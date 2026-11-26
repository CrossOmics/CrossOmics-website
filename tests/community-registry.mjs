import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

// Compile the pure projections using the project's TypeScript; no test-only runtime dependency.
const require = createRequire(import.meta.url);
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
}).outputText, filename);
async function loadProjection(name) { return require(`../lib/community/${name}.ts`); }
const repositories = await loadProjection("repositories");
const ranking = await loadProjection("ranking");
const updates = await loadProjection("repository-updates");
const original = "https://github.com/alexdobin/STAR";
const fork = "https://github.com/example/STAR";
const nuStar = "https://github.com/BioCode-Commons/NuSTAR";

function version(id, repo, released_at, parent = null, extra = {}) {
  return { id, repo, released_at, parent, kind: "original", label: id, commit: id.padEnd(40, "a"),
    improvement: null, withdrawn: false, ...extra };
}
function item(versions = [], extra = {}) {
  return { id: "cp_example", name: "Example", kind: "tool", description: "Aligner", domain: "transcriptomics",
    status: "active", modalities: [], algorithms: [], keywords: [], inputs: [], outputs: [],
    repositories: [{ url: original, primary: true }], papers: [], versions, metrics: null, ...extra };
}

test("repository cards combine URL aliases and choose the newest active update regardless of input order", () => {
  assert.equal(typeof repositories.repositoryGroups, "function");
  const groups = repositories.repositoryGroups(item([
    version("new", original, "2026-10-01"),
    version("old", "https://github.com/AlexDobin/STAR.git/", "2024-01-01"),
    version("undated", original, null),
    version("withdrawn", original, "2026-11-01", null, { withdrawn: true }),
    version("fork", fork, "2026-10-02")
  ]));
  assert.equal(groups.length, 2);
  const upstream = groups.find((group) => group.primary);
  assert.equal(upstream.latest.id, "new");
  assert.equal(upstream.versions.length, 4);
});

test("STAR includes NuSTAR pinned first without removing the original or duplicating registry records", () => {
  const groups = repositories.repositoryGroups(item([version("original", original, "2024-01-25")], { id: "cp_star", name: "STAR" }));
  assert.equal(groups.length, 2);
  assert.equal(groups[0].url, nuStar);
  assert.equal(groups[0].pinned, true);
  assert.equal(groups[0].name, "NuSTAR");
  assert.equal(groups[1].primary, true);
  assert.equal(groups[1].pinned, false);
  const registered = groups[0].latest;
  const again = repositories.repositoryGroups(item([{ ...registered, id: "from_registry" }], {
    id: "cp_star", repositories: [{ url: nuStar, primary: false }, { url: original, primary: true }]
  }));
  assert.equal(again[0].versions.length, 1);
  assert.equal(again[0].latest.id, "from_registry");
  assert.ok(repositories.repositoryGroups(item()).every((group) => !group.pinned));
});

test("lineage never connects across repositories and retains sibling branches", () => {
  const groups = repositories.repositoryGroups(item([
    version("root", original, "2024-01-01"),
    version("fork-root", fork, "2025-01-01", "root"),
    version("child", fork, "2026-01-01", "fork-root"),
    version("sibling", fork, "2026-02-01", "fork-root")
  ]));
  const lineage = groups.find((group) => group.url === fork).lineage;
  assert.deepEqual(lineage.map((entry) => [entry.version.id, entry.parent?.id ?? null, entry.depth]), [
    ["fork-root", null, 0], ["child", "fork-root", 1], ["sibling", "fork-root", 1]
  ]);
});

test("distinct registered IDs at one commit retain withdrawal metadata and parent references", () => {
  const groups = repositories.repositoryGroups(item([
    version("withdrawn", original, "2024-01-01", null, { commit: "a".repeat(40), withdrawn: true }),
    version("restored", original, "2025-01-01", null, { commit: "a".repeat(40) }),
    version("child", original, "2026-01-01", "restored")
  ]));
  assert.equal(groups[0].versions.length, 3);
  assert.equal(groups[0].lineage.find((entry) => entry.version.id === "child").parent.id, "restored");
  assert.equal(groups[0].versions.find((entry) => entry.id === "withdrawn").withdrawn, true);
});

test("HTTP GitHub aliases preserve registered history and merge with HTTPS repositories", () => {
  const groups = repositories.repositoryGroups(item([
    version("http-version", "http://github.com/alexdobin/STAR.git", "2026-01-01")
  ]));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].latest.id, "http-version");
  assert.equal(groups[0].url, original);
});

test("v2 recommendations pin repositories while retaining latest selection and author metadata", () => {
  const originalV2 = { ...version("original", original, "2024-01-01"), type: "original", authors: [{ name: "Original author" }], maintainers: [] };
  const updateV2 = { ...version("recommended", fork, "2025-01-01", "original"), type: "update", authors: [{ name: "Original author" }], updateAuthors: [{ name: "Update author" }], maintainers: [], citation: "Update citation" };
  const latest = { ...updateV2, id: "latest", label: "Latest", released_at: "2026-01-01", parent: "recommended", commit: "b".repeat(40) };
  const groups = repositories.repositoryGroups(item([originalV2, updateV2, latest], { recommendedVersionIds: ["recommended"] }));
  assert.equal(groups[0].url, fork);
  assert.equal(groups[0].pinned, true);
  assert.equal(groups[0].latest.id, "latest");
  assert.equal(groups[0].latest.updateAuthors[0].name, "Update author");
  assert.equal(groups[0].latest.citation, "Update citation");
  assert.equal(groups[0].lineage.find(entry => entry.version.id === "recommended").parent, null);
  assert.equal(groups[0].lineage.find(entry => entry.version.id === "recommended").upstreamParent.id, "original");
  assert.equal(groups[0].lineage.find(entry => entry.version.id === "recommended").issue, null);
});

test("repository lineage retains the shared v2 cycle diagnostics without fabricated edges", () => {
  const group = repositories.repositoryGroups(item([
    version("a", original, "2024-01-01", "b"), version("b", original, "2024-01-02", "a")
  ]))[0];
  assert.ok(group.lineage.every(entry => entry.parent === null && entry.issue === "cycle"));
});

test("empty repositories, withdrawn-only history and cycles remain readable", () => {
  assert.equal(repositories.repositoryGroups(item())[0].latest, null);
  const groups = repositories.repositoryGroups(item([
    version("a", fork, "2025-01-01", "b", { withdrawn: true }),
    version("b", fork, "2026-01-01", "a", { withdrawn: true })
  ]));
  const group = groups.find((group) => group.url === fork);
  assert.equal(group.latest.id, "b");
  assert.equal(group.lineage.length, 2);
  assert.equal(new Set(group.lineage.map((entry) => entry.version.id)).size, 2);
});

test("unsafe repository URLs cannot become source links or merge into valid repositories", () => {
  const groups = repositories.repositoryGroups(item([version("unsafe", "javascript:alert(1)", null)]));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].url, original);
});

test("latest curated repository commit refreshes without discarding its fallback or changing original metrics", async () => {
  assert.equal(typeof updates.refreshRepositoryUpdates, "function");
  const entry = item([], { id: "cp_star" });
  const curated = repositories.curatedRepositories.cp_star;
  const refreshed = await updates.refreshRepositoryUpdates(entry, curated, async (url) => {
    assert.equal(String(url), "https://api.github.com/repos/BioCode-Commons/NuSTAR/commits?per_page=1");
    return Response.json([{ sha: "f".repeat(40), commit: { committer: { date: "2026-11-20T00:00:00Z" }, message: "Latest update" } }]);
  });
  const group = repositories.repositoryGroups(refreshed)[0];
  assert.equal(group.latest.commit, "f".repeat(40));
  assert.equal(group.versions.length, 2);
  assert.equal(refreshed.metrics, entry.metrics);
  for (const fetcher of [async () => { throw new Error("offline"); }, async () => new Response("rate limited", { status: 429 }),
    async () => Response.json([{ sha: "broken", commit: {} }])]) {
    const fallback = await updates.refreshRepositoryUpdates(entry, curated, fetcher);
    assert.equal(repositories.repositoryGroups(fallback)[0].latest.commit, "00467cd3f8fc8595f635d5c8ee35b26c9488411a");
  }
});

test("ranking preserves score zero, separates stable and missing data, and sorts by priority", () => {
  assert.equal(typeof ranking.maintenanceRanking, "function");
  const result = ranking.maintenanceRanking({ items: [
    item([], { name: "Zero", metrics: { priority: 0, priority_reason: null } }),
    item([], { name: "Missing" }),
    item([], { name: "High", metrics: { priority: 0.9, priority_reason: null } }),
    item([], { name: "Stable", status: "stable", metrics: { priority: 0.8, priority_reason: null } }),
    item([], { name: "Deprecated", status: "deprecated", metrics: { priority: 1, priority_reason: null } }),
    item([], { name: "No paper", metrics: { priority: null, priority_reason: "no_paper" } })
  ], generatedAt: "2026-11-16T00:00:00Z" });
  assert.deepEqual(result.ranked.map((entry) => entry.name), ["High", "Zero"]);
  assert.deepEqual(result.stable.map((entry) => entry.name), ["Stable"]);
  assert.deepEqual(result.excluded.map((entry) => entry.name), ["Deprecated", "Missing", "No paper"]);
});

test("ranking uses collection metadata and can infer years with the existing deployed API", () => {
  const catalog = { items: [item([], { metrics: { citations_by_year: { 2026: 0, 2024: 2, 2025: 1 },
    collected_at: "2026-11-16T10:28:07Z" } })], generatedAt: "2026-11-20T00:00:00Z" };
  assert.deepEqual(ranking.maintenanceRanking(catalog).years, [2024, 2025, 2026]);
  assert.equal(ranking.maintenanceRanking(catalog).collectedAt, "2026-11-16T10:28:07Z");
  assert.deepEqual(ranking.maintenanceRanking({ ...catalog, config: { citation_years: [2025, 2026], activity_window_days: 180 } }).years, [2025, 2026]);
});


test("repository browser sorts by latest update after pinned picks and searches names or URLs", () => {
  assert.equal(typeof repositories.browseRepositories, "function");
  const groups = repositories.repositoryGroups(item([
    version("old", original, "2024-01-01"), version("new", fork, "2026-01-01")
  ]));
  assert.deepEqual(repositories.browseRepositories(groups).map(group=>group.url), [fork, original]);
  assert.equal(repositories.browseRepositories(groups, "EXAMPLE").length, 1);
  assert.equal(repositories.browseRepositories(groups, "does-not-exist").length, 0);
  groups.find(group=>group.url===original).pinned=true;
  assert.equal(repositories.browseRepositories(groups)[0].url, original);
});

test("newly published web updates with no release date become latest instead of stale imported versions", () => {
  const groups = repositories.repositoryGroups(item([
    version("dated-import", original, "2025-01-01"),
    version("web-update", original, null, "dated-import", {published_at:"2026-11-25T18:00:00Z"})
  ]));
  assert.equal(groups[0].latest.id,"web-update");
  assert.deepEqual(repositories.repositoryVersionDate(groups[0].latest),{value:"2026-11-25T18:00:00Z",kind:"publication"});
  assert.deepEqual(repositories.repositoryVersionDate(groups[0].versions[0]),{value:"2025-01-01",kind:"update"});
});


test("implementation lineage names repositories and prefers published records over observed snapshots", () => {
  const tool=item([
    version("star", original,"2024-01-01",null,{label:"2.7.11b"}),
    version("nustar",nuStar,"2026-01-01","star",{label:"v1.1.0",improvement:"Published implementation"})
  ],{id:"cp_star",name:"STAR"});
  const nodes=repositories.implementationLineage(tool);
  assert.equal(nodes.length,2);
  const derived=nodes.find(node=>node.name==="NuSTAR");
  const base=nodes.find(node=>node.name==="STAR");
  assert.equal(derived.version.id,"nustar");
  assert.equal(derived.parent,base.version.id);
  assert.equal(repositories.repositoryGroups(tool)[0].latest.id,"nustar");
  assert.equal(repositories.repositoryGroups(tool)[0].versions.length,2);
});

test("implementation projection diagnoses ambiguous origins and repository cycles instead of inventing edges", () => {
  const other="https://github.com/example/other";
  const ambiguous=repositories.implementationLineage(item([
    version("a",original,"2024-01-01"),version("b",other,"2024-01-01"),
    version("c",fork,"2025-01-01","a"),version("d",fork,"2026-01-01","b")
  ]));
  const node=ambiguous.find(node=>node.repository.url===fork);
  assert.equal(node.parent,null);assert.equal(node.issue,"ambiguous-parent");
  const cycle=repositories.implementationLineage(item([
    version("a1",original,"2024-01-01"),version("b1",fork,"2025-01-01","a1"),
    version("a2",original,"2026-01-01","b1")
  ]));
  assert.ok(cycle.every(node=>node.parent===null&&node.issue==="cycle"));
});

test("value summary preserves published compatibility and pending performance without fabricating results",()=>{
  const improvement="NuSTAR is a refactored reimplementation based on STAR 2.7.11b.\nIt introduces a modular C++20 architecture.\nNuSTAR requires its own native index and does not support every STAR workflow. Performance measurements for the current implementation are pending.";
  const tool=item([version("nustar",nuStar,"2026-11-25",null,{improvement})],{id:"cp_star"});
  const summary=repositories.repositorySummary(tool,repositories.repositoryGroups(tool)[0]);
  assert.equal(summary.purpose,"NuSTAR is a refactored reimplementation based on STAR 2.7.11b.");
  assert.match(summary.compatibility,/requires its own native index/);
  assert.match(summary.performance,/pending/);
  assert.doesNotMatch(JSON.stringify(summary),/1.3|verified|drop-in/);
  const empty=item();
  const unknown=repositories.repositorySummary(empty,repositories.repositoryGroups(empty)[0]);
  assert.equal(unknown.purpose,"Aligner");
  assert.match(unknown.performance,/No benchmark evidence provided/);
});

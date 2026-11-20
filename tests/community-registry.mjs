import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Compile the pure projections using the project's TypeScript; no test-only runtime dependency.
async function loadProjection(name) {
  const source = await readFile(new URL(`../lib/community/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
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

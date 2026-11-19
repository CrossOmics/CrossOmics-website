import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const gardenerTarget = process.env.GARDENER_TEST_TARGET ?? "https://gardener.example.test";
let service, web, workspace, base, output = "", catalogUnavailable = false, detailMetadata = false;
const pipeline = {
  id: "cp_example", name: "Example tool", description: "Example analysis", domain: "genomics",
  kind: "tool", status: "active", modalities: [], algorithms: [], keywords: [], inputs: [], outputs: [],
  repositories: [], papers: [], metrics: null,
  versions: [{ id: "cv_example", type: "origin", label: "v1", parent: null,
    repo: "https://github.com/example/pipeline", commit: "a".repeat(40), released_at: null,
    improvement: null, withdrawn: false, authors: [{ name: "Original author" }], citation: "Upstream paper citation", maintainers: [{ name: "Maintainer" }] }]
};

const managed = { ...pipeline, id: "cp_managed", name: "Managed tool", maintainers: [{ name: "Tool maintainer" }], recommendedVersionIds: ["cv_recommended"],
  versions: [...pipeline.versions, { ...pipeline.versions[0], id: "cv_recommended", type: "update", label: "Recommended update", parent: "cv_example", updateAuthors: [{ name: "NuSTAR Developer" }], upstreamCitation: "Upstream paper citation", citation: "NuSTAR software citation", maintainers: [{ name: "Version-only maintainer" }] }] };

async function listen(server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

before(async () => {
  service = createServer((request, response) => {
    response.setHeader("content-type", "application/json");
    const mode = request.headers.cookie?.match(/community_session=([^;]+)/)?.[1] ?? "anonymous";
    if (request.url === "/api/community/v1/session") {
      if (mode === "session-error") { response.writeHead(503).end("{}"); return; }
      response.end(JSON.stringify({
        contributor: ["anonymous", "login-old", "login-none"].includes(mode) ? null : { id: ["google", "apple"].includes(mode) ? mode + ":" + "a".repeat(64) : "123456", login: "test-user" },
        ...(mode === "login-old" ? {} : { sessionDurationDays: 30 }),
        signInAvailable: mode !== "login-none", signInProviders: mode === "login-none" ? [] : ["github", "google", "apple"],
        registrySubmissionAvailable: true, registryV2Enabled: mode !== "legacy",
        registryV2Available: !["legacy", "unavailable"].includes(mode),
        registryUpdateAuthorsAvailable: mode !== "old-authors", canManageRegistry: mode === "admin", desktopAuthAvailable: true, canPostBounties: false, canManageBounties: false
      }));
    } else if (request.url?.startsWith("/api/community/v2/me/contributions")) {
      const params = new URL(request.url,"http://fixture").searchParams;
      const section = params.get("section") || "original";
      const submission = { ...pipeline, id: "00000000-0000-4000-8000-000000000003", name: "My submitted tool", type: section === "original" ? "original" : "update", label: "v1", repository: "https://github.com/example/tool", status: "published", contributor: { id: "123456", login: "test-user" }, createdAt: "2026-11-18T00:00:00Z", pipelineId: "cp_example", authors: [], maintainers: [] };
      const entries = section === "maintained" ? [{kind:"maintained",tool:managed}] : [{kind:"submission",submission}];
      response.end(JSON.stringify({ section, entries, page: Number(params.get("page") || 1), hasMore: section !== "maintained", total: 21, counts:{original:21,update:2,maintained:1} }));
    } else if (request.url === "/api/community/v2/catalog/cp_managed/management") {
      if (!["admin","maintainer"].includes(mode)) {response.writeHead(403).end("{}");return;}
      response.end(JSON.stringify({item:managed,canAssignMaintainers:mode === "admin",maintainers:[{name:"Tool maintainer",...(mode === "admin" ? {contributorId:"123456"} : {})}]}));
    } else if (request.url === "/api/community/v2/catalog/cp_managed") {
      response.end(JSON.stringify({item:managed}));
    } else if (request.url?.startsWith("/api/community/v1/catalog")) {
      response.end(JSON.stringify({ items: [pipeline, { ...pipeline, id: "cp_unknown", name: "Untyped tool fixture", kind: undefined }, { ...pipeline, id: "cp_workflow", name: "Workflow fixture", kind: "workflow" }], generatedAt: "2026-11-13T00:00:00Z" }));
    } else if (request.url?.startsWith("/api/community/v1/contributions")) {
      response.end(JSON.stringify({ items: [{ id: "00000000-0000-4000-8000-000000000002", type: "algorithm_update", subjectKind: "tool", subjectName: "Example tool", catalogId: "cp_example", summary: "A legacy update", occurredOn: "2026-11-01", projectUrl: "https://github.com/example/tool", evidenceUrl: "https://github.com/example/tool/pull/1", projectScope: "external", channel: "web", contributor: { id: "123456", login: "test-user" }, impact: [] }], page: 1, hasMore: false }));
    } else if (request.url?.startsWith("/api/community/v1/bounties")) {
      response.end(JSON.stringify({ items: [], page: 1, hasMore: false }));
    } else if (request.url?.startsWith("/api/community/v2/registry/submissions")) {
      response.end(JSON.stringify({ submissions: ["credits", "legacy-credits"].includes(mode) ? [{ id: "00000000-0000-4000-8000-000000000004", type: "update", name: "Example tool", label: "NuSTAR-dev", repository: "https://github.com/example/nustar", pipelineId: "cp_example", parentVersionId: "cv_example", commit: "b".repeat(40), status: "submitted", createdAt: "2026-11-18T00:00:00Z", contributor: { id: "123456", login: "test-user" }, authors: [{ name: "Original author" }], updateAuthors: mode === "legacy-credits" ? undefined : [{ name: "NuSTAR Developer" }], maintainers: mode === "legacy-credits" ? [{ name: "Historic version maintainer" }] : [], upstreamCitation: "Upstream paper citation", citation: "NuSTAR software citation" }] : [] }));
    } else if (request.url === "/api/community/v2/catalog/cp_workflow") {
      response.end(JSON.stringify({ item: { ...pipeline, id: "cp_workflow", name: "Workflow fixture", kind: "workflow" } }));
    } else if (request.url?.match(/^\/api\/community\/v2\/catalog\/cp_example$/)) {
      response.end(JSON.stringify({ item: detailMetadata ? { ...pipeline, modalities: ["RNA-seq"], inputs: ["FASTQ"] } : pipeline }));
    } else if (request.url?.endsWith("/metadata")) {
      response.end(JSON.stringify({ updated: true }));
    } else if (request.url?.startsWith("/api/community/v2/catalog")) {
      if (new URL(request.url, "http://fixture").searchParams.get("q") === "transitional") {
        const requested = new URL(request.url, "http://fixture").searchParams.get("type");
        if (requested === "original") { response.writeHead(422).end(JSON.stringify({ message: "Old backend needs origin." })); return; }
        const items = [pipeline, ...["improved", "fix"].map(type => ({ ...pipeline, id: "cp_" + type, name: "Legacy " + type + " tool", versions: pipeline.versions.map(v => ({ ...v, type })) }))];
        response.end(JSON.stringify({ items: requested ? items.filter(item => item.versions.some(v => v.type === requested)) : items, generatedAt: "2026-11-13T00:00:00Z" })); return;
      }
      response.writeHead(catalogUnavailable ? 503 : 200).end(JSON.stringify({ items: [pipeline, { ...pipeline, id: "cp_workflow", name: "Workflow fixture", kind: "workflow" }], generatedAt: "2026-11-13T00:00:00Z" }));
    } else if (request.url?.startsWith("/api/community/auth/callback")) {
      response.setHeader("set-cookie", "community_session=fixture; Path=/; HttpOnly; Secure; SameSite=Lax");
      response.writeHead(307, { location: "https://www.cross-omics.com/community/mine" }).end();
    } else response.writeHead(404).end("{}");
  });
  const serviceUrl = await listen(service);
  // Run the real Next page without touching an existing dev server, build, or .env.
  workspace = await mkdtemp(join(tmpdir(), "community-submit-test-"));
  await cp(root, workspace, { recursive: true, filter: (source) =>
    !["node_modules", ".next", ".git", ".superpowers"].includes(basename(source)) && !basename(source).startsWith(".env") });
  await symlink(join(root, "node_modules"), join(workspace, "node_modules"), "dir");
  const reservation = createServer();
  base = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  const env = { ...process.env, COMMUNITY_SERVICE_URL: serviceUrl, GARDENER_WEBSITE_URL: gardenerTarget, NEXT_TELEMETRY_DISABLED: "1" };
  web = spawn(process.execPath, [join(root, "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", new URL(base).port], { cwd: workspace, env });
  web.stdout.on("data", (chunk) => { output += chunk; });
  web.stderr.on("data", (chunk) => { output += chunk; });
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (web.exitCode !== null) throw new Error(output);
    if (output.includes("Ready in")) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Next did not become ready: " + output);
});

after(async () => {
  if (web && web.exitCode === null) {
    const closed = new Promise((resolve) => web.once("exit", resolve));
    web.kill("SIGTERM");
    await closed;
  }
  if (service) await new Promise((resolve) => service.close(resolve));
  if (workspace) await rm(workspace, { recursive: true, force: true });
});

async function page(mode, query = "") {
  const response = await fetch(base + "/community/registry/submit" + query, { headers: { cookie: "community_session=" + mode } });
  assert.equal(response.status, 200);
  return (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}

function entryTypes(html) {
  const select = html.match(/<label>Type<select[^>]*>(.*?)<\/select>/s)?.[1];
  assert.ok(select, "The submission form must explain the tool type");
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map((match) => [match[1], match[2]]),
    [["original", "Original"], ["update", "Update"]]);
}

test("legacy service shows two types with submission controls disabled", async () => {
  const html = await page("legacy");
  entryTypes(html);
  assert.match(html, /<fieldset disabled="">/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Submit registration<\/button>/);
  assert.doesNotMatch(html, /Authorize and open PR|Preview registration/);
});

test("ready service shows two entry types and keeps pipeline lineage", async () => {
  const html = await page("ready", "?pipelineId=cp_example");
  entryTypes(html);
  assert.match(html, /value="update" selected=""/);
  assert.match(html, /value="cp_example" selected=""/);
  assert.match(html, /value="cv_example"/);
  assert.doesNotMatch(html, /<legend>Maintainers<\/legend>/);
  assert.match(html, /Update author names/);
  const authorsInput = html.match(/<input[^>]*name="updateAuthorNames"[^>]*>/)?.[0];
  assert.ok(authorsInput);
  assert.match(authorsInput, /required=""/);
  assert.match(authorsInput, /value=""/);
  assert.doesNotMatch(html, /name="authorNames"/);
  assert.match(html, /Choose a based-on version to see upstream attribution/);
  assert.match(html, /<button[^>]*type="submit">Submit registration<\/button>/);
});

test("original tool asks for actual authors and citation without requiring a change summary", async () => {
  const html = await page("ready");
  assert.match(html, /value="original" selected=""/);
  assert.match(html, /Author names/);
  assert.match(html, /Separate names with a semicolon/);
  assert.match(html, /Citation information \(optional\)/);
  assert.doesNotMatch(html, /name="changeSummary"/);
  assert.match(html, /no earlier version is needed/);
  assert.match(html, /<legend>Maintainers<\/legend>/);
  assert.match(html, /<button[^>]*type="submit">Submit registration<\/button>/);
});

test("unavailable service retains the two-type form with submission disabled", async () => {
  const html = await page("unavailable");
  entryTypes(html);
  assert.match(html, /<fieldset disabled="">/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Submit registration<\/button>/);
});

test("catalog failure disables the form instead of offering an empty substitute catalog", async () => {
  catalogUnavailable = true;
  try {
    const html = await page("ready");
    entryTypes(html);
    assert.match(html, /<button[^>]*disabled=""[^>]*>Submit registration<\/button>/);
  } finally { catalogUnavailable = false; }
});

test("Google and Apple can submit projects and read history without switching accounts", async () => {
  for (const provider of ["google", "apple"]) {
    const html = await page(provider, "?pipelineId=cp_example");
    entryTypes(html);
    assert.match(html, /value="cp_example" selected=""/);
    assert.match(html, /Submit registration/);
    assert.doesNotMatch(html, /provider=github|Sign in with GitHub/);
    const history = await fetch(base + "/community/registry/submissions", { headers: { cookie: "community_session=" + provider } });
    assert.equal(history.status, 200);
    assert.match(await history.text(), /No submissions yet/);
  }
});

test("anonymous registration uses the dedicated sign-in page and keeps the target tool", async () => {
  const response = await fetch(base + "/community/registry/submit?pipelineId=cp_example", { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/community/sign-in?returnTo=%2Fcommunity%2Fregistry%2Fsubmit%3FpipelineId%3Dcp_example");
});

async function loginPage(mode = "anonymous", query = "") {
  return fetch(base + "/community/sign-in" + query, { headers: { cookie: "community_session=" + mode }, redirect: "manual" });
}

test("dedicated login has three provider actions and duration without the Community toolbar", async () => {
  const response = await loginPage("anonymous", "?returnTo=%2Fcommunity%2Fregistry%2Fsubmit%3FpipelineId%3Dcp_example");
  assert.equal(response.status, 200);
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.ok(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").includes("Sign in to Community"));
  assert.match(html, /30 days/);
  for (const provider of ["github", "google", "apple"]) {
    assert.match(html, new RegExp("provider=" + provider));
  }
  assert.match(html, /returnTo=%2Fcommunity%2Fregistry%2Fsubmit%3FpipelineId%3Dcp_example/);
  assert.doesNotMatch(html, /aria-label="Community"|Log a contribution|Choose a sign-in method/);
});

test("login handles old backend duration, unavailable providers and expired attempts", async () => {
  assert.match(await (await loginPage("login-old")).text(), /7 days/);
  assert.match(await (await loginPage("login-none")).text(), /Sign-in is unavailable/);
  assert.match(await (await loginPage("anonymous", "?login=expired")).text(), /expired/);
  assert.doesNotMatch(await (await loginPage("session-error")).text(), /provider=github|provider=google|provider=apple/);
});

test("already signed in users return safely without repeating OAuth", async () => {
  const good = await loginPage("google", "?returnTo=%2Fcommunity%2Fregistry%2Fsubmit%3FpipelineId%3Dcp_example");
  assert.equal(good.status, 307);
  assert.equal(good.headers.get("location"), "/community/registry/submit?pipelineId=cp_example");
  const bad = await loginPage("apple", "?returnTo=https%3A%2F%2Fevil.example");
  assert.equal(bad.headers.get("location"), "/community");
  const direct = await loginPage("google");
  assert.equal(direct.status, 307);
  assert.equal(direct.headers.get("location"), "/community");
  const home = await fetch(base + "/community/sign-in", { headers: { cookie: "community_session=google" } });
  assert.equal(new URL(home.url).pathname, "/");
  const anonymous = await loginPage();
  const html = (await anonymous.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.equal((html.match(/returnTo=%2Fcommunity&amp;provider=/g) ?? []).length, 3);
});

test("session failure does not expose a submission form", async () => {
  assert.doesNotMatch(await page("session-error"), /<form/);
});

test("completed legacy PR callbacks still show the actual PR", async () => {
  const html = await page("legacy", "?pr=42");
  assert.match(html, /href="https:\/\/github.com\/CrossOmics\/pipeline-registry\/pull\/42"/);
  assert.doesNotMatch(html, /<form/);
});

test("failed legacy authorization callbacks explain the outcome without restoring the old form", async () => {
  const html = await page("legacy", "?result=denied");
  assert.match(html, /GitHub did not grant public repository access/);
  assert.doesNotMatch(html, /Authorize and open PR|Preview registration/);
});

test("Community root is the registry and keeps query filters", async () => {
  const response = await fetch(base + "/?q=example&type=fix");
  assert.equal(response.status, 200);
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, /Community Tracking/);
  assert.match(html, /Example tool/);
  assert.match(html, /action="\/#registry"/);
  assert.match(html, /name="q"[^>]*value="example"/);
  assert.doesNotMatch(html, /<select name="type"/);
  assert.match(html, /href="\/community\/sign-in\?returnTo=%2Fcommunity"/);
  assert.doesNotMatch(html, /href="\/tutorial|An Operating System/);
  const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0];
  const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0];
  assert.ok(header);
  assert.doesNotMatch(header, /Gardener/);
  if (gardenerTarget) assert.match(footer, /href="https:\/\/gardener\.example\.test\/?"/);
});

test("old Community index redirects to root preserving repeated query parameters", async () => {
  const response = await fetch(base + "/community?q=example&type=fix&tag=a&tag=b", { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/?q=example&type=fix&tag=a&tag=b");
});

test("migrated product routes redirect to Gardener or clearly report missing configuration", async () => {
  for (const path of ["/about", "/tutorial", "/tutorial/setup/sphere-node", "/future", "/value"]) {
    const response = await fetch(base + path + "?tag=a&tag=b", { redirect: "manual" });
    if (gardenerTarget) {
      assert.equal(response.status, 307, path);
      assert.equal(response.headers.get("location"), gardenerTarget + path + "?tag=a&tag=b", path);
    } else {
      assert.equal(response.status, 200, path);
      assert.match(await response.text(), /Gardener website is temporarily unavailable/);
      assert.equal(response.headers.get("location"), null);
    }
  }
});

test("unmigrated paths and unknown API routes do not redirect", async () => {
  for (const path of ["/not-migrated", "/tutorial/not-a-page", "/api/community/not-a-route"]) {
    const response = await fetch(base + path, { redirect: "manual" });
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get("location"), null);
  }
});

test("Community proxy still forwards identity and OAuth response headers and limits bodies", async () => {
  const session = await fetch(base + "/api/community/v1/session", { headers: { cookie: "community_session=ready" } });
  assert.equal(session.status, 200);
  assert.equal((await session.json()).contributor.id, "123456");
  const callback = await fetch(base + "/api/community/auth/callback?state=fixture", { redirect: "manual" });
  assert.equal(callback.status, 307);
  assert.equal(callback.headers.get("location"), "https://www.cross-omics.com/community/mine");
  assert.match(callback.headers.getSetCookie()[0], /community_session=fixture.*HttpOnly.*Secure/);
  const oversized = await fetch(base + "/api/community/v2/registry/submissions", {
    method: "POST", headers: { "content-type": "application/json", origin: base }, body: JSON.stringify({data:"a".repeat(17000)})
  });
  assert.equal(oversized.status, 413);
});

test("everyone sees the bounty publishing entry and anonymous visitors return after sign-in", async () => {
  for (const mode of ["anonymous", "google", "apple", "ready"]) {
    const response = await fetch(base + "/community/bounties", { headers: { cookie: "community_session=" + mode } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/community\/bounties\/new"[^>]*>Post a bounty/);
  }
  const anonymous = await fetch(base + "/community/bounties/new", { redirect: "manual" });
  assert.equal(anonymous.status, 307);
  assert.equal(anonymous.headers.get("location"), "/community/sign-in?returnTo=%2Fcommunity%2Fbounties%2Fnew");
});

test("all authenticated accounts see the bounty form without contributions or editor access", async () => {
  for (const mode of ["google", "apple", "ready"]) {
    const response = await fetch(base + "/community/bounties/new", { headers: { cookie: "community_session=" + mode } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Reward or recognition/);
    assert.match(html, /<button[^>]*type="submit"[^>]*>Post bounty/);
    assert.doesNotMatch(html, /Record a contribution|editor access to post/);
  }
});


test("tool registration offers optional metadata with examples", async () => {
  const html = await page("ready");
  for (const field of ["modalities", "algorithms", "inputs", "outputs"]) {
    assert.match(html, new RegExp('name="' + field + '"'));
    assert.doesNotMatch(html, new RegExp('name="' + field + '"[^>]*required'));
  }
});

test("project details hide empty metadata and show only populated fields", async () => {
  for (const mode of ["ready", "metadata", "admin"]) {
    detailMetadata = mode === "metadata";
    const response = await fetch(base + "/community/catalog/cp_example", { headers: { cookie: "community_session=" + mode } });
    assert.equal(response.status, 200);
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.doesNotMatch(html, /Unspecified/);
    assert.equal(html.includes("<h2>Algorithms and data</h2>"), mode === "metadata");
    assert.equal(html.includes("<dt>Modalities</dt>"), mode === "metadata");
    assert.equal(html.includes("<dt>Inputs</dt>"), mode === "metadata");
    assert.doesNotMatch(html, /<dt>Algorithms<\/dt>|<dt>Outputs<\/dt>/);
    assert.equal(html.includes("Edit tool metadata"), mode === "admin");
  }
});

test("project metadata correction is forwarded by the authenticated proxy", async () => {
  const response = await fetch(base + "/api/community/v2/catalog/cp_example/metadata", {
    method: "POST", headers: { "content-type": "application/json", origin: base, cookie: "community_session=admin" },
    body: JSON.stringify({ modalities: [], algorithms: [], inputs: [], outputs: [], reason: "Manual verified" })
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).updated, true);
});


test("registry and contribution forms share Original/Update and offer only tools", async () => {
  const registry = await page("ready");
  entryTypes(registry);
  assert.match(registry, /Tool name/);
  assert.doesNotMatch(registry, /Project name|>Workflow<|>Performance improvement<|>Bug fix</);
  const contributionResponse = await fetch(base + "/community/submit?mode=record", { headers: { cookie: "community_session=ready" } });
  assert.equal(contributionResponse.status, 200);
  const contribution = (await contributionResponse.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const menu = contribution.match(/<select id="contribution-type"[^>]*>(.*?)<\/select>/s)?.[1];
  assert.ok(menu);
  assert.deepEqual([...menu.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map(m => [m[1],m[2]]), [["original","Original"],["update","Update"]]);
  assert.match(contribution, /name="subjectKind"[^>]*value="tool"/);
  assert.match(contribution, /Tool name/);
  assert.doesNotMatch(contribution, /Item type|Workflow fixture/);
  const detail = await fetch(base + "/community/catalog/cp_example", { headers: { cookie: "community_session=ready" } });
  const detailHtml = (await detail.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.doesNotMatch(detailHtml, />Tool<\/span>/);
  assert.match(detailHtml, />Original<\/span>/);
});

test("tool catalog excludes workflow entries and uses Tool registration vocabulary", async () => {
  const response = await fetch(base + "/", { headers: { cookie: "community_session=ready" } });
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, /Submit a Contribution/);
  assert.doesNotMatch(html, /Workflow fixture|Register a project|>Workflows<|>Project<\/span>|>Tool<\/span>/);
});


test("legacy contribution types display the same Update label and workflows have no Tool detail page", async () => {
  const feed = await fetch(base + "/community/activity");
  assert.equal(feed.status, 200);
  const html = (await feed.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, />Update<\/span>/);
  assert.doesNotMatch(html, />Algorithm update<|>Optimization<|>Bug fix</);
  const workflow = await fetch(base + "/community/catalog/cp_workflow");
  assert.equal(workflow.status, 404);
});


test("legacy catalogs retain untyped tools while excluding workflows", async () => {
  const response = await fetch(base + "/", { headers: { cookie: "community_session=legacy" } });
  assert.equal(response.status, 200);
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, /Untyped tool fixture/);
  assert.doesNotMatch(html, /Workflow fixture/);
});


test("home lists only Original tools even with old Update-filter bookmarks", async () => {
  for (const type of ["original", "update"]) {
    const response = await fetch(base + "/?q=transitional&type=" + type, { headers: { cookie: "community_session=transitional" } });
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.doesNotMatch(html, /Old backend needs origin|temporarily unavailable/);
    assert.match(html, /Search Tools/); assert.match(html, /Example tool/);
    assert.doesNotMatch(html, /Legacy improved tool|Legacy fix tool|<select name="type"/);
  }
});


test("Community navigation uses task labels with a single submission entry", async () => {
  const response = await fetch(base + "/", { headers: { cookie: "community_session=ready" } });
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const nav = html.match(/<nav[^>]*aria-label="Community"[^>]*>(.*?)<\/nav>/s)?.[1];
  assert.ok(nav);
  for (const label of ["Submit a Contribution", "Explore Existing Tools", "Maintenance Needed", "Tools Wanted"]) assert.match(nav, new RegExp(label));
  assert.equal([...nav.matchAll(/href="\/community\/submit"/g)].length, 1);
  assert.match(nav, /href="https:\/\/crossomics.github.io\/pipeline-registry\/ranking\/"/);
  assert.doesNotMatch(nav, />Registry<|>Bounties<|>Contributions<|Log a contribution/);
  const registry = html.match(/<section[^>]*id="registry"[\s\S]*?<\/section>/)?.[0];
  assert.ok(registry);
  assert.doesNotMatch(registry, /Register a tool|Maintenance ranking/);
});


test("one submission hub explains reviewed tools versus directly published records", async () => {
  for (const mode of ["ready", "google", "apple"]) {
    const response = await fetch(base + "/community/submit?catalogId=cp_example", { headers: { cookie: "community_session=" + mode } });
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.match(html, /Submit a Contribution/);
    assert.match(html, /Submit a Tool or Update/);
    assert.match(html, /Record a Contribution/);
    assert.match(html, /Administrator review/);
    assert.match(html, /Published directly/);
    assert.match(html, /href="\/community\/registry\/submit\?pipelineId=cp_example"/);
    assert.match(html, /href="\/community\/submit\?mode=record&amp;catalogId=cp_example"/);
    assert.doesNotMatch(html, /id="contribution-type"/);
  }
});

test("record mode preserves sign-in destination and existing Tool selection", async () => {
  const anonymous = await fetch(base + "/community/submit?mode=record&catalogId=cp_example", { redirect: "manual" });
  assert.equal(anonymous.status, 307);
  assert.equal(anonymous.headers.get("location"), "/community/sign-in?returnTo=%2Fcommunity%2Fsubmit%3Fmode%3Drecord%26catalogId%3Dcp_example");
  const response = await fetch(base + "/community/submit?mode=record&catalogId=cp_example", { headers: { cookie: "community_session=ready" } });
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, /Record a Contribution/);
  assert.match(html, /id="contribution-type"/);
  assert.match(html, /value="cp_example" selected=""/);
  assert.match(html, /value="Example tool"/);
});


test("tool details show global maintainers once and recommendations before other versions", async () => {
  const response = await fetch(base + "/community/catalog/cp_managed",{headers:{cookie:"community_session=maintainer"}});
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, /Tool maintainer/); assert.doesNotMatch(html, /Version-only maintainer/);
  assert.ok(html.indexOf("Recommended update") < html.indexOf(">v1</h3>"));
  assert.match(html, /href="\/community\/catalog\/cp_managed\/manage"/);
  assert.match(html, /href="\/community\/registry\/submit\?pipelineId=cp_managed"/);
  assert.match(html, /href="\/community\/submit\?mode=record&amp;catalogId=cp_managed"/);
  assert.doesNotMatch(html, /href="\/community\/submit\?catalogId=cp_managed"/);
});

test("My Contributions has correctly paginated groups and assigned-tool management", async () => {
  for (const [section,label] of [["tools","My Tools"],["updates","My Updates"],["maintained","My Maintained Tools"]]) {
    const response = await fetch(base+"/community/mine?section="+section,{headers:{cookie:"community_session=maintainer"}});
    const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.match(html, /My Contributions/); assert.match(html,new RegExp(label));
    if(section === "maintained") assert.match(html,/Manage this tool/); else { assert.match(html,/My submitted tool/); assert.match(html,/page=2/); }
  }
});

test("Tool management keeps sign-in destinations and hides administrator assignment from maintainers", async () => {
  const anon = await fetch(base+"/community/catalog/cp_managed/manage",{redirect:"manual"});
  assert.equal(anon.status,307);assert.equal(anon.headers.get("location"),"/community/sign-in?returnTo=%2Fcommunity%2Fcatalog%2Fcp_managed%2Fmanage");
  for(const mode of ["ready","maintainer","admin"]) {
    const response=await fetch(base+"/community/catalog/cp_managed/manage",{headers:{cookie:"community_session="+mode}});
    const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    if(mode === "ready") assert.doesNotMatch(html,/Save recommendations|Save maintainers/);
    else {assert.match(html,/Save recommendations/);assert.equal(html.includes("Save maintainers"),mode === "admin");}
  }
});


test("private Tool routes reject bearer credentials even with a web cookie", async () => {
  for(const path of ["catalog/cp_managed/management","catalog/cp_managed/recommendations","catalog/cp_managed/maintainers","catalog/cp_managed/metadata","me/contributions"]) {
    const response=await fetch(base+"/api/community/v2/"+path,{headers:{cookie:"community_session=maintainer",authorization:"Bearer desktop-fixture"}});
    assert.equal(response.status,403,path);
  }
  const unknown=await fetch(base+"/api/community/v2/catalog/cp_managed/management/extra");
  assert.equal(unknown.status,404);
});


test("Update form does not substitute upstream citation or authors for this version", async () => {
  const html = await page("ready", "?pipelineId=cp_example");
  assert.match(html, /Update author names/);
  assert.match(html, /Update citation \(optional\)/);
  assert.doesNotMatch(html, /<h4>Upstream citation<\/h4>/);
  assert.doesNotMatch(html, /Upstream paper citation/);
  assert.match(html, /name="citation"[^>]*><\/textarea>/);
  assert.doesNotMatch(html, /name="authorNames"/);
  const old = await page("old-authors", "?pipelineId=cp_example");
  assert.match(old, /<button[^>]*disabled=""[^>]*>Submit registration<\/button>/);
});


test("published detail and submission history keep Update developers distinct from upstream authors", async () => {
  for (const [path, mode] of [["/community/catalog/cp_managed", "ready"], ["/community/registry/submissions", "credits"]]) {
    const response = await fetch(base + path, { headers: { cookie: "community_session=" + mode } });
    assert.equal(response.status, 200);
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.match(html, /<dt>Upstream authors<\/dt>/);
    assert.match(html, /<dt>Update authors<\/dt>/);
    assert.match(html, /NuSTAR Developer/);
    assert.match(html, /Upstream paper citation/);
    assert.match(html, /NuSTAR software citation/);
    assert.equal([...html.matchAll(/<dt>Update authors<\/dt>/g)].length, 1);
  }
});


test("legacy Update history retains neutral attribution and recorded maintainer credits", async () => {
  const response = await fetch(base + "/community/registry/submissions", { headers: { cookie: "community_session=legacy-credits" } });
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(html, /Historic version maintainer/);
  assert.match(html, /Recorded citation/);
  assert.match(html, /Recorded authors/);
  assert.doesNotMatch(html, /<h3>Update citation<\/h3>|<dt>Update authors<\/dt>/);
});

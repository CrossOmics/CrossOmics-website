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
let service, web, workspace, base, output = "", catalogUnavailable = false;
const pipeline = {
  id: "cp_example", name: "Example pipeline", description: "Example analysis", domain: "genomics",
  status: "active", modalities: [], algorithms: [], keywords: [], inputs: [], outputs: [],
  repositories: [], papers: [], metrics: null,
  versions: [{ id: "cv_example", type: "origin", label: "v1", parent: null,
    repo: "https://github.com/example/pipeline", commit: "a".repeat(40), released_at: null,
    improvement: null, withdrawn: false, authors: [{ name: "Original author" }], maintainers: [{ name: "Maintainer" }] }]
};

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
        canManageRegistry: false, desktopAuthAvailable: true, canPostBounties: false, canManageBounties: false
      }));
    } else if (request.url?.startsWith("/api/community/v1/bounties")) {
      response.end(JSON.stringify({ items: [], page: 1, hasMore: false }));
    } else if (request.url?.startsWith("/api/community/v2/registry/submissions")) {
      response.end(JSON.stringify({ submissions: [] }));
    } else if (request.url?.startsWith("/api/community/v2/catalog")) {
      response.writeHead(catalogUnavailable ? 503 : 200).end(JSON.stringify({ items: [pipeline], generatedAt: "2026-11-13T00:00:00Z" }));
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
  const select = html.match(/<label>Registration type<select[^>]*>(.*?)<\/select>/s)?.[1];
  assert.ok(select, "The submission form must explain the registration type");
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map((match) => [match[1], match[2]]),
    [["origin", "New project (first version)"], ["improved", "Performance improvement"], ["update", "Feature or compatibility update"], ["fix", "Bug fix"]]);
}

test("legacy service shows four types with submission controls disabled", async () => {
  const html = await page("legacy");
  entryTypes(html);
  assert.match(html, /<fieldset disabled="">/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Submit registration<\/button>/);
  assert.doesNotMatch(html, /Authorize and open PR|Preview registration/);
});

test("ready service shows four entry types and keeps pipeline lineage", async () => {
  const html = await page("ready", "?pipelineId=cp_example");
  entryTypes(html);
  assert.match(html, /value="update" selected=""/);
  assert.match(html, /value="cp_example" selected=""/);
  assert.match(html, /value="cv_example"/);
  assert.match(html, /Author names/);
  assert.match(html, /name="authorNames"[^>]*value="Original author"/);
  assert.match(html, /<button[^>]*type="submit">Submit registration<\/button>/);
});

test("new project asks for actual authors and citation without requiring a change summary", async () => {
  const html = await page("ready");
  assert.match(html, /value="origin" selected=""/);
  assert.match(html, /Author names/);
  assert.match(html, /Separate names with a semicolon/);
  assert.match(html, /Citation information \(optional\)/);
  assert.doesNotMatch(html, /name="changeSummary"/);
  assert.match(html, /no earlier version is needed/);
  assert.match(html, /<legend>Maintainers<\/legend>/);
  assert.match(html, /<button[^>]*type="submit">Submit registration<\/button>/);
});

test("unavailable service retains the four-type form with submission disabled", async () => {
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

test("anonymous registration uses the dedicated sign-in page and keeps the target project", async () => {
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
  assert.equal(bad.headers.get("location"), "/community/mine");
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
  assert.match(html, /Example pipeline/);
  assert.match(html, /action="\/#registry"/);
  assert.match(html, /name="q"[^>]*value="example"/);
  assert.match(html, /value="fix" selected=""/);
  assert.match(html, /returnTo=%2Fcommunity%3Fq%3Dexample%26type%3Dfix/);
  assert.doesNotMatch(html, /href="\/tutorial|An Operating System/);
  if (gardenerTarget) assert.match(html, /href="https:\/\/gardener\.example\.test\/?"/);
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

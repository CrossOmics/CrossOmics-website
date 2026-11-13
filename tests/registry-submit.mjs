import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
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
        contributor: mode === "anonymous" ? null : { id: mode === "google" ? "google:test-user" : "123456", login: "test-user" },
        signInAvailable: true, signInProviders: ["github", "google", "apple"],
        registrySubmissionAvailable: true, registryV2Enabled: mode !== "legacy",
        registryV2Available: !["legacy", "unavailable"].includes(mode),
        canManageRegistry: false, desktopAuthAvailable: true, canPostBounties: false, canManageBounties: false
      }));
    } else if (request.url?.startsWith("/api/community/v2/catalog")) {
      response.writeHead(catalogUnavailable ? 503 : 200).end(JSON.stringify({ items: [pipeline], generatedAt: "2026-11-13T00:00:00Z" }));
    } else response.writeHead(404).end("{}");
  });
  const serviceUrl = await listen(service);
  // Run the real Next page without touching an existing dev server, build, or .env.
  workspace = await mkdtemp(join(tmpdir(), "community-submit-test-"));
  await cp(root, workspace, { recursive: true, filter: (source) =>
    !["node_modules", ".next", ".git"].includes(basename(source)) && !basename(source).startsWith(".env") });
  await symlink(join(root, "node_modules"), join(workspace, "node_modules"), "dir");
  const reservation = createServer();
  base = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  const env = { ...process.env, COMMUNITY_SERVICE_URL: serviceUrl, NEXT_TELEMETRY_DISABLED: "1" };
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
  const select = html.match(/<label>Entry type<select[^>]*>(.*?)<\/select>/s)?.[1];
  assert.ok(select, "The submission form must expose an Entry type selector");
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map((match) => [match[1], match[2]]),
    [["origin", "Origin"], ["improved", "Improved"], ["update", "Update"], ["fix", "Fix"]]);
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
  assert.match(html, /Original authors/);
  assert.match(html, /<legend>Original authors<\/legend>.*?<label>Name<input required=""[^>]*value="Original author"/s);
  assert.match(html, /<button[^>]*type="submit">Submit registration<\/button>/);
});

test("Origin hides the original-author fields and keeps maintainer input", async () => {
  const html = await page("ready");
  assert.match(html, /value="origin" selected=""/);
  assert.doesNotMatch(html, /<legend>Original authors<\/legend>/);
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

test("Google users must authenticate with GitHub while preserving the target pipeline", async () => {
  const html = await page("google", "?pipelineId=cp_example");
  assert.match(html, /provider=github/);
  assert.match(html, /returnTo=%2Fcommunity%2Fregistry%2Fsubmit%3FpipelineId%3Dcp_example/);
  assert.doesNotMatch(html, /<form/);
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

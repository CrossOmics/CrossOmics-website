import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://test.example" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.FormData = dom.window.FormData;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const require = createRequire(import.meta.url);
require.extensions[".tsx"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText, filename);
require.extensions[".ts"] = require.extensions[".tsx"];
const Module = require("node:module");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolveFilename.call(this, request.startsWith("@/") ? fileURLToPath(new URL("../" + request.slice(2), import.meta.url)) : request, ...args);
};
const { createElement, act } = require("react");
const { createRoot } = require("react-dom/client");
const Fields = require("../app/community/registry/submit/UpdateVerificationFields.tsx").default;
const root = createRoot(document.getElementById("root"));
let instance = 0;
async function render(repository = "https://github.com/example/upstream") {
  await act(() => root.render(createElement("form", {}, createElement(Fields, { key: ++instance, targetKey: repository, upstreamRepository: repository }))));
}
async function choose(name, value) {
  const select = document.querySelector(`[name="${name}"]`);
  await act(() => { select.value = value; select.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
}
function values() { return Object.fromEntries(new dom.window.FormData(document.querySelector("form"))); }
after(async () => { await act(() => root.unmount()); Module._resolveFilename = resolveFilename; dom.window.close(); });

test("new repository uses a required benchmark Markdown link and submits the entered repository", async () => {
  await render();
  document.querySelector('[name="repository"]').value = "https://github.com/example/faster";
  document.querySelector('[name="evidenceUrl"]').value = "https://github.com/example/faster/blob/main/benchmark.md";
  assert.deepEqual(values(), { updateSource: "new_repository", repository: "https://github.com/example/faster", verificationKind: "benchmark", evidenceUrl: "https://github.com/example/faster/blob/main/benchmark.md" });
  assert.equal(document.querySelector('[name="evidenceUrl"]').required, true);
  assert.match(document.getElementById("update-verification-help").textContent, /benchmark .md file/);
});

test("upstream PR reuses the selected repository and clears the previous benchmark link", async () => {
  await render("http://github.com/example/upstream.git///");
  document.querySelector('[name="repository"]').value = "https://github.com/example/faster";
  document.querySelector('[name="evidenceUrl"]').value = "https://github.com/example/faster/blob/main/benchmark.md";
  await choose("updateSource", "upstream_pr");
  assert.deepEqual(values(), { updateSource: "upstream_pr", repository: "https://github.com/example/upstream", verificationKind: "pull_request", evidenceUrl: "" });
  assert.equal(document.querySelector('[name="repository"]').readOnly, true);
  document.querySelector('[name="evidenceUrl"]').value = "https://github.com/example/upstream/pull/42";
  assert.equal(values().evidenceUrl, "https://github.com/example/upstream/pull/42");
  await choose("updateSource", "new_repository");
  assert.equal(values().repository, "");
  assert.equal(values().evidenceUrl, "");
  assert.equal(document.querySelector('[name="repository"]').readOnly, false);
});

test("new repository may use a PR, and switching verification kinds clears stale URLs", async () => {
  await render();
  document.querySelector('[name="evidenceUrl"]').value = "https://github.com/example/faster/blob/main/benchmark.md";
  await choose("verificationKind", "pull_request");
  assert.equal(values().verificationKind, "pull_request");
  assert.equal(values().evidenceUrl, "");
  assert.match(document.querySelector('[name="evidenceUrl"]').placeholder, /pull\/123/);
});

test("changing the based-on version remounts repository and verification fields without stale values", async () => {
  await render();
  await choose("updateSource", "upstream_pr");
  document.querySelector('[name="evidenceUrl"]').value = "https://github.com/example/upstream/pull/42";
  await render("https://github.com/example/different");
  assert.equal(values().updateSource, "new_repository");
  assert.equal(values().evidenceUrl, "");
  await choose("updateSource", "upstream_pr");
  assert.equal(values().repository, "https://github.com/example/different");
});

test("choosing a tool in PR mode shows its recorded repository before a version is selected", async () => {
  const Form = require("../app/community/registry/submit/RegistryFormV2.tsx").default;
  const original = { id: "cv_original", type: "original", label: "1.0", repo: "https://github.com/example/upstream", authors: [], maintainers: [] };
  const fork = { ...original, id: "cv_fork", type: "update", label: "1.1", repo: "https://github.com/example/fork" };
  const tool = { id: "cp_example", name: "Example", versions: [original, fork], repositories: [{ url: original.repo, primary: true }] };
  const solo = { ...tool, id: "cp_solo", name: "Solo", versions: [
    { ...original, id: "cv_solo", repo: "https://github.com/example/solo" }, { ...fork, withdrawn: true }
  ], repositories: [{ url: "https://github.com/example/solo", primary: true }] };
  await act(() => root.render(createElement(Form, { key: ++instance, items: [tool, solo], submitter: { id: "123456", login: "tester" }, updateAuthorsAvailable: true })));
  await choose("type", "update");
  await choose("updateSource", "upstream_pr");
  async function selectTool(id) {
    const select = [...document.querySelectorAll("select")].find(node => node.labels[0].textContent.startsWith("Existing tool"));
    await act(() => { select.value = id; select.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
  }
  await selectTool(tool.id);
  assert.equal(values().updateSource, "upstream_pr");
  const repositoryField = () => [...document.querySelectorAll("input")].find(input => input.labels?.[0]?.textContent.includes("repository"));
  assert.equal(repositoryField().value, "https://github.com/example/upstream");
  assert.equal(repositoryField().readOnly, true);
  const link = document.querySelector('[name="evidenceUrl"]');
  assert.equal(link.labels[0].textContent.trim(), "Pull Request Link");
  assert.ok(link.compareDocumentPosition(repositoryField()) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(values().repository, undefined);
  assert.equal(values().parentVersionId, "");
  await choose("parentVersionId", fork.id);
  assert.equal(values().repository, "https://github.com/example/fork");
  document.querySelector('[name="evidenceUrl"]').value = "https://github.com/example/fork/pull/15";
  await selectTool(solo.id);
  assert.equal(values().parentVersionId, "cv_solo");
  assert.equal(values().repository, "https://github.com/example/solo");
  assert.equal(values().evidenceUrl, "");
});

test("a tool preselected by its detail page defaults to its only published version", async () => {
  const Form = require("../app/community/registry/submit/RegistryFormV2.tsx").default;
  const original = { id: "cv_original", type: "original", label: "1.0", repo: "https://github.com/example/upstream", authors: [], maintainers: [] };
  const tool = { id: "cp_example", name: "Example", versions: [original] };
  await act(() => root.render(createElement(Form, { key: ++instance, initialId: tool.id, items: [tool], submitter: { id: "123456", login: "tester" }, updateAuthorsAvailable: true })));
  await choose("updateSource", "upstream_pr");
  assert.equal(values().parentVersionId, "cv_original");
  assert.equal(values().repository, "https://github.com/example/upstream");
});

test("the complete Update form sends the correct repository and verification fields through its real submit handler", async () => {
  const Form = require("../app/community/registry/submit/RegistryFormV2.tsx").default;
  const item = { id: "cp_example", name: "Example", description: "Align sequences", domain: "genomics", versions: [
    { id: "cv_example", type: "original", label: "1.0", repo: "https://github.com/example/upstream", authors: [{ name: "Original Author" }], maintainers: [] },
    { id: "cv_second", type: "update", label: "1.1", repo: "https://github.com/example/different", authors: [{ name: "Update Author" }], maintainers: [] }
  ] };
  const originalFetch = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (url, request) => {
    assert.equal(url, "/api/community/v2/registry/submissions");
    sent.push(JSON.parse(request.body));
    return Response.json({ error: "Test endpoint: registration captured" }, { status: 422 });
  };
  try {
    for (const source of ["new_repository", "upstream_pr"]) {
      await act(() => root.render(createElement(Form, { key: ++instance, initialId: item.id, items: [item], submitter: { id: "123456", login: "tester" }, updateAuthorsAvailable: true })));
      await choose("parentVersionId", "cv_example");
      await choose("updateSource", source);
      const field = (name, value) => {
        const element = document.querySelector(`[name="${name}"]`);
        const prototype = element.tagName === "TEXTAREA" ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
        element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      };
      await act(() => {
        field("updateAuthorNames", "New Author"); field("changeSummary", "Faster alignment"); field("label", "2.0"); field("commit", "b".repeat(40));
        if (source === "new_repository") field("repository", "https://github.com/example/faster");
        field("evidenceUrl", source === "new_repository" ? "https://github.com/example/faster/blob/main/benchmark.md" : "https://github.com/example/upstream/pull/12");
      });
      assert.equal(document.querySelector("form").checkValidity(), true);
      await act(async () => document.querySelector("form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })));
      const body = sent.at(-1);
      assert.equal(body.updateSource, source);
      assert.equal(body.repository, source === "new_repository" ? "https://github.com/example/faster" : "https://github.com/example/upstream");
      assert.equal(body.verificationKind, source === "new_repository" ? "benchmark" : "pull_request");
      assert.deepEqual(body.updateAuthors, [{ name: "New Author" }]);
      assert.equal(body.parentVersionId, "cv_example");
      assert.equal(body.type, "update");
      await choose("parentVersionId", "cv_second");
      assert.equal(values().updateSource, source);
      assert.equal(values().evidenceUrl, "");
      assert.equal(values().repository, source === "new_repository" ? "" : "https://github.com/example/different");
      await choose("updateSource", "upstream_pr");
      assert.equal(values().repository, "https://github.com/example/different");
      await act(() => field("evidenceUrl", "https://github.com/example/different/pull/15"));
      await act(async () => document.querySelector("form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })));
      assert.equal(sent.at(-1).repository, "https://github.com/example/different");
      assert.equal(sent.at(-1).parentVersionId, "cv_second");
    }
    assert.equal(sent.length, 4);
  } finally { globalThis.fetch = originalFetch; }
});

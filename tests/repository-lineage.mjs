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
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
const require = createRequire(import.meta.url);
require.extensions[".tsx"] = require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText, filename);
require.extensions[".css"] = module => { module.exports = { __esModule: true, default: {} }; };
const Module = require("node:module");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolveFilename.call(this, request.startsWith("@/") ? fileURLToPath(new URL("../" + request.slice(2), import.meta.url)) : request, ...args);
};
const { createElement, act } = require("react");
const { createRoot } = require("react-dom/client");
const Repositories = require("../app/community/catalog/[id]/RepositoryVersions.tsx").default;
const { AppRouterContext } = require("next/dist/shared/lib/app-router-context.shared-runtime.js");
function render(props) {
  return createElement(AppRouterContext.Provider, { value: { refresh() {} } }, createElement(Repositories, props));
}
const root = createRoot(document.getElementById("root"));
const upstream = "https://github.com/example/tool";
const fork = "https://github.com/example/faster";
function version(id, repo, date, parent = null, extra = {}) {
  return { id, repo, label: id, released_at: date, parent, type: "original", commit: "a".repeat(40),
    improvement: null, withdrawn: false, authors: [{ name: "Upstream author" }], maintainers: [], ...extra };
}
const item = { id: "cp_fixture", name: "Tool", kind: "tool", description: "Fixture", domain: "genomics", status: "active",
  modalities: [], algorithms: [], keywords: [], inputs: [], outputs: [], papers: [], metrics: null,
  repositories: [{ url: upstream, primary: true }], recommendedVersionIds: ["fork-root"], versions: [
    version("v1", upstream, "2024-01-01"), version("v2", upstream, "2025-01-01", "v1"),
    version("fork-root", fork, "2026-01-01", "v2", { type: "update", updateAuthors: [{ name: "Update developer" }], citation: "Update citation" })
  ] };
after(async () => { await act(() => root.unmount()); Module._resolveFilename = resolveFilename; dom.window.close(); });

test("repository graphs expand independently, select historical details and retain v2 credits and controls", async () => {
  await act(() => root.render(render({ item, v2: true, canManage: true })));
  const cards = [...document.querySelectorAll(".community-repository")];
  assert.equal(cards.length, 2);
  assert.equal(cards[0].getAttribute("data-repository"), fork);
  assert.match(cards[0].textContent, /Pinned · Recommended/);
  assert.match(cards[0].textContent, /Upstream authors.*Upstream author.*Update authors.*Update developer/);
  assert.match(cards[0].textContent, /Update citation/);
  assert.match(cards[0].textContent, /Derived from v2/);
  assert.doesNotMatch(cards[0].textContent, /Parent not available/);
  assert.equal(cards[1].querySelectorAll("[data-version-id]").length, 1);
  assert.equal(cards[1].querySelector("[data-version-id]").dataset.versionId, "v2");
  assert.match(cards[1].textContent, /Withdraw this version/);
  const toggle = cards[1].querySelector('[aria-expanded="false"]');
  await act(() => toggle.click());
  assert.equal(cards[0].querySelector("[aria-expanded]").getAttribute("aria-expanded"), "false");
  const nodes = [...cards[1].querySelectorAll("button[aria-pressed]")];
  assert.equal(nodes.length, 2);
  assert.ok(nodes.every(node => !node.textContent.includes("fork-root")));
  await act(() => nodes.find(node => node.getAttribute("aria-label").startsWith("v1,")).click());
  assert.equal(cards[1].querySelector("[data-version-id]").dataset.versionId, "v1");
  await act(() => toggle.click());
  assert.equal(cards[1].querySelector("[data-version-id]").dataset.versionId, "v2");
});

test("invalid historical parents remain diagnosed after selecting their own repository node", async () => {
  const invalid = { ...item, id: "cp_invalid", versions: [
    version("orphan", upstream, "2024-01-01", "absent", { type: "update" }),
    version("self", upstream, "2025-01-01", "self", { type: "update" })
  ] };
  await act(() => root.render(render({ key: "invalid", item: invalid, v2: true })));
  await act(() => document.querySelector('[aria-expanded="false"]').click());
  const orphan = [...document.querySelectorAll("button[aria-pressed]")].find(node => node.getAttribute("aria-label").startsWith("orphan,"));
  await act(() => orphan.click());
  const details = document.querySelector("[data-version-id]");
  assert.match(details.textContent, /Parent not available/);
  assert.doesNotMatch(details.textContent, /Based on|Original authors/);
});

test("curated commit snapshots cannot expose withdrawal actions for unregistered versions", async () => {
  const star = { ...item, id: "cp_star", versions: [], repositories: [] };
  await act(() => root.render(render({ key: "star", item: star, v2: true, canManage: true })));
  assert.match(document.body.textContent, /NuSTAR.*Pinned · Admin selected/);
  assert.doesNotMatch(document.body.textContent, /Withdraw this version|Correct author credits/);
});

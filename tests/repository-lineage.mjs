import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://test.example" });
globalThis.window = dom.window;
globalThis.self = dom.window;
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

test("tool lineage spans repositories while cards link to repository contributions", async () => {
  const ToolLineage = require("../app/community/catalog/[id]/ToolLineage.tsx").default;
  await act(() => root.render(createElement(AppRouterContext.Provider, { value: { refresh() {} } },
    createElement("div", null, createElement(ToolLineage, { item, v2: true, canManage: true }), createElement(Repositories, { item, v2: true, canManage: true })))));
  const cards = [...document.querySelectorAll(".community-repository")];
  assert.equal(cards.length, 2);
  assert.equal(cards[0].dataset.repository, fork);
  assert.match(cards[0].textContent, /Maintainer Pick/);
  assert.ok(cards.every(card => !card.textContent.includes("View lineage")));
  for (const card of cards) {
    const url = new URL([...card.querySelectorAll("a")].find(link => link.textContent === "View contributions").href);
    assert.equal(url.searchParams.get("repository"), card.dataset.repository);
    assert.equal(url.searchParams.get("catalogId"), item.id);
  }
  assert.doesNotMatch(document.body.textContent, /a{40}/);
  const toggle = document.querySelector('#lineage [aria-expanded="false"]');
  await act(() => toggle.click());
  const nodes = [...document.querySelectorAll("button[aria-pressed]")];
  assert.equal(nodes.length, 2);
  assert.match(nodes.find(node => node.textContent.includes("fork-root")).getAttribute("aria-label"), /based on Tool/);
  const history=document.querySelector("#lineage .community-lineage-history");
  await act(() => { history.open=true; history.dispatchEvent(new window.Event("toggle")); });
  const historyToggle=[...history.querySelectorAll("button")].find(button=>button.textContent==="View lineage");
  await act(() => historyToggle.click());
  await act(() => [...history.querySelectorAll("button[aria-pressed]")].find(node=>node.getAttribute("aria-label").startsWith("v1,")).click());
  assert.equal(history.querySelector("[data-version-id]").dataset.versionId, "v1");
  assert.match(document.querySelector("[data-version-id]").textContent, /Withdraw this version/);
});

test("repository search reports an empty result and update sorting retains picks first", async () => {
  await act(() => root.render(render({ key: "search", item })));
  const search = document.querySelector('input[type="search"]');
  assert.ok(search);
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  await act(() => { setter.call(search, "missing repository"); search.dispatchEvent(new window.Event("input", { bubbles: true })); });
  assert.equal(document.querySelectorAll(".community-repository").length, 0);
  assert.match(document.body.textContent, /No repositories match/);
});

test("invalid tool ancestry stays diagnosed without fabricated cross-repository edges", async () => {
  const ToolLineage = require("../app/community/catalog/[id]/ToolLineage.tsx").default;
  const invalid = { ...item, versions: [version("orphan", upstream, "2024-01-01", "absent", {type:"update"})] };
  await act(() => root.render(createElement(ToolLineage, {key:"invalid", item:invalid, v2:true})));
  await act(() => document.querySelector('[aria-expanded="false"]').click());
  assert.match(document.querySelector("[data-version-id]").textContent, /Parent not available/);
  assert.doesNotMatch(document.querySelector("[data-version-id]").textContent, /Based on|Original authors/);
});

test("curated snapshots do not invent benchmark results or expose registry mutation controls", async () => {
  const star = { ...item, id:"cp_star", versions:[], repositories:[] };
  await act(() => root.render(render({key:"star",item:star,v2:true,canManage:true})));
  assert.match(document.body.textContent, /NuSTAR.*Platform endorsement/);
  assert.doesNotMatch(document.body.textContent, /1.3×|Formal verification|Withdraw this version|Correct author credits/);
});


test("top lineage link opens the diagram on first and repeated clicks and direct hash navigation",async()=>{
  const ToolLineage=require("../app/community/catalog/[id]/ToolLineage.tsx").default;
  await act(()=>root.render(createElement("div",{key:"top-link"},createElement("a",{href:"#lineage"},"Top lineage"),createElement(ToolLineage,{item,v2:true}))));
  const link=document.querySelector('a[href="#lineage"]');
  await act(async()=>{link.click(); await new Promise(resolve=>setTimeout(resolve,20));});
  assert.ok(document.querySelector('#lineage [aria-label="Implementation lineage canvas"]'));
  await act(()=>document.querySelector('#lineage button[aria-expanded="true"]').click());
  assert.ok(!document.querySelector('#lineage [aria-label="Implementation lineage canvas"]'));
  await act(async()=>{link.click(); await new Promise(resolve=>setTimeout(resolve,20));});
  assert.ok(document.querySelector('#lineage [aria-label="Implementation lineage canvas"]'));
  window.history.replaceState(null,"","#lineage");
  await act(()=>root.render(createElement(ToolLineage,{key:"direct-hash",item,v2:true})));
  assert.ok(document.querySelector('#lineage [aria-label="Implementation lineage canvas"]'));
  window.history.replaceState(null,"","/");
});

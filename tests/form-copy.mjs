import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText, filename);
const exports = require("../lib/community/form-copy.ts");

test("new projects describe their purpose while fixes and improvements describe their changes", () => {
  assert.equal(exports.contributionSummary("original").label, "What does it do?");
  assert.equal(exports.contributionSummary("update").label, "What did you update?");
  assert.equal(exports.contributionSummary("optimization").label, exports.contributionSummary("update").label);
  assert.equal(exports.contributionSummary("bug_fix").label, exports.contributionSummary("update").label);
  assert.notEqual(exports.contributionSummary("original").placeholder, exports.contributionSummary("update").placeholder);
});

test("the contribution form explains only the supported Tool item", () => {
  assert.deepEqual(Object.keys(exports.subjectDescriptions), ["tool"]);
  assert.match(exports.subjectDescriptions.tool, /MAFFT/);
});


const { normalizeToolType, toolTypes } = require("../lib/community/tool-types.ts");
test("Original/Update normalizes both legacy registries and contribution histories", () => {
  assert.deepEqual(Object.keys(toolTypes), ["original", "update"]);
  for (const value of ["original", "origin", "new_pipeline"]) assert.equal(normalizeToolType(value), "original");
  for (const value of ["update", "improved", "fix", "algorithm_update", "bug_fix", "optimization", "maintenance"]) assert.equal(normalizeToolType(value), "update");
  for (const value of ["workflow", "tool", "unknown", null, {}, 42]) assert.equal(normalizeToolType(value), null);
});


test("the Tool UI can write through the existing backend during a frontend-first rollout", () => {
  const { registryRequestType, contributionRequestType, isToolKind } = require("../lib/community/tool-types.ts");
  assert.equal(registryRequestType("original"), "origin");
  assert.equal(registryRequestType("update"), "update");
  assert.equal(contributionRequestType("original"), "new_pipeline");
  assert.equal(contributionRequestType("update"), "algorithm_update");
  for (const value of ["tool", "", null, undefined]) assert.equal(isToolKind(value), true);
  for (const value of ["workflow", "algorithm", "unknown"]) assert.equal(isToolKind(value), false);
});


const { toolMaintainers, orderedToolVersions } = require("../lib/community/tool-maintenance.ts");
test("Tool maintainers never default to historical per-version author or maintainer credits", () => {
  const item={versions:[{id:"cv_original",type:"original",maintainers:[{name:"Old maintainer"}]}]};
  assert.deepEqual(toolMaintainers(item),[]);
  assert.deepEqual(toolMaintainers({...item,maintainers:[{name:"Registered maintainer"}]}),[{name:"Registered maintainer"}]);
  assert.deepEqual(toolMaintainers({...item,maintainers:[]}),[]);
});

test("recommendations preserve complete history while ignoring missing or withdrawn pins", () => {
  const versions=[{id:"cv_original"},{id:"cv_update"},{id:"cv_withdrawn",withdrawn:true}];
  const result=orderedToolVersions({versions,recommendedVersionIds:["cv_missing","cv_withdrawn","cv_update"]});
  assert.deepEqual(result.map(v=>v.id),["cv_update","cv_original","cv_withdrawn"]);
  assert.deepEqual(versions.map(v=>v.id),["cv_original","cv_update","cv_withdrawn"]);
});

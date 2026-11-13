import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../lib/community/form-copy.ts", import.meta.url), "utf8");
const exports = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });

test("new projects describe their purpose while fixes and improvements describe their changes", () => {
  assert.equal(exports.contributionSummary("new_pipeline").label, "What does it do?");
  assert.equal(exports.contributionSummary("bug_fix").label, "What problem did you fix?");
  assert.equal(exports.contributionSummary("optimization").label, "What did you improve?");
  assert.notEqual(exports.contributionSummary("new_pipeline").placeholder, exports.contributionSummary("maintenance").placeholder);
});

test("all three item types have concrete definitions", () => {
  assert.match(exports.subjectDescriptions.pipeline, /several analysis steps/);
  assert.match(exports.subjectDescriptions.tool, /MAFFT/);
  assert.match(exports.subjectDescriptions.algorithm, /method used inside a tool/);
});

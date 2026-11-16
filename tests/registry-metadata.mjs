import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.tsx'] = require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText, filename);
const { readRegistryMetadata, changedRegistryMetadata } = require('../app/community/registry/RegistryMetadataFields.tsx');

test('metadata editor preserves semicolons within a value and normalizes lines', () => {
  const form = new FormData();
  form.set('modalities', ' RNA-seq \nRNA-seq\n\n');
  form.set('outputs', 'BAM; indexed\n CRAM ');
  assert.deepEqual(readRegistryMetadata(form), { modalities: ['RNA-seq'], algorithms: [], inputs: [], outputs: ['BAM; indexed', 'CRAM'] });
});

test('later versions omit untouched prefilled metadata but preserve intentional clearing', () => {
  const baseline = { modalities: ['RNA-seq'], algorithms: ['Alignment'], inputs: ['FASTQ'], outputs: ['BAM; indexed'] };
  assert.deepEqual(changedRegistryMetadata({ ...baseline }, baseline), {});
  assert.deepEqual(changedRegistryMetadata({ ...baseline, outputs: [] }, baseline), { outputs: [] });
  assert.deepEqual(changedRegistryMetadata({ ...baseline, inputs: ['FASTA'] }, baseline), { inputs: ['FASTA'] });
});

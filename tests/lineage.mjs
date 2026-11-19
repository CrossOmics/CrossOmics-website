import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText, filename);
let api = {};
try { api = require('../lib/community/lineage.ts'); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
const v = (id, parent = null) => ({ id, parent });

test('branches follow parent IDs even when a descendant or recommendation comes first', () => {
  assert.equal(typeof api.buildLineage, 'function');
  const graph = api.buildLineage([v('leaf','a'),v('b','root'),v('root'),v('a','root'),v('other')]);
  assert.deepEqual(graph.edges.map(e => [e.parent,e.child]).sort(), [['a','leaf'],['root','a'],['root','b']]);
  const nodes = Object.fromEntries(graph.nodes.map(n => [n.id,n]));
  assert.ok(nodes.root.x < nodes.a.x && nodes.a.x < nodes.leaf.x);
  assert.equal(nodes.a.x,nodes.b.x);
  assert.notEqual(nodes.a.y,nodes.b.y);
  assert.notEqual(nodes.root.y,nodes.other.y);
  assert.equal(graph.nodes.length,5);
});

test('missing, self and cyclic parents stay visible without fabricated links', () => {
  assert.equal(typeof api.buildLineage, 'function');
  const graph = api.buildLineage([v('orphan','absent'),v('self','self'),v('a','b'),v('b','a'),v('child','b')]);
  assert.deepEqual(graph.edges.map(e => [e.parent,e.child]), [['b','child']]);
  const nodes = Object.fromEntries(graph.nodes.map(n=>[n.id,n]));
  assert.equal(nodes.orphan.issue,'missing-parent');
  assert.equal(nodes.self.issue,'cycle');
  assert.equal(nodes.a.issue,'cycle'); assert.equal(nodes.b.issue,'cycle');
  assert.equal(nodes.child.issue,null);
  assert.equal(graph.nodes.length,5);
});

test('empty and deep catalogs return finite bounds without recursion overflow', () => {
  assert.equal(typeof api.buildLineage, 'function');
  const empty = api.buildLineage([]);
  assert.deepEqual(empty.nodes,[]); assert.deepEqual(empty.edges,[]);
  const versions = Array.from({length:5000},(_,i)=>v(String(i),i?String(i-1):null)).reverse();
  const graph = api.buildLineage(versions);
  assert.equal(graph.nodes.length,5000); assert.equal(graph.edges.length,4999);
  for(const n of graph.nodes) assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y));
  assert.ok(Number.isFinite(graph.width) && graph.width>0 && Number.isFinite(graph.height) && graph.height>0);
});

test('fit centers the whole graph within the viewport and retains usable zoom bounds', () => {
  assert.equal(typeof api.fitLineage, 'function');
  const view=api.fitLineage({width:1000,height:500},{width:500,height:300});
  assert.ok(view.scale>=.1 && view.scale<=1);
  assert.ok(view.x>=0 && view.y>=0);
  assert.ok(view.x+1000*view.scale<=500);
  assert.ok(view.y+500*view.scale<=300);
  const tiny=api.fitLineage({width:1e7,height:500},{width:320,height:300});
  assert.equal(tiny.scale,.1);
  const zero=api.fitLineage({width:0,height:0},{width:0,height:0});
  assert.ok(Object.values(zero).every(Number.isFinite));
});

test('zoom preserves the chosen screen anchor and clamps at 10% and 200%', () => {
  assert.equal(typeof api.zoomLineage,'function');
  const view=api.zoomLineage({scale:1,x:30,y:40},2,{x:100,y:100});
  assert.deepEqual(view,{scale:2,x:-40,y:-20});
  assert.equal(api.zoomLineage(view,100,{x:0,y:0}).scale,2);
  assert.equal(api.zoomLineage(view,0,{x:0,y:0}).scale,.1);
});

test('pinch zoom follows the finger midpoint and a pan cannot move a pressed node', () => {
  assert.equal(typeof api.moveLineageGesture,'function');
  const start={view:{scale:1,x:0,y:0},point:{x:100,y:100},distance:100,pan:false};
  assert.deepEqual(api.moveLineageGesture(start,[{x:50,y:100},{x:250,y:100}]),{scale:2,x:-50,y:-100});
  assert.equal(api.moveLineageGesture(start,[{x:150,y:150}]),null);
  assert.equal(api.moveLineageGesture(start,[]),null);
  assert.deepEqual(api.moveLineageGesture({...start,view:{scale:1,x:10,y:20},point:{x:30,y:40},distance:0,pan:true},[{x:55,y:65}]),{scale:1,x:35,y:45});
});

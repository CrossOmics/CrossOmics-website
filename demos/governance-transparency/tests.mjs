import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, verifyBundle, canonical, merkleRoot, inclusionProof, verifyInclusion } from './dist/ledger.mjs';

test('canonical JSON is stable and Merkle proofs cover non-power-of-two trees', async()=>{
  assert.equal(canonical({b:2,a:1}),'{"a":1,"b":2}');
  const values=['a','b','c','d','e'];
  const root=await merkleRoot(values);
  for(let i=0;i<values.length;i++)assert.equal(await verifyInclusion(values[i],i,values.length,await inclusionProof(values,i),root),true);
  assert.equal(await verifyInclusion('changed',2,5,await inclusionProof(values,2),root),false);
});
test('valid records, actor signatures, checkpoint and local witness signatures verify',async()=>{
  const demo=await createDemo();
  const result=await verifyBundle(await demo.bundle(2),demo.trust);
  assert.equal(result.ok,true);
  assert.ok(result.checks.every(c=>c.ok));
});
test('alteration, truncation, and replacing trusted keys are detected',async()=>{
  const demo=await createDemo();
  const bundle=await demo.bundle(2);
  const altered=structuredClone(bundle);altered.events[1].body.change.after=['Mallory'];
  assert.equal((await verifyBundle(altered,demo.trust)).ok,false);
  const truncated=structuredClone(bundle);truncated.events.pop();
  assert.equal((await verifyBundle(truncated,demo.trust)).ok,false);
  const another=await createDemo();
  assert.equal((await verifyBundle(await another.bundle(2),demo.trust)).ok,false);
  const witness=structuredClone(bundle);witness.checkpoint.witnesses=[];
  assert.equal((await verifyBundle(witness,demo.trust)).ok,false);
});
test('membership needs strict majority and candidate acceptance, then revoked access disappears',async()=>{
  const demo=await createDemo();
  const proposal=await demo.propose('AAA','transfer','CCC','Hand off maintenance responsibilities');
  assert.equal(demo.state.proposals[proposal].status,'voting');
  await assert.rejects(()=>demo.accept('CCC',proposal),/has not yet passed/);
  await demo.vote('BBB',proposal);
  assert.equal(demo.state.proposals[proposal].status,'awaiting_acceptance');
  assert.equal(demo.state.maintainers.includes('CCC'),false);
  await demo.accept('CCC',proposal);
  assert.deepEqual(demo.state.maintainers,['BBB','CCC']);
  await assert.rejects(()=>demo.recommend('AAA','nustar','version','Former maintainer'),/No .*permission/);
  assert.equal((await verifyBundle(await demo.bundle(),demo.trust)).ok,true);
});
test('viewer, cross-tool changes and duplicate votes never append a successful event',async()=>{
  const demo=await createDemo();const count=demo.events.length;
  await assert.rejects(()=>demo.recommend('viewer','nustar','repository','test'),/No .*permission/);
  await assert.rejects(()=>demo.recommend('AAA','nustar','repository','test','cp_bwa'),/scope/);
  assert.equal(demo.events.length,count);
  const id=await demo.propose('AAA','add','CCC','Add a maintainer');
  await assert.rejects(()=>demo.vote('AAA',id),/already/);
  await assert.rejects(()=>demo.vote('CCC',id),/No .*permission/);
});
test('a prior valid checkpoint is rejected after the session has observed newer published history',async()=>{
  const demo=await createDemo();const previous=await demo.bundle();
  await demo.recommend('AAA','star','version','Select another version');
  const result=await verifyBundle(previous,demo.trust);
  assert.equal(result.ok,false);
  assert.equal(result.checks.find(c=>c.name==='Checkpoint freshness').ok,false);
});
test('membership ABA changes permanently invalidate old proposals and votes',async()=>{
  const demo=await createDemo();
  const old=await demo.propose('AAA','add','CCC','Old proposal');await demo.vote('BBB',old);
  const handoff=await demo.propose('AAA','transfer','CCC','Handoff');await demo.vote('BBB',handoff);await demo.accept('CCC',handoff);
  const back=await demo.propose('CCC','transfer','AAA','Hand back');await demo.vote('BBB',back);await demo.accept('AAA',back);
  assert.equal(demo.state.proposals[old].status,'superseded');
  await assert.rejects(()=>demo.accept('CCC',old),/superseded/);
  assert.equal((await verifyBundle(await demo.bundle(),demo.trust)).ok,true);
});
test('administrator invitation does not grant authority before the candidate accepts',async()=>{
  const demo=await createDemo();
  const id=await demo.appoint('admin','CCC','Invite a new maintainer');
  assert.equal(demo.state.maintainers.includes('CCC'),false);
  await assert.rejects(()=>demo.recommend('CCC','nustar','version','Try a change'),/No .*permission/);
  await demo.accept('CCC',id);
  assert.equal(demo.state.maintainers.includes('CCC'),true);
});

// Catch current-role substitution, incomplete evidence masquerading as authority,
// unrelated votes being attached, accidental commit pins and stale event links.
const lineage = await import('./dist/lineage.mjs');
test('historical recommendation traces the grant active then, even after handoff',async()=>{
  const demo=await createDemo(),original=demo.events.at(-1);
  const id=await demo.propose('AAA','transfer','CCC','Handoff');await demo.vote('BBB',id);await demo.accept('CCC',id);
  const graph=lineage.buildLineage(demo.events,original.hash);
  assert.deepEqual(graph.nodes.filter(n=>n.event).map(n=>n.event.body.sequence).sort((a,b)=>a-b),[1,2,3,7]);
  assert.equal(graph.missing.length,0);
  assert.ok(graph.edges.some(e=>e.type==='authority'&&e.from===demo.events[2].hash&&e.to===original.hash));
  assert.equal(graph.target.commit,'00467cd3f8fc8595f635d5c8ee35b26c9488411a');
});
test('successor recommendation includes proposal, threshold vote and acceptance',async()=>{
  const demo=await createDemo();const id=await demo.propose('AAA','transfer','CCC','Handoff');
  await demo.vote('BBB',id);await demo.accept('CCC',id);await demo.recommend('CCC','star','repository','New recommendation');
  const graph=lineage.buildLineage(demo.events,demo.events.at(-1).hash);
  assert.ok(graph.nodes.some(n=>n.event?.body.action==='proposal.voted'&&n.event.body.actor==='BBB'));
  assert.ok(graph.edges.some(e=>e.type==='vote'&&e.from===demo.events[8].hash&&e.to===demo.events[9].hash));
  assert.ok(graph.edges.some(e=>e.type==='authority'&&e.from===demo.events[9].hash&&e.to===demo.events[10].hash));
  assert.equal(graph.target.commit,null);
  assert.equal(graph.missing.length,0);
});
test('missing or foreign Tool grants remain unresolved and future invitations cannot fill gaps',async()=>{
  const demo=await createDemo(),events=demo.events;
  const missing=events.filter(e=>e.body.sequence!==3);
  assert.ok(lineage.buildLineage(missing,events[6].hash).missing.some(m=>m.kind==='authority'));
  const foreign=structuredClone(events);foreign[2].body.toolId='cp_bwa';
  assert.ok(lineage.buildLineage(foreign,events[6].hash).missing.some(m=>m.kind==='authority'));
  const future=structuredClone(events);future[2].body.sequence=100;future.push(future.splice(2,1)[0]);
  assert.ok(lineage.buildLineage(future,events[6].hash).missing.some(m=>m.kind==='authority'));
});
test('unknown session hash fails visibly and routes preserve the selected event',async()=>{
  const demo=await createDemo();
  const route=lineage.eventRoute('lineage',demo.events[2].hash);
  assert.deepEqual(lineage.parseRoute(route,demo.events),{tab:'lineage',index:2,unavailable:false});
  assert.equal(lineage.parseRoute('#lineage/'+'a'.repeat(64),demo.events).unavailable,true);
  assert.equal(lineage.parseRoute('#lineage/invalid',demo.events).index,null);
  assert.deepEqual(lineage.buildLineage([], 'a'.repeat(64)).nodes,[]);
});
test('revoked maintainer cannot obtain a lineage grant from their old acceptance',async()=>{
  const demo=await createDemo();const id=await demo.propose('AAA','transfer','CCC','Handoff');await demo.vote('BBB',id);await demo.accept('CCC',id);
  const fake=structuredClone(demo.events[6]);fake.hash='f'.repeat(64);fake.body.sequence=11;
  const graph=lineage.buildLineage([...demo.events,fake],fake.hash);
  assert.ok(graph.missing.some(m=>m.kind==='authority'));
});
test('missing or cross-Tool threshold votes mark successor authorization evidence incomplete',async()=>{
  const demo=await createDemo();const id=await demo.propose('AAA','transfer','CCC','Handoff');await demo.vote('BBB',id);await demo.accept('CCC',id);await demo.recommend('CCC','star','version','Recommendation');
  const events=demo.events,last=events.at(-1).hash;
  assert.ok(lineage.buildLineage(events.filter(e=>e.body.action!=='proposal.voted'),last).missing.some(m=>m.kind==='votes'));
  const foreign=structuredClone(events);foreign.find(e=>e.body.action==='proposal.voted').body.toolId='cp_bwa';
  assert.ok(lineage.buildLineage(foreign,last).missing.some(m=>m.kind==='votes'));
});

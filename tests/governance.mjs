import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { generateKeyPairSync, sign, createHash } from 'node:crypto';
import ts from 'typescript';
const require=createRequire(import.meta.url);
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
let api={}; try{api=require('../lib/community/governance.ts');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
const canonical=value=>JSON.stringify(value&&typeof value==='object'?Array.isArray(value)?value.map(v=>JSON.parse(canonical(v))):Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))])):value);
const hash=s=>createHash('sha256').update(s).digest('hex');
function evidence(){
 const {publicKey,privateKey}=generateKeyPairSync('ed25519');
 const body={schemaVersion:1,logId:'test-log',sequence:1,eventId:'00000000-0000-4000-8000-000000000001',toolId:'cp_test',action:'invite',actor:{id:'public-actor',name:'Alex'},recordedAt:'2026-11-22T00:00:00Z',policyVersion:'1',reason:'Start maintenance',previousEventHash:'0'.repeat(64),beforeStateHash:'a'.repeat(64),afterStateHash:'b'.repeat(64),change:{field:'proposals',before:[],after:[]},references:[]};
 const message='crossomics-governance-event-v1\n'+canonical(body);
 const event={body,hash:hash(message),signature:sign(null,Buffer.from(message),privateKey).toString('base64')};
 const checkpointBody={logId:'test-log',keyId:'test-key',treeSize:1,rootHash:hash(Buffer.concat([Buffer.from([0]),Buffer.from(canonical(event))])),lastEventHash:event.hash,stateHash:body.afterStateHash,previousCheckpointHash:null,recordedAt:body.recordedAt};
 const checkpoint={body:checkpointBody,signature:sign(null,Buffer.from('crossomics-governance-checkpoint-v1\n'+canonical(checkpointBody)),privateKey).toString('base64')};
 const trust={logId:'test-log',keyId:'test-key',publicKey:publicKey.export({format:'jwk'}),signatureType:'service'};
 return {events:[event],selectedIndex:0,proof:[],checkpoint,previousCheckpoint:null,trust};
}
test('evidence verifies service signatures against a separately supplied trust root',async()=>{
 assert.equal(typeof api.verifyGovernanceEvidence,'function'); const data=evidence();
 const result=await api.verifyGovernanceEvidence(data,data.trust);assert.equal(result.valid,true);assert.equal(result.independentlyWitnessed,false);
});
test('tampering and replacing a bundled key cannot pass pinned verification',async()=>{
 assert.equal(typeof api.verifyGovernanceEvidence,'function');const data=evidence();const original=structuredClone(data.trust);
 data.events[0].body.reason='Rewritten';assert.equal((await api.verifyGovernanceEvidence(data,original)).valid,false);
 const replacement=evidence();assert.equal((await api.verifyGovernanceEvidence(replacement,original)).valid,false);
});
test('truncated events and altered inclusion proof are rejected',async()=>{
 assert.equal(typeof api.verifyGovernanceEvidence,'function');const data=evidence();data.events=[];assert.equal((await api.verifyGovernanceEvidence(data,data.trust)).valid,false);
 const bad=evidence();bad.proof=[{side:'right',hash:'f'.repeat(64)}];assert.equal((await api.verifyGovernanceEvidence(bad,bad.trust)).valid,false);
});
test('proposal actions use current membership and candidate identity without granting access',()=>{
 assert.equal(typeof api.proposalActions,'function');
 const p={status:'voting',candidate:{id:'candidate',name:'Sam'},memberIds:['member'],votes:[],membershipVersion:2,expiresAt:'2099-01-01T00:00:00Z'};
 assert.deepEqual(api.proposalActions(p,{actorId:'member',canManage:true,isAdmin:false},2),{canVote:true,canAccept:false});
 assert.equal(api.proposalActions(p,{actorId:'member',canManage:true,isAdmin:false},3).canVote,false);
 assert.equal(api.proposalActions({...p,status:'awaiting_acceptance'},{actorId:'candidate',canManage:false,isAdmin:false},2).canAccept,true);
 assert.equal(api.proposalActions({...p,votes:[{actorId:'member'}]},{actorId:'member',canManage:true,isAdmin:false},2).canVote,false);
});
test('expired invitations do not offer acceptance even if the stored status is pending',()=>{
 const proposal={status:'awaiting_acceptance',candidate:{id:'candidate'},membershipVersion:2,memberIds:[],votes:[],expiresAt:'2000-01-01T00:00:00Z'};
 assert.equal(api.proposalActions(proposal,{actorId:'candidate',canManage:false,isAdmin:false},2).canAccept,false);
});
test('canonicalization rejects values that cannot be public canonical JSON',()=>{
 assert.throws(()=>api.canonicalGovernance([,]));
 assert.throws(()=>api.canonicalGovernance({value:NaN}));
 assert.throws(()=>api.canonicalGovernance('\ud800'));
 const withGetter={get secret(){throw new Error('Getter executed');}};
 assert.throws(()=>api.canonicalGovernance(withGetter),/data propert/i);
});

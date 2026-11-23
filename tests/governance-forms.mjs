import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { generateKeyPairSync, sign, createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'https://test.example'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
const require=createRequire(import.meta.url),Module=require('node:module'),resolve=Module._resolveFilename;
Module._resolveFilename=function(request,...args){return resolve.call(this,request.startsWith('@/')?fileURLToPath(new URL('../'+request.slice(2),import.meta.url)):request,...args)};
require.extensions['.tsx']=(module,file)=>module._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
require.extensions['.ts']=require.extensions['.tsx'];require.extensions['.css']=(module)=>module.exports={};
let refreshes=0,calls=[],failure=false,commandReceipt=null,fetchHandler=null;
const navigation=require.resolve('next/navigation');require.cache[navigation]={id:navigation,filename:navigation,loaded:true,exports:{useRouter:()=>({refresh:()=>refreshes++})}};
globalThis.fetch=async(url,init)=>{if(fetchHandler)return fetchHandler(url,init);calls.push({url,body:JSON.parse(init.body)});return {ok:!failure,json:async()=>failure?{message:'State changed. Refresh before retrying.'}:{state:{},receipt:commandReceipt}}};
const {createElement,act}=require('react'),{createRoot}=require('react-dom/client'),root=createRoot(document.getElementById('root'));
const {ProposalCommands}=require('../app/community/catalog/[id]/governance/GovernanceForms.tsx');
const proposal={id:'proposal',status:'awaiting_acceptance',candidate:{id:'candidate',name:'Sam'},memberIds:['member'],votes:[],membershipVersion:2,expiresAt:'2099-01-01T00:00:00Z'};
const data={state:{toolId:'cp_test',version:7,membershipVersion:2,proposals:[proposal]},capabilities:{actorId:'candidate',canManage:false,isAdmin:false}};
async function render(value=data){await act(()=>root.render(createElement(ProposalCommands,{data:value,proposalId:'proposal'})));}
async function submit(){document.querySelector('textarea').value='I accept the role';await act(()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));}
after(async()=>{await act(()=>root.unmount());Module._resolveFilename=resolve;dom.window.close()});
test('candidate acceptance sends its proposal, state version and reusable request identity',async()=>{
 await render();assert.match(document.body.textContent,/Accept invitation/);failure=true;await submit();
 assert.equal(calls[0].url,'/api/community/v2/catalog/cp_test/governance/commands');assert.equal(calls[0].body.action,'accept');assert.equal(calls[0].body.expectedVersion,7);assert.equal(calls[0].body.proposalId,'proposal');assert.match(calls[0].body.requestId,/^[0-9a-f-]{36}$/);assert.match(document.querySelector('[role="alert"]').textContent,/State changed/);
 failure=false;await submit();assert.equal(calls[1].body.requestId,calls[0].body.requestId);assert.equal(refreshes,1);
});
test('revoked and already-voted members cannot submit a vote from refreshed state',async()=>{
 const voting={...proposal,status:'voting',candidate:{id:'other',name:'Sam'}};
 await render({...data,state:{...data.state,proposals:[voting]},capabilities:{actorId:'member',canManage:true,isAdmin:false}});assert.match(document.body.textContent,/Approve proposal/);
 await render({...data,state:{...data.state,proposals:[voting]},capabilities:{actorId:'member',canManage:false,isAdmin:false}});assert.equal(document.querySelector('form'),null);
 await render({...data,state:{...data.state,proposals:[{...voting,votes:[{actorId:'member',eventId:'event'}]}]},capabilities:{actorId:'member',canManage:true,isAdmin:false}});assert.equal(document.querySelector('form'),null);
});
test('administrator without Tool membership sees direct invitations rather than member-only proposals',async()=>{
 const Forms=require('../app/community/catalog/[id]/governance/GovernanceForms.tsx').default;
 await act(()=>root.render(createElement(Forms,{data:{...data,state:{...data.state,members:[],recommendations:[],adminPick:null},capabilities:{actorId:'admin',canManage:true,isAdmin:true}}})));
 const choices=[...document.querySelectorAll('option')].map(option=>option.value);
 assert.ok(choices.includes('invite'));assert.ok(choices.includes('revoke'));assert.ok(!choices.includes('propose_transfer'));assert.ok(!choices.includes('propose_remove'));assert.ok(!choices.includes('leave'));
});

test('emergency revocation reports a durable receipt as pending publication',async()=>{
 const Forms=require('../app/community/catalog/[id]/governance/GovernanceForms.tsx').default;
 await act(()=>root.render(createElement(Forms,{data:{...data,state:{...data.state,members:[{actorId:'member',name:'Maintainer'}],recommendations:[],adminPick:null},capabilities:{actorId:'admin',canManage:true,isAdmin:true}}})));
 const select=document.querySelector('select');await act(()=>{select.value='revoke';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
 document.querySelector('[name="subjectId"]').value='member';commandReceipt={status:'pending',body:{},signature:'receipt-signature',publicKey:{}};await submit();
 assert.match(document.querySelector('[role="status"]').textContent,/Access revoked.*publication is pending/);commandReceipt=null;
});
test('pending publication hides ordinary grant actions while retaining emergency revocation',async()=>{
 const Forms=require('../app/community/catalog/[id]/governance/GovernanceForms.tsx').default;
 const paused={...data,publishingAvailable:false,pendingReceipts:[{status:'pending'}],state:{...data.state,members:[{actorId:'member',name:'Maintainer'}],recommendations:[],adminPick:null},capabilities:{actorId:'admin',canManage:true,isAdmin:true}};
 await act(()=>root.render(createElement(Forms,{data:paused})));assert.deepEqual([...document.querySelectorAll('option')].map(option=>option.value).filter(Boolean),['revoke','member']);
 await act(()=>root.render(createElement(ProposalCommands,{data:{...data,publishingAvailable:false},proposalId:'proposal'})));assert.equal(document.querySelector('form'),null);
});

async function chooseAction(value){const select=document.querySelector('select');await act(()=>{select.value=value;select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});}
function strictTargetCommand(command){
 if(process.env.COMMUNITY_GOVERNANCE_POLICY_PATH)return require(process.env.COMMUNITY_GOVERNANCE_POLICY_PATH).parseGovernanceCommand(command);
 for(const target of command.action==='recommend'?command.targets:command.target?[command.target]:[]){
  assert.equal(Object.keys(target).length,1,'Choose exactly one repository or published version.');
  assert.ok(/^cv_[a-z0-9_]{1,124}$/.test(target.versionId??'')||/^https:\/\/github\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+\/?$/i.test(target.repository??''));
 }
 return command;
}
test('saving existing fixed versions submits version-only targets accepted by the strict command contract',async()=>{
 const Forms=require('../app/community/catalog/[id]/governance/GovernanceForms.tsx').default;
 const target={repository:'https://github.com/example/tool',versionId:'cv_fixed',commit:'a'.repeat(40),label:'Fixed version'};
 await act(()=>root.render(createElement(Forms,{key:'strict-targets',data:{...data,state:{...data.state,members:[],recommendations:[target,{...target,versionId:'cv_second'}],adminPick:target},capabilities:{actorId:'admin',canManage:true,isAdmin:true}}})));
 let received;fetchHandler=async(url,init)=>{received=JSON.parse(init.body);try{strictTargetCommand(received);return {ok:true,json:async()=>({state:{}})};}catch(error){return {ok:false,json:async()=>({message:error.message})};}};
 try{
  await chooseAction('recommend');await submit();assert.equal(Boolean(document.querySelector('[role="alert"]')),false);assert.deepEqual(received.targets,[{versionId:'cv_fixed'},{versionId:'cv_second'}]);
  await chooseAction('admin_pick');await submit();assert.equal(Boolean(document.querySelector('[role="alert"]')),false);assert.deepEqual(received.target,{versionId:'cv_fixed'});
  document.querySelector('[name="versionId"]').value='';await submit();assert.deepEqual(received.target,{repository:target.repository});assert.equal(Boolean(document.querySelector('[role="alert"]')),false);
 }finally{fetchHandler=null;}
});
function signedEvidence(){
 const canonical=value=>JSON.stringify(value&&typeof value==='object'?Array.isArray(value)?value.map(v=>JSON.parse(canonical(v))):Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))])):value);
 const hash=value=>createHash('sha256').update(value).digest('hex'),key=generateKeyPairSync('ed25519');
 const body={schemaVersion:1,logId:'component-log',sequence:1,eventId:'00000000-0000-4000-8000-000000000001',toolId:'cp_test',action:'invite',actor:{id:'public-actor',name:'Alex'},recordedAt:'2026-11-22T00:00:00Z',policyVersion:'1',reason:'Start maintenance',previousEventHash:'0'.repeat(64),beforeStateHash:'a'.repeat(64),afterStateHash:'b'.repeat(64),change:{field:'proposals',before:[],after:[]},references:[]};
 const message='crossomics-governance-event-v1\n'+canonical(body),event={body,hash:hash(message),signature:sign(null,Buffer.from(message),key.privateKey).toString('base64')};
 const checkpointBody={logId:body.logId,keyId:'component-key',treeSize:1,rootHash:hash(Buffer.concat([Buffer.from([0]),Buffer.from(canonical(event))])),lastEventHash:event.hash,stateHash:body.afterStateHash,previousCheckpointHash:null,recordedAt:body.recordedAt};
 const checkpoint={body:checkpointBody,signature:sign(null,Buffer.from('crossomics-governance-checkpoint-v1\n'+canonical(checkpointBody)),key.privateKey).toString('base64')},trust={logId:body.logId,keyId:'component-key',publicKey:key.publicKey.export({format:'jwk'}),signatureType:'service'};
 return {events:[event],selectedIndex:0,proof:[],checkpoint,previousCheckpoint:null,trust};
}
async function changeTrust(value){await act(()=>{const textarea=document.querySelector('textarea');Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value').set.call(textarea,value);textarea.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});}
async function finishVerification(){for(let i=0;i<100&&document.querySelector('button').disabled;i++)await act(()=>new Promise(resolve=>setTimeout(resolve,5)));assert.equal(document.querySelector('button').disabled,false);}
test('editing a trust configuration clears an earlier successful evidence result',async()=>{
 const Verifier=require('../app/community/catalog/[id]/governance/EvidenceVerifier.tsx').default,evidence=signedEvidence();
 fetchHandler=async url=>({ok:true,json:async()=>url.endsWith('/proof')?evidence:evidence.trust});
 try{
  await act(()=>root.render(createElement(Verifier,{key:'trust-edit',eventId:evidence.events[0].body.eventId})));
  await act(()=>document.querySelector('button').click());await finishVerification();assert.match(document.querySelector('[role="status"]').textContent,/Cryptographic checks passed/);
  await changeTrust(JSON.stringify({...evidence.trust,keyId:'unverified-key'}));assert.equal(Boolean(document.querySelector('[role="status"]')),false);assert.doesNotMatch(document.body.textContent,/Cryptographic checks passed/);
 }finally{fetchHandler=null;}
});
test('a result from verification started before a trust edit cannot appear afterward',async()=>{
 const Verifier=require('../app/community/catalog/[id]/governance/EvidenceVerifier.tsx').default,evidence=signedEvidence();
 let release;const gate=new Promise(resolve=>release=resolve);
 fetchHandler=async url=>{if(url.endsWith('/proof'))await gate;return {ok:true,json:async()=>url.endsWith('/proof')?evidence:evidence.trust};};
 try{
  await act(()=>root.render(createElement(Verifier,{key:'trust-inflight',eventId:evidence.events[0].body.eventId})));await act(()=>document.querySelector('button').click());assert.equal(document.querySelector('button').disabled,true);
  await changeTrust(JSON.stringify({...evidence.trust,keyId:'new-unverified-key'}));release();await finishVerification();assert.equal(Boolean(document.querySelector('[role="status"]')),false);assert.equal(Boolean(document.querySelector('[role="alert"]')),false);
 }finally{release();fetchHandler=null;}
});

test('governance Update publication requires a nonempty public reason before sending a review',async()=>{
 const ReviewForm=require('../app/community/registry/submissions/ReviewForm.tsx').default;
 await act(()=>root.render(createElement(ReviewForm,{id:'00000000-0000-4000-8000-000000000020',requireReason:true})));
 assert.equal(document.querySelector('[name="reason"]').required,true);
 const before=calls.length;await act(()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(calls.length,before);assert.match(document.querySelector('[role="alert"]').textContent,/public reason/i);
 document.querySelector('[name="reason"]').value='Reviewed benchmark and fixed commit';await act(()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.deepEqual(calls.at(-1).body,{decision:'published',reason:'Reviewed benchmark and fixed commit'});
});

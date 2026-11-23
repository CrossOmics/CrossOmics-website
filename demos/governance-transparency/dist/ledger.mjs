const enc=new TextEncoder();
const bytes=s=>enc.encode(s);
const concat=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;};
const hex=a=>Array.from(new Uint8Array(a),n=>n.toString(16).padStart(2,'0')).join('');
const unhex=s=>Uint8Array.from(s.match(/../g)??[],v=>parseInt(v,16));
const base64=a=>btoa(String.fromCharCode(...new Uint8Array(a)));
const unbase64=s=>Uint8Array.from(atob(s),v=>v.charCodeAt(0));
const digest=async data=>new Uint8Array(await crypto.subtle.digest('SHA-256',data));
export function canonical(value){
  if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value);
  if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Non-finite number');return JSON.stringify(value);}
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  throw Error('Unsupported data type');
}
export async function hashObject(value,domain='crossomics-state-v1\n'){return hex(await digest(bytes(domain+canonical(value))));}
async function leaf(value){return digest(concat(new Uint8Array([0]),bytes(value)));}
async function node(left,right){return digest(concat(new Uint8Array([1]),left,right));}
function split(n){let k=1;while(k*2<n)k*=2;return k;}
async function root(values){if(!values.length)return digest(new Uint8Array());if(values.length===1)return leaf(values[0]);const k=split(values.length);return node(await root(values.slice(0,k)),await root(values.slice(k)));}
export async function merkleRoot(values){return hex(await root(values));}
export async function inclusionProof(values,index){
  if(index<0||index>=values.length)throw Error('Record index out of range');
  if(values.length===1)return [];
  const k=split(values.length);
  return index<k?[...await inclusionProof(values.slice(0,k),index),{side:'right',hash:hex(await root(values.slice(k)))}]:
    [...await inclusionProof(values.slice(k),index-k),{side:'left',hash:hex(await root(values.slice(0,k)))}];
}
export async function verifyInclusion(value,index,size,path,rootHash){
  if(!Number.isInteger(index)||index<0||index>=size)return false;
  function sides(i,n){if(n===1)return [];const k=split(n);return i<k?[...sides(i,k),'right']:[...sides(i-k,n-k),'left'];}
  const expected=sides(index,size);if(path.length!==expected.length)return false;
  let h=await leaf(value);
  for(let i=0;i<path.length;i++){const p=path[i];if(p.side!==expected[i]||!/^[0-9a-f]{64}$/.test(p.hash))return false;h=p.side==='right'?await node(h,unhex(p.hash)):await node(unhex(p.hash),h);}
  return hex(h)===rootHash;
}
const alg={name:'ECDSA',namedCurve:'P-256'};
async function keyPair(){return crypto.subtle.generateKey(alg,true,['sign','verify']);}
async function sign(key,value,domain){return base64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,bytes(domain+canonical(value))));}
async function verify(key,value,signature,domain){try{return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},await crypto.subtle.importKey('jwk',key,alg,false,['verify']),unbase64(signature),bytes(domain+canonical(value)));}catch{return false;}}
const empty=()=>({maintainers:[],membershipVersion:0,recommendation:null,adminPick:null,proposals:{},policyVersion:'1.0'});
export const repositories={star:{name:'STAR',url:'https://github.com/alexdobin/STAR',commit:'b1edc1208d91a53bf40ebae8669f71d50b994851',label:'2.7.11b'},nustar:{name:'NuSTAR',url:'https://github.com/BioCode-Commons/NuSTAR',commit:'00467cd3f8fc8595f635d5c8ee35b26c9488411a',label:'main · 00467cd3'}};
const member=(state,actor)=>state.maintainers.includes(actor);
function changedMembership(state,completedId){state.membershipVersion++;for(const p of Object.values(state.proposals)){if(p.id!==completedId&&['voting','awaiting_acceptance'].includes(p.status))p.status='superseded';}}
function transition(state,action,actor,p){
  const next=structuredClone(state),admin=actor==='admin';
  if(action==='registry.initialized'){if(!admin)throw Error('No permission to initialize governance');return next;}
  if(action==='maintainer.invited'){
    if(!admin)throw Error('No permission to appoint maintainers directly');if(!['AAA','BBB','CCC'].includes(p.candidate)||member(state,p.candidate))throw Error('Account is invalid or already on the team');
    next.proposals[p.id]={id:p.id,kind:'admin_add',candidate:p.candidate,proposer:actor,members:[...state.maintainers],membershipVersion:state.membershipVersion,policyVersion:state.policyVersion,votes:['admin'],required:1,status:'awaiting_acceptance'};return next;
  }
  if(action==='admin_pick.changed'){
    if(!admin)throw Error('No permission to set admin picks');if(!repositories[p.repository])throw Error('Invalid repository');next.adminPick=p.repository;return next;
  }
  if(action==='recommendation.changed'){
    if(!admin&&!member(state,actor))throw Error('No STAR management permission');if(!repositories[p.repository]||!['version','repository'].includes(p.targetType))throw Error('Invalid recommendation target');
    next.recommendation={repository:p.repository,targetType:p.targetType,commit:p.targetType==='version'?repositories[p.repository].commit:null,by:actor};return next;
  }
  if(action==='proposal.created'){
    if(!member(state,actor))throw Error('No permission to create proposals');if(!['add','transfer'].includes(p.kind)||!['AAA','BBB','CCC'].includes(p.candidate)||member(state,p.candidate)||state.proposals[p.id])throw Error('Candidate is invalid or already on the team');
    const required=Math.floor(state.maintainers.length/2)+1;
    next.proposals[p.id]={id:p.id,kind:p.kind,candidate:p.candidate,proposer:actor,members:[...state.maintainers],membershipVersion:state.membershipVersion,policyVersion:state.policyVersion,votes:[actor],required,status:required===1?'awaiting_acceptance':'voting'};return next;
  }
  const proposal=state.proposals[p.id];
  if(!proposal)throw Error('Proposal does not exist');
  if(proposal.status==='superseded'||proposal.membershipVersion!==state.membershipVersion||proposal.policyVersion!==state.policyVersion)throw Error('Proposal superseded; create a new proposal');
  if(action==='proposal.voted'){
    if(!member(state,actor)||!proposal.members.includes(actor))throw Error('No permission to vote');if(proposal.votes.includes(actor))throw Error('You have already voted');if(proposal.status!=='voting')throw Error('Voting has ended');
    const target=next.proposals[p.id];target.votes.push(actor);if(target.votes.length>=target.required)target.status='awaiting_acceptance';return next;
  }
  if(action==='maintainer.accepted'){
    if(actor!==proposal.candidate)throw Error('Only the candidate can accept the invitation');if(proposal.status!=='awaiting_acceptance')throw Error('Proposal has not yet passed');
    next.maintainers.push(actor);if(proposal.kind==='transfer')next.maintainers=next.maintainers.filter(id=>id!==proposal.proposer);
    next.proposals[p.id].status='effective';changedMembership(next,p.id);return next;
  }
  throw Error('Unsupported governance action');
}
function changeFor(before,after,action,p){
  if(action==='recommendation.changed')return {field:'maintainerRecommendation',before:before.recommendation,after:after.recommendation};
  if(action==='admin_pick.changed')return {field:'adminPick',before:before.adminPick,after:after.adminPick};
  if(action==='proposal.created'||action==='proposal.voted'||action==='maintainer.invited')return {field:'proposal',before:before.proposals[p.id]??null,after:after.proposals[p.id]};
  if(action==='registry.initialized')return {field:'policyVersion',before:null,after:after.policyVersion};
  return {field:'maintainers',before:before.maintainers,after:after.maintainers};
}
export async function verifyBundle(bundle,trust){
  const checks=[];const push=(name,ok,detail)=>checks.push({name,ok,detail});
  try{
    const {events,checkpoint,selectedIndex,proof,previousCheckpoint}=bundle;
    let chain=true,actors=true,policy=true,state=empty(),prev='0'.repeat(64);
    for(let i=0;i<events.length;i++){
      const event=events[i],body=event.body;
      chain&&=body.sequence===i+1&&body.previousEventHash===prev&&body.logId===trust.logId&&event.hash===await hashObject(body,'crossomics-event-v1\n');
      actors&&=!!trust.actors[body.actor]&&await verify(trust.actors[body.actor],body,event.actorSignature,'crossomics-actor-v1\n');
      try{const after=transition(state,body.action,body.actor,body.payload);policy&&=body.toolId==='cp_star'&&body.policyVersion===state.policyVersion&&body.beforeStateHash===await hashObject(state)&&body.afterStateHash===await hashObject(after)&&canonical(body.change)===canonical(changeFor(state,after,body.action,body.payload));state=after;}catch{policy=false;}
      prev=event.hash;
    }
    push('Event content and hash chain',chain,'Recompute SHA-256 in event order');
    push('Action signatures and permission rules',actors&&policy,'Verify demo account signatures and replay permission state for each event');
    const cp=checkpoint.body;
    const logOk=cp.logId===trust.logId&&await verify(trust.logKey,cp,checkpoint.signature,'crossomics-checkpoint-v1\n');
    const rootOk=cp.treeSize===events.length&&cp.rootHash===await merkleRoot(events.map(canonical))&&cp.stateHash===await hashObject(state);
    push('Published checkpoint signature',logOk&&rootOk,'Compare the complete log with the signed root digest');
    const included=events[selectedIndex]&&await verifyInclusion(canonical(events[selectedIndex]),selectedIndex,cp.treeSize,proof,cp.rootHash);
    push('Merkle inclusion proof',!!included,`Record ${selectedIndex+1} is included in a tree of ${cp.treeSize} records`);
    let consistent=cp.previousCheckpointHash===null;
    if(previousCheckpoint){const old=previousCheckpoint.body;consistent=old.treeSize<cp.treeSize&&await verify(trust.logKey,old,previousCheckpoint.signature,'crossomics-checkpoint-v1\n')&&await hashObject(old,'crossomics-checkpoint-hash-v1\n')===cp.previousCheckpointHash&&await merkleRoot(events.slice(0,old.treeSize).map(canonical))===old.rootHash;}
    push('Append-only consistency',consistent,'Verify against the previous checkpoint and complete history prefix; this prototype replays the full history');
    const known=trust.knownCheckpoint;
    const fresh=known&&cp.logId===known.logId&&cp.treeSize>=known.treeSize&&await merkleRoot(events.slice(0,known.treeSize).map(canonical))===known.rootHash;
    push('Checkpoint freshness',!!fresh,known?'Compare against the latest checkpoint retained in this session to reject history rollback':'No trusted known checkpoint provided; rollback cannot be checked');
    let witnesses=0;const seen=new Set();for(const w of checkpoint.witnesses??[]){if(seen.has(w.id))continue;seen.add(w.id);if(trust.witnesses[w.id]&&await verify(trust.witnesses[w.id],cp,w.signature,'crossomics-witness-v1\n'))witnesses++;}
    push('Witness signatures',witnesses>=trust.threshold,`${witnesses}/${trust.threshold} valid demo witnesses; all simulated in this browser`);
  }catch(error){push('Evidence bundle format',false,error.message);}
  return {ok:checks.length===7&&checks.every(c=>c.ok),checks};
}
export async function createDemo(){
  const actorPairs=Object.fromEntries(await Promise.all(['admin','AAA','BBB','CCC'].map(async id=>[id,await keyPair()])));
  const logPair=await keyPair();const witnessPairs=Object.fromEntries(await Promise.all(['witness_a','witness_b'].map(async id=>[id,await keyPair()])));
  const trust={logId:'crossomics-demo-'+crypto.randomUUID(),logKey:await crypto.subtle.exportKey('jwk',logPair.publicKey),actors:{},witnesses:{},threshold:2};
  for(const [id,pair]of Object.entries(actorPairs))trust.actors[id]=await crypto.subtle.exportKey('jwk',pair.publicKey);
  for(const [id,pair]of Object.entries(witnessPairs))trust.witnesses[id]=await crypto.subtle.exportKey('jwk',pair.publicKey);
  let state=empty();const events=[],checkpoints=[];
  async function append(action,actor,payload,reason){
    if(!reason?.trim())throw Error('Enter a public reason for the change');const after=transition(state,action,actor,payload);
    const body={schemaVersion:1,logId:trust.logId,sequence:events.length+1,toolId:'cp_star',action,actor,policyVersion:'1.0',recordedAt:new Date().toISOString(),reason:reason.trim(),payload,
      previousEventHash:events.at(-1)?.hash??'0'.repeat(64),beforeStateHash:await hashObject(state),afterStateHash:await hashObject(after),change:changeFor(state,after,action,payload)};
    const event={body,hash:await hashObject(body,'crossomics-event-v1\n'),actorSignature:await sign(actorPairs[actor].privateKey,body,'crossomics-actor-v1\n')};
    const nextEvents=[...events,event];
    const cpBody={formatVersion:1,logId:trust.logId,treeSize:nextEvents.length,rootHash:await merkleRoot(nextEvents.map(canonical)),stateHash:body.afterStateHash,
      previousCheckpointHash:checkpoints.length?await hashObject(checkpoints.at(-1).body,'crossomics-checkpoint-hash-v1\n'):null,recordedAt:body.recordedAt};
    const checkpoint={body:cpBody,signature:await sign(logPair.privateKey,cpBody,'crossomics-checkpoint-v1\n'),witnesses:await Promise.all(Object.entries(witnessPairs).map(async([id,pair])=>({id,signature:await sign(pair.privateKey,cpBody,'crossomics-witness-v1\n')})))};
    events.push(event);checkpoints.push(checkpoint);state=after;trust.knownCheckpoint=structuredClone(cpBody);return event;
  }
  const api={get state(){return structuredClone(state);},get events(){return structuredClone(events);},get checkpoint(){return structuredClone(checkpoints.at(-1));},trust,
    async appoint(actor,candidate,reason){const id='proposal_'+(Object.keys(state.proposals).length+1);await append('maintainer.invited',actor,{id,candidate},reason);return id;},
    async recommend(actor,repository,targetType,reason,toolId='cp_star'){if(toolId!=='cp_star')throw Error('Outside the STAR authorization scope; cannot change BWA');return append('recommendation.changed',actor,{repository,targetType},reason);},
    async propose(actor,kind,candidate,reason){const id='proposal_'+(Object.keys(state.proposals).length+1);await append('proposal.created',actor,{id,kind,candidate},reason);return id;},
    async vote(actor,id){return append('proposal.voted',actor,{id},'Approve this team change proposal');},
    async accept(actor,id){return append('maintainer.accepted',actor,{id},'Candidate accepts maintenance responsibilities, completing the access handoff');},
    async bundle(selectedIndex=events.length-1){return {format:'crossomics-governance-demo-v1',note:'Demo keys and witnesses are all generated in the same browser. Production verification must use public keys pinned through an independent trusted channel.',events:structuredClone(events),selectedIndex,
      proof:await inclusionProof(events.map(canonical),selectedIndex),checkpoint:structuredClone(checkpoints.at(-1)),previousCheckpoint:checkpoints.length>1?structuredClone(checkpoints.at(-2)):null,publicKeys:structuredClone(trust)};}
  };
  await append('registry.initialized','admin',{},'Publish demo governance rules 1.0: tool-scoped access, strict majority voting, and activation after candidate acceptance');
  const first=await api.appoint('admin','AAA','Invite AAA as a STAR maintainer for community maintenance and version curation');await api.accept('AAA',first);
  const second=await api.appoint('admin','BBB','Invite BBB as a co-maintainer to support independent review and team handoffs');await api.accept('BBB',second);
  await append('admin_pick.changed','admin',{repository:'nustar'},'Select NuSTAR as the administrator-picked repository');
  await api.recommend('AAA','nustar','version','Maintainers recommend this specific NuSTAR commit. Future commits do not automatically inherit endorsement.');
  return api;
}

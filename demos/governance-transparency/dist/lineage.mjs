// Read-only explanatory projection. Cryptographic and permission validation live
// in verifyBundle; a graph by itself never establishes valid authorization.
const tabs=new Set(['log','lineage','team','proposals','verify']);
export function eventRoute(tab,hash){return '#'+(tabs.has(tab)?tab:'log')+(hash?'/'+encodeURIComponent(hash):'');}
export function parseRoute(fragment,events){
  const [requested,hash,...extra]=fragment.replace(/^#/,'').split('/');
  const tab=tabs.has(requested)?requested:'log';
  if(hash===undefined&&!extra.length)return {tab,index:events.length?events.length-1:null,unavailable:false};
  const index=extra.length||!/^[a-f0-9]{64}$/.test(hash??'')?-1:events.findIndex(e=>e.hash===hash);
  return {tab,index:index<0?null:index,unavailable:index<0};
}
export function buildLineage(events,selectedHash){
  const selected=events.find(e=>e.hash===selectedHash);
  const result={selected:selected??null,nodes:[],edges:[],missing:[],target:null};
  if(!selected)return result;
  const tool=selected.body.toolId;
  const history=events.filter(e=>e.body.toolId===tool);
  const nodes=new Map(),seen=new Set(),edgeKeys=new Set();
  const missing=(kind,event,detail)=>result.missing.push({kind,eventHash:event.hash,detail});
  function edge(from,to,type){const key=from+'|'+to+'|'+type;if(!edgeKeys.has(key)){edgeKeys.add(key);result.edges.push({from,to,type});}}
  function adminRoot(e){const id='demo-admin-root';nodes.set(id,{id,kind:'trust',event:null});edge(id,e.hash,'authority');}
  function earlier(e){return history.slice(0,history.indexOf(e)).filter(v=>v.body.sequence<e.body.sequence);}
  function origin(before,id){return before.findLast(e=>['maintainer.invited','proposal.created'].includes(e.body.action)&&e.body.payload.id===id);}
  function activeGrant(before,actor){
    const grants=new Map();
    for(let i=0;i<before.length;i++){
      const e=before[i],b=e.body;
      if(b.action!=='maintainer.accepted')continue;
      const start=origin(before.slice(0,i),b.payload.id);
      if(!start||start.body.payload.candidate!==b.actor)continue;
      if(start.body.payload.kind==='transfer')grants.delete(start.body.actor);
      grants.set(b.actor,e);
    }
    return grants.get(actor);
  }
  function visit(e){
    if(seen.has(e.hash))return;seen.add(e.hash);nodes.set(e.hash,{id:e.hash,kind:'event',event:e});
    const b=e.body,before=earlier(e);
    function depend(dep,type,kind,detail){if(!dep){missing(kind,e,detail);return;}edge(dep.hash,e.hash,type);visit(dep);}
    if(b.action!=='registry.initialized'){
      depend(before.findLast(v=>v.body.action==='registry.initialized'&&v.body.policyVersion===b.policyVersion),'policy','policy','Missing the original governance policy in effect at the time');
    }
    if(b.actor==='admin')adminRoot(e);
    else if(['recommendation.changed','proposal.created','proposal.voted'].includes(b.action)){
      depend(activeGrant(before,b.actor),'authority','authority',`Missing valid ${tool} authority for ${b.actor} at the time of the action`);
    }
    if(['proposal.voted','maintainer.accepted'].includes(b.action)){
      const start=origin(before,b.payload.id);
      depend(start,'proposal','proposal','Missing the corresponding proposal or invitation');
      if(start&&b.action==='maintainer.accepted'){
        const votes=before.filter(v=>v.body.sequence>start.body.sequence&&v.body.action==='proposal.voted'&&v.body.payload.id===b.payload.id);
        for(const vote of votes)depend(vote,'vote','vote','Missing the original vote record');
        if(start.body.action==='proposal.created'){
          const snapshot=start.body.change?.after;
          const eligible=new Set(snapshot?.members??[]);
          const approvals=new Set((snapshot?.votes??[]).filter(id=>id===start.body.actor&&eligible.has(id)));
          for(const vote of votes)if(eligible.has(vote.body.actor))approvals.add(vote.body.actor);
          if(!Number.isInteger(snapshot?.required)||approvals.size<snapshot.required)
            missing('votes',e,`Insufficient original eligible vote records: found ${approvals.size}, required ${snapshot?.required??'unknown'}`);
        }
      }
    }
  }
  visit(selected);
  result.nodes=[...nodes.values()].sort((a,b)=>(a.event?.body.sequence??0)-(b.event?.body.sequence??0));
  const b=selected.body;
  if(['recommendation.changed','admin_pick.changed'].includes(b.action)){
    result.target={repository:b.payload.repository,targetType:b.action==='admin_pick.changed'?'repository':b.payload.targetType,
      commit:b.action==='recommendation.changed'&&b.payload.targetType==='version'?b.change?.after?.commit??null:null};
    if(result.target.targetType==='version'&&!result.target.commit)missing('target',selected,'Version target is missing a signed commit identifier');
  }
  return result;
}

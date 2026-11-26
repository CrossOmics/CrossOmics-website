"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { communityRequest } from "../../../client";
import { proposalActions, type GovernanceAction, type GovernanceResponse, type GovernanceCommandResult } from "@/lib/community/governance";
import styles from "./governance.module.css";

type CommandFields = { proposalId?: string; candidateId?: string; candidateName?: string; subjectId?: string; targets?: { repository?: string; versionId?: string }[]; target?: { repository?: string; versionId?: string } | null };
function CommandForm({data, action, label, fields={},children}:{data:GovernanceResponse;action:GovernanceAction;label:string;fields?:CommandFields;children?:React.ReactNode}) {
  const [pending,setPending]=useState(false),[message,setMessage]=useState<{error:boolean;text:string}|null>(null);
  const attempt=useRef<{fingerprint:string;requestId:string}|null>(null), router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending)return; const form=new FormData(event.currentTarget);
    const payload:CommandFields={...fields};
    for(const key of ["candidateId","candidateName","subjectId"] as const){const value=String(form.get(key)??"").trim();if(value)payload[key]=value;}
    if(action==="recommend"||action==="admin_pick"){
      const repository=String(form.get("repository")??"").trim(),versionId=String(form.get("versionId")??"").trim();
      const target=versionId?{versionId}:repository?{repository}:null;
      if(action==="recommend"){
        const repository2=String(form.get("repository2")??"").trim(),versionId2=String(form.get("versionId2")??"").trim();
        payload.targets=[...(target?[target]:[]),...(versionId2?[{versionId:versionId2}]:repository2?[{repository:repository2}]:[])];
      } else payload.target=target;
    }
    const command={expectedVersion:data.state.version,action,reason:String(form.get("reason")??"").trim(),...payload};
    const fingerprint=JSON.stringify(command); if(attempt.current?.fingerprint!==fingerprint)attempt.current={fingerprint,requestId:crypto.randomUUID()};
    setPending(true);setMessage(null);
    try{const result=await communityRequest<GovernanceCommandResult>(`catalog/${data.state.toolId}/governance/commands`,"POST",{...command,requestId:attempt.current!.requestId},"v2");setMessage({error:false,text:result.receipt?.status==="pending"?"Access revoked. Public log publication is pending; a signed receipt has been saved.":"Change recorded. The public record is refreshing."});router.refresh();}
    catch(error){setMessage({error:true,text:error instanceof Error?error.message:"The change was not recorded. Refresh to check current permissions and state before retrying."});}
    finally{setPending(false);}
  }
  return <form className={styles.compact} onSubmit={submit}><fieldset disabled={pending}><legend>{label}</legend>{children}
    <label>Public reason<textarea name="reason" rows={2} required maxLength={1000} /></label>
    <p className={styles.meta}>This reason will be public. Keep private contact and account information out of it.</p>
    <button className="community-primary" disabled={pending}>{pending?"Recording…":label}</button></fieldset>
    {message&&<p role={message.error?"alert":"status"} className={message.error?"community-error":undefined}>{message.text}</p>}
  </form>;
}
export function ProposalCommands({data,proposalId}:{data:GovernanceResponse;proposalId:string}){
  if(data.publishingAvailable===false||data.pendingReceipts?.some(receipt=>receipt.status==="pending"))return null;
  const proposal=data.state.proposals.find(item=>item.id===proposalId); if(!proposal)return null;
  const actions=proposalActions(proposal,data.capabilities,data.state.membershipVersion);
  return <>{actions.canVote&&<CommandForm data={data} action="vote" label="Approve proposal" fields={{proposalId}} />}
    {actions.canAccept&&<CommandForm data={data} action="accept" label="Accept invitation" fields={{proposalId}} />}</>;
}
export default function GovernanceForms({data}:{data:GovernanceResponse}){
  const [selection,setAction]=useState<GovernanceAction>(data.capabilities.isAdmin?"invite":"propose_add");
  const {capabilities,state}=data;
  const isMember=state.members.some(member=>member.actorId===capabilities.actorId);
  const paused=data.publishingAvailable===false||data.pendingReceipts?.some(receipt=>receipt.status==="pending");
  const available:GovernanceAction[]=paused?(capabilities.isAdmin?["revoke"]:[]):["recommend",...(capabilities.isAdmin?["invite","admin_pick","revoke"] as GovernanceAction[]:[]),...(isMember?["propose_add","propose_transfer","propose_remove","leave"] as GovernanceAction[]:[])];
  const action=available.includes(selection)?selection:available[0];
  if(!capabilities.canManage&&!capabilities.isAdmin)return null;
  if(!available.length)return <p>Governance changes are paused until public log publication resumes.</p>;
  const candidate=["invite","propose_add","propose_transfer"].includes(action),subject=["propose_remove","revoke"].includes(action),target=["recommend","admin_pick"].includes(action);
  return <section className={styles.commands}><h2>Manage governance</h2><p>Changes are checked against current permissions and state before they enter the public log. Submitting a proposal records your yes vote in its public event. Other eligible members must vote before candidate acceptance when a majority requires more than one approval.</p>
    <label>Action <select value={action} onChange={event=>setAction(event.target.value as GovernanceAction)}>
      {available.map(value=><option key={value} value={value}>{{invite:"Invite a maintainer",propose_add:"Propose adding a maintainer",propose_transfer:"Propose a handoff",propose_remove:"Propose removing a maintainer",recommend:"Set Maintainer Picks",admin_pick:"Set platform endorsement",revoke:"Emergency revoke",leave:"Leave the team",vote:"Approve proposal",accept:"Accept invitation"}[value]}</option>)}
    </select></label>
    <CommandForm key={action} data={data} action={action} label={action==="leave"?"Leave team":action==="recommend"?"Save Maintainer Picks":action==="admin_pick"?"Save platform endorsement":action==="revoke"?"Revoke maintainer":action==="invite"?"Send invitation":"Propose and vote yes"}>
      {candidate&&<><label>Candidate Community Contributor ID<input name="candidateId" required maxLength={200} autoComplete="off" /></label><p className={styles.meta}>Ask the candidate for their Contributor ID from their Community profile. This field is sent privately to the service.</p><label>Candidate public name<input name="candidateName" required maxLength={100}/></label></>}
      {subject&&<label>Current maintainer<select name="subjectId" required><option value="">Choose a maintainer</option>{state.members.map(member=><option key={member.actorId} value={member.actorId}>{member.name}</option>)}</select></label>}
      {target&&<><p>Choose a repository or a registered version. A version ID takes precedence over the repository URL and records its fixed commit. Leave all fields empty to clear this selection.</p><label>Repository URL<input name="repository" type="url" defaultValue={(action==="admin_pick"?state.adminPick:state.recommendations[0])?.repository??""} placeholder="https://github.com/owner/repository" /></label><label>Registered version ID<input name="versionId" defaultValue={(action==="admin_pick"?state.adminPick:state.recommendations[0])?.versionId??""} placeholder="cv_…" /></label>{action==="recommend"&&<><label>Second repository URL (optional)<input name="repository2" type="url" defaultValue={state.recommendations[1]?.repository??""}/></label><label>Second registered version ID (optional)<input name="versionId2" defaultValue={state.recommendations[1]?.versionId??""}/></label></>}</>}
      {action==="invite"&&<p>This records administrator approval and sends an invitation. Access begins only when the candidate accepts.</p>}
      {action==="propose_transfer"&&<p>After approval and candidate acceptance, the candidate takes over your maintainer role.</p>}
      {action==="leave"&&<p>The last maintainer must arrange a handoff before leaving.</p>}
      {action==="revoke"&&<p>Emergency revocation removes access immediately and requires a public explanation.</p>}
    </CommandForm>
  </section>;
}

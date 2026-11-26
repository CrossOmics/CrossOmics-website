"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ToolMaintainer } from "@/lib/community/tool-maintenance";
import { communityRequest } from "../../../client";
import { emptyCredit, parseCredit, withEmptyCreditFields } from "../../../registry/CreditFields";

const empty = { ...emptyCredit, contributorId:"" };
export default function MaintainersForm({ id, maintainers }: { id:string;maintainers:ToolMaintainer[] }) {
  const [rows, setRows] = useState(maintainers.filter(credit => credit.contributorId).map(credit => ({...withEmptyCreditFields(credit),contributorId:credit.contributorId ?? ""})));
  const [pending,setPending] = useState(false);
  const [message,setMessage] = useState<{text:string;error:boolean}>();
  const router=useRouter();
  function update(index:number,field:keyof typeof empty,value:string) {setRows(rows.map((row,i)=>i===index?{...row,[field]:value}:row));}
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(pending)return;
    const reason=String(new FormData(event.currentTarget).get("reason")??"");
    setPending(true);setMessage(undefined);
    try {
      await communityRequest(`catalog/${id}/maintainers`,"POST",{maintainers:rows.map(row=>({...parseCredit(row),...(row.contributorId.trim()?{contributorId:row.contributorId.trim()}: {})})),reason},"v2");
      setMessage({text:"Tool maintainers saved.",error:false});router.refresh();
    } catch(error) {setMessage({text:error instanceof Error?error.message:"Could not save maintainers.",error:true});}
    finally {setPending(false);}
  }
  return <form className="community-form" onSubmit={submit}>
    <fieldset disabled={pending}>
      <legend>Tool maintainers and management access</legend>
      <p>Names and profiles appear publicly. Each maintainer must have a registered Community account. The service validates the account before granting management access. GitHub handles alone do not grant access.</p>
      {rows.map((row,index)=><fieldset key={index}>
        <legend>Maintainer {index+1}</legend>
        <div className="community-form-grid">
          <label>Name<input required maxLength={120} value={row.name} onChange={event=>update(index,"name",event.target.value)} /></label>
          <label>Community account ID<input required maxLength={80} value={row.contributorId} onChange={event=>update(index,"contributorId",event.target.value)} placeholder="Community account ID" /></label>
          <label>GitHub handle (optional)<input maxLength={40} value={row.github} onChange={event=>update(index,"github",event.target.value)} /></label>
          <label>ORCID (optional)<input maxLength={19} value={row.orcid} onChange={event=>update(index,"orcid",event.target.value)} /></label>
          <label>Public profile URL (optional)<input type="url" maxLength={400} value={row.url} onChange={event=>update(index,"url",event.target.value)} /></label>
        </div>
        <button type="button" className="community-secondary" onClick={()=>setRows(rows.filter((_,i)=>i!==index))}>Remove maintainer {index+1}</button>
      </fieldset>)}
      {!rows.length && <p>No maintainers. Saving this list removes all public maintainer credits and assigned management access for this Tool.</p>}
      {rows.length<20 && <button type="button" className="community-secondary" onClick={()=>setRows([...rows,{...empty}])}>Add maintainer</button>}
      <label>Reason for maintainer changes<textarea name="reason" required rows={2} maxLength={1000} /></label>
    </fieldset>
    <button className="community-primary" disabled={pending}>Save maintainers</button>
    {message && <p role={message.error?"alert":"status"} className={message.error?"community-error":undefined}>{message.text}</p>}
  </form>;
}

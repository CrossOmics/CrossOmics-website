"use client";
import { useRef, useState } from "react";
import { verifyGovernanceEvidence, type GovernanceEvidence, type GovernanceTrust } from "@/lib/community/governance";
import styles from "./governance.module.css";
type CheckResult = {valid:boolean;message:string};
export default function EvidenceVerifier({eventId}:{eventId:string}){
  const [trust,setTrust]=useState(""),[result,setResult]=useState<CheckResult|null>(null),[pending,setPending]=useState(false);
  const trustRevision=useRef(0);
  async function verify(){
    if(pending)return;const revision=trustRevision.current,trustSnapshot=trust;
    const publish=(value:CheckResult)=>{if(trustRevision.current===revision)setResult(value);};
    setPending(true);setResult(null);
    try{
      const response=await fetch(`/api/community/v2/governance/events/${encodeURIComponent(eventId)}/proof`,{cache:"no-store"});
      if(!response.ok)throw new Error("The evidence package is unavailable. Try again later.");
      const evidence=await response.json() as GovernanceEvidence;
      let root:GovernanceTrust;
      if(trustSnapshot.trim())root=JSON.parse(trustSnapshot) as GovernanceTrust;
      else{const config=await fetch("/api/community/v2/governance/trust-config",{cache:"no-store"});if(!config.ok)throw new Error("Service trust configuration is unavailable.");root=await config.json() as GovernanceTrust;}
      const selected=evidence.events[evidence.selectedIndex];
      if(!selected||selected.body.eventId!==eventId&&selected.hash!==eventId)throw new Error("The package is for a different event.");
      publish(await verifyGovernanceEvidence(evidence,root));
    }catch(error){publish({valid:false,message:error instanceof Error?error.message:"The evidence could not be checked."});}
    finally{setPending(false);}
  }
  return <section className="community-section"><h2>Check public evidence</h2><p>Check the event hashes, service signatures, inclusion proof and supplied log history in your browser.</p>
    <label className={styles.compact}>Trusted configuration JSON (optional)<textarea rows={5} value={trust} onChange={event=>{trustRevision.current++;setTrust(event.target.value);setResult(null);}} placeholder='{"logId":"…","keyId":"…","publicKey":{…},"signatureType":"service"}'/></label>
    <p className={styles.meta}>Paste a configuration obtained independently to pin its key. Leaving this empty uses the current service configuration and cannot detect operator key substitution.</p>
    <button className="community-primary" onClick={verify} disabled={pending}>{pending?"Checking evidence…":"Check evidence"}</button>
    {result&&<div className={styles.assurance} role={result.valid?"status":"alert"}><strong>{result.valid?"Cryptographic checks passed":"Evidence check failed"}</strong><p>{result.message}</p><p>Trust source: {trust.trim()?"configuration supplied by you":"current service configuration"}. No independent witnesses, personal user signatures, policy replay or freshness check.</p></div>}
  </section>;
}

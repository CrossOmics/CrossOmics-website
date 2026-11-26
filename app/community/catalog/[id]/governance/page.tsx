import Link from "next/link";
import { communitySession, toolGovernance, toolGovernanceReviews } from "@/lib/community/service";
import { governanceActionLabel } from "@/lib/community/governance";
import { communitySignInPath } from "@/lib/community/return-path";
import GovernanceTeam from "./GovernanceTeam";
import UpdateReviewQueue from "./UpdateReviewQueue";
import styles from "./governance.module.css";

type Query = { tab?: string; cursor?: string; actor?: string; action?: string; repository?: string };
export default async function Governance({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Query>}) {
  const [{id},query,session]=await Promise.all([params,searchParams,communitySession()]);
  const filters={cursor:query.cursor,actor:query.actor,action:query.action,repository:query.repository};
  const {data}=await toolGovernance(id,filters);
  const path=`/community/catalog/${encodeURIComponent(id)}/governance`,tab=query.tab==="team"?"team":query.tab==="evidence"?"evidence":"log";
  if(!data)return <section className="community-notice"><h1>Governance is unavailable</h1><p>The public governance service has no available record for this tool, or is temporarily unavailable. Refresh to try again.</p><Link className="community-link" href={`/community/catalog/${id}`}>Back to tool</Link></section>;
  const {state}=data;
  const reviews=tab==="team"&&session?.contributor&&data.capabilities.canManage?await toolGovernanceReviews(state.toolId):null;
  const reviewItems=reviews?.data?.submissions.map(item=>({
    id:item.id,name:item.name,label:item.label,description:item.description,changeSummary:item.changeSummary,
    repository:item.repository,evidenceUrl:item.evidenceUrl,commit:item.commit,parentVersionId:item.parentVersionId,
    createdAt:item.createdAt,submitterLogin:item.contributor.login,ownSubmission:item.contributor.id===session?.contributor?.id
  }))??null;
  return <div className={styles.explorer}>
    <header className={`community-heading ${styles.heading}`}><Link className="community-link" href={`/community/catalog/${id}`}>← Back to tool</Link>
      <div className={styles.headingRow}><div><h1>Tool governance</h1><p>The people, recommendations and decisions behind this tool.</p></div>
        <span className={styles.viewerRole}>{data.capabilities.isAdmin ? "Super Administrator" : data.capabilities.canManage ? "Tool Maintainer" : session?.contributor ? "Community Member" : "Public view"}</span></div>
    </header>

    {(data.pendingReceipts?.length||data.publishingAvailable===false)&&<aside className={styles.assurance} role="status"><p><strong>{data.pendingReceipts?.length?"Public log publication is pending":"Governance publishing is unavailable"}</strong></p><p>{data.pendingReceipts?.length?"Emergency access restrictions have taken effect and durable signed receipts have been saved. Their full public log records are pending.":"Existing public history remains readable. Ordinary access grants and recommendations cannot be published right now."}</p><p>Ordinary governance changes are paused until publication resumes. A receipt is a service attestation and has no independent witness or blockchain anchor.</p>{data.pendingReceipts?.map((receipt,index)=><p key={index}><a className="community-link" download={`governance-receipt-${index+1}.json`} href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(receipt,null,2))}`}>Download signed receipt {index+1}</a></p>)}</aside>}
    <nav className={styles.tabs} aria-label="Governance views"><Link href={path} aria-current={tab==="log"?"page":undefined}>Public log</Link><Link href={path+"?tab=team"} aria-current={tab==="team"?"page":undefined}>Team and proposals</Link><Link href={path+"?tab=evidence"} aria-current={tab==="evidence"?"page":undefined}>Evidence and trust</Link></nav>
    {tab==="log"&&<section><h2>Public log</h2><p>Open an event for its recorded changes, authority and approval references. Global sequence numbers can skip here because this view is scoped to one tool.</p>
      <form className={styles.filters} action={path}><label>Actor public ID<input name="actor" defaultValue={query.actor} /></label><label>Action<input name="action" defaultValue={query.action} placeholder="recommend" /></label><label>Repository URL<input name="repository" type="url" defaultValue={query.repository} /></label><button className="community-secondary">Filter log</button>{Object.values(filters).some(Boolean)&&<Link className="community-link" href={path}>Clear filters</Link>}</form>
      {!data.events.length?<p className="community-notice">No public events match this view.</p>:<ol className={styles.events}>{data.events.map(event=><li key={event.body.eventId}><h3><Link className="community-link" href={`${path}/events/${event.body.eventId}`}>{governanceActionLabel(event.body.action)}</Link></h3><p>{event.body.reason}</p><p className={styles.meta}>{event.body.actor.name} · <time dateTime={event.body.recordedAt}>{event.body.recordedAt}</time> · Sequence {event.body.sequence}</p><p className={styles.meta}>{event.body.references.length} governance references · Hash <code>{event.hash}</code></p></li>)}</ol>}
      {data.hasMore&&data.cursor&&<Link className="community-secondary" href={path+"?"+new URLSearchParams({...Object.fromEntries(Object.entries(filters).filter((entry):entry is [string,string]=>!!entry[1])),cursor:data.cursor})}>Older events</Link>}
    </section>}
    {tab === "team" && <GovernanceTeam data={data} path={path} signedIn={!!session?.contributor}
      signInHref={communitySignInPath(path + "?tab=team")}
      reviews={reviews && session?.contributor ? <UpdateReviewQueue submissions={reviewItems} publishingAvailable={data.publishingAvailable !== false && !data.pendingReceipts?.some(receipt => receipt.status === "pending")} /> : undefined} />}
    {tab==="evidence"&&<section><h2>Evidence and trust</h2><p>Open a public event to download its full evidence package and check event hashes, service signatures, Merkle inclusion and the supplied append-only history.</p><p>A successful cryptographic check establishes consistency with the chosen service key. It does not prove that the service operator is honest, that an account holder personally signed an action, or that every governance rule was followed.</p><p>Independent key pinning and a previously known checkpoint are needed to detect operator key substitution or history rollback. Freshness, user identity, governance policy replay, independent witnesses and blockchain anchoring are not verified by this page.</p><a className="community-secondary" href="/api/community/v2/governance/trust-config" download="crossomics-governance-trust.json">Download service trust configuration</a><p className={styles.meta}>The configuration above comes from the same service. Obtain and retain a trusted key through an independent channel for stronger verification.</p><Link className="community-link" href={path}>Choose an event</Link></section>}
    <details className={styles.recordNotice} aria-label="Assurance scope"><summary>About this public record<span>Service-signed</span></summary>
      <p>Signatures attest what the CrossOmics service recorded. They are not personal user signatures. This log has no independent witnesses or blockchain anchor.</p>
      <Link className="community-link" href={path + "?tab=evidence"}>Evidence and trust</Link>
    </details>
  </div>;
}

import Link from "next/link";
import type { PersonalEntry } from "@/lib/community/tool-maintenance";
import { toolTypeLabel } from "@/lib/community/tool-types";
import { httpsUrl } from "@/lib/community/https-url";
import ContributionList from "../ContributionList";

const statuses={submitted:"Awaiting review",published:"Published",rejected:"Rejected"};
export default function PersonalEntries({entries}:{entries:PersonalEntry[]}) {
  if(!entries.length)return <p className="community-notice">Nothing in this group yet.</p>;
  return <div className="community-personal-records">{entries.map(entry=>{
    if(entry.kind==="contribution")return <section key={"record-"+entry.contribution.id}><p className="community-record-kind">Contribution record · Published</p><ContributionList items={[entry.contribution]} mine /></section>;
    if(entry.kind==="maintained")return <article key={entry.tool.id} className="community-record">
      <h2><Link href={`/community/catalog/${entry.tool.id}`}>{entry.tool.name}</Link></h2><p>{entry.tool.description}</p>
      <Link className="community-primary" href={`/community/catalog/${entry.tool.id}/manage`}>Manage this tool</Link>
    </article>;
    const item=entry.submission,source=httpsUrl(item.repository);
    return <article key={"submission-"+item.id} className="community-record">
      <p className="community-record-kind">Tool submission · {statuses[item.status]}</p>
      <h2>{item.name} · {item.label}</h2><span className="community-tag">{toolTypeLabel(item.type)}</span>
      <p>{item.changeSummary || item.description}</p><p>Submitted {item.createdAt.slice(0,10)}</p>
      <div className="community-actions">
        {item.status==="published" && item.pipelineId && <Link className="community-link" href={`/community/catalog/${item.pipelineId}`}>View tool</Link>}
        <Link className="community-link" href="/community/registry/submissions">Review status</Link>
        {source && <a className="community-link" href={source}>Source repository ↗</a>}
      </div>
    </article>;
  })}</div>;
}

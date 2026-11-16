import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import Link from "next/link";
import { communitySession, registryV2Submissions } from "@/lib/community/service";
import { registryTypes } from "@/lib/community/registry-v2";
import { httpsUrl } from "@/lib/community/https-url";
import RegistryCredits from "../../RegistryCredits";
import RegistryMetadata from "../../RegistryMetadata";
import ReviewForm from "./ReviewForm";

const path = "/community/registry/submissions";
const statuses = { submitted: "Awaiting review", published: "Published", rejected: "Rejected" };

export default async function RegistrySubmissions({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const [session, { all: filter }] = await Promise.all([communitySession(), searchParams]);
  if (session && !session.contributor) redirect(communitySignInPath(path + (filter === "1" ? "?all=1" : "")));
  const signedIn = Boolean(session?.contributor);
  const available = session?.registryV2Available === true;
  const admin = session?.canManageRegistry === true;
  const all = admin && filter === "1";
  const history = signedIn && available ? await registryV2Submissions(all) : null;
  return (
    <>
      <header className="community-heading">
        <Link className="community-link" href="/community/registry/submit">← Register a project</Link>
        <h1>{all ? "Registry review queue" : "My registry submissions"}</h1>
        <p>{all ? "Review the source, version lineage, and credits before publishing." : "Track your submissions and their review status."}</p>
        {admin && <div className="community-actions">
          <Link className="community-secondary" href={all ? path : path + "?all=1"}>
            {all ? "My submissions" : "Review queue"}
          </Link>
        </div>}
      </header>
      {!available ? <p className="community-notice">The registry submission history is unavailable.</p> :
          !history ? <p className="community-notice" role="status">Submissions are temporarily unavailable.</p> :
            !history.submissions.length ? <p className="community-notice">No submissions yet.</p> :
              <ul className="community-record-list">
                {history.submissions.map((item) => {
                  const repo = httpsUrl(item.repository);
                  const evidence = httpsUrl(item.evidenceUrl);
                  return (
                    <li key={item.id} className="community-record">
                      <div className="community-actions">
                        <h2>{item.name} · {item.label}</h2>
                        <span className="community-tag">{registryTypes[item.type]}</span>
                        <span className="community-tag">{statuses[item.status]}</span>
                      </div>
                      <p>Submitted by @{item.contributor.login} · {item.createdAt.slice(0, 10)}</p>
                      <p>{item.changeSummary || item.description}</p>
                      {item.citation && <div><h3>Citation information</h3><p className="community-citation">{item.citation}</p></div>}
                      {repo && <a className="community-link" href={repo}>Source repository ↗</a>}
                      {evidence && <a className="community-link" href={evidence}>Evidence ↗</a>}
                      <dl className="community-detail-grid">
                        <div><dt>Commit</dt><dd><code>{item.commit}</code></dd></div>
                        {item.type !== "origin" && item.pipelineId && <div><dt>Target pipeline</dt>
                          <dd><Link className="community-link" href={"/community/catalog/" + item.pipelineId}>{item.pipelineId}</Link></dd>
                        </div>}
                        {item.parentVersionId && <div><dt>Parent version</dt><dd>{item.parentVersionId}</dd></div>}
                        <div><dt>Original authors</dt><dd><RegistryCredits credits={item.authors} /></dd></div>
                        <div><dt>Maintainers</dt><dd><RegistryCredits credits={item.maintainers} /></dd></div>
                      </dl>
                      <RegistryMetadata metadata={item} />
                      {item.reason && <p>Review reason · {item.reason}</p>}
                      {item.status === "published" && item.pipelineId &&
                        <Link className="community-link" href={"/community/catalog/" + item.pipelineId}>View published entry</Link>}
                      {all && item.status === "submitted" && <ReviewForm id={item.id} />}
                    </li>
                  );
                })}
              </ul>}
    </>
  );
}

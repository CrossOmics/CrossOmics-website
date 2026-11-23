import type { RegistrySubmissionV2 } from "@/lib/community/registry-v2";
import { httpsUrl } from "@/lib/community/https-url";
import ReviewForm from "../../../registry/submissions/ReviewForm";

export type UpdateReviewItem = Pick<RegistrySubmissionV2, "id" | "name" | "label" | "description" | "changeSummary" | "repository" | "evidenceUrl" | "commit" | "parentVersionId" | "createdAt"> & { submitterLogin: string; ownSubmission: boolean };

export default function UpdateReviewQueue({ submissions, publishingAvailable }: {
  submissions: UpdateReviewItem[] | null; publishingAvailable: boolean;
}) {
  return <section className="community-section" aria-labelledby="update-reviews-title">
    <h2 id="update-reviews-title">Pending Update reviews</h2>
    <p>This private queue contains pending Updates for this tool. Check the description, source and fixed commit before publishing. Your public review reason will be recorded.</p>
    {submissions === null ? <p className="community-notice">Update reviews are unavailable. Your access may have changed, or the review service is temporarily unavailable. Refresh to try again.</p> :
      !submissions.length ? <p>No Updates are awaiting review.</p> :
        <ul className="community-record-list">{submissions.map(item => {
          const repository = httpsUrl(item.repository);
          const evidence = httpsUrl(item.evidenceUrl);
          return <li key={item.id} className="community-record">
            <h3>{item.name} · {item.label}</h3>
            <p>Submitted by @{item.submitterLogin} · {item.createdAt.slice(0, 10)}</p>
            <p>{item.description}</p>
            {item.changeSummary && item.changeSummary !== item.description && <p>{item.changeSummary}</p>}
            <div className="community-actions">
              {repository && <a className="community-link" href={repository}>Source repository</a>}
              {evidence && <a className="community-link" href={evidence}>Review evidence</a>}
            </div>
            <dl className="community-detail-grid"><div><dt>Fixed commit</dt><dd><code>{item.commit}</code></dd></div>
              {item.parentVersionId && <div><dt>Based on version</dt><dd>{item.parentVersionId}</dd></div>}
            </dl>
            {item.ownSubmission ? <p className="community-notice"><strong>Independent reviewer required.</strong> Another current Tool maintainer or administrator must review your submission.</p> :
              !publishingAvailable ? <p className="community-notice">Reviews are paused until public log publication resumes.</p> :
                <ReviewForm id={item.id} requireReason />}
          </li>;
        })}</ul>}
  </section>;
}

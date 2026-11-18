import Link from "next/link";

export default function SubmissionChoices({ catalogId }: { catalogId?: string }) {
  const toolQuery = new URLSearchParams(catalogId ? { pipelineId: catalogId } : {});
  const recordQuery = new URLSearchParams({ mode: "record", ...(catalogId ? { catalogId } : {}) });
  return (
    <>
      <header className="community-heading">
        <h1>Submit a Contribution</h1>
        <p>Share a tool or an improvement, or record work you have already contributed.</p>
      </header>
      <div className="community-submission-choices">
        <Link className="community-submission-choice" href={"/community/registry/submit" + (catalogId ? `?${toolQuery}` : "")}>
          <span className="community-choice-status">Administrator review</span>
          <h2>Submit a Tool or Update <span aria-hidden>→</span></h2>
          <p>Add an original tool to the catalog, or submit a new version with performance improvements, bug fixes, or other changes.</p>
          <span className="community-link">Submit for review →</span>
        </Link>
        <Link className="community-submission-choice" href={`/community/submit?${recordQuery}`}>
          <span className="community-choice-status">Published directly</span>
          <h2>Record a Contribution <span aria-hidden>→</span></h2>
          <p>Record completed work with a public evidence link. This adds to your contribution history without adding a tool version to the catalog.</p>
          <span className="community-link">Record completed work →</span>
        </Link>
      </div>
      <div className="community-actions">
        <Link className="community-link" href="/community/registry/submissions">My Tool Submissions</Link>
        <Link className="community-link" href="/community/mine">My Contribution History</Link>
      </div>
    </>
  );
}

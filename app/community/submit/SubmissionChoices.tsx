import Link from "next/link";

export default function SubmissionChoices({ catalogId }: { catalogId?: string }) {
  return <>
    <header className="community-heading"><h1>Contribute to the community</h1>
      <p>Share a research tool or improve an existing one. Sign in to submit your work for review; published work appears in your contribution history.</p></header>
    <div className="community-submission-choices">
      <Link className="community-submission-choice" href="/community/registry/submit">
        <span className="community-choice-status">New tool</span><h2>Submit a Tool</h2>
        <p>Introduce a tool that is not in the registry. Credit its original authors and explain how other researchers can use it.</p>
        <span className="community-link">Submit for review</span>
      </Link>
      <Link className="community-submission-choice" href={`/community/registry/submit?${new URLSearchParams(catalogId ? { pipelineId: catalogId } : { type: "update" })}`}>
        <span className="community-choice-status">Existing tool</span><h2>Submit an Update</h2>
        <p>Contribute a repository, bug fix, compatibility change or performance improvement, with evidence and a link to the version you built on.</p>
        <span className="community-link">Submit for review</span>
      </Link>
    </div>
    <p className="community-notice">All submissions follow the review process. <Link className="community-link" href="/community/guide#submitting">Read the contribution guide</Link>.</p>
    <div className="community-actions"><Link className="community-link" href="/community/registry/submissions">My Tool Submissions</Link>
      <Link className="community-link" href="/community/mine">My Contributions</Link></div>
  </>;
}

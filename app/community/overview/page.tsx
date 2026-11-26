import Link from "next/link";

export default function CommunityOverview() {
  return <>
    <header className="community-heading"><h1>Build on each other’s work.</h1><p>Research software keeps evolving. CrossOmics brings its implementations, evidence and contributors together so researchers can see what changed and participate in what comes next.</p>
      <div className="community-actions"><Link className="community-primary" href="/#registry">Explore Existing Tools</Link><Link className="community-secondary" href="/community/submit">Submit a Tool or Update</Link></div></header>
    <section className="community-section community-explainer"><h2>One tool, many implementations</h2><p>A tool family groups the original software and community repositories. Tool lineage shows recorded ancestry. Each repository has its own updates, author credits and evidence, so you can decide which implementation fits your research.</p></section>
    <section className="community-section"><h2>Take part</h2><div className="community-overview-links">
      <Link href="/community/bounties"><h3>Ask for help</h3><p>Post a development or maintenance request, or contribute your expertise.</p></Link>
      <Link href="/community/contributors"><h3>Meet the contributors</h3><p>See who maintains a tool and explore members’ published contributions.</p></Link>
      <Link href="/community/governance"><h3>Follow community decisions</h3><p>Read public tool governance records and understand how maintenance works.</p></Link>
    </div></section>
    <section className="community-section community-explainer"><h2>Start with the guide</h2><p>Learn how to find tools, read lineage and submit work for review. <Link className="community-link" href="/community/guide">Open the User Guide</Link>.</p></section>
  </>;
}

import Link from "next/link";

export default function WhoWeAre() {
  return <>
    <header className="community-heading"><h1>Who We Are</h1><p>CrossOmics connects researchers and software contributors working to make scientific tools easier to discover, improve and maintain.</p></header>
    <section className="community-section community-explainer"><h2>Why this community exists</h2><p>Useful research software often lives across several repositories, papers and individual contributions. We bring those connections into a shared registry, with visible authorship, recorded ancestry and evidence for published improvements.</p></section>
    <section className="community-section community-explainer"><h2>A shared record of the work</h2><p>Original authors receive credit for their software. Community maintainers are registered members responsible for a tool here. Contributors can submit new tools or updates, and other researchers can explore their published work.</p><div className="community-actions"><Link className="community-secondary" href="/community/contributors">Meet contributors</Link><Link className="community-primary" href="/community/guide">Get involved</Link></div></section>
  </>;
}

import Link from "next/link";

export default function PublicGovernance() {
  return <>
    <header className="community-heading"><h1>Public Governance</h1><p>Understand how the community reviews contributions, assigns maintenance responsibilities and records decisions. No sign-in is needed to read public records.</p></header>
    <section className="community-section community-explainer"><h2>Roles and responsibilities</h2><dl className="community-role-list">
      <div><dt>Original authors</dt><dd>The people who created the research software. Author credit does not grant community management access.</dd></div>
      <div><dt>Contributors</dt><dd>Members who submit tools or improvements with evidence for review.</dd></div>
      <div><dt>Tool maintainers</dt><dd>Registered members responsible for a particular tool, its metadata and Maintainer Picks.</dd></div>
      <div><dt>Super Administrators</dt><dd>Platform administrators who manage tools and maintenance assignments across the community.</dd></div>
    </dl></section>
    <section className="community-section community-explainer"><h2>Review and membership</h2><p>Submissions are reviewed before publication. Membership changes follow the current tool policy, including candidate acceptance and approval votes where governance is enabled. Private drafts and internal account bindings stay private.</p></section>
    <section className="community-section community-explainer"><h2>Read a tool’s public record</h2><p>Open Public governance from any tool page to see its current maintenance team, recommendations, proposals and recorded changes. Available evidence packages let you verify service signatures against a separately trusted configuration.</p><p>Service signatures describe what this platform recorded. Independent witnesses, personal user signatures and blockchain anchoring are not currently provided.</p><div className="community-actions"><Link className="community-primary" href="/#registry">Find a tool’s records</Link><Link className="community-secondary" href="/community/guide#governance">Read the governance guide</Link></div></section>
  </>;
}

import { communityContributions, communitySession, personalContributions } from "@/lib/community/service";
import ContributionList, { ContributionPager } from "../ContributionList";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import AppAccess from "./AppAccess";
import Link from "next/link";
import PersonalEntries from "./PersonalEntries";
import ContributorId from "./ContributorId";

export default async function MyHistory({ searchParams: query }: { searchParams: Promise<{ login?: string; page?: string; section?: string }> }) {
  const searchParams = await query;
  const session = await communitySession();
  const contributor = session?.contributor;
  const sections = [{key:"tools",type:"original",label:"My Tools"},{key:"updates",type:"update",label:"My Updates"},{key:"maintained",type:"maintained",label:"My Maintained Tools"}] as const;
  const selected = sections.find(section=>section.key===searchParams.section) ?? sections[0];
  const returnQuery = new URLSearchParams({...(searchParams.section?{section:selected.key}:{}),...(typeof searchParams.page==="string" && /^\d{1,4}$/.test(searchParams.page)?{page:searchParams.page}:{})});
  if (!contributor) redirect(communitySignInPath(`/community/mine${returnQuery.size?`?${returnQuery}`:""}`,searchParams.login));
  const personal = session?.registryV2Enabled ? await personalContributions(selected.type, searchParams.page) : null;
  const history = personal ? null : await communityContributions({ page: searchParams.page, mine: true });
  function pageHref(page:number) {return "/community/mine?"+new URLSearchParams({section:selected.key,page:String(page)});}
  return (
    <>
      <header className="community-heading">
        <h1>My Contributions</h1>
        <p>Review your submitted tools and updates, record completed work, and manage tools assigned to you.</p>
        <div className="community-actions">
          <span className="community-tag">@{contributor.login}</span>
          {session?.registryV2Available && /^[1-9]\d{0,19}$/.test(contributor.id) &&
            <Link className="community-secondary" href="/community/registry/submissions">My Tool Submissions</Link>}
          <form method="post" action="/api/community/auth/logout"><button className="community-secondary">Sign out</button></form>
        </div>
        <ContributorId id={contributor.id} />
      </header>
      {personal ? <>
        <nav className="community-personal-tabs" aria-label="My contribution groups">
          {sections.map(section=><Link key={section.key} href={"/community/mine?"+new URLSearchParams({section:section.key})} aria-current={section.key===selected.key?"page":undefined}>{section.label} <span>{personal.counts[section.type]}</span></Link>)}
        </nav>
        <section className="community-section">
          <h2>{selected.label}</h2>
          <p className="community-group-description">{selected.key==="maintained"?"Tools for which an administrator has assigned you management access.":selected.key==="tools"?"Original tools you submitted or recorded. Submission does not imply original authorship or management access.":"Tool updates you submitted and update contributions you recorded."}</p>
          <PersonalEntries entries={personal.entries} />
          {(personal.page>1 || personal.hasMore) && <nav className="community-actions community-pager" aria-label="Personal contribution pages">
            {personal.page>1 && <Link className="community-secondary" href={pageHref(personal.page-1)}>Previous page</Link>}
            <span>Page {personal.page}</span>
            {personal.hasMore && <Link className="community-secondary" href={pageHref(personal.page+1)}>Next page</Link>}
          </nav>}
        </section>
      </> : <><p className="community-notice">Grouped submissions and maintained tools are temporarily unavailable. Your existing contribution records are shown below.</p>{history ? (
        <>
          <section className="community-tally" aria-label="Contribution count">
            <strong>{history.total}</strong>
            <div><h2>Recorded contributions</h2><p>Each unique record counts once across both project scopes.</p></div>
          </section>
          <ContributionList items={history.items} mine />
          <ContributionPager route="/community/mine" {...history} />
        </>
      ) : <p className="community-notice" role="status">Your history is temporarily unavailable. Try refreshing this page.</p>}
      </>}
      <AppAccess serviceUrl={process.env.COMMUNITY_PUBLIC_SERVICE_URL || undefined}
        desktopAuth={session?.desktopAuthAvailable && /^[1-9]\d{0,19}$/.test(contributor.id)} />
    </>
  );
}

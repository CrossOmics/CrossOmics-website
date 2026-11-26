import { communityContributions, communitySession, personalContributions, myPublicProfile } from "@/lib/community/service";
import ContributionList, { ContributionPager } from "../ContributionList";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import AppAccess from "./AppAccess";
import Link from "next/link";
import PublicName from "./PublicName";
import ContributorId from "./ContributorId";
import ContributorSections, { profileSections, type ProfilePages } from "../ContributorSections";

export default async function MyHistory({ searchParams }: { searchParams: Promise<{
  login?: string; page?: string; section?: string; maintainedPage?: string; originalPage?: string; updatePage?: string;
}> }) {
  const query = await searchParams;
  const session = await communitySession();
  const contributor = session?.contributor;
  const pages: ProfilePages = { maintained: query.maintainedPage, original: query.originalPage, update: query.updatePage };
  // Keep pagination in old personal bookmarks without splitting the profile into routes.
  if (query.page) {
    const legacy = query.section === "maintained" ? "maintained" : query.section === "updates" ? "update" : "original";
    pages[legacy] ??= query.page;
  }
  const returnQuery = new URLSearchParams();
  for (const { key } of profileSections) if (pages[key] && /^\d{1,4}$/.test(pages[key]!)) returnQuery.set(key + "Page", pages[key]!);
  if (!contributor) redirect(communitySignInPath(`/community/mine${returnQuery.size ? `?${returnQuery}` : ""}`, query.login));
  const [maintained, original, update] = session.registryV2Enabled
    ? await Promise.all(profileSections.map(({key}) => personalContributions(key, pages[key]))) : [null, null, null];
  const profile = session.registryV2Enabled ? await myPublicProfile() : null;
  const history = !session.registryV2Enabled ? await communityContributions({ page: query.page, mine: true }) : null;
  return <>
    <header className="community-heading"><h1>My Contributions</h1>
      <p>Your community profile: tools you maintain, originals you submitted and contributions to existing tools.</p>
      <div className="community-actions"><span className="community-tag">@{contributor.login}</span>
        <span className="community-tag community-tag-neutral">{session.canManageRegistry ? "Super Administrator" : maintained?.total ? "Tool Maintainer" : "Community Member"}</span>
        <Link className="community-secondary" href="/community/registry/submissions">My Tool Submissions</Link>
        {session.canManageRegistry && <Link className="community-primary" href="/community/admin">Admin Dashboard</Link>}
        <form method="post" action="/api/community/auth/logout"><button className="community-secondary">Sign out</button></form>
      </div>
    </header>
    {session.registryV2Enabled && <PublicName profile={profile} />}
    <ContributorSections route="/community/mine" pages={pages} sections={{maintained, original, update}} mine />
    {history && <section className="community-section"><h2>Existing contribution records</h2><ContributionList items={history.items} mine /><ContributionPager route="/community/mine" {...history} /></section>}
    <details className="community-account-settings" id="account-settings"><summary>Account settings & app access</summary>
      <ContributorId id={contributor.id} />
      <AppAccess serviceUrl={process.env.COMMUNITY_PUBLIC_SERVICE_URL || undefined}
        desktopAuth={session.desktopAuthAvailable && /^[1-9]\d{0,19}$/.test(contributor.id)} />
    </details>
  </>;
}

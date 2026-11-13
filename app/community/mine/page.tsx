import { communityContributions, communitySession } from "@/lib/community/service";
import ContributionList, { ContributionPager } from "../ContributionList";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import AppAccess from "./AppAccess";
import Link from "next/link";
import ContributorId from "./ContributorId";

export default async function MyHistory({ searchParams: query }: { searchParams: Promise<{ login?: string; page?: string }> }) {
  const searchParams = await query;
  const session = await communitySession();
  const contributor = session?.contributor;
  if (!contributor) {
    const page = typeof searchParams.page === "string" && /^\d{1,4}$/.test(searchParams.page) ? `?page=${searchParams.page}` : "";
    redirect(communitySignInPath(`/community/mine${page}`, searchParams.login));
  }
  const history = await communityContributions({ page: searchParams.page, mine: true });
  return (
    <>
      <header className="community-heading">
        <h1>My contribution history</h1>
        <p>See your contributions from Web and Gardener, and add evidence as their impact becomes visible.</p>
        <div className="community-actions">
          <span className="community-tag">@{contributor.login}</span>
          {session?.registryV2Available && /^[1-9]\d{0,19}$/.test(contributor.id) &&
            <Link className="community-secondary" href="/community/registry/submissions">My registry submissions</Link>}
          <form method="post" action="/api/community/auth/logout"><button className="community-secondary">Sign out</button></form>
        </div>
        <ContributorId id={contributor.id} />
      </header>
      {history ? (
        <>
          <section className="community-tally" aria-label="Contribution count">
            <strong>{history.total}</strong>
            <div><h2>Recorded contributions</h2><p>Each unique record counts once across both project scopes.</p></div>
          </section>
          <ContributionList items={history.items} mine />
          <ContributionPager route="/community/mine" {...history} />
        </>
      ) : <p className="community-notice" role="status">Your history is temporarily unavailable. Try refreshing this page.</p>}
      <AppAccess serviceUrl={process.env.COMMUNITY_PUBLIC_SERVICE_URL || undefined}
        desktopAuth={session?.desktopAuthAvailable && /^[1-9]\d{0,19}$/.test(contributor.id)} />
    </>
  );
}

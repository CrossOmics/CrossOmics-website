import Link from "next/link";
import { requireAccount } from "@/lib/community/account";
import { personalContributions, publicContributor } from "@/lib/community/service";
import PersonalEntries from "../mine/PersonalEntries";
import { AccountUnavailable } from "./AccountFrame";

export default async function AccountHome() {
  const {session,profile,name} = await requireAccount("/community/account");
  if (!session?.contributor) return <AccountUnavailable />;
  const [histories,publicHome] = await Promise.all([
    session.registryV2Enabled ? Promise.all([personalContributions("maintained"),personalContributions("original"),personalContributions("update")]) : [],
    profile ? publicContributor(profile.contributor.slug,{}) : null
  ]);
  const counts = histories.find(section => section !== null)?.counts;
  const work = histories.flatMap(section => section?.entries ?? []).slice(0,3);
  const role = session.canManageRegistry ? "Platform administrator" : counts?.maintained ? "Tool maintainer" : "Community member";
  return <>
    <header className="community-account-overview" aria-label="Your account overview">
      <div className="community-account-overview-title"><span className="community-account-avatar" aria-hidden>{([...name][0] ?? "").toUpperCase()}</span>
        <div><p className="community-account-context">Account home</p><h1>{name}</h1><p>{role}</p></div>
      </div>
      <div className="community-actions">
        <Link className="community-secondary" href="/community/account/settings">Edit profile</Link>
        {publicHome?.data && <Link className="community-link" href={`/community/contributors/${profile!.contributor.slug}`}>View public profile <span aria-hidden>↗</span></Link>}
      </div>
    </header>
    <dl className="community-account-counts" aria-label="Your contribution summary">
      {[{key:"maintained",label:"Maintained tools"},{key:"original",label:"Original submissions"},{key:"update",label:"Updates & contributions"}].map(({key,label}) =>
        <div key={key}><dt>{label}</dt><dd>{counts?.[key as keyof typeof counts] ?? "—"}</dd></div>)}
    </dl>
    {!publicHome?.data && <p className="community-account-profile-note">{publicHome?.status === 404 ?
      "Your public homepage appears with your first public contribution or maintenance assignment. Your account settings and drafts stay private." :
      "Your public profile is temporarily unavailable. You can still use your private account pages."}</p>}
    <section className="community-section community-account-work"><div className="community-section-heading"><h2>Your work</h2><Link className="community-link" href="/community/mine">View all contributions</Link></div>
      {work.length ? <PersonalEntries entries={work} mine /> : !session.registryV2Enabled ? <p>Open My Contributions to view your work and contribution history.</p> :
        histories.some(section => section === null) ? <p className="community-notice">Your contribution preview is temporarily unavailable. Try refreshing this page.</p> :
          <p>Your contributions will appear here as you share tools, submit updates or join a maintenance team.</p>}
    </section>
  </>;
}

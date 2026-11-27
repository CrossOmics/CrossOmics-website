import Link from "next/link";
import { requireAccount } from "@/lib/community/account";
import { personalContributions, publicContributor } from "@/lib/community/service";
import PersonalEntries from "../mine/PersonalEntries";
import { AccountUnavailable } from "./AccountFrame";

export default async function AccountHome() {
  const {session,profile,name} = await requireAccount("/community/account");
  if (!session?.contributor) return <AccountUnavailable />;
  const [history,publicHome] = await Promise.all([
    session.registryV2Enabled ? personalContributions("maintained") : null,
    profile ? publicContributor(profile.contributor.slug,{}) : null
  ]);
  const counts = history?.counts;
  const role = session.canManageRegistry ? "Platform administrator" : counts?.maintained ? "Tool maintainer" : "Community member";
  return <>
    <header className="community-heading community-account-heading"><h1>Account home</h1><p>Your work, profile and account preferences in one place.</p></header>
    <section className="community-account-welcome" aria-label="Your account overview">
      <span className="community-account-avatar" aria-hidden>{([...name][0] ?? "").toUpperCase()}</span>
      <div><h2>{name}</h2><p>{role}</p></div>
      <Link className="community-secondary" href="/community/account/settings">Edit profile</Link>
    </section>
    <section className="community-account-public"><h2>Your public homepage</h2>
      {publicHome?.data ? <><p>Share your maintained tools and published work with the community.</p><Link className="community-link" href={`/community/contributors/${profile!.contributor.slug}`}>View public profile</Link></> :
        publicHome?.status === 404 ? <p>Your public homepage appears with your first public contribution or maintenance assignment. Your account settings and drafts stay private.</p> :
          <p>Your public profile is temporarily unavailable. You can still use your private account pages.</p>}
    </section>
    <dl className="community-account-counts" aria-label="Your contribution summary">
      {[{key:"maintained",label:"Maintained tools"},{key:"original",label:"Original submissions"},{key:"update",label:"Updates & contributions"}].map(({key,label}) =>
        <div key={key}><dt>{label}</dt><dd>{counts?.[key as keyof typeof counts] ?? "—"}</dd></div>)}
    </dl>
    <section className="community-section"><div className="community-section-heading"><h2>Your work</h2><Link className="community-link" href="/community/mine">View all contributions</Link></div>
      {history ? <PersonalEntries entries={history.entries.slice(0,3)} mine /> : <p>Open My Contributions to view your work and contribution history.</p>}
    </section>
    <div className="community-account-quick-links"><Link href="/community/registry/submissions"><h3>Submission history</h3><p>Follow your tools and updates through review.</p></Link>
      <Link href="/community/account/security"><h3>Sign-in & access</h3><p>Review your sign-in method and manage Gardener access.</p></Link></div>
  </>;
}

import { requireAccount } from "@/lib/community/account";
import PublicName from "../../mine/PublicName";
import ContributorId from "../../mine/ContributorId";
import { AccountUnavailable } from "../AccountFrame";

export default async function ProfileSettings() {
  const {session,profile} = await requireAccount("/community/account/settings");
  if (!session?.contributor) return <AccountUnavailable />;
  return <>
    <header className="community-heading community-account-heading"><h1>Profile settings</h1><p>Choose how your name appears alongside your public contributions.</p></header>
    <PublicName profile={profile} />
    <section className="community-section"><h2>Account identifier</h2><p>This identifier belongs to your account. It is shown only to you here and can be used when a maintainer invitation asks for your account.</p><ContributorId id={session.contributor.id} /></section>
  </>;
}

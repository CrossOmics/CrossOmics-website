import { requireAccount } from "@/lib/community/account";
import { signInLabels } from "@/lib/community/types";
import AppAccess from "../../mine/AppAccess";
import { AccountUnavailable } from "../AccountFrame";

export default async function SignInAccess() {
  const {session,provider} = await requireAccount("/community/account/security");
  if (!session?.contributor) return <AccountUnavailable />;
  return <>
    <header className="community-heading community-account-heading"><h1>Sign-in & access</h1><p>Review how you signed in and manage access from Gardener.</p></header>
    <section className="community-account-methods"><h2>Sign-in methods</h2>
      <dl className="community-account-session"><div><dt>Current sign-in method</dt><dd>{provider ? signInLabels[provider] : "Unavailable"}</dd></div>
        <div><dt>Browser session</dt><dd>Up to {session.sessionDurationDays} days</dd></div></dl>
      <p>These are the sign-in methods available on this site. A different provider may belong to a separate Community account.</p>
      <ul>{Object.entries(signInLabels).map(([key,label]) => <li key={key}><strong>{label}</strong><span>{provider === key ? "Current session · " : ""}{session.providers.includes(key as keyof typeof signInLabels) ? "Available on this site" : "Not available on this site"}</span></li>)}</ul>
    </section>
    <section className="community-section"><h2>Gardener access</h2><AppAccess serviceUrl={process.env.COMMUNITY_PUBLIC_SERVICE_URL || undefined} desktopAuth={session.desktopAuthAvailable && provider === "github"} /></section>
    <section className="community-section"><h2>End this browser session</h2><p>Sign out before using a different account on this browser.</p><form method="post" action="/api/community/auth/logout"><button className="community-secondary" type="submit">Sign out</button></form></section>
  </>;
}

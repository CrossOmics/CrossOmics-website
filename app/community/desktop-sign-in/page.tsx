import Link from "next/link";
import { communitySession, desktopAuthAttempt } from "@/lib/community/service";

const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;

export default async function DesktopSignIn({ searchParams }: { searchParams: Promise<{ attempt?: string; login?: string }> }) {
  const { attempt, login: error } = await searchParams;
  const valid = typeof attempt === "string" && uuid.test(attempt);
  const [session, request] = await Promise.all([communitySession(), valid ? desktopAuthAttempt(attempt) : null]);
  const github = session?.contributor && /^[1-9]\d{0,19}$/.test(session.contributor.id);
  const returnTo = "/community/desktop-sign-in?" + new URLSearchParams({ attempt: valid ? attempt : "" });
  const login = "/api/community/auth/login?" + new URLSearchParams({ provider: "github", returnTo });

  return (
    <>
      <header className="community-heading">
        <h1>Sign in to Gardener</h1>
        <p>Use your CrossOmics Community account to access shared contributions and the registry in Gardener.</p>
      </header>
      {request && (error === "failed" || error === "expired") && <p role="alert" className="community-error">
        GitHub sign-in did not complete. You can try again from this page.
      </p>}
      {!request ? <p className="community-notice">This sign-in request is unavailable. Start a new sign-in from Gardener.</p> : github ? (
        <section className="community-notice">
          <p>Connect Gardener as <strong>@{session.contributor?.login}</strong>.</p>
          <div className="community-actions">
            <form method="post" action={"/api/community/v1/desktop-auth/attempts/" + attempt + "/approve"}>
              <button className="community-primary" type="submit">Connect Gardener</button>
            </form>
            <a className="community-link" href={login}>Use another GitHub account</a>
          </div>
        </section>
      ) : (
        <div className="community-actions"><a className="community-primary" href={login}>Sign in with GitHub</a></div>
      )}
      <Link className="community-link" href="/community">Back to Community</Link>
    </>
  );
}

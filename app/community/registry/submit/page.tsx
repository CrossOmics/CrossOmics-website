import Link from "next/link";
import { communitySession } from "@/lib/community/service";
import RegistryForm from "./RegistryForm";

const path = "/community/registry/submit";

export default async function RegistrySubmitPage({ searchParams }: {
  searchParams: Promise<{ pr?: string; result?: string }>;
}) {
  const [session, query] = await Promise.all([communitySession(), searchParams]);
  const signedInWithGitHub = /^[1-9]\d{0,19}$/.test(session?.contributor?.id ?? "");
  const loginUrl = "/api/community/auth/login?" + new URLSearchParams({ provider: "github", returnTo: path });
  const pr = typeof query.pr === "string" && /^[1-9]\d{0,15}$/.test(query.pr) ? query.pr : null;
  return (
    <>
      <header className="community-heading">
        <Link href="/community#registry" className="community-link">← Back to the registry</Link>
        <h1>Submit a pipeline</h1>
        <p>Register a tool or workflow from a public GitHub repository. The CrossOmics maintainers review each registration on GitHub.</p>
      </header>
      {pr && signedInWithGitHub ? (
        <RegistryForm pr={pr} />
      ) : !session?.registrySubmissionAvailable ? (
        <p className="community-notice">Website submissions are unavailable. You can submit through Gardener or{" "}
          <a className="community-link" href="https://github.com/CrossOmics/pipeline-registry#adding-a-pipeline-or-a-version">open a Registry PR on GitHub</a>.
        </p>
      ) : !signedInWithGitHub ? (
        <section className="community-notice">
          <h2>Sign in with GitHub</h2>
          <p>Your submission will open a pull request under your GitHub account.</p>
          {session.providers.includes("github") ? (
            <div className="community-actions"><a className="community-primary" href={loginUrl}>Sign in with GitHub</a></div>
          ) : <p>GitHub sign-in is currently unavailable.</p>}
        </section>
      ) : (
        <RegistryForm result={typeof query.result === "string" ? query.result : undefined} />
      )}
    </>
  );
}

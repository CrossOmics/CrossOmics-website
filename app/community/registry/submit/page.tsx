import Link from "next/link";
import { communitySession, registryV2Catalog } from "@/lib/community/service";
import RegistryForm from "./RegistryForm";
import RegistryFormV2 from "./RegistryFormV2";

const path = "/community/registry/submit";
const legacyResults: Record<string, string> = {
  processing: "Your previous Registry pull request attempt is still being processed.",
  expired: "Your previous GitHub authorization expired.",
  denied: "GitHub did not grant public repository access for your previous submission.",
  account: "Your previous authorization used a different GitHub account.",
  fork: "The Registry fork could not be used for your previous submission.",
  source: "The source repository or commit for your previous submission was unavailable.",
  rate: "Your previous submission reached GitHub's request limit.",
  conflict: "The Registry or submission branch changed during your previous submission.",
  unavailable: "The previous GitHub submission service was unavailable.",
  retry: "GitHub could not confirm your previous submission."
};

export default async function RegistrySubmitPage({ searchParams }: {
  searchParams: Promise<{ pr?: string; result?: string; pipelineId?: string }>;
}) {
  const [session, query] = await Promise.all([communitySession(), searchParams]);
  const signedInWithGitHub = /^[1-9]\d{0,19}$/.test(session?.contributor?.id ?? "");
  const pipelineId = typeof query.pipelineId === "string" && /^cp_[a-z0-9_]{1,61}$/.test(query.pipelineId)
    ? query.pipelineId : undefined;
  const returnTo = pipelineId ? path + "?" + new URLSearchParams({ pipelineId }) : path;
  const loginUrl = "/api/community/auth/login?" + new URLSearchParams({ provider: "github", returnTo });
  const pr = typeof query.pr === "string" && /^[1-9]\d{0,15}$/.test(query.pr) ? query.pr : null;
  const legacyResult = signedInWithGitHub && !pr && typeof query.result === "string" && Object.hasOwn(legacyResults, query.result)
    ? legacyResults[query.result] : null;
  const v2 = session?.registryV2Enabled === true;
  const available = v2 && session?.registryV2Available === true;
  const catalog = available && signedInWithGitHub ? await registryV2Catalog() : null;
  const unavailableMessage = !available
    ? "Pipeline submissions are temporarily unavailable. Please try again later."
    : catalog?.error || undefined;
  return (
    <>
      <header className="community-heading">
        <Link href="/community#registry" className="community-link">← Back to the registry</Link>
        <h1>Submit a pipeline</h1>
        <p>Register a new pipeline or submit an improved version, update, or fix. CrossOmics administrators review submissions before publication.</p>
        {v2 && signedInWithGitHub && <div className="community-actions">
          <Link className="community-link" href="/community/registry/submissions">My registry submissions</Link>
        </div>}
      </header>
      {legacyResult && <p className="community-notice" role="alert">{legacyResult}{" "}
        <a className="community-link" href="https://github.com/CrossOmics/pipeline-registry/pulls">Check Registry pull requests on GitHub</a> before starting a new submission.
      </p>}
      {pr && signedInWithGitHub ? (
        <RegistryForm pr={pr} />
      ) : !session ? (
        <p className="community-notice">Website submissions are temporarily unavailable. Try again shortly.</p>
      ) : !signedInWithGitHub ? (
        <section className="community-notice">
          <h2>Sign in with GitHub</h2>
          <p>Your GitHub account identifies you as the submitter.</p>
          {session.providers.includes("github") ? (
            <div className="community-actions"><a className="community-primary" href={loginUrl}>Sign in with GitHub</a></div>
          ) : <p>GitHub sign-in is currently unavailable.</p>}
        </section>
      ) : (
        <RegistryFormV2 items={catalog?.data?.items ?? []} initialId={pipelineId} unavailableMessage={unavailableMessage} />
      )}
    </>
  );
}

import Link from "next/link";
import { communitySession, registryV2Catalog } from "@/lib/community/service";
import RegistryForm from "./RegistryForm";
import RegistryFormV2 from "./RegistryFormV2";

const path = "/community/registry/submit";

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
  const v2 = session?.registryV2Enabled === true;
  const available = session?.registryV2Available === true;
  const catalog = available && signedInWithGitHub ? await registryV2Catalog() : null;
  return (
    <>
      <header className="community-heading">
        <Link href="/community#registry" className="community-link">← Back to the registry</Link>
        <h1>Submit a pipeline</h1>
        {session && <p>{v2 ? "Register a new pipeline or submit an improved version, update, or fix." :
          "Register a tool or workflow from a public GitHub repository. The CrossOmics maintainers review each registration on GitHub."}</p>}
        {v2 && signedInWithGitHub && <div className="community-actions">
          <Link className="community-link" href="/community/registry/submissions">My registry submissions</Link>
        </div>}
      </header>
      {pr && signedInWithGitHub ? (
        <RegistryForm pr={pr} />
      ) : !session || (v2 && !available) ? (
        <p className="community-notice">Website submissions are temporarily unavailable. Try again shortly.</p>
      ) : !v2 && !session.registrySubmissionAvailable ? (
        <p className="community-notice">Website submissions are unavailable. You can submit through Gardener or{" "}
          <a className="community-link" href="https://github.com/CrossOmics/pipeline-registry#adding-a-pipeline-or-a-version">open a Registry PR on GitHub</a>.
        </p>
      ) : !signedInWithGitHub ? (
        <section className="community-notice">
          <h2>Sign in with GitHub</h2>
          <p>{v2 ? "Your GitHub account identifies you as the submitter." : "Your submission will open a pull request under your GitHub account."}</p>
          {session.providers.includes("github") ? (
            <div className="community-actions"><a className="community-primary" href={loginUrl}>Sign in with GitHub</a></div>
          ) : <p>GitHub sign-in is currently unavailable.</p>}
        </section>
      ) : v2 ? (
        catalog?.data ? <RegistryFormV2 items={catalog.data.items} initialId={pipelineId} /> :
          <p className="community-notice" role="status">{catalog?.error}</p>
      ) : (
        <RegistryForm result={typeof query.result === "string" ? query.result : undefined} />
      )}
    </>
  );
}

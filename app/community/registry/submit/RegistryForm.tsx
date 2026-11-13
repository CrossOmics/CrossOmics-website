"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { communityRequest } from "../../client";

const fields = ["name", "kind", "domain", "description", "repository", "label", "commit"] as const;
const domains = {
  transcriptomics: "Transcriptomics",
  epigenomics: "Epigenomics",
  genomics: "Genomics",
  proteomics: "Proteomics",
  metagenomics: "Metagenomics",
  "multi-omics": "Multi-omics",
  imaging: "Imaging"
};
const errors: Record<string, string> = {
  processing: "This authorization is still being processed. Return to the original tab for the result.",
  expired: "The authorization expired. Preview your submission and try again.",
  denied: "GitHub did not grant public repository access. Preview your submission to try again.",
  account: "Authorize with the same GitHub account you used to sign in to Community.",
  fork: "The Registry fork could not be used. Check your pipeline-registry fork on GitHub, then try again.",
  source: "The source repository or commit is no longer available. Check it and preview again.",
  rate: "GitHub's request limit was reached. Try again later.",
  conflict: "The Registry or submission branch changed. Review a new preview before trying again.",
  unavailable: "Website submissions are currently unavailable.",
  retry: "GitHub could not confirm the submission. Preview and retry to recover an existing open pull request."
};
const draftKey = "crossomics-registry-draft";
type Draft = Record<(typeof fields)[number], string>;
type Preview = { path: string; yaml: string; proof: string };
const emptyDraft: Draft = { name: "", kind: "", domain: "", description: "", repository: "", label: "", commit: "" };

export default function RegistryForm({ pr, result }: { pr?: string; result?: string }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const authorizing = useRef(false);
  const [error, setError] = useState(result && Object.hasOwn(errors, result) ? errors[result] : "");

  useEffect(() => {
    try {
      if (pr) sessionStorage.removeItem(draftKey);
      else {
        const saved = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
        if (saved && fields.every((field) => typeof saved[field] === "string")) setDraft(saved);
      }
    } catch {
      // Browser storage is optional. A fresh form still works.
    }
  }, [pr]);

  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (event.persisted && authorizing.current) {
        authorizing.current = false;
        setBusy(false);
      }
    }
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  if (pr) return (
    <section className="community-notice" role="status">
      <h2>Pull request submitted</h2>
      <p>CrossOmics maintainers can now review your registration.</p>
      <div className="community-actions">
        <a className="community-primary" href={"https://github.com/CrossOmics/pipeline-registry/pull/" + pr}>View pull request #{pr}</a>
      </div>
    </section>
  );

  function update(field: keyof Draft, value: string) {
    setDraft({ ...draft, [field]: value });
    setPreview(null);
    setError("");
  }

  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setPreview(null);
    setError("");
    try {
      setPreview(await communityRequest<Preview>("registry-submissions/preview", "POST", draft));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : errors.retry);
    } finally {
      setBusy(false);
    }
  }

  async function authorize() {
    if (!preview || authorizing.current) return;
    authorizing.current = true;
    setBusy(true);
    setError("");
    try {
      const { authorizationUrl } = await communityRequest<{ authorizationUrl: string }>(
        "registry-submissions", "POST", { ...draft, proof: preview.proof }
      );
      try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
      window.location.assign(authorizationUrl);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : errors.retry);
      authorizing.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="community-form">
      <form onSubmit={review} aria-busy={busy}>
        <fieldset disabled={busy}>
          <legend>Registry details</legend>
          <div className="community-form-grid">
            <label>Pipeline name<input required maxLength={120} value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
            <label>Public GitHub repository<input type="url" required maxLength={160} placeholder="https://github.com/owner/repository"
              value={draft.repository} onChange={(event) => update("repository", event.target.value)} /></label>
            <label>Entry type<select required value={draft.kind} onChange={(event) => update("kind", event.target.value)}>
              <option value="">Choose a type</option><option value="tool">Tool</option><option value="workflow">Workflow</option>
            </select></label>
            <label>Domain<select required value={draft.domain} onChange={(event) => update("domain", event.target.value)}>
              <option value="">Choose a domain</option>
              {Object.entries(domains).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select></label>
            <label>Version label<input required maxLength={120} placeholder="v1.0.0" value={draft.label}
              onChange={(event) => update("label", event.target.value)} /></label>
            <label>Full commit SHA<input required maxLength={40} pattern="[0-9a-fA-F]{40}" spellCheck={false}
              value={draft.commit} onChange={(event) => update("commit", event.target.value)} /></label>
            <label className="community-field-wide">Description<textarea required maxLength={2000} rows={4} value={draft.description}
              onChange={(event) => update("description", event.target.value)} /></label>
          </div>
        </fieldset>
        <button className="community-secondary" type="submit" disabled={busy}>Preview registration</button>
      </form>
      {error && <p className="community-notice community-registry-preview" role="alert">{error}</p>}
      {busy && <p role="status">Checking your submission…</p>}
      {preview && (
        <section className="community-notice community-registry-preview" aria-live="polite">
          <h2>Review your registration</h2>
          <p><code>{preview.path}</code></p>
          <pre>{preview.yaml}</pre>
          <p>GitHub will ask for access to public repositories. Community uses that authorization to open this Registry pull request from your GitHub account.</p>
          <div className="community-actions">
            <button type="button" className="community-primary" onClick={authorize} disabled={busy}>Authorize and open PR</button>
          </div>
        </section>
      )}
    </div>
  );
}

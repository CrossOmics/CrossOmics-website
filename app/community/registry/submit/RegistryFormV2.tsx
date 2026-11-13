"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { registryTypes, registryTypeDescriptions, type RegistryDraftV2, type RegistryItemV2, type RegistrySubmissionV2, type RegistryType } from "@/lib/community/registry-v2";
import type { Contributor } from "@/lib/community/types";
import { communityRequest } from "../../client";
import CreditFields, { emptyCredit, parseCredit, withEmptyCreditFields, type CreditInput } from "../CreditFields";

const domains = ["transcriptomics", "epigenomics", "genomics", "proteomics", "metagenomics", "multi-omics", "imaging"];
export default function RegistryFormV2({ items, submitter, initialId, unavailableMessage }: {
  items: RegistryItemV2[]; submitter: Contributor; initialId?: string; unavailableMessage?: string;
}) {
  const initial = items.find((item) => item.id === initialId);
  const [type, setType] = useState<RegistryType>(initial ? "update" : "origin");
  const [pipelineId, setPipelineId] = useState(initial?.id ?? "");
  const [authors, setAuthors] = useState<CreditInput[]>(() => seedCredits(initial, "authors"));
  const [authorNames, setAuthorNames] = useState(() => seedCredits(initial, "authors").map((credit) => credit.name).filter(Boolean).join("; "));
  const [citation, setCitation] = useState(() => initial?.versions.find((version) => version.type === "origin")?.citation ?? "");
  const [maintainers, setMaintainers] = useState<CreditInput[]>(() => seedCredits(initial, "maintainers"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegistrySubmissionV2 | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef<string | null>(null);
  const origin = type === "origin";
  const selected = origin ? undefined : items.find((item) => item.id === pipelineId);
  const parents = selected?.versions.filter((version) => !version.withdrawn) ?? [];

  function select(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    setPipelineId(id);
    setAuthors(seedCredits(item, "authors"));
    setAuthorNames(seedCredits(item, "authors").map((credit) => credit.name).filter(Boolean).join("; "));
    setCitation(item?.versions.find((version) => version.type === "origin")?.citation ?? "");
    setMaintainers(seedCredits(item, "maintainers"));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || unavailableMessage) return;
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "");
    const body: RegistryDraftV2 = {
      requestId: requestId.current ?? (requestId.current = crypto.randomUUID()),
      type, name: selected?.name ?? value("name"), description: selected?.description ?? value("description"),
      domain: selected?.domain ?? value("domain"), repository: value("repository"), label: value("label"),
      commit: value("commit"),
      authors: authorNames.split(/[;；]/).map((name) => name.trim()).filter(Boolean).map((name) => {
        const existing = authors.find((credit) => credit.name.trim() === name);
        return existing ? parseCredit(existing) : { name };
      }),
      maintainers: maintainers.map(parseCredit),
      ...(citation.trim() ? { citation: citation.trim() } : {}),
      ...(origin ? {} : { pipelineId, parentVersionId: value("parentVersionId"), changeSummary: value("changeSummary"),
        ...(value("evidenceUrl").trim() ? { evidenceUrl: value("evidenceUrl").trim() } : {}) })
    };
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const response = await communityRequest<{ submission: RegistrySubmissionV2 }>(
        "registry/submissions", "POST", body, "v2");
      setResult(response.submission);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not submit your registration.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  if (result) return (
    <section className="community-notice" role="status">
      <h2>{result.status === "published" ? "Registration published" : "Registration submitted"}</h2>
      <p>Submission ID <code>{result.id}</code></p>
      <div className="community-actions">
        <Link className="community-primary" href="/community/registry/submissions">View my submissions</Link>
        {result.status === "published" && result.pipelineId &&
          <Link className="community-secondary" href={"/community/catalog/" + result.pipelineId}>Open registry entry</Link>}
      </div>
    </section>
  );

  return (
    <form className="community-form" onSubmit={submit} onChange={() => { requestId.current = null; }} aria-busy={pending}>
      {unavailableMessage && <p className="community-notice" role="status">{unavailableMessage}</p>}
      <fieldset disabled={pending || Boolean(unavailableMessage)}>
        <legend>Registry details</legend>
        <div className="community-form-grid">
          <label>Registration type<select name="type" value={type} aria-describedby="registration-type-help" onChange={(event) => {
            const next = event.target.value as RegistryType;
            if ((next === "origin") !== origin) select(next === "origin" ? "" : initial?.id ?? "");
            setType(next);
          }}>
            {Object.entries(registryTypes).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
          </select></label>
          <p id="registration-type-help" className="community-field-wide">{registryTypeDescriptions[type]}</p>
          {origin ? <>
            <label>Project name<input name="name" required maxLength={120} /></label>
            <label>Domain<select name="domain" required defaultValue="">
              <option value="">Choose a domain</option>
              {domains.map((domain) => <option value={domain} key={domain}>{domain}</option>)}
            </select></label>
            <label className="community-field-wide">Description<textarea name="description" required maxLength={2000} rows={4} /></label>
          </> : <>
            <label>Existing project<select required value={pipelineId} onChange={(event) => select(event.target.value)}>
              <option value="">Choose a project</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select></label>
            <label>Based on version<select name="parentVersionId" key={pipelineId} required defaultValue="" onChange={(event) => {
              const parent = parents.find((version) => version.id === event.target.value);
              if (parent?.maintainers.length) setMaintainers(parent.maintainers.map(withEmptyCreditFields));
            }}>
              <option value="">Choose a version</option>
              {parents.map((version) => <option key={version.id} value={version.id}>{version.label}</option>)}
            </select></label>
            <label className="community-field-wide">Change summary<textarea name="changeSummary" required maxLength={2000} rows={4} /></label>
            <label className="community-field-wide">Evidence URL (optional)<input name="evidenceUrl" type="url" pattern="https://.*" maxLength={2048} placeholder="https://example.org/benchmark-results" /></label>
          </>}
          <label>Public GitHub repository<input name="repository" type="url" required maxLength={160} placeholder="https://github.com/owner/repository" /></label>
          <label>Version label<input name="label" required maxLength={120} placeholder="v1.0.0" /></label>
          <label>Full commit SHA<input name="commit" required maxLength={40} pattern="[0-9a-fA-F]{40}" spellCheck={false} /></label>
        </div>
        <label>Author names<input name="authorNames" required value={authorNames} maxLength={2600}
          placeholder="Jane Smith; John Doe" aria-describedby="author-names-help" onChange={(event) => setAuthorNames(event.target.value)} /></label>
        <p id="author-names-help">Separate names with a semicolon (;). List the original authors, who may be different from the person submitting this form.</p>
        <label>Citation information (optional)<textarea name="citation" value={citation} maxLength={4000} rows={3}
          placeholder="Paper or software citation, DOI, URL, or BibTeX" onChange={(event) => setCitation(event.target.value)} /></label>
        <p>Submitting as @{submitter.login}. Authors and maintainers are recorded separately.</p>
        <CreditFields label="Maintainers" credits={maintainers} onChange={(value) => { requestId.current = null; setMaintainers(value); }} />
      </fieldset>
      <div className="community-form-footer">
        <button className="community-primary" type="submit" disabled={pending || Boolean(unavailableMessage)}>Submit registration</button>
        {error && <p className="community-error" role="alert">{error}</p>}
        {pending && <p role="status">Submitting your registration…</p>}
      </div>
    </form>
  );
}

function seedCredits(item: RegistryItemV2 | undefined, field: "authors" | "maintainers") {
  const origin = item?.versions.find((version) => version.type === "origin");
  const values = origin?.[field] ?? [];
  return values.length ? values.map(withEmptyCreditFields) : [emptyCredit];
}

"use client";

import Link from "next/link";
import { toolMaintainers } from "@/lib/community/tool-maintenance";
import { registryRequestType } from "@/lib/community/tool-types";
import { useRef, useState, type FormEvent } from "react";
import { registryTypes, registryTypeDescriptions, type RegistryDraftV2, type RegistryItemV2, type RegistrySubmissionV2, type RegistryType } from "@/lib/community/registry-v2";
import type { Contributor } from "@/lib/community/types";
import { communityRequest } from "../../client";
import RegistryMetadataFields, { readRegistryMetadata, changedRegistryMetadata } from "../RegistryMetadataFields";
import RegistryCredits from "../../RegistryCredits";
import CreditFields, { emptyCredit, parseCredit, withEmptyCreditFields, type CreditInput } from "../CreditFields";
import UpdateVerificationFields from "./UpdateVerificationFields";

const domains = ["transcriptomics", "epigenomics", "genomics", "proteomics", "metagenomics", "multi-omics", "imaging"];
export default function RegistryFormV2({ items, submitter, initialId, unavailableMessage, updateAuthorsAvailable }: {
  items: RegistryItemV2[]; submitter: Contributor; initialId?: string; unavailableMessage?: string; updateAuthorsAvailable: boolean;
}) {
  const initial = items.find((item) => item.id === initialId);
  const [type, setType] = useState<RegistryType>(initial ? "update" : "original");
  const [pipelineId, setPipelineId] = useState(initial?.id ?? "");
  const [authorNames, setAuthorNames] = useState("");
  const [updateAuthorNames, setUpdateAuthorNames] = useState("");
  const [citation, setCitation] = useState("");
  const [updateCitation, setUpdateCitation] = useState("");
  const [parentVersionId, setParentVersionId] = useState("");
  const [maintainers, setMaintainers] = useState<CreditInput[]>(() => seedCredits(initial, "maintainers"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegistrySubmissionV2 | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef<string | null>(null);
  const origin = type === "original";
  const selected = origin ? undefined : items.find((item) => item.id === pipelineId);
  const parents = selected?.versions.filter((version) => !version.withdrawn) ?? [];
  const upstream = parents.find((version) => version.id === parentVersionId);
  const blockedMessage = unavailableMessage || (!origin && !updateAuthorsAvailable
    ? "Update submissions are temporarily unavailable. Please try again later." : undefined);
  const names = (value: string) => value.split(/[;；]/).map(name => name.trim()).filter(Boolean).map(name => ({ name }));

  function select(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    setPipelineId(id);
    setParentVersionId("");
    setMaintainers(seedCredits(item, "maintainers"));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || blockedMessage) return;
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "");
    const body: RegistryDraftV2 = {
      requestId: requestId.current ?? (requestId.current = crypto.randomUUID()),
      type, name: selected?.name ?? value("name"), description: selected?.description ?? value("description"),
      domain: selected?.domain ?? value("domain"), repository: value("repository"), label: value("label"),
      commit: value("commit"),
      ...(selected ? changedRegistryMetadata(readRegistryMetadata(form), selected) : readRegistryMetadata(form)),
      authors: origin ? names(authorNames) : [],
      ...(origin ? {} : { updateAuthors: names(updateAuthorNames) }),
      maintainers: origin ? maintainers.map(parseCredit) : [],
      ...((origin ? citation : updateCitation).trim() ? { citation: (origin ? citation : updateCitation).trim() } : {}),
      ...(origin ? {} : { pipelineId, parentVersionId: value("parentVersionId"), changeSummary: value("changeSummary"),
        updateSource: value("updateSource") as RegistryDraftV2["updateSource"],
        verificationKind: value("verificationKind") as RegistryDraftV2["verificationKind"],
        ...(value("evidenceUrl").trim() ? { evidenceUrl: value("evidenceUrl").trim() } : {}) })
    };
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const response = await communityRequest<{ submission: RegistrySubmissionV2 }>(
        "registry/submissions", "POST", { ...body, type: registryRequestType(body.type) }, "v2");
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
      {blockedMessage && <p className="community-notice" role="status">{blockedMessage}</p>}
      <fieldset disabled={pending || Boolean(unavailableMessage)}>
        <legend>Registry details</legend>
        <div className="community-form-grid">
          <label>Type<select name="type" value={type} aria-describedby="registration-type-help" onChange={(event) => {
            const next = event.target.value as RegistryType;
            if ((next === "original") !== origin) select(next === "original" ? "" : initial?.id ?? "");
            setType(next);
          }}>
            {Object.entries(registryTypes).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
          </select></label>
          <p id="registration-type-help" className="community-field-wide">{registryTypeDescriptions[type]}</p>
          {origin ? <>
            <label>Tool name<input name="name" required maxLength={120} /></label>
            <label>Domain<select name="domain" required defaultValue="">
              <option value="">Choose a domain</option>
              {domains.map((domain) => <option value={domain} key={domain}>{domain}</option>)}
            </select></label>
            <label className="community-field-wide">Description<textarea name="description" required maxLength={2000} rows={4} /></label>
          </> : <>
            <label>Existing tool<select required value={pipelineId} onChange={(event) => select(event.target.value)}>
              <option value="">Choose a tool</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select></label>
            <label>Based on version<select name="parentVersionId" key={pipelineId} required value={parentVersionId} onChange={(event) => {
              setParentVersionId(event.target.value);
              const parent = parents.find((version) => version.id === event.target.value);
              if (parent && selected) setMaintainers(toolMaintainers(selected).map(withEmptyCreditFields));
            }}>
              <option value="">Choose a version</option>
              {parents.map((version) => <option key={version.id} value={version.id}>{version.label}</option>)}
            </select></label>
            <label className="community-field-wide">Change summary<textarea name="changeSummary" required maxLength={2000} rows={4} /></label>
            <UpdateVerificationFields key={pipelineId + ":" + parentVersionId} upstreamRepository={upstream?.repo} />
          </>}
          {origin && <label>Public GitHub repository<input key="original-repository" name="repository" type="url" required maxLength={160} placeholder="https://github.com/owner/repository" /></label>}
          <label>Version label<input name="label" required maxLength={120} placeholder="v1.0.0" /></label>
          <label>Full commit SHA<input name="commit" required maxLength={40} pattern="[0-9a-fA-F]{40}" spellCheck={false} /></label>
        </div>
        <RegistryMetadataFields key={origin ? "original" : pipelineId} metadata={selected} />
        {!origin && selected && !upstream && <p className="community-notice">Choose a based-on version to see upstream attribution.</p>}
        {!origin && upstream && <section className="community-notice community-upstream-credits" aria-label="Upstream attribution">
          <h3>Upstream attribution</h3>
          <p>Credits from the based-on version are preserved separately from this update's authors.</p>
          <dl className="community-detail-grid"><div><dt>Upstream authors</dt><dd>
            {(upstream.updateAuthors?.length || upstream.authors.length) ? <RegistryCredits credits={upstream.updateAuthors?.length ? upstream.updateAuthors : upstream.authors} /> : "Not recorded"}
          </dd></div></dl>
          {upstream?.citation && <div><h4>Upstream citation</h4><p className="community-citation">{upstream.citation}</p></div>}
        </section>}
        <label>{origin ? "Author names" : "Update author names"}<input name={origin ? "authorNames" : "updateAuthorNames"}
          required value={origin ? authorNames : updateAuthorNames} maxLength={2600}
          placeholder="Jane Smith; John Doe" aria-describedby="author-names-help"
          onChange={(event) => origin ? setAuthorNames(event.target.value) : setUpdateAuthorNames(event.target.value)} /></label>
        <p id="author-names-help">{origin
          ? "Separate names with a semicolon (;). List the original authors, who may be different from the person submitting this form."
          : "Separate names with a semicolon (;). List the people who developed this update. Submitting it does not make you an author."}</p>
        <label>{origin ? "Citation information (optional)" : "Update citation (optional)"}<textarea name="citation"
          value={origin ? citation : updateCitation} maxLength={4000} rows={3}
          placeholder={origin ? "Paper or software citation, DOI, URL, or BibTeX" : "Citation for this update, if one exists; otherwise leave blank"}
          onChange={(event) => origin ? setCitation(event.target.value) : setUpdateCitation(event.target.value)} /></label>
        <p>Submitting as @{submitter.login}. Authors and maintainers are recorded separately.</p>
        {origin && <p>These maintainer credits belong to the whole Tool. Management access is assigned separately by an administrator.</p>}
        {origin ? <CreditFields label="Maintainers" credits={maintainers} onChange={(value) => { requestId.current = null; setMaintainers(value); }} /> : <p>Maintainers belong to the Tool. Submitting an update does not change its maintainers or grant management access.</p>}
      </fieldset>
      <div className="community-form-footer">
        <button className="community-primary" type="submit" disabled={pending || Boolean(blockedMessage)}>Submit registration</button>
        {error && <p className="community-error" role="alert">{error}</p>}
        {pending && <p role="status">Submitting your registration…</p>}
      </div>
    </form>
  );
}

function seedCredits(item: RegistryItemV2 | undefined, field: "authors" | "maintainers") {
  const origin = item?.versions.find((version) => version.type === "original");
  const values = item && field === "maintainers" ? toolMaintainers(item) : origin?.[field] ?? [];
  return values.length ? values.map(withEmptyCreditFields) : [emptyCredit];
}

"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Contribution } from "@/lib/community/types";
import { contributionTypes, subjectKinds } from "@/lib/community/types";
import { contributionSummary } from "@/lib/community/form-copy";
import ItemTypeHelp from "./ItemTypeHelp";
import { communityRequest } from "../client";

type CatalogOption = { id: string; name: string; kind?: "workflow" | "tool"; projectUrl: string };

export default function ContributionForm({ catalog, selected }: { catalog: CatalogOption[]; selected?: CatalogOption }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ item: Contribution; reused: boolean } | null>(null);
  const [name, setName] = useState(selected?.name ?? "");
  const [kind, setKind] = useState<keyof typeof subjectKinds>(selected?.kind === "tool" ? "tool" : "pipeline");
  const [type, setType] = useState<keyof typeof contributionTypes>("new_pipeline");
  const summaryCopy = contributionSummary(type);
  const [projectUrl, setProjectUrl] = useState(selected?.projectUrl ?? "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      setResult(await communityRequest("contributions", "POST", data));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not publish your contribution.");
    } finally {
      setPending(false);
    }
  }

  if (result) return (
    <section className="community-notice community-success" role="status">
      <h2>{result.reused ? "Contribution already recorded" : "Contribution published"}</h2>
      <p>{result.item.subjectName} is in your history. You can add impact evidence there as it becomes available.</p>
      <div className="community-actions">
        <Link href="/community/mine" className="community-primary">View my history</Link>
        <button type="button" className="community-secondary" onClick={() => setResult(null)}>Log another contribution</button>
      </div>
    </section>
  );

  return (
    <form className="community-form" method="post" onSubmit={submit}>
      <fieldset disabled={pending}>
        <legend>What did you contribute?</legend>
        <div className="community-form-grid">
          <label>Contribution type
            <select required name="type" value={type} onChange={(event) => setType(event.target.value as keyof typeof contributionTypes)}>
              {Object.entries(contributionTypes).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>Date of contribution<input name="occurredOn" required type="date" /></label>
          {catalog.length > 0 && (
            <label className="community-field-wide">Related registry entry <span>(optional)</span>
              <select name="catalogId" defaultValue={selected?.id ?? ""} onChange={(event) => {
                const entry = catalog.find((item) => item.id === event.target.value);
                if (entry) {
                  setName(entry.name);
                  setKind(entry.kind === "tool" ? "tool" : "pipeline");
                  setProjectUrl(entry.projectUrl);
                }
              }}>
                <option value="">No registry entry</option>
                {catalog.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </label>
          )}
          <div className="community-item-type-field">
            <div className="community-item-type-label"><label htmlFor="subject-kind">Item type</label><ItemTypeHelp /></div>
            <select id="subject-kind" name="subjectKind" value={kind} onChange={(event) => setKind(event.target.value as keyof typeof subjectKinds)} required>
              {Object.entries(subjectKinds).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </div>
          <label>Item name<input name="subjectName" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></label>
          <label className="community-field-wide">{summaryCopy.label}
            <textarea name="summary" rows={4} maxLength={2000} required placeholder={summaryCopy.placeholder} />
          </label>
        </div>
      </fieldset>
      <fieldset disabled={pending}>
        <legend>Link to your work</legend>
        <div className="community-form-grid">
          <label>Project URL<input name="projectUrl" type="url" value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} maxLength={2048} placeholder="https://github.com/org/project" required /></label>
          <label>Evidence URL<input name="evidenceUrl" type="url" maxLength={2048} placeholder="https://github.com/org/project/pull/123" required /></label>
        </div>
        <p>Link to a public pull request, commit, release, or paper. BioCode Commons and external projects follow the same rules.</p>
      </fieldset>
      <div className="community-form-footer">
        <p>Your Community username, description, and links will be visible in the public contribution feed.</p>
        {error && <p className="community-error" role="alert">{error}</p>}
        <button type="submit" className="community-primary" disabled={pending}>{pending ? "Publishing…" : "Publish contribution"}</button>
      </div>
    </form>
  );
}

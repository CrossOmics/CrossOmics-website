"use client";

import type { RegistryCredit } from "@/lib/community/registry-v2";

export const emptyCredit = { name: "", github: "", orcid: "", url: "" };
export type CreditInput = typeof emptyCredit;

export function parseCredit({ name, github, orcid, url }: CreditInput): RegistryCredit {
  const handle = github.trim().replace(/^@/, "");
  return { name, ...(handle ? { github: handle } : {}), ...(orcid.trim() ? { orcid: orcid.trim() } : {}),
    ...(url.trim() ? { url: url.trim() } : {}) };
}

export default function CreditFields({ label, credits, onChange }: {
  label: string; credits: CreditInput[]; onChange: (value: CreditInput[]) => void;
}) {
  function update(index: number, field: keyof CreditInput, value: string) {
    onChange(credits.map((item, position) => position === index ? { ...item, [field]: value } : item));
  }

  return (
    <fieldset>
      <legend>{label}</legend>
      {credits.map((credit, index) => (
        <div key={index} className="community-form-grid community-credit-row">
          <label>Name<input required value={credit.name} maxLength={120}
            onChange={(event) => update(index, "name", event.target.value)} /></label>
          <label>GitHub handle <input value={credit.github} maxLength={40} placeholder="@github-handle"
            onChange={(event) => update(index, "github", event.target.value)} /></label>
          <label>ORCID <input value={credit.orcid} maxLength={19} placeholder="0000-0000-0000-0000"
            onChange={(event) => update(index, "orcid", event.target.value)} /></label>
          <label>Public profile URL <input type="url" value={credit.url} maxLength={400}
            onChange={(event) => update(index, "url", event.target.value)} /></label>
          {credits.length > 1 && <button className="community-secondary" type="button" onClick={() =>
            onChange(credits.filter((_, position) => position !== index))}>Remove entry {index + 1}</button>}
        </div>
      ))}
      {credits.length < 20 && <button className="community-secondary" type="button" onClick={() =>
        onChange([...credits, emptyCredit])}>Add another</button>}
    </fieldset>
  );
}

export function withEmptyCreditFields(credit: RegistryCredit): CreditInput {
  return { ...emptyCredit, ...credit };
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RegistryCredit } from "@/lib/community/registry-v2";
import { communityRequest } from "../../client";
import CreditFields, { emptyCredit, parseCredit, withEmptyCreditFields } from "../../registry/CreditFields";

export default function CorrectVersionCredits({ pipelineId, versionId, existingAuthors, existingMaintainers }: {
  pipelineId: string;
  versionId: string;
  existingAuthors: RegistryCredit[];
  existingMaintainers: RegistryCredit[];
}) {
  const router = useRouter();
  const [authors, setAuthors] = useState(() => existingAuthors.length ? existingAuthors.map(withEmptyCreditFields) : [emptyCredit]);
  const [maintainers, setMaintainers] = useState(() => existingMaintainers.length ? existingMaintainers.map(withEmptyCreditFields) : [emptyCredit]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean }>();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const reason = String(new FormData(form).get("reason") ?? "");
    setPending(true);
    setMessage(undefined);
    try {
      await communityRequest(
        "catalog/" + encodeURIComponent(pipelineId) + "/versions/" + encodeURIComponent(versionId) + "/credits",
        "POST", { authors: authors.map(parseCredit), maintainers: maintainers.map(parseCredit), reason }, "v2"
      );
      form.reset();
      setMessage({ text: "Credits updated.", error: false });
      router.refresh();
    } catch (failure) {
      setMessage({ text: failure instanceof Error ? failure.message : "Could not save credits.", error: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="community-app-access">
      <summary>Correct imported credits</summary>
      <form onSubmit={save} className="community-form" aria-busy={pending}>
        <fieldset disabled={pending}>
          <CreditFields label="Original authors" credits={authors} onChange={setAuthors} />
          <CreditFields label="Maintainers" credits={maintainers} onChange={setMaintainers} />
          <label>Source and reason for correction<textarea name="reason" required maxLength={1000} rows={3} /></label>
        </fieldset>
        <div className="community-actions">
          <button className="community-secondary" type="submit" disabled={pending}>Save credits</button>
        </div>
      </form>
      {message && <p role={message.error ? "alert" : "status"} className={message.error ? "community-error" : undefined}>{message.text}</p>}
    </details>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RegistryMetadata } from "@/lib/community/registry-v2";
import RegistryMetadataFields, { readRegistryMetadata } from "../../registry/RegistryMetadataFields";
import { communityRequest } from "../../client";

export default function EditProjectMetadata({ pipelineId, metadata }: { pipelineId: string; metadata: RegistryMetadata }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean }>();
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setMessage(undefined);
    try {
      await communityRequest("catalog/" + encodeURIComponent(pipelineId) + "/metadata", "POST",
        { ...readRegistryMetadata(form), reason: String(form.get("reason") ?? "") }, "v2");
      setMessage({ text: "Project metadata saved.", error: false });
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Could not save project metadata.", error: true });
    } finally { setPending(false); }
  }
  return <details className="community-app-access">
    <summary>Edit project metadata</summary>
    <form className="community-form" onSubmit={save} aria-busy={pending}>
      <fieldset disabled={pending}>
        <RegistryMetadataFields metadata={metadata} />
        <p>Saving replaces these four project fields. Clear a field to hide it on the public page. Versions and credits stay unchanged.</p>
        <label>Source and reason for correction<textarea name="reason" required maxLength={1000} rows={3} /></label>
      </fieldset>
      <button type="submit" className="community-primary" disabled={pending}>Save project metadata</button>
      {message && <p role={message.error ? "alert" : "status"} className={message.error ? "community-error" : undefined}>{message.text}</p>}
    </form>
  </details>;
}

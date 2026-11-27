"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { communityRequest } from "../client";
import type { MyPublicProfile } from "@/lib/community/service";

export default function PublicName({ profile }: { profile: MyPublicProfile | null }) {
  const [name, setName] = useState(profile?.displayName ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const helpId = useId();
  const router = useRouter();
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(""); setStatus("");
    const value = name.trim();
    if ([...value].length > 120 || /[\p{Cc}\p{Bidi_Control}]/u.test(value)) {
      setError("Use up to 120 characters without control characters."); return;
    }
    setBusy(true);
    try {
      const result = await communityRequest<MyPublicProfile>("me/profile", "PATCH", { displayName: value || null }, "v2");
      setName(result.displayName ?? "");
      setStatus("Public name saved.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your public name could not be saved. Try again.");
    } finally { setBusy(false); }
  }
  return <section className="community-public-name" aria-label="Public profile settings">
    <h2>Your public profile</h2>
    {profile ? <>
      <p>Help people find your contributions by name. Your name becomes searchable when you have public activity; setting it does not publish drafts or change author credits.</p>
      <form onSubmit={save}>
        <label>Public display name<input name="displayName" value={name} maxLength={240} autoComplete="name" disabled={busy}
          aria-describedby={helpId} onChange={event => setName(event.target.value)} placeholder={profile.contributor.name} /></label>
        <p id={helpId}>Up to 120 characters. Leave blank to use your existing account or credited name.</p>
        <div className="community-actions"><button className="community-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save public name"}</button><span role="status">{status}</span></div>
        {error && <p role="alert">{error}</p>}
      </form>
    </> : <p>Public name settings are temporarily unavailable. Your other account pages remain available.</p>}
  </section>;
}

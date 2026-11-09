"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { impactMetrics } from "@/community-server/lib/community/types";
import { communityRequest } from "../client";

export default function ImpactForm({ contributionId }: { contributionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await communityRequest(`contributions/${contributionId}/impact`, "PUT", {
        metric: data.get("metric"),
        value: Number(data.get("value")),
        evidenceUrl: data.get("evidenceUrl")
      });
      form.reset();
      setStatus("Impact evidence saved.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save impact evidence.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="community-impact-form">
      <summary>Add or update impact evidence</summary>
      <form method="post" onSubmit={submit}>
        <fieldset disabled={pending}>
          <legend className="community-visually-hidden">Impact evidence</legend>
          <p>Enter 0 for a metric you checked and found no activity. Leave metrics you cannot check unrecorded.</p>
          <div className="community-form-grid">
            <label>Metric<select name="metric" required>{Object.entries(impactMetrics).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Count<input name="value" type="number" step="1" min="0" max="2147483647" required /></label>
            <label className="community-field-wide">Evidence URL<input name="evidenceUrl" type="url" maxLength={2048} required /></label>
          </div>
          {error && <p role="alert" className="community-error">{error}</p>}
          {status && <p role="status">{status}</p>}
          <button className="community-secondary" type="submit">{pending ? "Saving…" : "Save impact evidence"}</button>
        </fieldset>
      </form>
    </details>
  );
}

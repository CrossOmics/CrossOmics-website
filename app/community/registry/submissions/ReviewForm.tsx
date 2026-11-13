"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { communityRequest } from "../../client";

export default function ReviewForm({ id }: { id: string }) {
  const router = useRouter();
  const [decision, setDecision] = useState<"published" | "rejected">("published");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    setPending(true);
    setError("");
    try {
      await communityRequest("registry/submissions/" + id + "/review", "POST", {
        decision, ...(reason ? { reason } : {})
      }, "v2");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not review the submission.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="community-form" onSubmit={review} aria-busy={pending}>
      <fieldset disabled={pending} className="community-form-grid">
        <legend>Review this submission</legend>
        <label>Decision<select value={decision} onChange={(event) => setDecision(event.target.value as typeof decision)}>
          <option value="published">Publish</option>
          <option value="rejected">Reject</option>
        </select></label>
        <label>Reason<input name="reason" required={decision === "rejected"} maxLength={1000} /></label>
        <div className="community-actions"><button className="community-primary" type="submit">
          {decision === "published" ? "Publish registration" : "Reject registration"}
        </button></div>
      </fieldset>
      {error && <p role="alert" className="community-error">{error}</p>}
    </form>
  );
}

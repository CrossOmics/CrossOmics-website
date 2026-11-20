"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { communityRequest } from "../../client";

export default function WithdrawVersion({ pipelineId, versionId }: { pipelineId: string; versionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function withdraw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    if (pending || !reason) return;
    setPending(true);
    setError("");
    try {
      await communityRequest(
        "catalog/" + encodeURIComponent(pipelineId) + "/versions/" + encodeURIComponent(versionId) + "/withdraw",
        "POST", { reason }, "v2"
      );
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not withdraw this version.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="community-app-access">
      <summary>Withdraw this version</summary>
      <form onSubmit={withdraw} className="community-form" aria-busy={pending}>
        <label>Reason for withdrawal<input name="reason" required maxLength={1000} disabled={pending} /></label>
        <div className="community-actions"><button className="community-secondary" type="submit" disabled={pending}>Confirm withdrawal</button></div>
      </form>
      {error && <p role="alert" className="community-error">{error}</p>}
    </details>
  );
}

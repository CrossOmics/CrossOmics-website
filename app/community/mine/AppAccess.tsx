"use client";

import { useState } from "react";
import { communityRequest } from "../client";

export default function AppAccess({ serviceUrl, desktopAuth }: { serviceUrl?: string; desktopAuth?: boolean }) {
  const [credential, setCredential] = useState<{ token: string; expiresAt: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function change(method: "POST" | "DELETE" | "REVOKE_DESKTOP") {
    setError("");
    setStatus("");
    setPending(true);
    try {
      if (method === "POST") {
        setCredential(await communityRequest("app-token", method));
      } else if (method === "REVOKE_DESKTOP") {
        const { revoked } = await communityRequest<{ revoked: number }>("desktop-auth/sessions", "DELETE");
        setStatus(revoked ? "Gardener desktop sessions revoked." : "There are no active desktop sessions.");
      } else {
        await communityRequest("app-token", method);
        setCredential(null);
        setStatus("Gardener access revoked.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not change Gardener access.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="community-app-access">
      <summary>Manage Gardener access</summary>
      {desktopAuth && <p>Sign in with GitHub in Gardener to connect a desktop session.</p>}
      <p>{desktopAuth ? "Older Gardener clients can use an access token. Each token expires after 90 days." :
        "In Gardener, open Community → Contributions and connect with this access token. A new token replaces the previous one and expires after 90 days."}</p>
      {serviceUrl && <label>Community server address<input value={serviceUrl} readOnly onFocus={(event) => event.target.select()} /></label>}
      <div className="community-actions">
        <button type="button" className="community-secondary" disabled={pending} onClick={() => change("POST")}>Generate access token</button>
        <button type="button" className="community-secondary" disabled={pending} onClick={() => change("DELETE")}>Revoke access token</button>
        {desktopAuth && <button type="button" className="community-secondary" disabled={pending}
          onClick={() => change("REVOKE_DESKTOP")}>Revoke desktop sessions</button>}
      </div>
      {credential && <label>Access token<input value={credential.token} readOnly onFocus={(event) => event.target.select()} />
        <span>Copy this token now. It expires {credential.expiresAt.slice(0, 10)}.</span>
      </label>}
      {status && <p role="status">{status}</p>}
      {error && <p role="alert" className="community-error">{error}</p>}
    </details>
  );
}

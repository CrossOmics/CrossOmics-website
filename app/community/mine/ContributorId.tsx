"use client";

import { useState } from "react";

export default function ContributorId({ id }: { id: string }) {
  const [status, setStatus] = useState("");

  async function copyId() {
    try {
      await navigator.clipboard.writeText(id);
      setStatus("Contributor ID copied.");
    } catch {
      setStatus("Select the Contributor ID to copy it manually.");
    }
  }

  return (
    <div className="community-actions community-contributor-id">
      <dl>
        <dt>Contributor ID</dt>
        <dd><code>{id}</code></dd>
      </dl>
      <button type="button" className="community-secondary" onClick={copyId} aria-label="Copy contributor ID">Copy ID</button>
      <span role="status">{status}</span>
    </div>
  );
}

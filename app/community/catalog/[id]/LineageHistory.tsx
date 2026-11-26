"use client";

import { useState, type ReactNode } from "react";

export default function LineageHistory({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <details className="community-update-details community-lineage-history" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Complete version history</summary>
    {open && children}
  </details>;
}

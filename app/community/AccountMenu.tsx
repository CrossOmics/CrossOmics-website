"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountLinks, type AccountCapabilities } from "@/lib/community/account-links";

export default function AccountMenu({ name, ...capabilities }: { name: string } & AccountCapabilities) {
  const details = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => { if (details.current) details.current.open = false; }, [pathname]);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (details.current && event.target instanceof window.Node && !details.current.contains(event.target)) details.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  return <details ref={details} className="community-account-menu" onKeyDown={event => {
    if (event.key === "Escape" && details.current?.open) {
      event.preventDefault(); details.current.open = false; details.current.querySelector("summary")?.focus();
    }
  }}>
    <summary aria-label="Account menu"><span className="community-account-avatar" aria-hidden>{([...name][0] ?? "").toUpperCase()}</span><span>{name}</span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></summary>
    <div className="community-account-dropdown"><p>Signed in as <strong>{name}</strong></p>
      <nav aria-label="Account shortcuts" onClick={event => {
        if (event.target instanceof window.Element && event.target.closest("a") && details.current) details.current.open = false;
      }}>{accountLinks(capabilities).map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
      <form method="post" action="/api/community/auth/logout"><button type="submit">Sign out</button></form>
    </div>
  </details>;
}

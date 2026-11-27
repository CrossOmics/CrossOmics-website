"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { accountLinks, type AccountCapabilities } from "@/lib/community/account-links";

export default function AccountSidebar(capabilities: AccountCapabilities) {
  const pathname = usePathname(), query = useSearchParams();
  const current = pathname === "/community/registry/submissions" && query.get("all") === "1" ? pathname + "?all=1" : pathname;
  const links = accountLinks(capabilities);
  const selected = links.find(link => link.href === current)?.label ?? "Account pages";
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (disclosure.current) disclosure.current.open = false; }, [current]);
  const sections = ["Work", "Account", "Administration"];
  function navigation(label: string) {
    return <nav aria-label={label}>{sections.map(section => {
      const entries = links.filter(link => link.section === section);
      return entries.length ? <div className="community-account-nav-group" key={section}><h2>{section}</h2>
        {entries.map(link => <Link key={link.href} href={link.href} aria-current={current === link.href ? "page" : undefined}>{link.label}</Link>)}
      </div> : null;
    })}</nav>;
  }
  return <aside className="community-account-sidebar">
    <div className="community-account-desktop-nav">{navigation("Account navigation")}</div>
    <details className="community-account-mobile-nav" ref={disclosure} onKeyDown={event => {
      if (event.key === "Escape" && disclosure.current?.open) {
        disclosure.current.open = false; disclosure.current.querySelector("summary")?.focus();
      }
    }}>
      <summary><span>{selected}</span><span className="community-account-nav-toggle">Account pages <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span></summary>
      {navigation("Account pages")}
    </details>
  </aside>;
}

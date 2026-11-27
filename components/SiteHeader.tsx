"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SiteHeader({ compact = false, controls }: { compact?: boolean; controls?: ReactNode }) {
  const path = usePathname();
  const links = [{href:"/",label:"Home"},{href:"/community/overview",label:"Community"},{href:"/community/ranking",label:"Tools Tracking"},{href:"/community/about",label:"Who We Are"},{href:"/community/guide",label:"User Guide"}];
  return <header className={`site-header${compact ? " site-header-account" : ""}`}><div className="site-header-inner container">
    <Link href="/" className="site-logo" aria-label="CrossOmics home">
      <svg className="site-logo-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M7 9L18 18L29 9M7 27L18 18L29 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><circle cx="7" cy="9" r="4" fill="currentColor"/><circle cx="7" cy="27" r="4" fill="currentColor"/><circle cx="29" cy="9" r="4" fill="currentColor"/><circle cx="29" cy="27" r="4" fill="currentColor"/><circle cx="18" cy="18" r="4" fill="#218969"/></svg>
      CrossOmics
    </Link>
    {compact ? <Link className="site-account-community" href="/"><span aria-hidden>←</span> Community</Link> :
      <nav className="site-primary-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} aria-current={path === link.href ? "page" : undefined} href={link.href}>{link.label}</Link>)}</nav>}
    {controls && <div className="site-account-controls">{controls}</div>}
  </div></header>;
}

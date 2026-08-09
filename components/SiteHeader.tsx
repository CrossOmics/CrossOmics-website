"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, GITHUB_URL } from "@/lib/nav";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link href="/" className="site-logo">CrossOmics</Link>

        <nav className="site-nav" aria-label="Main">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <a
          className="pill-btn site-header-cta"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}

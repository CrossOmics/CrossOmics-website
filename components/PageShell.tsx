import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/research", label: "Research" },
  { href: "/approach", label: "Approach" },
  { href: "/roadmap", label: "Roadmap" }
];

type Crumb = { label: string; href?: string };

export default function PageShell({
  title,
  subtitle,
  breadcrumb,
  backgroundImage,
  children
}: {
  title: string;
  subtitle?: string;
  /** A single label, or a trail of ancestors ending with the current page. */
  breadcrumb?: string | Crumb[];
  backgroundImage?: string;
  children: ReactNode;
}) {
  const crumbs: Crumb[] = typeof breadcrumb === "string" ? [{ label: breadcrumb }] : breadcrumb ?? [];
  return (
    <div className="page">
      <div
        className="page-bg-painting"
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        aria-hidden
      />

      <header className="page-header">
        <Link href="/" className="logo">
          <span className="logo-word">CrossOmics</span>
        </Link>
        <nav className="page-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="page-header-right">
          <a href="https://github.com/CrossOmics/Gardener-Agent" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </header>

      <main className="page-main">
        <Reveal className="page-title-block" hover={false}>
          {crumbs.length > 0 && (
            <div className="breadcrumb">
              <Link href="/">TOP</Link>
              {crumbs.map((c) => (
                <span key={c.label} className="breadcrumb-crumb">
                  <span>›</span>{" "}
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </div>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </Reveal>
        {children}
      </main>

      <footer className="page-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="logo-word">CrossOmics</span>
          </div>
          <nav className="footer-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <p className="footer-copy">© {new Date().getFullYear()} CrossOmics, Inc.</p>
        </div>
      </footer>
    </div>
  );
}

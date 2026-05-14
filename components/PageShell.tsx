import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/tutorial", label: "Tutorial" },
  { href: "/research", label: "Research" },
  { href: "/value", label: "Value" },
  { href: "/future", label: "Future" }
];

export default function PageShell({
  title,
  subtitle,
  breadcrumb,
  children
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <div className="page-bg-painting" aria-hidden />

      <header className="page-header">
        <Link href="/" className="logo">
          <span className="logo-mark">C&amp;O</span>
          <span className="logo-word">CROSS OMICS</span>
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
          <div className="burger" aria-label="menu"><span /><span /></div>
        </div>
      </header>

      <main className="page-main">
        <div className="page-title-block">
          {breadcrumb && (
            <div className="breadcrumb">
              <Link href="/">TOP</Link> <span>›</span> <span>{breadcrumb}</span>
            </div>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {children}
      </main>

      <footer className="page-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="logo-mark">C&amp;O</span>
            <span className="logo-word">CROSS OMICS</span>
          </div>
          <nav className="footer-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <p className="footer-copy">© {new Date().getFullYear()} Cross Omics, Inc.</p>
        </div>
      </footer>
    </div>
  );
}

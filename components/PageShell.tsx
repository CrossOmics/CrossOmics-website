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

export default function PageShell({
  title,
  subtitle,
  breadcrumb,
  backgroundImage,
  children
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  backgroundImage?: string;
  children: ReactNode;
}) {
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
          {breadcrumb && (
            <div className="breadcrumb">
              <Link href="/">TOP</Link> <span>›</span> <span>{breadcrumb}</span>
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

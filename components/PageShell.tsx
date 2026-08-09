import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";

type Crumb = { label: string; href?: string };

export default function PageShell({
  title,
  subtitle,
  breadcrumb,
  children
}: {
  title: string;
  subtitle?: string;
  /** A single label, or a trail of ancestors ending with the current page. */
  breadcrumb?: string | Crumb[];
  children: ReactNode;
}) {
  const crumbs: Crumb[] = typeof breadcrumb === "string" ? [{ label: breadcrumb }] : breadcrumb ?? [];

  return (
    <div className="page">
      <SiteHeader />

      <main className="page-main container">
        <Reveal className="page-title-block" hover={false}>
          {crumbs.length > 0 && (
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              {crumbs.map((c) => (
                <span key={c.label} className="breadcrumb-crumb">
                  <span aria-hidden>/</span>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </nav>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </Reveal>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

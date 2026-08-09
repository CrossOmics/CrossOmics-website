import Link from "next/link";
import { NAV, GITHUB_URL } from "@/lib/nav";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner container">
        <Link href="/" className="site-logo">CrossOmics</Link>

        <nav className="site-footer-nav" aria-label="Footer">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>

        <p className="site-footer-copy">© {new Date().getFullYear()} CrossOmics, Inc.</p>
      </div>
    </footer>
  );
}

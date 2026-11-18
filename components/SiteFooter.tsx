import Link from "next/link";
import { NAV } from "@/lib/nav";
import { gardenerWebsiteUrl } from "@/lib/site-links.mjs";

export default function SiteFooter() {
  const gardener = gardenerWebsiteUrl();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner container">
        <nav className="site-footer-nav" aria-label="Footer">
          {NAV.map((n) => (
            n.external ? <a key={n.href} href={n.href}>{n.label} ↗</a> : <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
          <Link href="/community/activity">Contribution History</Link>
          {gardener && <a href={gardener}>Gardener ↗</a>}
        </nav>

        <p className="site-footer-copy">© {new Date().getFullYear()} CrossOmics, Inc.</p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { GITHUB_URL } from "@/lib/nav";
import { gardenerWebsiteUrl } from "@/lib/site-links.mjs";

export default function SiteHeader() {
  const gardener = gardenerWebsiteUrl();
  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link href="/" className="site-logo">CrossOmics <small>Community</small></Link>
        <nav className="site-nav" aria-label="Main">
          {gardener && <a href={gardener}>Gardener <span aria-hidden>↗</span></a>}
        </nav>
        <a className="pill-btn site-header-cta" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </header>
  );
}

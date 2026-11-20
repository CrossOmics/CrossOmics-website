import Link from "next/link";
import { GITHUB_URL } from "@/lib/nav";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link href="/" className="site-logo">CrossOmics <small>Community</small></Link>
        <a className="pill-btn site-header-cta" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </header>
  );
}

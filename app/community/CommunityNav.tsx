"use client";

import Link from "next/link";
import { NAV } from "@/lib/nav";
import { usePathname } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";


export default function CommunityNav({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  // This allowed OAuth return path redirects to the Community home at /.
  const signInHref = communitySignInPath("/community");
  return (
    <nav className="community-nav" aria-label="Community">
      <div className="community-nav-links">
        {NAV.map(({ href, label, external }) => {
          const active = path === href || (href === "/" ? path.startsWith("/community/catalog/") : href === "/community/submit" ? path.startsWith("/community/registry/") : path.startsWith(`${href}/`));
          if (external) return <a key={href} href={href}>{label} <span aria-hidden>↗</span></a>;
          return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
        })}
      </div>
      <div className="community-nav-actions">
        {signedIn ? (
          <Link href="/community/mine" className="community-secondary" aria-current={path === "/community/mine" ? "page" : undefined}>My history</Link>
        ) : (
          <Link href={signInHref} className="community-secondary">Sign in</Link>
        )}
      </div>
    </nav>
  );
}

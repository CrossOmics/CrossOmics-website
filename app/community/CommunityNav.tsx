"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";

const links = [
  { href: "/", label: "Registry" },
  { href: "/community/bounties", label: "Bounties" },
  { href: "/community/activity", label: "Contributions" }
];

export default function CommunityNav({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  // This allowed OAuth return path redirects to the Community home at /.
  const signInHref = communitySignInPath("/community");
  return (
    <nav className="community-nav" aria-label="Community">
      <div className="community-nav-links">
        {links.map(({ href, label }) => {
          const active = path === href || (href === "/" ? path.startsWith("/community/catalog/") : path.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
        })}
      </div>
      <div className="community-nav-actions">
        {signedIn ? (
          <Link href="/community/mine" className="community-secondary" aria-current={path === "/community/mine" ? "page" : undefined}>My history</Link>
        ) : (
          <Link href={signInHref} className="community-secondary">Sign in</Link>
        )}
        <Link href="/community/submit" className="community-primary" aria-current={path === "/community/submit" ? "page" : undefined}>
          <span aria-hidden>＋</span> Log a contribution
        </Link>
      </div>
    </nav>
  );
}

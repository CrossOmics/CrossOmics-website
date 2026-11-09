"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { communitySignInPath } from "@/community-server/lib/community/return-path";

const links = [
  { href: "/community", label: "Registry" },
  { href: "/community/bounties", label: "Bounties" },
  { href: "/community/activity", label: "Contributions" }
];

export default function CommunityNav({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  const query = useSearchParams();
  const signInPage = path === "/community/sign-in";
  const returnTo = query.size ? `${path}?${query.toString()}` : path;
  return (
    <nav className="community-nav" aria-label="Community">
      <div className="community-nav-links">
        {links.map(({ href, label }) => {
          const active = path === href || (href === "/community" ? path.startsWith("/community/catalog/") : path.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
        })}
      </div>
      <div className="community-nav-actions">
        {signedIn ? (
          <Link href="/community/mine" className="community-secondary" aria-current={path === "/community/mine" ? "page" : undefined}>My history</Link>
        ) : (
          <Link href={signInPage ? returnTo : communitySignInPath(returnTo)} className="community-secondary" aria-current={signInPage ? "page" : undefined}>Sign in</Link>
        )}
        <Link href="/community/submit" className="community-primary" aria-current={path === "/community/submit" ? "page" : undefined}>
          <span aria-hidden>＋</span> Log a contribution
        </Link>
      </div>
    </nav>
  );
}

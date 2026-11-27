"use client";

import Link from "next/link";
import AccountMenu from "./AccountMenu";
import type { AccountCapabilities } from "@/lib/community/account-links";
import { NAV } from "@/lib/nav";
import { usePathname } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";


export default function CommunityNav({ signedIn, accountName = "My account", ...capabilities }: { signedIn: boolean; accountName?: string } & AccountCapabilities) {
  const path = usePathname();
  const signInHref = communitySignInPath("/community/account");
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
          <AccountMenu name={accountName} {...capabilities} />
        ) : (
          <Link href={signInHref} className="community-secondary">Sign in</Link>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { accountLinks, type AccountCapabilities } from "@/lib/community/account-links";

export default function AccountSidebar({ name, ...capabilities }: { name: string } & AccountCapabilities) {
  const pathname = usePathname(), query = useSearchParams();
  const current = pathname === "/community/registry/submissions" && query.get("all") === "1" ? pathname + "?all=1" : pathname;
  return <aside className="community-account-sidebar">
    <Link className="community-account-identity" href="/community/account"><span className="community-account-avatar" aria-hidden>{([...name][0] ?? "").toUpperCase()}</span><span><strong>{name}</strong><small>Your account</small></span></Link>
    <nav aria-label="Account navigation">{accountLinks(capabilities).map(link => <Link key={link.href} href={link.href} aria-current={current === link.href ? "page" : undefined}>{link.label}</Link>)}</nav>
  </aside>;
}

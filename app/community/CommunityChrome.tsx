"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { isAccountArea, type AccountCapabilities } from "@/lib/community/account-links";
import { communitySignInPath } from "@/lib/community/return-path";
import AccountMenu from "./AccountMenu";
import CommunityNav from "./CommunityNav";

type Props = { signedIn: boolean; accountName: string } & AccountCapabilities;

export function CommunityHeader({signedIn,accountName,...capabilities}:Props) {
  const privateArea = isAccountArea(usePathname());
  return <SiteHeader compact={privateArea} controls={privateArea ? signedIn ? <AccountMenu name={accountName} {...capabilities} /> :
    <Link className="community-secondary" href={communitySignInPath("/community/account")}>Sign in</Link> : undefined} />;
}

export function CommunityPageNavigation(props:Props) {
  if (isAccountArea(usePathname())) return null;
  return <>
    <nav className="community-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden>/</span><Link href="/">Community</Link></nav>
    <CommunityNav {...props} />
  </>;
}

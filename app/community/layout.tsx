import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { httpsUrl } from "@/community-server/lib/community/validation";
import { communitySession } from "@/lib/community/service";
import CommunityNav from "./CommunityNav";
import "./community.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Tracking | CrossOmics",
  description: "Explore community pipelines, tools and algorithms, and record the work that keeps them useful."
};

export default async function CommunityLayout({ children }: { children: ReactNode }) {
  const session = await communitySession();
  const discord = httpsUrl(process.env.COMMUNITY_DISCORD_URL);
  const slack = httpsUrl(process.env.COMMUNITY_SLACK_URL);
  const email = process.env.COMMUNITY_CONTACT_EMAIL;
  const mailto = email && /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w.-]+\.[a-z]{2,}$/i.test(email) ? `mailto:${email}` : null;

  return (
    <div className="page">
      <SiteHeader />
      <main className="community-main container">
        <nav className="community-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden>/</span><Link href="/community">Community Tracking</Link></nav>
        <CommunityNav signedIn={Boolean(session?.contributor)} />
        {children}
        {(discord || slack || mailto) && (
          <aside className="community-contacts" aria-label="Contact CrossOmics">
            <h2>Connect with CrossOmics</h2>
            <div>
              {discord && <a href={discord}>Discord <span aria-hidden>↗</span></a>}
              {slack && <a href={slack}>Slack <span aria-hidden>↗</span></a>}
              {mailto && <a href={mailto}>Email the team</a>}
            </div>
          </aside>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

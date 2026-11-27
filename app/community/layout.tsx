import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import { httpsUrl } from "@/lib/community/https-url";
import { accountContext } from "@/lib/community/account";
import { CommunityHeader, CommunityPageNavigation } from "./CommunityChrome";
import "./community.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CrossOmics Community",
  description: "Discover, improve and maintain scientific tools through transparent community contributions."
};

export default async function CommunityLayout({ children }: { children: ReactNode }) {
  const {session,name} = await accountContext();
  const discord = httpsUrl(process.env.COMMUNITY_DISCORD_URL);
  const slack = httpsUrl(process.env.COMMUNITY_SLACK_URL);
  const email = process.env.COMMUNITY_CONTACT_EMAIL;
  const mailto = email && /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w.-]+\.[a-z]{2,}$/i.test(email) ? `mailto:${email}` : null;

  return (
    <div className="page">
      <CommunityHeader signedIn={Boolean(session?.contributor)} accountName={name} canManageRegistry={session?.canManageRegistry} canManageBounties={session?.canManageBounties} />
      <main className="community-main container">
        <CommunityPageNavigation signedIn={Boolean(session?.contributor)} accountName={name} canManageRegistry={session?.canManageRegistry} canManageBounties={session?.canManageBounties} />
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

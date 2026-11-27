import type { ReactNode } from "react";
import { accountContext } from "@/lib/community/account";
import AccountSidebar from "./AccountSidebar";

export default async function AccountFrame({ children }: { children: ReactNode }) {
  const {session,name} = await accountContext();
  if (!session?.contributor) return children;
  return <div className="community-account-frame"><AccountSidebar name={name} canManageRegistry={session.canManageRegistry} canManageBounties={session.canManageBounties} />
    <div className="community-account-content">{children}</div>
  </div>;
}

export function AccountUnavailable() {
  return <p className="community-notice" role="status">Your account is temporarily unavailable. Try refreshing this page.</p>;
}

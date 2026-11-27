export type AccountCapabilities = { canManageRegistry?: boolean; canManageBounties?: boolean };
export function accountLinks(capabilities: AccountCapabilities) {
  return [
    { href: "/community/account", label: "Account home", section: "Work" },
    { href: "/community/mine", label: "My Contributions", section: "Work" },
    { href: "/community/registry/submissions", label: "My Tool Submissions", section: "Work" },
    { href: "/community/account/settings", label: "Profile settings", section: "Account" },
    { href: "/community/account/security", label: "Sign-in & access", section: "Account" },
    ...(capabilities.canManageRegistry ? [
      { href: "/community/admin", label: "Administration", section: "Administration" },
      { href: "/community/registry/submissions?all=1", label: "Review submissions", section: "Administration" }
    ] : []),
    ...(capabilities.canManageBounties ? [{ href: "/community/bounties", label: "Request management", section: "Administration" }] : [])
  ];
}


export function isAccountArea(pathname: string | null) {
  return pathname !== null && (/^\/community\/account(?:\/(?:settings|security))?$/.test(pathname) ||
    ["/community/mine", "/community/admin", "/community/registry/submissions"].includes(pathname));
}

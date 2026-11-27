export type AccountCapabilities = { canManageRegistry?: boolean; canManageBounties?: boolean };
export function accountLinks(capabilities: AccountCapabilities) {
  return [
    { href: "/community/account", label: "Account home" },
    { href: "/community/mine", label: "My Contributions" },
    { href: "/community/registry/submissions", label: "My Tool Submissions" },
    { href: "/community/account/settings", label: "Profile settings" },
    { href: "/community/account/security", label: "Sign-in & access" },
    ...(capabilities.canManageRegistry ? [
      { href: "/community/admin", label: "Administration" },
      { href: "/community/registry/submissions?all=1", label: "Review submissions" }
    ] : []),
    ...(capabilities.canManageBounties ? [{ href: "/community/bounties", label: "Request management" }] : [])
  ];
}

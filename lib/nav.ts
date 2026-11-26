export type NavEntry = { href: string; label: string; external?: boolean };

export const NAV: NavEntry[] = [
  { href: "/", label: "Explore Existing Tools" },
  { href: "/community/bounties", label: "Tools Wanted" },
  { href: "/community/contributors", label: "Contributors" },
  { href: "/community/governance", label: "Public Governance" },
  { href: "/community/submit", label: "Contribute" }
];
export const GITHUB_URL = "https://github.com/CrossOmics/pipeline-registry";

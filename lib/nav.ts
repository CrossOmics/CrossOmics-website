export type NavEntry = { href: string; label: string; external?: boolean };

export const NAV: NavEntry[] = [
  { href: "/community/submit", label: "Submit a Contribution" },
  { href: "/", label: "Explore Existing Tools" },
  { href: "/community/ranking", label: "Maintenance Needed" },
  { href: "/community/bounties", label: "Tools Wanted" }
];

export const GITHUB_URL = "https://github.com/CrossOmics/pipeline-registry";

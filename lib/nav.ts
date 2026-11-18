export type NavEntry = { href: string; label: string; external?: boolean };

export const NAV: NavEntry[] = [
  { href: "/community/submit", label: "Submit a Contribution" },
  { href: "/", label: "Explore Existing Tools" },
  { href: "https://crossomics.github.io/pipeline-registry/ranking/", label: "Maintenance Needed", external: true },
  { href: "/community/bounties", label: "Tools Wanted" }
];

export const GITHUB_URL = "https://github.com/CrossOmics/pipeline-registry";

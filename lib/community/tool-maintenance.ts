import type { RegistryCredit, RegistryItemV2, RegistrySubmissionV2 } from "./registry-v2";
import type { Contribution } from "./types";

export type ToolMaintainer = RegistryCredit & { contributorId?: string };
export type ToolManagement = { item: RegistryItemV2; canAssignMaintainers: boolean; maintainers: ToolMaintainer[] };
export type PersonalSection = "original" | "update" | "maintained";
export type PersonalEntry = { kind: "submission"; submission: RegistrySubmissionV2 }
  | { kind: "contribution"; contribution: Contribution } | { kind: "maintained"; tool: RegistryItemV2 };
export type PersonalContributions = { section: PersonalSection; entries: PersonalEntry[]; page: number; hasMore: boolean; total: number;
  counts: Record<PersonalSection, number> };

export function toolMaintainers(item: RegistryItemV2): RegistryCredit[] {
  if (item.maintainers !== undefined) return item.maintainers;
  return [];
}

export function orderedToolVersions(item: RegistryItemV2) {
  const ids = (item.recommendedVersionIds ?? []).filter(id => item.versions.some(version => version.id === id && !version.withdrawn));
  return [...item.versions].sort((a, b) => {
    const aRank = ids.indexOf(a.id), bRank = ids.indexOf(b.id);
    return (aRank < 0 ? ids.length : aRank) - (bRank < 0 ? ids.length : bRank);
  });
}

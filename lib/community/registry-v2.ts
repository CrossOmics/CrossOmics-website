import type { Contributor, RegistryItem } from "./types";
import { toolTypes, normalizeToolType } from "./tool-types";

export const registryTypes = toolTypes;
export const registryTypeDescriptions = {
  original: "Register a tool that is not in the catalog yet. Describe what it does; no earlier version is needed.",
  update: "Update an existing tool with performance improvements, bug fixes, features, compatibility or maintenance changes. Choose the earlier version you updated."
} as const;
export type RegistryType = keyof typeof registryTypes;
export type RegistryCredit = { name: string; github?: string; orcid?: string; url?: string };
export type RegistryMetadata = { modalities: string[]; algorithms: string[]; inputs: string[]; outputs: string[] };
export type RegistryDraftV2 = Partial<RegistryMetadata> & {
  requestId: string;
  type: RegistryType;
  name: string;
  domain: string;
  description: string;
  repository: string;
  label: string;
  commit: string;
  pipelineId?: string;
  parentVersionId?: string;
  changeSummary?: string;
  evidenceUrl?: string;
  authors: RegistryCredit[];
  maintainers: RegistryCredit[];
  citation?: string;
};
export type RegistryVersionV2 = Omit<RegistryItem["versions"][number], "kind"> & {
  type: RegistryType;
  evidence_url?: string;
  legacyKind?: "original" | "optimization";
  authors: RegistryCredit[];
  maintainers: RegistryCredit[];
  citation?: string;
};
export type RegistryItemV2 = Omit<RegistryItem, "kind" | "versions"> & {
  kind?: RegistryItem["kind"];
  maintainers?: RegistryCredit[];
  recommendedVersionIds?: string[];
  versions: RegistryVersionV2[];
};
export type RegistrySubmissionV2 = Omit<RegistryDraftV2, "requestId"> & {
  id: string;
  status: "submitted" | "published" | "rejected";
  contributor: Contributor;
  createdAt: string;
  reason?: string | null;
  versionId?: string | null;
};


export function normalizeRegistryItem(item: RegistryItemV2): RegistryItemV2 {
  return { ...item, kind: "tool", versions: item.versions.map(version => {
    const type = normalizeToolType(version.type);
    if (!type) throw new Error("Unsupported tool version type.");
    return { ...version, type };
  }) };
}

export function normalizeRegistrySubmission(item: RegistrySubmissionV2): RegistrySubmissionV2 {
  const type = normalizeToolType(item.type);
  if (!type) throw new Error("Unsupported tool submission type.");
  return { ...item, type };
}

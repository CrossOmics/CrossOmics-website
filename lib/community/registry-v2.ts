import type { Contributor, RegistryItem } from "./types";

export const registryTypes = { origin: "New project (first version)", improved: "Performance improvement", update: "Feature or compatibility update", fix: "Bug fix" } as const;
export const registryTypeDescriptions = {
  origin: "Register a project that is not in the catalog yet. Describe what it does; no earlier version is needed.",
  improved: "Make an existing project faster or reduce its memory use. Choose the version you improved.",
  update: "Add a feature or support for a new dependency, format, or platform. Choose the earlier version you updated.",
  fix: "Correct a problem in an existing project. Choose the version with the problem and describe the fix."
} as const;
export type RegistryType = keyof typeof registryTypes;
export type RegistryCredit = { name: string; github?: string; orcid?: string; url?: string };
export type RegistryDraftV2 = {
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

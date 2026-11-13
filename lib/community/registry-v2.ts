import type { Contributor, RegistryItem } from "./types";

export const registryTypes = { origin: "Origin", improved: "Improved", update: "Update", fix: "Fix" } as const;
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
};
export type RegistryVersionV2 = Omit<RegistryItem["versions"][number], "kind"> & {
  type: RegistryType;
  evidence_url?: string;
  legacyKind?: "original" | "optimization";
  authors: RegistryCredit[];
  maintainers: RegistryCredit[];
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

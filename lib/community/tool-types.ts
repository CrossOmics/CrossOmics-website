// Registry versions and contribution records share one public classification.
export const toolTypes = { original: "Original", update: "Update" } as const;
export type ToolType = keyof typeof toolTypes;

export function normalizeToolType(value: unknown): ToolType | null {
  if (typeof value !== "string") return null;
  if (value === "original" || value === "origin" || value === "new_pipeline") return "original";
  if (["update", "improved", "fix", "algorithm_update", "bug_fix", "optimization", "maintenance"].includes(value)) return "update";
  return null;
}

export function toolTypeLabel(value: unknown): string {
  const type = normalizeToolType(value);
  return type ? toolTypes[type] : "Unknown type";
}

// Existing request aliases also work before the backend's taxonomy rollout.
export function registryRequestType(type: ToolType): "origin" | "update" {
  return type === "original" ? "origin" : "update";
}

export function contributionRequestType(type: ToolType): "new_pipeline" | "algorithm_update" {
  return type === "original" ? "new_pipeline" : "algorithm_update";
}

export function isToolKind(kind: unknown): boolean {
  return kind == null || kind === "" || kind === "tool";
}

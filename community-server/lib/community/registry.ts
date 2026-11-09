import type { RegistryItem } from "./types";
import { CommunityError } from "./validation";

export const registryUrl = "https://crossomics.github.io/pipeline-registry/index.json";

type Registry = {
  schema_version: number;
  generated_at: string;
  moved: Record<string, string>;
  pipelines: RegistryItem[];
};

export async function loadRegistry(): Promise<Registry> {
  try {
    const response = await fetch(registryUrl, { next: { revalidate: 900 }, signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error("Registry request failed.");
    const data: Registry = await response.json();
    if (data.schema_version !== 1 || !Array.isArray(data.pipelines) || typeof data.generated_at !== "string" ||
      !data.moved || typeof data.moved !== "object") {
      throw new Error("Registry schema mismatch.");
    }
    return data;
  } catch {
    throw new CommunityError(503, "The pipeline registry is temporarily unavailable.");
  }
}

export function findRegistryItem(registry: Registry, id: string): RegistryItem | undefined {
  return registry.pipelines.find((item) => item.id === id || item.id === registry.moved[id]);
}

export function searchRegistry(registry: Registry, query: string, kind: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return registry.pipelines.flatMap((item) => {
    if (kind && kind !== item.kind) return [];
    const name = item.name.toLowerCase();
    const searchable = [name, item.description, item.domain, ...item.algorithms, ...item.modalities,
      ...item.inputs, ...item.outputs, ...item.keywords].join(" ").toLowerCase();
    if (!terms.every((term) => searchable.includes(term))) return [];
    return [{ item, matches: terms.filter((term) => name.includes(term)).length }];
  }).sort((left, right) => right.matches - left.matches || left.item.name.localeCompare(right.item.name))
    .map(({ item }) => item);
}

export function registryFilters(params: { q?: string | null; kind?: string | null }) {
  const kind = params.kind ?? "";
  const q = params.q?.trim() ?? "";
  if (!["", "tool", "workflow"].includes(kind)) throw new CommunityError(400, "Choose tool or workflow.", "kind");
  if (q.length > 120) throw new CommunityError(400, "Keep searches under 120 characters.", "q");
  return { kind, q };
}

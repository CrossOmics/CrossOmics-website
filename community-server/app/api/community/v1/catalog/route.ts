import type { NextRequest } from "next/server";
import { api, json } from "@/lib/community/http";
import { findRegistryItem, loadRegistry, registryFilters, searchRegistry } from "@/lib/community/registry";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return api(async () => {
    const params = request.nextUrl.searchParams;
    const id = params.get("id");
    if (id !== null) {
      const item = findRegistryItem(await loadRegistry(), id);
      return item ? json({ item }) : json({ message: "Registry entry not found." }, 404);
    }
    const { q, kind } = registryFilters({ q: params.get("q"), kind: params.get("kind") });
    const registry = await loadRegistry();
    return json({ items: searchRegistry(registry, q, kind), generatedAt: registry.generated_at });
  });
}

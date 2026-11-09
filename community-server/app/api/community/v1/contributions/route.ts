import type { NextRequest } from "next/server";
import { requireIdentity } from "@/lib/community/auth";
import { contributionCount, listContributions, saveContribution } from "@/lib/community/database";
import { api, json, pageNumber, readJson } from "@/lib/community/http";
import { findRegistryItem, loadRegistry } from "@/lib/community/registry";
import { CommunityError, parseContribution } from "@/lib/community/validation";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return api(async () => {
    const params = request.nextUrl.searchParams;
    const author = params.get("mine") === "1" ? (await requireIdentity(request)).contributor.id : undefined;
    const catalogId = params.get("catalogId") || undefined;
    const page = pageNumber(params.get("page"));
    const [listing, total] = await Promise.all([
      listContributions({ author, catalogId, page }),
      author && !catalogId ? contributionCount(author) : null
    ]);
    return json({ ...listing, ...(total === null ? {} : { total }) });
  });
}

export function POST(request: NextRequest) {
  return api(async () => {
    const { contributor, channel } = await requireIdentity(request, true);
    const input = parseContribution(await readJson(request));
    if (input.catalogId) {
      const item = findRegistryItem(await loadRegistry(), input.catalogId);
      if (!item) throw new CommunityError(422, "Choose an item from the registry.", "catalogId");
      input.catalogId = item.id;
    }
    const result = await saveContribution(input, contributor, channel);
    return json(result, result.reused ? 200 : 201);
  });
}

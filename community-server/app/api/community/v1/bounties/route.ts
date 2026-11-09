import type { NextRequest } from "next/server";
import { createBounty, listBounties, requireBountyEditor } from "@/lib/community/bounties";
import { api, json, pageNumber, readJson } from "@/lib/community/http";
import { CommunityError, parseBounty, parseBountyStatus } from "@/lib/community/validation";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return api(async () => {
    const params = request.nextUrl.searchParams;
    const query = params.get("q")?.trim() ?? "";
    if (query.length > 120 || query.includes("\u0000")) throw new CommunityError(400, "Keep searches under 120 characters.", "q");
    const status = params.get("status");
    return json(await listBounties(query, status ? parseBountyStatus(status) : null, pageNumber(params.get("page"))));
  });
}

export function POST(request: NextRequest) {
  return api(async () => {
    const editor = await requireBountyEditor(request);
    return json(await createBounty(parseBounty(await readJson(request)), editor), 201);
  });
}

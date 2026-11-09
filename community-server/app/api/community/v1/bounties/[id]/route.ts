import type { NextRequest } from "next/server";
import { changeBountyStatus, getBounty, requireBountyEditor } from "@/lib/community/bounties";
import { api, json, pageNumber, readJson } from "@/lib/community/http";
import { parseBountyStatus } from "@/lib/community/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export function GET(request: NextRequest, { params }: Context) {
  return api(async () => json(await getBounty((await params).id, pageNumber(request.nextUrl.searchParams.get("page")))));
}

export function PATCH(request: NextRequest, { params }: Context) {
  return api(async () => {
    await requireBountyEditor(request);
    const body = await readJson(request);
    const status = body && typeof body === "object" && "status" in body ? body.status : undefined;
    return json(await changeBountyStatus((await params).id, parseBountyStatus(status)));
  });
}

import type { NextRequest } from "next/server";
import { requireWebIdentity } from "@/lib/community/auth";
import { createBountyReply } from "@/lib/community/bounties";
import { api, json, readJson } from "@/lib/community/http";
import { parseBountyReply } from "@/lib/community/validation";

export function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    const contributor = await requireWebIdentity(request, true);
    const message = parseBountyReply(await readJson(request));
    return json(await createBountyReply((await params).id, message, contributor), 201);
  });
}

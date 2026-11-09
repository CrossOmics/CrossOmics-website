import type { NextRequest } from "next/server";
import { requireWebIdentity } from "@/lib/community/auth";
import { issueAppToken, revokeAppToken } from "@/lib/community/database";
import { api, json } from "@/lib/community/http";

export function POST(request: NextRequest) {
  return api(async () => json(await issueAppToken(await requireWebIdentity(request, true)), 201));
}

export function DELETE(request: NextRequest) {
  return api(async () => {
    await revokeAppToken(await requireWebIdentity(request, true));
    return json({ revoked: true });
  });
}

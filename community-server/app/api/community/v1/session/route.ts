import type { NextRequest } from "next/server";
import { requireIdentity, webIdentity } from "@/lib/community/auth";
import { canManageBounties } from "@/lib/community/bounties";
import { enabledSignInProviders } from "@/lib/community/oauth";
import { api, json } from "@/lib/community/http";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return api(async () => {
    const contributor = request.headers.has("authorization")
      ? (await requireIdentity(request)).contributor
      : await webIdentity();
    const signInProviders = enabledSignInProviders();
    return json({ contributor, signInAvailable: signInProviders.length > 0, signInProviders, canManageBounties: canManageBounties(contributor) });
  });
}

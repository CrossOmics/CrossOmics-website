import type { NextRequest } from "next/server";
import { requireIdentity } from "@/lib/community/auth";
import { saveImpact } from "@/lib/community/database";
import { api, json, readJson } from "@/lib/community/http";
import { CommunityError, parseImpact } from "@/lib/community/validation";

export function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    const { contributor } = await requireIdentity(request, true);
    const { id } = await params;
    if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
      throw new CommunityError(404, "Contribution not found.");
    }
    const impact = await saveImpact(id, contributor, parseImpact(await readJson(request)));
    return json({ impact });
  });
}

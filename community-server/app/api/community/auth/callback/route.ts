import type { NextRequest } from "next/server";
import { finishSignIn } from "@/lib/community/oauth";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return finishSignIn(request, "github");
}

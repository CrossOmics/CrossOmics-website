import type { NextRequest } from "next/server";
import { json } from "@/lib/community/http";
import { finishSignIn } from "@/lib/community/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "apple") return json({ message: "Unknown sign-in provider." }, 404);
  return finishSignIn(request, provider);
}

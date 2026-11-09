import { NextResponse } from "next/server";
import { CommunityError } from "./validation";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function api(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof CommunityError) {
      return json({ message: error.message, field: error.field }, error.status);
    }
    // Database and provider errors may contain user-supplied values.
    console.error("Community API request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ message: "Community Tracking is temporarily unavailable. Try again shortly." }, 503);
  }
}

export async function readJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new CommunityError(415, "Send an application/json request.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new CommunityError(400, "Expected a JSON request body.");
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 16384) {
      await reader.cancel().catch(() => {});
      throw new CommunityError(413, "This request exceeds 16 KiB.");
    }
    body += decoder.decode(value, { stream: true });
  }
  try {
    return JSON.parse(body + decoder.decode());
  } catch {
    throw new CommunityError(400, "The request contains invalid JSON.");
  }
}

export function pageNumber(value: string | null | undefined) {
  if (!value) return 1;
  if (!/^\d{1,4}$/.test(value) || Number(value) < 1) {
    throw new CommunityError(400, "Page must be an integer from 1 to 9999.");
  }
  return Number(value);
}

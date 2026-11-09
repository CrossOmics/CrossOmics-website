import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, publicOrigin, requireSameOrigin, sessionCookie } from "@/lib/community/auth";
import { api } from "@/lib/community/http";

export function POST(request: NextRequest) {
  return api(async () => {
    requireSameOrigin(request);
    const origin = publicOrigin(request);
    const response = NextResponse.redirect(new URL("/community", origin), 303);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(sessionCookie, "", { ...cookieOptions(origin), maxAge: 0 });
    return response;
  });
}

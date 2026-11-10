import type { NextRequest } from "next/server";
import { communityServiceFetch } from "@/lib/community/service";

export const dynamic = "force-dynamic";

const routes = /^(?:auth\/(?:login|callback(?:\/(?:google|apple))?|logout)|v1\/(?:catalog|session|contributions|app-token|registry-import|registry-submissions(?:\/(?:preview|callback))?|bounty-editors|bounties(?:\/[0-9a-f-]{36}(?:\/replies)?)?|contributions\/[0-9a-f-]{36}\/impact))$/i;

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!routes.test(path)) return Response.json({ message: "Community route not found." }, { status: 404 });

  const headers = new Headers();
  for (const name of ["origin", "content-type"]) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  const cookie = request.cookies.getAll()
    .filter(({ name }) => name === "community_session" || name === "community_oauth" ||
      (path === "v1/registry-submissions/callback" && name === "community_registry_oauth"))
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("; ");
  if (cookie) headers.set("cookie", cookie);

  try {
    const options: RequestInit = { method: request.method, headers };
    // Finish reading the small request before sending it. The service can
    // reject a write before reading its body, for example when a session expires.
    if (request.body) {
      const reader = request.body.getReader();
      const buffer = new Uint8Array(16 * 1024);
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (size + value.length > buffer.length) {
          void reader.cancel().catch(() => {});
          return Response.json({ message: "This request exceeds 16 KiB." }, { status: 413 });
        }
        buffer.set(value, size);
        size += value.length;
      }
      options.body = buffer.slice(0, size);
    }
    const response = await communityServiceFetch(path + request.nextUrl.search, options);
    const outgoing = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "location", "allow", "referrer-policy"]) {
      const value = response.headers.get(name);
      if (value) outgoing.set(name, value);
    }
    for (const value of response.headers.getSetCookie()) outgoing.append("Set-Cookie", value);
    return new Response(response.body, { status: response.status, headers: outgoing });
  } catch {
    return Response.json({ message: "Community Tracking is temporarily unavailable." }, {
      status: 503, headers: { "Cache-Control": "no-store" }
    });
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };

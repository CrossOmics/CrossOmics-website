import type { NextRequest } from "next/server";
import { communityServiceFetch } from "@/lib/community/service";

export const dynamic = "force-dynamic";

const directoryRoutes = /^v2\/contributors(?:\/contributor_[a-f0-9]{64})?$/;
const adminRoutes = /^v2\/admin\/tools$/;
const desktopRoutes = /^v1\/desktop-auth\/(?:attempts\/[0-9a-f-]{36}(?:\/approve)?|sessions)$/i;
const registryRoutes = /^v2\/(?:me\/contributions|catalog(?:\/cp_[a-z0-9_]{1,61}(?:\/metadata|\/management|\/maintainers|\/recommendations|\/versions\/cv_[a-z0-9_]{1,124}\/(?:withdraw|credits))?)?|registry\/submissions(?:\/[0-9a-f-]{36}(?:\/review)?)?)$/i;
const governanceRoutes = /^v2\/(?:catalog\/cp_[a-z0-9_]{1,61}\/governance(?:\/(?:commands|reviews))?|governance\/(?:trust-config|events\/(?:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/proof)?))$/i;
const routes = /^(?:auth\/(?:login|callback(?:\/(?:google|apple))?|logout)|v1\/(?:catalog|session|contributions|app-token|registry-import|registry-submissions(?:\/(?:preview|callback))?|bounty-editors|bounties(?:\/[0-9a-f-]{36}(?:\/replies)?)?|contributions\/[0-9a-f-]{36}\/impact))$/i;

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!routes.test(path) && !desktopRoutes.test(path) && !registryRoutes.test(path) && !governanceRoutes.test(path) && !directoryRoutes.test(path) && !adminRoutes.test(path)) return Response.json({ message: "Community route not found." }, { status: 404 });

  const privateToolRoute = /^v2\/(?:me\/contributions|catalog\/cp_[a-z0-9_]{1,61}\/(?:management|maintainers|recommendations|metadata|governance\/(?:commands|reviews)))$/i;
  if (request.headers.has("authorization") && (privateToolRoute.test(path) || adminRoutes.test(path))) {
    return Response.json({ message: "Use your Community website session for this action." }, { status: 403 });
  }

  if ((directoryRoutes.test(path) || adminRoutes.test(path)) && request.method !== "GET") return Response.json({ message: "Method not allowed." }, { status: 405 });

  if (path === "v1/contributions" && request.method === "POST" && !request.headers.has("authorization")) return Response.json({ message: "Submit a Tool or Update for review instead.", submitUrl: "/community/submit" }, { status: 410 });

  if (governanceRoutes.test(path) && !(request.method === "GET" && !path.endsWith("/commands")) && !(request.method === "POST" && path.endsWith("/commands"))) return Response.json({ message: "Method not allowed." }, { status: 405 });

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

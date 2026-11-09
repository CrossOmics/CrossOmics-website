import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Contributor } from "./types";
import { CommunityError } from "./validation";
import { appTokenIdentity } from "./database";

export const sessionCookie = "community_session";
export const oauthCookie = "community_oauth";
export const sessionAge = 60 * 60 * 24 * 7;

export function publicOrigin(request: NextRequest) {
  const configured = process.env.COMMUNITY_WEB_ORIGIN;
  return configured ? new URL(configured).origin : request.nextUrl.origin;
}

export function cookieOptions(origin: string) {
  return { httpOnly: true, secure: origin.startsWith("https://"), sameSite: "lax" as const, path: "/" };
}

function sign(payload: string) {
  const key = process.env.COMMUNITY_SESSION_SECRET;
  return key && key.length >= 32 ? createHmac("sha256", key).update(payload).digest("base64url") : null;
}

export function createSignedCookie(data: object) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = sign(payload);
  if (!signature) throw new Error("Community session key is missing.");
  return `${payload}.${signature}`;
}

export function readSignedCookie(value: string | undefined): Record<string, unknown> | null {
  if (!value || value.length > 1024) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = sign(payload);
  if (!expected || !/^[A-Za-z0-9_-]{43}$/.test(signature) ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data || typeof data.exp !== "number" || !Number.isFinite(data.exp) || data.exp <= Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function createSession(contributor: Contributor) {
  return createSignedCookie({ ...contributor, exp: Date.now() + sessionAge * 1000 });
}

export function contributorFromGitHub(value: unknown): Contributor | null {
  if (!value || typeof value !== "object" || !("id" in value) || !("login" in value)) return null;
  const id = typeof value.id === "number" && Number.isSafeInteger(value.id) ? String(value.id) : value.id;
  return typeof id === "string" && /^[1-9]\d{0,19}$/.test(id) &&
    typeof value.login === "string" && /^[a-zA-Z0-9-]{1,39}$/.test(value.login)
    ? { id, login: value.login }
    : null;
}

export async function webIdentity(): Promise<Contributor | null> {
  const data = readSignedCookie((await cookies()).get(sessionCookie)?.value);
  if (!data) return null;
  const { id, login } = data;
  if (typeof id === "string" && typeof login === "string" &&
    /^(google|apple):[a-f0-9]{64}$/.test(id) && /^member-[a-f0-9]{16}$/.test(login)) {
    return { id, login };
  }
  return contributorFromGitHub(data);
}

export function requireSameOrigin(request: NextRequest) {
  if (!process.env.COMMUNITY_WEB_ORIGIN || request.headers.get("origin") !== publicOrigin(request)) {
    throw new CommunityError(403, "This request must come from the Community Tracking site.");
  }
}

export async function requireWebIdentity(request: NextRequest, write: boolean) {
  const contributor = await webIdentity();
  if (!contributor) throw new CommunityError(401, "Sign in to Community to continue.");
  if (write) requireSameOrigin(request);
  return contributor;
}

export async function requireIdentity(request: NextRequest, write = false) {
  const auth = request.headers.get("authorization");
  if (auth !== null) {
    const token = /^Bearer ([^\s]+)$/i.exec(auth)?.[1];
    const contributor = token ? await appTokenIdentity(token) : null;
    if (!contributor) throw new CommunityError(401, "Use an active Gardener access token.");
    return { contributor, channel: "gardener" as const };
  }
  return { contributor: await requireWebIdentity(request, write), channel: "web" as const };
}

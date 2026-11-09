import { cookies } from "next/headers";
import { cache } from "react";
import type { Bounty, BountyReply, Contribution, Contributor, RegistryItem, SignInProvider } from "@/community-server/lib/community/types";

export function communityServiceFetch(path: string, init: RequestInit = {}) {
  const origin = process.env.COMMUNITY_SERVICE_URL;
  if (!origin) throw new Error("Community service is not configured.");
  return fetch(new URL(`/api/community/${path}`, origin), {
    ...init, cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(20000)
  });
}

class ServiceError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function communityData<T>(path: string, authenticated = false): Promise<T> {
  const cookie = authenticated ? (await cookies()).get("community_session") : undefined;
  const response = await communityServiceFetch(`v1/${path}`, {
    headers: cookie ? { cookie: `${cookie.name}=${encodeURIComponent(cookie.value)}` } : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new ServiceError(response.status, data?.message || "Community Tracking is unavailable.");
  return data as T;
}

export const communitySession = cache(async function () {
  const session = await communityData<{
    contributor: Contributor | null;
    signInAvailable: boolean;
    signInProviders?: SignInProvider[];
    canManageBounties?: boolean;
  }>("session", true).catch(() => null);
  if (!session) return null;
  const fallback: SignInProvider[] = session.signInAvailable ? ["github"] : [];
  return {
    contributor: session.contributor,
    providers: session.signInProviders ?? fallback,
    canManageBounties: session.canManageBounties === true
  };
});

export async function communityCatalog(filters: { q?: string; kind?: string } = {}) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.kind) query.set("kind", filters.kind);
  try {
    return { data: await communityData<{ items: RegistryItem[]; generatedAt: string }>(`catalog?${query}`), error: "" };
  } catch (error) {
    return { data: null, error: error instanceof ServiceError && error.status === 400
      ? error.message : "The registry is temporarily unavailable. Try refreshing this page." };
  }
}

export async function communityCatalogItem(id: string) {
  const query = new URLSearchParams({ id });
  try {
    return await communityData<{ item: RegistryItem }>(`catalog?${query}`);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) return { item: null };
    return null;
  }
}

export function communityContributions(filters: { mine?: boolean; page?: string; catalogId?: string }) {
  const query = new URLSearchParams();
  if (filters.mine) query.set("mine", "1");
  if (filters.page) query.set("page", filters.page);
  if (filters.catalogId) query.set("catalogId", filters.catalogId);
  return communityData<{ items: Contribution[]; page: number; hasMore: boolean; total?: number }>(
    `contributions?${query}`, filters.mine
  ).catch(() => null);
}

export async function communityBounties(filters: { q?: string; status?: string; page?: string }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (typeof value === "string" && value) query.set(key, value);
  try {
    return { data: await communityData<{ items: Bounty[]; page: number; hasMore: boolean }>(`bounties?${query}`), error: "" };
  } catch (error) {
    return { data: null, error: error instanceof ServiceError && error.status < 500
      ? error.message : "The bounty board is temporarily unavailable. Try refreshing this page." };
  }
}

export async function communityBounty(id: string, page: string | undefined) {
  const query = new URLSearchParams(typeof page === "string" ? { page } : {});
  try {
    const data = await communityData<{ item: Bounty; replies: BountyReply[]; page: number; hasMore: boolean }>(
      `bounties/${encodeURIComponent(id)}?${query}`
    );
    return { data, missing: false };
  } catch (error) {
    return { data: null, missing: error instanceof ServiceError && error.status === 404 };
  }
}

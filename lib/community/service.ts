import { cookies } from "next/headers";
import { cache } from "react";
import { normalizeRegistryItem, normalizeRegistrySubmission, type RegistryItemV2, type RegistrySubmissionV2 } from "./registry-v2";
import { normalizeToolType, isToolKind } from "./tool-types";
import type { Bounty, BountyReply, Contribution, Contributor, RegistryCatalog, RegistryItem, SignInProvider } from "@/lib/community/types";
import { curatedRepositories } from "./repositories";
import { refreshRepositoryUpdates } from "./repository-updates";

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

async function communityData<T>(path: string, authenticated = false, version: "v1" | "v2" = "v1"): Promise<T> {
  const cookie = authenticated ? (await cookies()).get("community_session") : undefined;
  const response = await communityServiceFetch(`${version}/${path}`, {
    headers: cookie ? { cookie: `${cookie.name}=${encodeURIComponent(cookie.value)}` } : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new ServiceError(response.status, data?.message || data?.error || "Community Tracking is unavailable.");
  return data as T;
}

export const communitySession = cache(async function () {
  const session = await communityData<{
    contributor: Contributor | null;
    signInAvailable: boolean;
    sessionDurationDays?: number;
    signInProviders?: SignInProvider[];
    registrySubmissionAvailable?: boolean;
    registryV2Enabled?: boolean;
    registryV2Available?: boolean;
    registryUpdateAuthorsAvailable?: boolean;
    canManageRegistry?: boolean;
    governanceEnabled?: boolean;
    governanceAvailable?: boolean;
    desktopAuthAvailable?: boolean;
    canPostBounties?: boolean;
    canManageBounties?: boolean;
  }>("session", true).catch(() => null);
  if (!session) return null;
  const fallback: SignInProvider[] = session.signInAvailable ? ["github"] : [];
  return {
    contributor: session.contributor,
    sessionDurationDays: Number.isInteger(session.sessionDurationDays) && session.sessionDurationDays! >= 1 && session.sessionDurationDays! <= 90
      ? session.sessionDurationDays! : 7,
    providers: session.signInProviders ?? fallback,
    registrySubmissionAvailable: session.registrySubmissionAvailable === true,
    registryV2Enabled: (session.registryV2Enabled ?? session.registryV2Available) === true,
    registryV2Available: session.registryV2Available === true,
    registryUpdateAuthorsAvailable: session.registryUpdateAuthorsAvailable === true,
    canManageRegistry: session.canManageRegistry === true,
    governanceEnabled: (session.governanceEnabled ?? session.governanceAvailable) === true,
    governanceAvailable: session.governanceAvailable === true,
    desktopAuthAvailable: session.desktopAuthAvailable === true,
    canPostBounties: (session.canPostBounties ?? session.canManageBounties) === true,
    canManageBounties: session.canManageBounties === true
  };
});

export async function communityCatalog(filters: { q?: string; kind?: string } = {}) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.kind) query.set("kind", filters.kind);
  try {
    const data = await communityData<RegistryCatalog>(`catalog?${query}`);
    return { data: { ...data, items: data.items.filter(item => isToolKind(item.kind)) }, error: "" };
  } catch (error) {
    return { data: null, error: error instanceof ServiceError && (error.status === 400 || error.status === 422)
      ? error.message : "The registry is temporarily unavailable. Try refreshing this page." };
  }
}

export async function communityCatalogItem(id: string) {
  const query = new URLSearchParams({ id });
  try {
    const data = await communityData<{ item: RegistryItem }>(`catalog?${query}`);
    const item = data.item && isToolKind(data.item.kind) ? data.item : null;
    return { item: item && curatedRepositories[item.id] ? await refreshRepositoryUpdates(item, curatedRepositories[item.id]) : item };
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) return { item: null };
    return null;
  }
}

export function communityContributions(filters: { mine?: boolean; page?: string; catalogId?: string; repository?: string }) {
  const query = new URLSearchParams();
  if (filters.mine) query.set("mine", "1");
  if (filters.page) query.set("page", filters.page);
  if (filters.catalogId) query.set("catalogId", filters.catalogId);
  if (filters.repository) query.set("repository", filters.repository);
  return communityData<{ items: Contribution[]; page: number; hasMore: boolean; total?: number }>(
    `contributions?${query}`, filters.mine
  ).then(data => ({ ...data, items: data.items.map(item => {
    const type = normalizeToolType(item.type);
    if (!type) throw new Error("Unsupported contribution type.");
    return { ...item, type };
  }) })).catch(() => null);
}

export async function communityBounties(filters: { q?: string; status?: string; page?: string }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (typeof value === "string" && value) query.set(key, value);
  try {
    return { data: await communityData<{ items: Bounty[]; page: number; hasMore: boolean }>(`bounties?${query}`), error: "" };
  } catch (error) {
    return { data: null, error: error instanceof ServiceError && error.status < 500
      ? error.message : "The request board is temporarily unavailable. Try refreshing this page." };
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

export async function registryV2Catalog(filters: { q?: string; type?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  try {
    const data = await communityData<{ items: RegistryItemV2[]; generatedAt: string }>("catalog?" + params, false, "v2");
    return { data: { ...data, items: data.items.filter(item => isToolKind(item.kind)).map(normalizeRegistryItem) }, error: "" };
  } catch (error) {
    return { data: null, error: error instanceof ServiceError && (error.status === 400 || error.status === 422)
      ? error.message : "The registry is temporarily unavailable. Try refreshing this page." };
  }
}

export async function registryV2Item(id: string) {
  try {
    const data = await communityData<{ item: RegistryItemV2 | null }>("catalog/" + encodeURIComponent(id), false, "v2");
    const item = data.item && isToolKind(data.item.kind) ? normalizeRegistryItem(data.item) : null;
    return { item: item && curatedRepositories[item.id] ? await refreshRepositoryUpdates(item, curatedRepositories[item.id]) : item };
  } catch (error) {
    return error instanceof ServiceError && error.status === 404 ? { item: null } : null;
  }
}

export function registryV2Submissions(all: boolean) {
  return communityData<{ submissions: RegistrySubmissionV2[] }>(
    "registry/submissions" + (all ? "?all=1" : ""), true, "v2"
  ).then(data => ({ ...data, submissions: data.submissions.map(normalizeRegistrySubmission) })).catch(() => null);
}

export async function desktopAuthAttempt(id: string) {
  try {
    return await communityData<{ expiresAt: string }>("desktop-auth/attempts/" + encodeURIComponent(id), true);
  } catch {
    return null;
  }
}

export async function toolManagement(id: string) {
  try {
    const data = await communityData<import("./tool-maintenance").ToolManagement>("catalog/" + encodeURIComponent(id) + "/management", true, "v2");
    return { data: { ...data, item: normalizeRegistryItem(data.item) }, status: 200 };
  } catch (error) {
    return { data: null, status: error instanceof ServiceError ? error.status : 503 };
  }
}

export async function personalContributions(section: import("./tool-maintenance").PersonalSection, page?: string) {
  const query = new URLSearchParams({ section, ...(page ? { page } : {}) });
  try {
    const data = await communityData<import("./tool-maintenance").PersonalContributions>("me/contributions?" + query, true, "v2");
    return { ...data, entries: data.entries.map(entry => {
      if (entry.kind === "submission") return { ...entry, submission: normalizeRegistrySubmission(entry.submission) };
      if (entry.kind === "maintained") return { ...entry, tool: normalizeRegistryItem(entry.tool) };
      const type = normalizeToolType(entry.contribution.type);
      if (!type) throw new Error("Unsupported contribution type.");
      return { ...entry, contribution: { ...entry.contribution, type } };
    }) };
  } catch { return null; }
}


export async function toolGovernance(id: string, filters: { cursor?: string; actor?: string; action?: string; repository?: string } = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  try {
    const data = await communityData<import("./governance").GovernanceResponse>(`catalog/${encodeURIComponent(id)}/governance?${query}`, true, "v2");
    return { data: data.available && data.state ? data : null, status: 200 };
  } catch (error) { return { data: null, status: error instanceof ServiceError ? error.status : 503 }; }
}

export async function governanceEvent(id: string) {
  if (!/^(?:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(id)) return null;
  try { return await communityData<import("./governance").GovernanceEventDetail>(`governance/events/${encodeURIComponent(id)}`, false, "v2"); }
  catch { return null; }
}

export async function toolGovernanceReviews(id: string) {
  try {
    const data = await communityData<{ submissions: RegistrySubmissionV2[] }>(`catalog/${encodeURIComponent(id)}/governance/reviews`, true, "v2");
    return { data: { submissions: data.submissions.map(normalizeRegistrySubmission).filter(item => item.type === "update" && item.status === "submitted" && item.pipelineId === id) }, status: 200 };
  } catch (error) { return { data: null, status: error instanceof ServiceError ? error.status : 503 }; }
}

export type PublicContributor = { slug: string; name: string; login: string | null };
export async function publicContributors(filters: { q?: string; page?: string }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (typeof value === "string") query.set(key, value);
  try {
    return await communityData<{ items: PublicContributor[]; page: number; hasMore: boolean }>(`contributors?${query}`, false, "v2");
  } catch { return null; }
}
export async function publicContributor(slug: string, pages: { maintainedPage?: string; originalPage?: string; updatePage?: string }) {
  if (!/^contributor_[a-f0-9]{64}$/.test(slug)) return { data: null, status: 404 };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(pages)) if (typeof value === "string" && /^\d{1,4}$/.test(value)) query.set(key, value);
  try {
    const data = await communityData<{ contributor: PublicContributor; sections: Record<import("./tool-maintenance").PersonalSection, import("./tool-maintenance").PersonalContributions> }>(`contributors/${slug}?${query}`, false, "v2");
    return { data, status: 200 };
  } catch (error) { return { data: null, status: error instanceof ServiceError ? error.status : 503 }; }
}
export async function adminTools(filters: { q?: string; page?: string }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (typeof value === "string") query.set(key, value);
  try {
    const data = await communityData<{ items: RegistryItemV2[]; page: number; hasMore: boolean }>(`admin/tools?${query}`, true, "v2");
    return { ...data, items: data.items.map(normalizeRegistryItem) };
  } catch { return null; }
}

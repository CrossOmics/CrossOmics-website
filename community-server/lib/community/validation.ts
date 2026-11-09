import { bountyCategories, bountyStatuses, contributionTypes, impactMetrics, subjectKinds } from "./types";
import type { Bounty, BountyStatus, ContributionInput, Impact } from "./types";

export class CommunityError extends Error {
  constructor(public status: number, message: string, public field?: string) {
    super(message);
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CommunityError(400, "Expected a JSON object.");
  }
  return value as Record<string, unknown>;
}

function text(input: Record<string, unknown>, key: string, label: string, max: number) {
  const value = input[key];
  if (typeof value !== "string" || !value.trim() || value.trim().length > max || /\u0000/.test(value)) {
    throw new CommunityError(422, `Enter ${label} using 1–${max} characters.`, key);
  }
  return value.trim();
}

export function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href.length <= 2048 ? url.href : null;
  } catch {
    return null;
  }
}

function link(input: Record<string, unknown>, key: string) {
  const url = httpsUrl(input[key]);
  if (!url) throw new CommunityError(422, "Enter a valid HTTPS link.", key);
  return url;
}

export function parseContribution(value: unknown): ContributionInput {
  const input = object(value);
  const type = text(input, "type", "a contribution type", 40);
  const subjectKind = text(input, "subjectKind", "an item type", 20);
  if (!Object.hasOwn(contributionTypes, type)) throw new CommunityError(422, "Choose a contribution type.", "type");
  if (!Object.hasOwn(subjectKinds, subjectKind)) throw new CommunityError(422, "Choose an item type.", "subjectKind");

  const occurredOn = text(input, "occurredOn", "the contribution date", 10);
  const date = new Date(occurredOn + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn) || !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== occurredOn || occurredOn > new Date().toISOString().slice(0, 10) ||
    occurredOn.startsWith("0000")) {
    throw new CommunityError(422, "Enter a valid date on or before today.", "occurredOn");
  }

  const projectUrl = new URL(link(input, "projectUrl"));
  projectUrl.hash = "";
  const isCommons = projectUrl.host === "github.com" &&
    /^\/biocode-commons\/[a-z0-9_.-]+(?:\/|$)/i.test(projectUrl.pathname);
  const catalogId = input.catalogId == null || input.catalogId === "" ? null : input.catalogId;
  if (catalogId !== null && (typeof catalogId !== "string" || !/^cp_[a-z0-9_]{1,61}$/.test(catalogId))) {
    throw new CommunityError(422, "Choose an item from the registry.", "catalogId");
  }
  return {
    type: type as ContributionInput["type"],
    subjectKind: subjectKind as ContributionInput["subjectKind"],
    subjectName: text(input, "subjectName", "the pipeline, tool or algorithm name", 120),
    catalogId,
    summary: text(input, "summary", "a short description of your contribution", 2000),
    occurredOn,
    projectUrl: projectUrl.href,
    evidenceUrl: link(input, "evidenceUrl"),
    projectScope: isCommons ? "commons" : "external"
  };
}

export function parseImpact(value: unknown): Impact {
  const input = object(value);
  const metric = text(input, "metric", "an impact metric", 40);
  if (!Object.hasOwn(impactMetrics, metric)) throw new CommunityError(422, "Choose an impact metric.", "metric");
  if (typeof input.value !== "number" || !Number.isInteger(input.value) || input.value < 0 || input.value > 2147483647) {
    throw new CommunityError(422, "Enter a whole number between 0 and 2,147,483,647.", "value");
  }
  return { metric: metric as Impact["metric"], value: input.value, evidenceUrl: link(input, "evidenceUrl") };
}

export function evidenceKey(evidenceUrl: string) {
  const url = new URL(evidenceUrl);
  if (url.hostname === "github.com" || url.hostname === "doi.org") {
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "").toLowerCase();
  }
  return url.href;
}

export function parseBounty(value: unknown) {
  const input = object(value);
  const category = text(input, "category", "a category", 30);
  if (!Object.hasOwn(bountyCategories, category)) throw new CommunityError(422, "Choose a bounty category.", "category");
  return {
    category: category as Bounty["category"],
    title: text(input, "title", "a title", 120),
    description: text(input, "description", "a description", 4000),
    projectUrl: input.projectUrl == null || input.projectUrl === "" ? null : link(input, "projectUrl"),
    reward: input.reward == null || input.reward === "" ? null : text(input, "reward", "the reward", 160)
  };
}

export function parseBountyStatus(value: unknown): BountyStatus {
  if (typeof value !== "string" || !Object.hasOwn(bountyStatuses, value)) {
    throw new CommunityError(422, "Choose a valid bounty status.", "status");
  }
  return value as BountyStatus;
}

export function parseBountyReply(value: unknown) {
  return text(object(value), "message", "a reply", 2000);
}

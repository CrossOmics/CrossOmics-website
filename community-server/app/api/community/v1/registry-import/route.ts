import type { NextRequest } from "next/server";
import { contributorFromGitHub, requireIdentity } from "@/lib/community/auth";
import { saveContribution } from "@/lib/community/database";
import { api, json, readJson } from "@/lib/community/http";
import { findRegistryItem, loadRegistry } from "@/lib/community/registry";
import { CommunityError, parseContribution } from "@/lib/community/validation";

const registryRepository = "https://github.com/CrossOmics/pipeline-registry";

export function POST(request: NextRequest) {
  return api(async () => {
    const { contributor, channel } = await requireIdentity(request, true);
    if (!/^[1-9]\d{0,19}$/.test(contributor.id)) {
      throw new CommunityError(403, "Connect with the GitHub account that opened this pull request to sync it.");
    }
    const body = await readJson(request);
    const number = body && typeof body === "object" && "number" in body ? body.number : null;
    if (typeof number !== "number" || !Number.isSafeInteger(number) || number < 1) {
      throw new CommunityError(422, "Enter a valid CrossOmics registry pull request number.", "number");
    }

    const response = await fetch(`https://api.github.com/repos/CrossOmics/pipeline-registry/pulls/${number}`, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000)
    });
    if (response.status === 404) throw new CommunityError(404, "Registry pull request not found.");
    if (response.status === 429 || response.headers.get("x-ratelimit-remaining") === "0") {
      if (!response.ok) throw new CommunityError(429, "GitHub's request limit was reached. Try syncing again later.");
    }
    if (!response.ok) throw new CommunityError(502, "Could not verify the pull request with GitHub.");

    const pr = await response.json();
    const author = contributorFromGitHub(pr.user);
    if (author?.id !== contributor.id) {
      throw new CommunityError(403, "This registry pull request belongs to a different GitHub account.");
    }
    const metadata = typeof pr.body === "string" && /^Submitted from Gardener\.\r?\n\r?\n- Pipeline: `(cp_[a-z0-9_]{1,61})`\r?\n- Version: `cv_[a-z0-9_]+` \((original|optimization)\)/.exec(pr.body);
    if (!metadata || typeof pr.title !== "string" || typeof pr.created_at !== "string") {
      throw new CommunityError(422, "This pull request does not contain Gardener registry submission metadata.");
    }

    const registry = await loadRegistry().catch(() => null);
    const item = registry ? findRegistryItem(registry, metadata[1]) : undefined;
    const input = parseContribution({
      type: metadata[2] === "original" ? "new_pipeline" : "optimization",
      subjectKind: item?.kind === "tool" ? "tool" : "pipeline",
      subjectName: item?.name ?? pr.title.slice(0, 120),
      summary: pr.title.slice(0, 2000),
      occurredOn: pr.created_at.slice(0, 10),
      projectUrl: registryRepository,
      evidenceUrl: `${registryRepository}/pull/${number}`,
      catalogId: item?.id
    });
    const result = await saveContribution(input, contributor, channel);
    return json(result, result.reused ? 200 : 201);
  });
}

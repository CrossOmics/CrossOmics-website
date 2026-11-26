import type { RegistryItem, RegistryRepository, RegistryVersion } from "./types";
import type { RegistryItemV2, RegistryVersionV2 } from "./registry-v2";
import { buildLineage, type LineageNode } from "./lineage";

export type RepositoryVersion = RegistryVersion | RegistryVersionV2;
export type RepositoryItem = RegistryItem | RegistryItemV2;

export type CuratedRepository = RegistryRepository & { versions: RegistryVersion[] };

// Administrator selections are scoped to an entry and never replace the upstream metrics.
export const curatedRepositories: Record<string, CuratedRepository[]> = {
  cp_star: [{
    url: "https://github.com/BioCode-Commons/NuSTAR", primary: false, pinned: true, name: "NuSTAR",
    description: "Community refactoring of STAR 2.7.11b, maintained by BioCode Commons.",
    versions: [{
      id: "cv_nustar_00467cd3", kind: "optimization", label: "main · 00467cd3",
      repo: "https://github.com/BioCode-Commons/NuSTAR",
      commit: "00467cd3f8fc8595f635d5c8ee35b26c9488411a", parent: null,
      released_at: "2026-11-18T00:39:00Z", improvement: "Update published.json with new benchmark datasets",
      withdrawn: false, source: "repository"
    }]
  }]
};

export function repositoryUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" && url.hostname === "github.com") url.protocol = "https:";
    if (url.protocol !== "https:" || url.username || url.password) return null;
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "").replace(/\.git$/i, "");
    return url.toString().replace(/\/$/, "");
  } catch { return null; }
}

function repositoryKey(value: string): string | null {
  const url = repositoryUrl(value);
  return url && (new URL(url).hostname === "github.com" ? url.toLowerCase() : url);
}

export function repositoryVersionDate(version: RepositoryVersion): { value: string; kind: "update" | "publication" } | null {
  for (const [value, kind] of [[version.released_at, "update"], [version.published_at, "publication"]] as const) {
    if (value && Number.isFinite(Date.parse(value))) return { value, kind };
  }
  return null;
}

function timestamp(version: RepositoryVersion) {
  const date = repositoryVersionDate(version);
  return date ? Date.parse(date.value) : -Infinity;
}

export type RepositoryGroup = RegistryRepository & {
  name: string;
  adminSelected: boolean;
  versions: RepositoryVersion[];
  latest: RepositoryVersion | null;
  lineage: { version: RepositoryVersion; parent: RepositoryVersion | null; upstreamParent: RepositoryVersion | null;
    depth: number; issue: LineageNode["issue"] }[];
};

export function repositoryGroups(item: RepositoryItem): RepositoryGroup[] {
  const curated = curatedRepositories[item.id] ?? [];
  const groups = new Map<string, RepositoryGroup>();
  for (const repo of [...item.repositories, ...curated]) {
    const key = repositoryKey(repo.url);
    const url = repositoryUrl(repo.url);
    if (!key || !url) continue;
    const existing = groups.get(key);
    const name = repo.name || existing?.name || new URL(url).pathname.split("/").filter(Boolean).pop() || new URL(url).hostname;
    groups.set(key, { ...existing, ...repo, url: existing?.url ?? url, name,
      primary: repo.primary || existing?.primary || false, pinned: repo.pinned || existing?.pinned || false,
      adminSelected: Boolean(repo.pinned || existing?.adminSelected),
      versions: existing?.versions ?? [], latest: null, lineage: [] });
  }
  const snapshots = curated.flatMap((repo) => repo.versions).filter((snapshot) => !item.versions.some((version) =>
    repositoryKey(version.repo) === repositoryKey(snapshot.repo) && version.commit === snapshot.commit));
  const allVersions = [...item.versions, ...snapshots];
  const globalGraph = buildLineage(allVersions);
  const globalParents = new Map(globalGraph.edges.map(edge => [edge.child, edge.parent]));
  const globalIssues = new Map(globalGraph.nodes.map(node => [node.id, node.issue]));
  const globalVersions = new Map(allVersions.map(version => [version.id, version]));
  for (const version of allVersions) {
    const key = repositoryKey(version.repo);
    const url = repositoryUrl(version.repo);
    if (!key || !url) continue;
    if (!groups.has(key)) groups.set(key, { url, primary: false, pinned: false, adminSelected: false,
      name: new URL(url).pathname.split("/").filter(Boolean).pop() || new URL(url).hostname,
      versions: [], latest: null, lineage: [] });
    const group = groups.get(key)!;
    if (!group.versions.some((existing) => existing.id === version.id)) {
      group.versions.push(version);
    }
  }
  for (const group of groups.values()) {
    group.versions.sort((a, b) => timestamp(a) - timestamp(b) || a.id.localeCompare(b.id));
    const active = group.versions.filter((version) => !version.withdrawn);
    group.latest = (active.length ? active : group.versions).at(-1) ?? null;
    const recommended = "recommendedVersionIds" in item ? item.recommendedVersionIds ?? [] : [];
    group.pinned = group.pinned || active.some(version => recommended.includes(version.id));
    const byId = new Map(group.versions.map(version => [version.id, version]));
    // Validate provenance globally, then draw only same-repository parent links.
    const graph = buildLineage(group.versions.map(version => ({ id: version.id,
      parent: byId.has(globalParents.get(version.id) ?? "") ? globalParents.get(version.id)! : null })));
    const parents = new Map(graph.edges.map(edge => [edge.child, edge.parent]));
    group.lineage = graph.nodes.map(node => ({ version: byId.get(node.id)!,
      parent: byId.get(parents.get(node.id) ?? "") ?? null,
      upstreamParent: !byId.has(globalParents.get(node.id) ?? "") ? globalVersions.get(globalParents.get(node.id) ?? "") ?? null : null,
      depth: Math.round((node.x - 24) / 344), issue: globalIssues.get(node.id) ?? null }));
  }
  return [...groups.values()].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
    Number(b.primary) - Number(a.primary) || a.name.localeCompare(b.name));
}

/** Pinned implementations stay first; unknown dates and popularity stay last. */
export function browseRepositories(groups: RepositoryGroup[], query = "", sort: "updated" | "popularity" = "updated") {
  const q = query.trim().toLocaleLowerCase();
  return groups.filter(repo => [repo.name, repo.url, repo.description ?? "", ...(repo.highlights ?? [])].some(value => value.toLocaleLowerCase().includes(q)))
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
      (sort === "popularity" ? (b.stars ?? -1) - (a.stars ?? -1) : (b.latest ? timestamp(b.latest) : -Infinity) - (a.latest ? timestamp(a.latest) : -Infinity)) || a.name.localeCompare(b.name));
}

/** Compare exact repositories, never arbitrary URL prefixes. */
export function sameRepository(a: string, b: string) {
  const key = repositoryKey(a);
  return key !== null && key === repositoryKey(b);
}

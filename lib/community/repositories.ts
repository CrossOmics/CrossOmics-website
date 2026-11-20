import type { RegistryItem, RegistryRepository, RegistryVersion } from "../../community-server/lib/community/types";

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

function timestamp(version: RegistryVersion) {
  const time = version.released_at ? Date.parse(version.released_at) : NaN;
  return Number.isFinite(time) ? time : -Infinity;
}

export type RepositoryGroup = RegistryRepository & {
  name: string;
  versions: RegistryVersion[];
  latest: RegistryVersion | null;
  lineage: { version: RegistryVersion; parent: RegistryVersion | null; depth: number }[];
};

export function repositoryGroups(item: RegistryItem): RepositoryGroup[] {
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
      versions: existing?.versions ?? [], latest: null, lineage: [] });
  }
  const snapshots = curated.flatMap((repo) => repo.versions).filter((snapshot) => !item.versions.some((version) =>
    repositoryKey(version.repo) === repositoryKey(snapshot.repo) && version.commit === snapshot.commit));
  for (const version of [...item.versions, ...snapshots]) {
    const key = repositoryKey(version.repo);
    const url = repositoryUrl(version.repo);
    if (!key || !url) continue;
    if (!groups.has(key)) groups.set(key, { url, primary: false, pinned: false,
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
    const byId = new Map(group.versions.map((version) => [version.id, version]));
    const visited = new Set<string>();
    const children = new Map<string, RegistryVersion[]>();
    for (const version of group.versions) {
      if (version.parent && byId.has(version.parent)) {
        children.set(version.parent, [...(children.get(version.parent) ?? []), version]);
      }
    }
    function visit(version: RegistryVersion, parent: RegistryVersion | null, depth: number) {
      if (visited.has(version.id)) return;
      visited.add(version.id);
      group.lineage.push({ version, parent, depth });
      for (const child of children.get(version.id) ?? []) visit(child, version, depth + 1);
    }
    for (const version of group.versions) {
      if (!version.parent || !byId.has(version.parent)) visit(version, null, 0);
    }
    // Malformed cycles have no root; show every remaining record once.
    for (const version of group.versions) if (!visited.has(version.id)) visit(version, null, 0);
  }
  return [...groups.values()].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
    Number(b.primary) - Number(a.primary) || a.name.localeCompare(b.name));
}

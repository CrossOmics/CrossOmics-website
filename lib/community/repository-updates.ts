import type { RegistryVersion } from "./types";
import type { RegistryVersionV2 } from "./registry-v2";
import type { CuratedRepository, RepositoryItem } from "./repositories";

export async function refreshRepositoryUpdates<T extends RepositoryItem>(item: T, curated: CuratedRepository[], fetcher: typeof fetch = fetch): Promise<T> {
  const updates = await Promise.all(curated.map(async (repo): Promise<(RegistryVersion & RegistryVersionV2) | null> => {
    try {
      const url = new URL(repo.url);
      if (url.hostname !== "github.com" || !/^\/[\w.-]+\/[\w.-]+$/.test(url.pathname)) return null;
      const response = await fetcher(`https://api.github.com/repos${url.pathname}/commits?per_page=1`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "CrossOmics-Community" },
        next: { revalidate: 900 }, signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) return null;
      const data = await response.json();
      const latest = Array.isArray(data) ? data[0] : null;
      const date = latest?.commit?.committer?.date;
      if (!/^[a-f0-9]{40}$/i.test(latest?.sha ?? "") || typeof date !== "string" || !Number.isFinite(Date.parse(date))) return null;
      const known = [...item.versions, ...repo.versions].filter((version) =>
        version.repo.toLowerCase().replace(/(?:\.git)?\/$|\.git$/i, "") === repo.url.toLowerCase());
      if (known.some((version) => version.commit === latest.sha)) return null;
      // A snapshot does not establish an immediate parent in the repository's history.
      return { id: `repository_${latest.sha}`, kind: "optimization", repo: repo.url, commit: latest.sha,
        label: `Latest commit · ${latest.sha.slice(0, 8)}`, parent: null, released_at: date,
        improvement: typeof latest.commit.message === "string" ? latest.commit.message.split("\n")[0].slice(0, 500) : null,
        withdrawn: false, source: "repository", type: "update", authors: [], maintainers: [] };
    } catch { return null; }
  }));
  return { ...item, versions: [...item.versions, ...updates.filter(version => version !== null)] } as T;
}

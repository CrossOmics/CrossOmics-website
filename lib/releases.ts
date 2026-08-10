export const RELEASES_URL = "https://github.com/CrossOmics/Gardener-Agent/releases";

const API_URL = "https://api.github.com/repos/CrossOmics/Gardener-Agent/releases/latest";

export type Release = {
  version: string;
  /** ISO 8601, as GitHub returns it. */
  publishedAt: string | null;
  /** What shipped, in one line. Derived from the release notes. */
  summary: string;
  href: string;
};

/**
 * Rendered when the API call fails — a rate limit, a network error, or an
 * offline build. Better a slightly stale card than a hole in the page.
 */
const FALLBACK: Release = {
  version: "2.1.0",
  publishedAt: "2026-07-31T21:32:08Z",
  summary: "New data sources, and Bulk RNA-seq and WGS workflow support.",
  href: RELEASES_URL
};

/**
 * GitHub release notes are long markdown. The bold bullet headings under
 * "Key Updates" are the closest thing to a changelog summary, so prefer those;
 * fall back to the opening paragraph if a release is not written that way.
 */
export function summarizeReleaseBody(body: string | null | undefined): string | null {
  if (!body) return null;

  const headings = [...body.matchAll(/^\s*[-*]\s+\*\*(.+?)\*\*/gm)]
    .map((m) => m[1].trim().replace(/[:.]$/, ""))
    .filter(Boolean);
  if (headings.length) return `${headings.join(" · ")}.`;

  const paragraph = body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#"));
  return paragraph ? paragraph.replace(/\s+/g, " ") : null;
}

/**
 * Read at render time on the server, revalidated hourly. Visitors never hit the
 * GitHub API themselves, and one call per hour sits far inside the
 * unauthenticated limit of 60 per hour.
 */
export async function getLatestRelease(): Promise<Release> {
  try {
    const res = await fetch(API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as {
      tag_name?: string;
      published_at?: string;
      body?: string;
      html_url?: string;
    };
    if (!data.tag_name) return FALLBACK;

    return {
      version: data.tag_name.replace(/^v/i, ""),
      publishedAt: data.published_at ?? null,
      summary: summarizeReleaseBody(data.body) ?? FALLBACK.summary,
      href: data.html_url ?? RELEASES_URL
    };
  } catch {
    return FALLBACK;
  }
}

/** Fixed locale and UTC so the server render is deterministic. */
export function formatReleaseDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(d);
}

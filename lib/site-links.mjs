const migratedPaths = new Set([
  'about', 'tutorial', 'tutorial/setup', 'tutorial/setup/sphere-node', 'tutorial/analysis',
  'tutorial/pipelines', 'research', 'approach', 'roadmap', 'future', 'value'
]);

/** @param {unknown} [value] @returns {string | null} */
export function gardenerWebsiteUrl(value = process.env.GARDENER_WEBSITE_URL) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    const communityHost = ['cross-omics.com', 'www.cross-omics.com'].includes(url.hostname) ||
      (url.hostname.startsWith('cross-omics-website') && url.hostname.endsWith('.vercel.app'));
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      url.pathname !== '/' || url.search || url.hash || communityHost) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** @param {string[]} segments */
export function isLegacyGardenerPath(segments) {
  return migratedPaths.has(segments.join('/'));
}

/**
 * @param {string[]} segments
 * @param {Record<string, string | string[] | undefined>} query
 * @param {unknown} [value]
 * @returns {string | null}
 */
export function legacyGardenerUrl(segments, query, value = process.env.GARDENER_WEBSITE_URL) {
  const origin = gardenerWebsiteUrl(value);
  if (!origin || !isLegacyGardenerPath(segments)) return null;
  const url = new URL('/' + segments.join('/'), origin);
  for (const [key, values] of Object.entries(query)) {
    for (const entry of Array.isArray(values) ? values : values === undefined ? [] : [values]) url.searchParams.append(key, entry);
  }
  return url.href;
}

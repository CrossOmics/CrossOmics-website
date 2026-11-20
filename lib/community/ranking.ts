import type { RegistryCatalog, RegistryItem } from "./types";

export const rankingReasons: Record<string, string> = {
  deprecated: "Deprecated", no_paper: "No paper registered", no_citation_data: "No citation data for its papers",
  no_repo: "No repository registered", unsupported_host: "Repository is not on GitHub",
  repo_unreachable: "Repository could not be read"
};

export function maintenanceRanking(catalog: RegistryCatalog) {
  const ranked: RegistryItem[] = [], stable: RegistryItem[] = [], excluded: RegistryItem[] = [];
  for (const item of catalog.items) {
    const metrics = item.metrics;
    if (item.status === "deprecated" || !metrics || metrics.priority == null || !Number.isFinite(metrics.priority) || metrics.priority_reason) {
      excluded.push(item);
    } else (item.status === "stable" ? stable : ranked).push(item);
  }
  const order = (a: RegistryItem, b: RegistryItem) => (b.metrics?.priority ?? 0) - (a.metrics?.priority ?? 0) || a.name.localeCompare(b.name);
  ranked.sort(order);
  stable.sort(order);
  excluded.sort((a, b) => a.name.localeCompare(b.name));
  const years = catalog.config?.citation_years ?? [...new Set(catalog.items.flatMap((item) =>
    Object.keys(item.metrics?.citations_by_year ?? {}).map(Number).filter(Number.isFinite)))].sort((a, b) => a - b);
  const dates = catalog.items.map((item) => item.metrics?.collected_at).filter((date): date is string => Boolean(date)).sort();
  return { ranked, stable, excluded, years, activityWindowDays: catalog.config?.activity_window_days ?? 365,
    collectedAt: catalog.metricsCollectedAt ?? dates.at(-1) ?? null };
}

import Link from "next/link";
import type { Contribution } from "@/community-server/lib/community/types";
import { contributionTypes, impactMetrics, subjectKinds } from "@/community-server/lib/community/types";
import { httpsUrl } from "@/community-server/lib/community/validation";
import ImpactForm from "./mine/ImpactForm";

export default function ContributionList({ items, mine = false }: { items: Contribution[]; mine?: boolean }) {
  if (!items.length) return (
    <div className="community-notice">
      <h2>{mine ? "Your history is empty" : "No contributions to show"}</h2>
      <p>{mine ? "Log a contribution to start your history." : "A contribution appears here when someone publishes it."}</p>
      <Link href="/community/submit" className="community-link">Log a contribution</Link>
    </div>
  );
  return (
    <ul className="community-record-list">
      {items.map((item) => {
        const project = httpsUrl(item.projectUrl);
        const evidence = httpsUrl(item.evidenceUrl);
        return (
          <li key={item.id} className="community-record" id={`contribution-${item.id}`}>
            <div className="community-actions">
              <span className="community-tag">{contributionTypes[item.type]}</span>
              <span className="community-tag community-tag-neutral">{item.projectScope === "commons" ? "BioCode Commons" : "External project"}</span>
            </div>
            <h3>{item.catalogId ? <Link href={`/community/catalog/${item.catalogId}`}>{item.subjectName}</Link> : item.subjectName}</h3>
            <p className="community-record-meta">
              {subjectKinds[item.subjectKind]} · @{item.contributor.login} · <time dateTime={item.occurredOn}>{item.occurredOn}</time> · via {item.channel === "gardener" ? "Gardener" : "Web"}
            </p>
            <p className="community-record-copy">{item.summary}</p>
            <div className="community-actions">
              {evidence && <a className="community-link" href={evidence}>Submitted evidence <span aria-hidden>↗</span></a>}
              {project && <a className="community-link" href={project}>Project <span aria-hidden>↗</span></a>}
            </div>
            <div className="community-impact">
              <h4>Reported impact</h4>
              {item.impact.length === 0 ? <p>Data unavailable</p> : (
                <ul>{item.impact.map(({ metric, value, evidenceUrl, observedAt }) => {
                  const url = httpsUrl(evidenceUrl);
                  const label = `${impactMetrics[metric]} ${value.toLocaleString("en-US")}${value === 0 ? " (none observed)" : ""}`;
                  return <li key={metric}>{url ? <a href={url} className="community-link">{label} ↗</a> : label}
                    {observedAt && <small> Recorded <time dateTime={observedAt}>{observedAt.slice(0, 10)}</time></small>}
                  </li>;
                })}</ul>
              )}
            </div>
            {mine && <ImpactForm contributionId={item.id} />}
          </li>
        );
      })}
    </ul>
  );
}

export function ContributionPager({ route, page, hasMore, catalogId }: { route: string; page: number; hasMore: boolean; catalogId?: string }) {
  if (page === 1 && !hasMore) return null;
  function href(to: number) {
    const params = new URLSearchParams({ page: String(to) });
    if (catalogId) params.set("catalogId", catalogId);
    return `${route}?${params}`;
  }
  return (
    <nav className="community-actions community-pager" aria-label="Contribution pages">
      {page > 1 && <Link className="community-secondary" href={href(page - 1)}>Previous page</Link>}
      <span>Page {page}</span>
      {hasMore && page < 9999 && <Link className="community-secondary" href={href(page + 1)}>Next page</Link>}
    </nav>
  );
}

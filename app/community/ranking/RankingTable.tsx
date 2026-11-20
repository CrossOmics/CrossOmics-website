import Link from "next/link";
import type { RegistryItem } from "@/lib/community/types";
import { httpsUrl } from "@/lib/community/https-url";

function count(value: number | null | undefined) {
  return value == null ? "—" : value.toLocaleString("en-US");
}

export default function RankingTable({ items, years, label }: { items: RegistryItem[]; years: number[]; label: string }) {
  if (!items.length) return <p className="community-notice">None.</p>;
  return (
    <div className="community-ranking-scroll" role="region" aria-label={label} tabIndex={0}>
      <table className="community-ranking-table">
        <caption className="community-visually-hidden">{label}: maintenance priority, citations and original repository activity</caption>
        <thead>
          <tr>
            <th scope="col">#</th><th scope="col">Pipeline</th><th scope="col">Kind</th><th scope="col">Risk score</th>
            <th scope="col">Original GitHub update</th><th scope="col">BioCode maintenance</th>
            {years.map((year, index) => <th scope="col" key={year}>Citations {year}{index === years.length - 1 ? " (YTD)" : ""}</th>)}
            <th scope="col">Commits / releases / merged PRs / closed issues</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const metrics = item.metrics;
            const activity = metrics?.activity;
            const project = httpsUrl(item.repositories.find((repo) => repo.primary)?.url);
            const updated = activity?.last_commit_at;
            const maintenance = item.biocode_maintenance;
            const replacement = httpsUrl(maintenance?.repository);
            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <th scope="row">
                  <Link href={`/community/catalog/${encodeURIComponent(item.id)}`}>{item.name}</Link>
                  <div className="community-ranking-badges">
                    {activity?.archived && <span className="community-tag community-tag-neutral">Archived</span>}
                    {activity?.moved_to_url && <span className="community-tag community-tag-neutral">Moved</span>}
                    {metrics?.stale_since && <span className="community-tag community-tag-neutral">Stale</span>}
                  </div>
                </th>
                <td>{item.kind === "tool" ? "Tool" : "Workflow"}</td>
                <td className="community-ranking-score">
                  {metrics?.priority?.toFixed(4) ?? "—"}
                  <span className="community-score-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(1, metrics?.priority ?? 0)) * 100}%` }} /></span>
                </td>
                <td>{updated ? (project ? <a href={project}><time dateTime={updated}>{updated.slice(0, 10)}</time></a> : <time dateTime={updated}>{updated.slice(0, 10)}</time>) : "—"}</td>
                <td>{maintenance?.status === "available" && replacement ? (
                  <a className="community-tag community-maintenance-available" href={replacement}>Available</a>
                ) : <span className={`community-tag ${maintenance?.status === "planned" ? "community-maintenance-planned" : "community-tag-neutral"}`}>{maintenance?.status === "planned" ? "Planned" : maintenance?.status === "available" ? "Available" : "Not registered"}</span>}</td>
                {years.map((year) => <td key={year} className="community-ranking-number">{count(metrics?.citations_by_year?.[String(year)])}</td>)}
                <td>{[activity?.commits, activity?.releases, activity?.merged_prs, activity?.closed_issues].map(count).join(" / ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

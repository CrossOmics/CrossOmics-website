"use client";

import { useState } from "react";
import Link from "next/link";
import type { GovernanceState } from "@/lib/community/governance";
import { browseRepositories, repositoryGroups, repositoryVersionDate, repositorySummary, sameRepository, type RepositoryItem } from "@/lib/community/repositories";
import VersionDetails from "./VersionDetails";

export default function RepositoryVersions({ item, governanceState, v2 = false, canManage = false }: {
  item: RepositoryItem; v2?: boolean; canManage?: boolean; governanceState?: GovernanceState;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"updated" | "popularity">("updated");
  const all = repositoryGroups(item).map(repo => ({ ...repo, pinned: governanceState
    ? governanceState.recommendations.some(target => sameRepository(target.repository, repo.url)) || !!governanceState.adminPick && sameRepository(governanceState.adminPick.repository, repo.url)
    : repo.pinned }));
  const groups = browseRepositories(all, query, sort);
  const hasPopularity = all.some(repo => typeof repo.stars === "number");
  return <section className="community-section" id="versions" aria-labelledby="versions-title">
    <div className="community-section-heading"><div><h2 id="versions-title">Repository versions</h2>
      <p>Different implementations of {item.name}. Maintainer picks appear first, followed by the latest updates.</p></div>
      <span className="community-tag">{all.length} {all.length === 1 ? "repository" : "repositories"}</span></div>
    <div className="community-repository-filters">
      <label>Search repositories<input type="search" value={query} maxLength={120} placeholder="Search by name, repository, or highlight" onChange={event => setQuery(event.target.value)} /></label>
      <label>Sort by<select value={sort} onChange={event => setSort(event.target.value as typeof sort)}>
        <option value="updated">Last updated · newest first</option>
        {hasPopularity && <option value="popularity">Popularity · GitHub stars</option>}
      </select></label>
    </div>
    <p className="community-results-meta" role="status">{groups.length} of {all.length} repositories</p>
    {!groups.length ? <p className="community-notice">{all.length ? "No repositories match this search. Try a different name." : "No repositories have been registered yet."}</p> :
      <ul className="community-repositories">{groups.map(repo => {
        const latest = repo.latestPublished ?? repo.latest;
        const date = repo.latest ? repositoryVersionDate(repo.latest) : null;
        const summary = repositorySummary(item, repo);
        const { evidence, benchmark } = summary;
        const picks = governanceState?.recommendations.filter(target => sameRepository(target.repository, repo.url)) ?? [];
        const adminOnly = governanceState ? !!governanceState.adminPick && sameRepository(governanceState.adminPick.repository, repo.url) && !picks.length : repo.adminSelected;
        return <li key={repo.url} className={`community-repository${repo.pinned ? " is-pinned" : ""}`} data-repository={repo.url}>
          <div className="community-repository-heading"><div>
            <div className="community-actions"><h3>{repo.name}</h3>
              {repo.pinned && <span className="community-tag community-pinned-tag">{adminOnly ? "Platform endorsement" : "Maintainer Pick"}</span>}
              <span className="community-tag community-tag-neutral">{repo.primary ? "Original repository" : "Community implementation"}</span>
              {typeof repo.stars === "number" && <span className="community-repository-path">{repo.stars.toLocaleString("en-US")} stars</span>}
            </div>
            <p className="community-repository-path">{new URL(repo.url).hostname}{new URL(repo.url).pathname}</p>
          </div><p className="community-latest">{date?.kind === "publication" ? "Latest publication" : "Latest update"}<br />{date ? <time dateTime={date.value}>{date.value.slice(0, 10)}</time> : "Date unavailable"}</p></div>
          <dl className="community-value-summary">
            <div className="community-value-purpose"><dt>Purpose</dt><dd>{summary.purpose}</dd></div>
            <div><dt>Compatibility</dt><dd>{summary.compatibility}</dd></div>
            <div><dt>Performance</dt><dd>{summary.performance}</dd></div>
            <div><dt>Evidence</dt><dd className="community-value-evidence">{benchmark && <a className="community-link" href={benchmark}>Benchmark report ↗</a>}
              {evidence && evidence !== benchmark && <a className="community-link" href={evidence}>{/\/pull\/\d+(?:$|[/?#])/.test(evidence) ? "Pull request evidence" : "Submitted evidence"} ↗</a>}
              {!benchmark && !evidence && "No review or benchmark evidence provided."}</dd></div>
          </dl>
          {repo.benchmark && benchmark && (repo.benchmark.wallTime || repo.benchmark.peakRss) && <dl className="community-benchmark-metrics">
            {repo.benchmark.wallTime && <div><dt>Wall time</dt><dd>{repo.benchmark.wallTime}</dd></div>}
            {repo.benchmark.peakRss && <div><dt>Peak RSS</dt><dd>{repo.benchmark.peakRss}</dd></div>}
          </dl>}
          {picks.filter(target => target.versionId).map(target => <p className="community-repository-path" key={target.versionId}>Pick applies to {target.label || "a specific published version"}.</p>)}
          {latest && <details className="community-update-details"><summary>{latest.source === "repository" ? "Latest repository observation" : latest.withdrawn ? "Withdrawn version and credits" : "Latest published update and credits"}</summary><ul className="community-record-list">
            <VersionDetails version={latest} parent={repo.lineage.find(entry => entry.version.id === latest.id)?.parent ?? null}
              upstreamParent={repo.lineage.find(entry => entry.version.id === latest.id)?.upstreamParent ?? null}
              issue={repo.lineage.find(entry => entry.version.id === latest.id)?.issue ?? null} pipelineId={item.id}
              canManage={canManage && latest.source !== "repository"} v2={v2}
              recommended={"recommendedVersionIds" in item && !!item.recommendedVersionIds?.includes(latest.id)} />
          </ul></details>}
          <div className="community-actions">
            <a className="community-secondary" href={repo.url}>View repository</a>
            <Link className="community-secondary" href={`/community/activity?${new URLSearchParams({ catalogId: item.id, repository: repo.url })}`}>View contributions</Link>
            <Link className="community-link" href={`/community/catalog/${item.id}/governance?${new URLSearchParams({ repository: repo.url })}`}>Governance</Link>
          </div>
        </li>;
      })}</ul>}
  </section>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { communityCatalog } from "@/lib/community/service";
import { maintenanceRanking, rankingReasons } from "@/lib/community/ranking";
import RankingTable from "./RankingTable";

export const metadata: Metadata = {
  title: "Maintenance ranking | CrossOmics Community",
  description: "Pipelines that may need community attention, ranked by citations and original repository activity."
};

export default async function MaintenanceRankingPage() {
  const { data: catalog, error } = await communityCatalog();
  const data = catalog ? maintenanceRanking(catalog) : null;
  return (
    <>
      <header className="community-heading">
        <Link href="/#registry" className="community-link">Back to registry</Link>
        <span className="community-tag">Community registry</span>
        <h1>Maintenance ranking</h1>
        <p>Pipelines that may need community attention. Widely cited pipelines with little recent activity in their original repositories rank highest.</p>
      </header>
      {!data || !catalog ? <p className="community-notice" role="status">{error}</p> : (
        <>
          <aside className="community-notice">
            <p><strong>Community updates:</strong> Explore original and community-maintained repositories, including <Link className="community-link" href="/community/catalog/cp_star#versions">STAR and NuSTAR</Link>, directly in the registry.</p>
          </aside>
          <section className="community-section" aria-labelledby="ranking-title">
            <div className="community-section-heading">
              <div><h2 id="ranking-title">Ranking</h2><p>{data.ranked.length} ranked pipelines · Highest priority first</p></div>
              <div className="community-ranking-dates">
                {data.collectedAt && <p>Metrics collected <time dateTime={data.collectedAt}>{data.collectedAt.slice(0, 10)}</time></p>}
                <p>Registry updated <time dateTime={catalog.generatedAt}>{catalog.generatedAt.slice(0, 10)}</time></p>
              </div>
            </div>
            <p className="community-ranking-help">Open a pipeline to explore its repositories and versions. Scroll the table horizontally for all metrics.</p>
            <RankingTable items={data.ranked} years={data.years} label="Maintenance ranking" />
          </section>
          <section className="community-section" aria-labelledby="stable-title">
            <div className="community-section-heading"><div><h2 id="stable-title">Mature (stable) pipelines</h2><p>Marked stable by their maintainers, so little activity is expected.</p></div></div>
            <RankingTable items={data.stable} years={data.years} label="Mature stable pipelines" />
          </section>
          <section className="community-section" aria-labelledby="excluded-title">
            <h2 id="excluded-title">Not ranked</h2>
            <p className="community-ranking-help">Entries without enough data to score, or marked deprecated.</p>
            {data.excluded.length ? (
              <ul className="community-ranking-excluded">
                {data.excluded.map((item) => {
                  const reason = item.status === "deprecated" ? "deprecated" : item.metrics?.priority_reason;
                  return <li key={item.id}><Link className="community-link" href={`/community/catalog/${encodeURIComponent(item.id)}`}>{item.name}</Link><span>{reason ? rankingReasons[reason] ?? reason : "Metrics unavailable"}</span></li>;
                })}
              </ul>
            ) : <p className="community-notice">None.</p>}
          </section>
          <details className="community-ranking-method community-section">
            <summary>How the score is computed</summary>
            <div>
              <p><strong>Risk score = CitationScore × (1 − ActivityScore)</strong>, rounded to four decimals.</p>
              <ul>
                <li>Both scores are mid-rank percentiles among eligible pipelines: (number below + half the number tied) / (number ranked − 1), or 0.5 for a single pipeline.</li>
                <li>CitationScore uses citations of the pipeline’s papers{data.years.length > 0 && <> in {data.years[0]}–{data.years.at(-1)} (the final year to date)</>}, from OpenAlex, or Semantic Scholar when OpenAlex has no record. A paper listed twice counts once.</li>
                <li>ActivityScore uses the original author’s primary GitHub repository over {data.activityWindowDays} days: commits + 5 × releases + 2 × merged PRs + closed issues. An archived repository counts as 0.</li>
                <li>Entries without citation data or a readable GitHub repository, and deprecated entries, are not ranked. A dash means a metric is unavailable.</li>
                <li>BioCode maintenance is registered separately: Available identifies a published replacement; Planned means a replacement is not yet available; Not registered means no replacement has been recorded. Pinned repositories and replacement activity do not change the original repository’s score.</li>
              </ul>
            </div>
          </details>
        </>
      )}
    </>
  );
}

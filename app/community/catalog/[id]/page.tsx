import Link from "next/link";
import { notFound } from "next/navigation";
import { communityCatalogItem } from "@/lib/community/service";
import { httpsUrl } from "@/community-server/lib/community/validation";

export default async function RegistryDetail({ params }: { params: Promise<{ id: string }> }) {
  const result = await communityCatalogItem((await params).id);
  if (!result) return <p className="community-notice">The registry is temporarily unavailable. Try refreshing this page.</p>;
  const { item } = result;
  if (!item) notFound();
  const project = httpsUrl(item.repositories.find((repo) => repo.primary)?.url);
  const citations = item.metrics?.recent_citations;
  return (
    <>
      <header className="community-heading">
        <Link href="/community#registry" className="community-link">← Back to registry</Link>
        <span className="community-tag">{item.kind === "workflow" ? "Workflow" : "Tool"}</span>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        <div className="community-actions">
          {project && <a className="community-secondary" href={project}>Source repository <span aria-hidden>↗</span></a>}
          <Link className="community-secondary" href={`/community/activity?catalogId=${item.id}`}>View contributions</Link>
          <Link className="community-primary" href={`/community/submit?catalogId=${item.id}`}>Log a contribution</Link>
        </div>
      </header>
      <dl className="community-detail-grid">
        <div><dt>Domain</dt><dd>{item.domain}</dd></div>
        <div><dt>Status</dt><dd>{item.status}</dd></div>
        <div><dt>Modalities</dt><dd>{item.modalities.join(", ") || "Unspecified"}</dd></div>
        <div><dt>Recent citations</dt><dd>{citations == null ? "Data unavailable" : citations.toLocaleString("en-US")}</dd></div>
      </dl>
      <section className="community-section">
        <h2>Algorithms and data</h2>
        <dl className="community-detail-grid">
          <div><dt>Algorithms</dt><dd>{item.algorithms.join(", ") || "Unspecified"}</dd></div>
          <div><dt>Inputs</dt><dd>{item.inputs.join(", ") || "Unspecified"}</dd></div>
          <div><dt>Outputs</dt><dd>{item.outputs.join(", ") || "Unspecified"}</dd></div>
        </dl>
      </section>
      <section className="community-section">
        <h2>Versions</h2>
        <ul className="community-record-list">
          {item.versions.map((version) => {
            const repo = httpsUrl(version.repo);
            const parent = item.versions.find((candidate) => candidate.id === version.parent);
            return (
              <li key={version.id} className="community-record">
                <div className="community-actions">
                  <h3>{version.label}</h3>
                  <span className="community-tag">{version.kind === "optimization" ? "Optimization" : "Original"}</span>
                  {version.withdrawn && <span className="community-tag">Withdrawn</span>}
                </div>
                <p>{[version.released_at, parent && `Based on ${parent.label}`].filter(Boolean).join(" · ")}</p>
                {version.improvement && <p>{version.improvement}</p>}
                {repo && <a href={repo} className="community-link">Version repository <span aria-hidden>↗</span></a>}
                <code>{version.commit}</code>
              </li>
            );
          })}
        </ul>
      </section>
      {item.papers.length > 0 && (
        <section className="community-section">
          <h2>Related papers</h2>
          <ul className="community-record-list">
            {item.papers.map((paper) => {
              const url = httpsUrl(paper.url) || (paper.doi && httpsUrl(`https://doi.org/${paper.doi}`));
              const label = paper.title || paper.doi || "Paper";
              return <li key={paper.doi || paper.url || label}>{url ? <a href={url} className="community-link">{label} ↗</a> : label}</li>;
            })}
          </ul>
        </section>
      )}
    </>
  );
}

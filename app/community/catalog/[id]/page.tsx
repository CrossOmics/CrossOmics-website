import Link from "next/link";
import { notFound } from "next/navigation";
import { toolTypeLabel } from "@/lib/community/tool-types";
import RegistryCredits from "../../RegistryCredits";
import { communityCatalogItem, communitySession, registryV2Item, toolManagement } from "@/lib/community/service";
import { orderedToolVersions, toolMaintainers } from "@/lib/community/tool-maintenance";
import type { RegistryItemV2 } from "@/lib/community/registry-v2";
import EditProjectMetadata from "./EditProjectMetadata";
import RegistryMetadata from "../../RegistryMetadata";
import WithdrawVersion from "./WithdrawVersion";
import CorrectVersionCredits from "./CorrectVersionCredits";
import { httpsUrl } from "@/lib/community/https-url";

export default async function RegistryDetail({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, communitySession()]);
  const v2 = session?.registryV2Enabled === true;
  const result = session === null ? null : v2 ? await registryV2Item(id) : await communityCatalogItem(id);
  if (!result) return <p className="community-notice">The registry is temporarily unavailable. Try refreshing this page.</p>;
  const { item } = result;
  if (!item) notFound();
  const project = httpsUrl(item.repositories.find((repo) => repo.primary)?.url);
  const citations = item.metrics?.recent_citations;
  const managed = v2 && session?.contributor ? await toolManagement(item.id) : null;
  const v2Item = v2 ? item as RegistryItemV2 : null;
  const versions = v2Item ? orderedToolVersions(v2Item) : item.versions;
  const maintainers = v2Item ? toolMaintainers(v2Item) : [];
  return (
    <>
      <header className="community-heading">
        <Link href="/#registry" className="community-link">← Back to registry</Link>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        <div className="community-actions">
          {project && <a className="community-secondary" href={project}>Source repository <span aria-hidden>↗</span></a>}
          <Link className="community-secondary" href={`/community/activity?catalogId=${item.id}`}>View contributions</Link>
          {v2 && <Link className="community-primary" href={`/community/registry/submit?pipelineId=${item.id}`}>Submit an update</Link>}
          <Link className="community-secondary" href={`/community/submit?mode=record&catalogId=${item.id}`}>Record work on this tool</Link>
          {managed?.data && <Link className="community-secondary" href={`/community/catalog/${item.id}/manage`}>Manage this tool</Link>}
        </div>
      </header>
      <dl className="community-detail-grid">
        <div><dt>Domain</dt><dd>{item.domain}</dd></div>
        {maintainers.length > 0 && <div><dt>Maintainers</dt><dd><RegistryCredits credits={maintainers} /></dd></div>}
        <div><dt>Status</dt><dd>{item.status}</dd></div>
        {item.modalities?.some(value => value.trim()) && <div><dt>Modalities</dt><dd>{item.modalities.join(", ")}</dd></div>}
        <div><dt>Recent citations</dt><dd>{citations == null ? "Data unavailable" : citations.toLocaleString("en-US")}</dd></div>
      </dl>
      {[item.algorithms, item.inputs, item.outputs].some(values => values?.some(value => value.trim())) &&
        <section className="community-section">
          <h2>Algorithms and data</h2>
          <RegistryMetadata metadata={{ algorithms: item.algorithms, inputs: item.inputs, outputs: item.outputs }} />
        </section>}
      {v2 && session?.canManageRegistry && !managed?.data && <EditProjectMetadata pipelineId={item.id} metadata={item} />}
      <section className="community-section">
        <h2>Versions</h2>
        <ul className="community-record-list">
          {versions.map((version) => {
            const repo = httpsUrl(version.repo);
            const evidence = "evidence_url" in version ? httpsUrl(version.evidence_url) : null;
            const parent = item.versions.find((candidate) => candidate.id === version.parent);
            return (
              <li key={version.id} className="community-record">
                <div className="community-actions">
                  <h3>{version.label}</h3>
                  <span className="community-tag">{toolTypeLabel("type" in version ? version.type : version.kind)}</span>
                  {!version.withdrawn && v2Item?.recommendedVersionIds?.includes(version.id) && <span className="community-tag community-recommended">Recommended</span>}
                  {version.withdrawn && <span className="community-tag">Withdrawn</span>}
                </div>
                <p>{[version.released_at, parent && `Based on ${parent.label}`].filter(Boolean).join(" · ")}</p>
                {"authors" in version && <dl className="community-detail-grid">
                  <div><dt>Original authors</dt><dd><RegistryCredits credits={version.authors} /></dd></div>
                </dl>}
                {version.improvement && <p>{version.improvement}</p>}
                {"citation" in version && version.citation && <div><h4>How to cite this version</h4><p className="community-citation">{version.citation}</p></div>}
                {repo && <a href={repo} className="community-link">Version repository <span aria-hidden>↗</span></a>}
                {evidence && <a href={evidence} className="community-link">Evidence <span aria-hidden>↗</span></a>}
                <code>{version.commit}</code>
                {session?.canManageRegistry && "legacyKind" in version &&
                  <CorrectVersionCredits pipelineId={item.id} versionId={version.id}
                    existingAuthors={version.authors} existingMaintainers={version.maintainers} />}
                {v2 && session?.canManageRegistry && !version.withdrawn &&
                  <WithdrawVersion pipelineId={item.id} versionId={version.id} />}
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

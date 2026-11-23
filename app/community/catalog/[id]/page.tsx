import Link from "next/link";
import { notFound } from "next/navigation";
import RegistryCredits from "../../RegistryCredits";
import { communityCatalogItem, communitySession, registryV2Item, toolManagement, toolGovernance } from "@/lib/community/service";
import { toolMaintainers } from "@/lib/community/tool-maintenance";
import type { RegistryItemV2 } from "@/lib/community/registry-v2";
import EditProjectMetadata from "./EditProjectMetadata";
import RegistryMetadata from "../../RegistryMetadata";
import RepositoryVersions from "./RepositoryVersions";
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
  const governance = v2 ? await toolGovernance(item.id) : null;
  const maintainers = v2Item ? toolMaintainers(v2Item) : [];
  return (
    <>
      <header className="community-heading">
        <Link href="/#registry" className="community-link">← Back to registry</Link>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        <div className="community-actions">
          {project && <a className="community-secondary" href={project}>Source repository <span aria-hidden>↗</span></a>}
          <Link className="community-secondary" href={`/community/catalog/${item.id}/governance`}>Public governance</Link>
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
      <RepositoryVersions item={item} v2={v2} canManage={session?.canManageRegistry === true} governanceState={governance?.data?.state} />
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { communityCatalogItem, communityContributions, communitySession, registryV2Item } from "@/lib/community/service";
import { repositoryGroups, sameRepository, repositoryUrl } from "@/lib/community/repositories";
import ContributionList, { ContributionPager } from "../ContributionList";
import VersionDetails from "../catalog/[id]/VersionDetails";

export const dynamic = "force-dynamic";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string; catalogId?: string; repository?: string }> }) {
  const query = await searchParams;
  const catalogId = typeof query.catalogId === "string" ? query.catalogId : undefined;
  const repository = typeof query.repository === "string" ? repositoryUrl(query.repository) : undefined;
  if (query.repository && (!repository || !catalogId)) notFound();
  const session = await communitySession();
  const [records, selection] = await Promise.all([
    communityContributions({ page: query.page, catalogId, repository: repository ?? undefined }),
    catalogId ? session?.registryV2Enabled ? registryV2Item(catalogId) : communityCatalogItem(catalogId) : null
  ]);
  const item = selection?.item;
  const repo = item && repository ? repositoryGroups(item).find(repo => sameRepository(repo.url, repository)) : null;
  if (item && repository && !repo) notFound();
  // The API filters before pagination; this guard also protects against an older API ignoring the filter.
  const visible = repository ? records?.items.filter(record => sameRepository(record.projectUrl, repository)) : records?.items;
  return <>
    <header className="community-heading"><h1>{repo ? `${repo.name} contributions` : "Contribution History"}</h1>
      <p>{repo ? "Published updates and contribution records for this repository." : "Explore the work behind community tools, or find a member to see their published contributions."}</p>
      <div className="community-actions">{item && <Link className="community-secondary" href={`/community/catalog/${item.id}`}>← {item.name}</Link>}
        <Link className="community-secondary" href="/community/contributors">Find contributors</Link></div>
      {repository && <p className="community-repository-path">{repository}</p>}
    </header>
    {repo && <section className="community-section"><h2>Published repository updates</h2>
      {!repo.versions.filter(version => version.source !== "repository").length ? <p className="community-notice">No reviewed updates have been published for this repository yet.</p> :
        <ul className="community-record-list">{[...repo.lineage].reverse().filter(({version}) => version.source !== "repository").map(({version,parent,upstreamParent,issue}) =>
          <VersionDetails key={version.id} version={version} parent={parent} upstreamParent={upstreamParent} issue={issue} pipelineId={item!.id} canManage={false} v2={session?.registryV2Enabled === true} recommended={false} />)}</ul>}
    </section>}
    <section className="community-section"><h2>Contribution records</h2>
      {records && visible ? <><ContributionList items={visible} /><ContributionPager route="/community/activity" catalogId={catalogId} repository={repository ?? undefined} {...records} /></>
        : <p className="community-notice" role="status">Contributions are temporarily unavailable. Try refreshing this page.</p>}
    </section>
  </>;
}

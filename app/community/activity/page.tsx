import Link from "next/link";
import { communityCatalogItem, communityContributions } from "@/lib/community/service";
import ContributionList, { ContributionPager } from "../ContributionList";

export const dynamic = "force-dynamic";

export default async function ActivityPage({ searchParams: query }: { searchParams: Promise<{ page?: string; catalogId?: string }> }) {
  const searchParams = await query;
  const catalogId = typeof searchParams.catalogId === "string" ? searchParams.catalogId : undefined;
  const [records, selection] = await Promise.all([
    communityContributions({ page: searchParams.page, catalogId }),
    catalogId ? communityCatalogItem(catalogId) : null
  ]);
  const item = selection?.item;
  return (
    <>
      <header className="community-heading">
        <h1>Community contributions</h1>
        <p>Browse evidence submitted by contributors working on BioCode Commons and external projects.</p>
        {catalogId && <div className="community-actions"><span className="community-tag">{item?.name ?? catalogId}</span><Link href="/community/activity" className="community-link">Show all contributions</Link></div>}
      </header>
      {records ? (
        <><ContributionList items={records.items} /><ContributionPager route="/community/activity" catalogId={catalogId} {...records} /></>
      ) : <p className="community-notice" role="status">Contributions are temporarily unavailable. Try refreshing this page.</p>}
    </>
  );
}

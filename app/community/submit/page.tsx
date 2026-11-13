import { communityCatalog, communityCatalogItem, communitySession, registryV2Catalog, registryV2Item } from "@/lib/community/service";
import { httpsUrl } from "@/lib/community/https-url";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import ContributionForm from "./ContributionForm";

export default async function SubmitPage({ searchParams: query }: { searchParams: Promise<{ login?: string; catalogId?: string }> }) {
  const searchParams = await query;
  const session = await communitySession();
  const catalogId = typeof searchParams.catalogId === "string" ? searchParams.catalogId : undefined;
  if (!session?.contributor) {
    const query = new URLSearchParams(catalogId ? { catalogId } : {});
    redirect(communitySignInPath(`/community/submit${catalogId ? `?${query}` : ""}`, searchParams.login));
  }
  const [registry, selection] = await Promise.all([
    session.registryV2Enabled ? registryV2Catalog() : communityCatalog(),
    catalogId ? (session.registryV2Enabled ? registryV2Item(catalogId) : communityCatalogItem(catalogId)) : null
  ]);
  const catalog = (registry?.data?.items ?? []).map(({ id, name, kind, repositories }) => ({
    id, name, kind, projectUrl: httpsUrl(repositories.find((repo) => repo.primary)?.url) ?? ""
  })).sort((a, b) => a.name.localeCompare(b.name));
  const selected = selection?.item;

  return (
    <>
      <header className="community-heading">
        <h1>Log a contribution</h1>
        <p>Give your work a public record, from a new pipeline to a bug fix in an existing tool.</p>
      </header>
      <ContributionForm catalog={catalog} selected={catalog.find((item) => item.id === selected?.id)} />
    </>
  );
}

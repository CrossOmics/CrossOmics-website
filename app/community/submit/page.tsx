import { communityCatalog, communityCatalogItem, communitySession, registryV2Catalog, registryV2Item } from "@/lib/community/service";
import { httpsUrl } from "@/lib/community/https-url";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import ContributionForm from "./ContributionForm";
import SubmissionChoices from "./SubmissionChoices";
import Link from "next/link";

export default async function SubmitPage({ searchParams: query }: { searchParams: Promise<{ login?: string; catalogId?: string; mode?: string }> }) {
  const searchParams = await query;
  const session = await communitySession();
  const catalogId = typeof searchParams.catalogId === "string" ? searchParams.catalogId : undefined;
  const record = searchParams.mode === "record";
  const returnQuery = new URLSearchParams({ ...(record ? { mode: "record" } : {}), ...(catalogId ? { catalogId } : {}) });
  if (!session?.contributor) redirect(communitySignInPath(`/community/submit${returnQuery.size ? `?${returnQuery}` : ""}`, searchParams.login));
  if (!record) return <SubmissionChoices catalogId={catalogId && /^cp_[a-z0-9_]{1,61}$/.test(catalogId) ? catalogId : undefined} />;
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
        <Link className="community-link" href={"/community/submit" + (catalogId ? "?" + new URLSearchParams({ catalogId }) : "")}>← All contribution options</Link>
        <h1>Record a Contribution</h1>
        <p>Record completed work with public evidence. Your record will appear in contribution history; tool catalog submissions are reviewed separately.</p>
      </header>
      <ContributionForm catalog={catalog} selected={catalog.find((item) => item.id === selected?.id)} />
    </>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLegacyGardenerPath, legacyGardenerUrl } from "@/lib/site-links.mjs";
import "../community/community.css";

export const dynamic = "force-dynamic";

export default async function LegacyGardenerPage({ params, searchParams }: {
  params: Promise<{ legacy: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ legacy }, query] = await Promise.all([params, searchParams]);
  if (!isLegacyGardenerPath(legacy)) notFound();
  const destination = legacyGardenerUrl(legacy, query);
  if (destination) redirect(destination);
  return <div className="page">
    <SiteHeader />
    <main className="community-main container">
      <h1>Gardener website is temporarily unavailable</h1>
      <p>The Gardener product website has moved. Please try this link again later.</p>
      <Link className="community-link" href="/">Browse Community</Link>
    </main>
    <SiteFooter />
  </div>;
}

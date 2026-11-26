import Link from "next/link";
import RegistryIllustration from "./RegistryIllustration";
import { normalizeToolType, isToolKind } from "@/lib/community/tool-types";
import { communityCatalog, communitySession, registryV2Catalog } from "@/lib/community/service";

export default async function CommunityRegistry({ searchParams: query }: { searchParams: Promise<{ q?: string; kind?: string; type?: string }> }) {
  const searchParams = await query;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const session = await communitySession();
  const v2 = session?.registryV2Enabled === true;
  const { data: catalog, error } = session === null
    ? { data: null, error: "The registry is temporarily unavailable. Try refreshing this page." }
    : v2 ? await registryV2Catalog({ q }) : await communityCatalog({ q, kind: "tool" });
  const results = (catalog?.items ?? []).filter(item => isToolKind(item.kind) &&
    item.versions.some(version => !version.withdrawn && normalizeToolType("type" in version ? version.type : version.kind) === "original"));

  return (
    <>
      <section className="community-hero">
        <div>
          <h1>Collaborative research software development</h1>
          <p>Discover, improve and maintain scientific tools through transparent community contributions.</p>
          <div className="community-actions"><Link className="community-primary" href="#registry">Find a tool</Link><Link className="community-secondary" href="/community/guide">How to participate</Link></div>
        </div>
        <RegistryIllustration />
      </section>
      <section className="community-section" id="registry" aria-labelledby="registry-title">
        <div className="community-section-heading">
          <div>
            <h2 id="registry-title">Explore Existing Tools</h2>
            <p>Find a tool family, compare its repositories and follow the work behind each implementation.</p>
          </div>
          <Link className="community-primary" href="/community/registry/submit">+ Submit a Tool</Link>
        </div>
        <form className="community-search" action="/#registry">
          <label>Search Tools<input type="search" name="q" maxLength={120} defaultValue={q} placeholder="Try STAR, alignment, or single-cell" /></label>
          <button className="community-primary">Search</button>
          {q && <Link className="community-link" href="/#registry">Clear filters</Link>}
        </form>
        {!catalog ? (
          <p className="community-notice" role="status">{error}</p>
        ) : (
          <>
            <div className="community-results-meta">
              <strong>{results.length} {results.length === 1 ? "entry" : "entries"}</strong>
              <span>Registry updated <time dateTime={catalog.generatedAt}>{catalog.generatedAt.slice(0, 10)}</time></span>
            </div>
            {results.length === 0 ? <p className="community-notice">{q ? "No tools match these filters." : <>No tools registered yet. <Link href="/community/registry/submit">Register the first tool</Link>.</>}</p> : (
              <ul className="community-catalog">
                {results.map((item) => (
                  <li key={item.id}>
                    <Link href={`/community/catalog/${item.id}`} className="community-catalog-card">
                      <div className="community-card-top">
                        <h3>{item.name}</h3>
                        <span aria-hidden>↗</span>
                      </div>
                      <p>{item.description}</p>
                      {item.algorithms.length > 0 && <small>{item.algorithms.slice(0, 3).join(" · ")}</small>}
                    </Link>
                    <div className="community-catalog-actions"><Link className="community-link" href={`/community/catalog/${item.id}`}>View tool</Link><Link className="community-link" href={`/community/registry/submit?pipelineId=${item.id}`}>+ Submit an Update</Link></div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </>
  );
}

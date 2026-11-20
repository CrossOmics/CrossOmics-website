import Link from "next/link";
import { normalizeToolType, isToolKind } from "@/lib/community/tool-types";
import { communityCatalog, communitySession, registryV2Catalog } from "@/lib/community/service";

function RegistryDiagram() {
  return (
    <svg className="community-diagram" aria-hidden="true" viewBox="0 0 420 220" fill="none">
      <defs>
        <pattern id="registry-grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ccd8e5" />
        </pattern>
      </defs>
      <rect width="420" height="220" fill="url(#registry-grid)" />
      <path d="M114 110H171Q183 110 183 98V70Q183 58 195 58H216M114 110H171Q183 110 183 122V150Q183 162 195 162H216M294 58H318Q330 58 330 70V98Q330 110 342 110H360M294 162H318Q330 162 330 150V122Q330 110 342 110H360" stroke="#8b9fba" strokeWidth="2" />
      <rect x="24" y="86" width="90" height="48" rx="10" fill="#0b57d0" />
      <rect x="216" y="35" width="78" height="46" rx="9" fill="#fff" stroke="#a0b2c9" />
      <rect x="216" y="139" width="78" height="46" rx="9" fill="#fff" stroke="#a0b2c9" />
      <circle cx="370" cy="110" r="10" fill="#d5f2e6" stroke="#218969" strokeWidth="2" />
      <g textAnchor="middle" dominantBaseline="central" fontFamily="inherit" fontSize="13" fontWeight="600">
        <text x="69" y="110" fill="#fff">Tool</text>
        <text x="255" y="58" fill="#1d3655">Original</text>
        <text x="255" y="162" fill="#1d3655">Update</text>
      </g>
      <circle cx="183" cy="110" r="4" fill="#0b57d0" />
    </svg>
  );
}

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
          <h1>Community Tracking</h1>
          <p>Discover computational biology tools and track the work that improves them.</p>
        </div>
        <RegistryDiagram />
      </section>
      <section className="community-section" id="registry" aria-labelledby="registry-title">
        <div className="community-section-heading">
          <div>
            <h2 id="registry-title">Explore Existing Tools</h2>
            <p>Browse registered tools and their versions.</p>
          </div>
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

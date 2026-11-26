import Link from "next/link";
import { publicContributors } from "@/lib/community/service";

export default async function Contributors({searchParams}: {searchParams: Promise<{q?: string; page?: string}>}) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q : "";
  const data = await publicContributors({q, page:query.page});
  const pageHref = (page:number) => "/community/contributors?" + new URLSearchParams({q,page:String(page)});
  return <>
    <header className="community-heading"><h1>Contributors</h1><p>Meet the people maintaining research software. Explore their tools and published contributions across the community.</p></header>
    <form className="community-search" action="/community/contributors"><label>Search contributors by name<input name="q" type="search" defaultValue={q} maxLength={120} placeholder="Name or public username" /></label><button className="community-primary">Search</button>
      {q && <Link className="community-link" href="/community/contributors">Clear search</Link>}</form>
    {!data ? <p className="community-notice" role="status">The contributor directory is temporarily unavailable. Try again shortly.</p> : <>
      {!data.items.length && <p className="community-notice">{q ? "No contributors match this search. Try another name." : "Published contributor profiles will appear here as members contribute."}</p>}
      <ul className="community-contributor-directory">{data.items.map(member => <li key={member.slug}>
        <span className="community-avatar" aria-hidden>{member.name.slice(0,1).toUpperCase()}</span><div><h2><Link href={`/community/contributors/${member.slug}`}>{member.name}</Link></h2>
          {member.login && <p>@{member.login}</p>}<Link className="community-link" href={`/community/contributors/${member.slug}`}>View maintained tools and contributions</Link></div></li>)}</ul>
      {(data.page > 1 || data.hasMore) && <nav className="community-actions community-pager" aria-label="Contributor pages">
        {data.page > 1 && <Link className="community-secondary" href={pageHref(data.page-1)}>Previous page</Link>}<span>Page {data.page}</span>
        {data.hasMore && <Link className="community-secondary" href={pageHref(data.page+1)}>Next page</Link>}</nav>}
    </>}
  </>;
}

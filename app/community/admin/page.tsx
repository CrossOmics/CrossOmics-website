import Link from "next/link";
import { redirect } from "next/navigation";
import { communitySession, adminTools } from "@/lib/community/service";
import { communitySignInPath } from "@/lib/community/return-path";
import { toolMaintainers } from "@/lib/community/tool-maintenance";
import RegistryCredits from "../RegistryCredits";

export default async function Administration({searchParams}: {searchParams:Promise<{q?:string;page?:string}>}) {
  const [session,query] = await Promise.all([communitySession(),searchParams]);
  if (!session?.contributor) redirect(communitySignInPath("/community/admin"));
  if (!session.canManageRegistry) return <section className="community-notice"><h1>Administrator access required</h1>
    <p>This dashboard is available to platform administrators. Tool maintainers can manage their assigned tools from My Contributions.</p><Link className="community-link" href="/community/mine">My Contributions</Link></section>;
  const q = typeof query.q === "string" ? query.q : "";
  const data = await adminTools({q,page:query.page});
  const pageHref = (page:number) => "/community/admin?" + new URLSearchParams({q,page:String(page)});
  return <>
    <header className="community-heading"><Link className="community-link" href="/community/mine">← My Contributions</Link><h1>Administration</h1>
      <p>Manage registered tools and their community maintainers.</p><div className="community-actions"><span className="community-tag">Super Administrator</span><Link className="community-secondary" href="/community/registry/submissions?all=1">Review submissions</Link></div></header>
    <section className="community-section"><h2>Manage registered tools</h2>
      <p>Open a tool to manage its maintainers, metadata and recommended implementations. Changes follow the tool’s governance policy and are checked by the service.</p>
      <form className="community-search" action="/community/admin"><label>Search tools<input type="search" name="q" maxLength={120} defaultValue={q} placeholder="Tool name or description" /></label><button className="community-primary">Search</button></form>
      {!data ? <p className="community-notice">Tool administration is temporarily unavailable. Try again shortly.</p> : <>
        {!data.items.length && <p className="community-notice">No tools match this search.</p>}
        <ul className="community-admin-tools">{data.items.map(item => <li key={item.id}><div><h3><Link href={`/community/catalog/${item.id}`}>{item.name}</Link></h3><p>{item.description}</p><p><strong>Maintainers: </strong><RegistryCredits credits={toolMaintainers(item)} /></p></div>
          <Link className="community-secondary" href={`/community/catalog/${item.id}/manage`}>Manage tool & maintainers</Link></li>)}</ul>
        {(data.page > 1 || data.hasMore) && <nav className="community-actions community-pager" aria-label="Administration pages">
          {data.page > 1 && <Link className="community-secondary" href={pageHref(data.page-1)}>Previous page</Link>}<span>Page {data.page}</span>
          {data.hasMore && <Link className="community-secondary" href={pageHref(data.page+1)}>Next page</Link>}</nav>}
      </>}
    </section>
  </>;
}

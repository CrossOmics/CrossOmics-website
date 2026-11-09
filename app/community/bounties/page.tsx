import Link from "next/link";
import { bountyStatuses } from "@/lib/community/types";
import { communityBounties, communitySession } from "@/lib/community/service";
import { BountyPager, BountyTags } from "./BountyMeta";

export default async function BountiesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";
  const [{ data, error }, session] = await Promise.all([
    communityBounties({ q, status, page: params.page }),
    communitySession()
  ]);
  return (
    <>
      <header className="community-heading">
        <h1>Community bounties</h1>
        <p>Find work the CrossOmics community would like help with, from maintaining a tool to building a workflow or running a benchmark.</p>
        {session?.canPostBounties && (
          <div className="community-actions">
            <Link href="/community/bounties/new" className="community-primary">Post a bounty</Link>
          </div>
        )}
      </header>
      <form className="community-search" action="/community/bounties">
        <label>Search bounties<input type="search" name="q" maxLength={120} defaultValue={q} placeholder="Try a tool, workflow, or benchmark" /></label>
        <label>Status
          <select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {Object.entries(bountyStatuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <button className="community-primary">Search</button>
        {(q || status) && <Link className="community-link" href="/community/bounties">Clear filters</Link>}
      </form>
      {!data ? <p className="community-notice" role="status">{error}</p> : data.items.length === 0 ? (
        <p className="community-notice">{q || status ? "No bounties match these filters." : "No one has posted a bounty yet."}</p>
      ) : (
        <>
          <ul className="community-bounty-list">
            {data.items.map((item) => (
              <li className="community-bounty-row" key={item.id}>
                <div>
                  <BountyTags item={item} />
                  <h2><Link href={`/community/bounties/${item.id}`}>{item.title}</Link></h2>
                  <p>{item.description.length > 180 ? `${item.description.slice(0, 177)}…` : item.description}</p>
                </div>
                <div className="community-bounty-meta">
                  <span>{item.replyCount} {item.replyCount === 1 ? "reply" : "replies"}</span>
                  <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)}</time>
                  {item.reward && <strong>{item.reward}</strong>}
                </div>
              </li>
            ))}
          </ul>
          <BountyPager route="/community/bounties" filters={{ q, status }} {...data} />
        </>
      )}
    </>
  );
}

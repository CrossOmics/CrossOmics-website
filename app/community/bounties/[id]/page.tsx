import Link from "next/link";
import { notFound } from "next/navigation";
import { communitySignInPath } from "@/community-server/lib/community/return-path";
import { httpsUrl } from "@/community-server/lib/community/validation";
import { communityBounty, communitySession } from "@/lib/community/service";
import { BountyReplyForm, BountyStatusForm } from "../BountyForms";
import { BountyPager, BountyTags } from "../BountyMeta";

export default async function BountyPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);
  const [{ data, missing }, session] = await Promise.all([communityBounty(id, page), communitySession()]);
  if (missing) notFound();
  if (!data) return <p className="community-notice" role="status">This bounty is temporarily unavailable. Try refreshing this page.</p>;
  const { item, replies } = data;
  const project = httpsUrl(item.projectUrl);
  const route = `/community/bounties/${item.id}`;

  return (
    <>
      <header className="community-heading">
        <Link href="/community/bounties" className="community-link">← Back to bounties</Link>
        <BountyTags item={item} />
        <h1 className="community-bounty-title">{item.title}</h1>
        <p className="community-record-meta">Posted by @{item.author} on <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)}</time></p>
      </header>
      <div className="community-bounty-body">
        <section aria-labelledby="bounty-details">
          <h2 id="bounty-details">The request</h2>
          <p className="community-record-copy">{item.description}</p>
        </section>
        {(item.reward || project || session?.canManageBounties) && (
          <aside className="community-notice community-bounty-aside" aria-label="Bounty information">
            {item.reward && <div><h3>Reward or recognition</h3><p>{item.reward}</p></div>}
            {project && <a href={project} className="community-link">Open project or issue <span aria-hidden>↗</span></a>}
            {session?.canManageBounties && <BountyStatusForm id={item.id} status={item.status} />}
          </aside>
        )}
      </div>
      <section className="community-section" id="discussion" aria-labelledby="discussion-title">
        <h2 id="discussion-title">Discussion</h2>
        {item.status === "closed" ? <p className="community-notice">This bounty is closed to new replies.</p> : session?.contributor
          ? <BountyReplyForm id={item.id} />
          : <p className="community-notice"><Link href={communitySignInPath(route)} className="community-link">Sign in to reply</Link> or offer to help.</p>}
        {replies.length === 0 ? <p className="community-bounty-empty">No replies yet.</p> : (
          <ul className="community-record-list">
            {replies.map((reply) => (
              <li key={reply.id} className="community-record">
                <p className="community-record-meta"><strong>@{reply.author}</strong> · <time dateTime={reply.createdAt}>{reply.createdAt.slice(0, 10)}</time></p>
                <p className="community-record-copy">{reply.message}</p>
              </li>
            ))}
          </ul>
        )}
        <BountyPager route={route} {...data} />
      </section>
    </>
  );
}

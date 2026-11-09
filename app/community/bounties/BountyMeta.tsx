import Link from "next/link";
import { bountyCategories, bountyStatuses, type Bounty } from "@/lib/community/types";

export function BountyTags({ item }: { item: Bounty }) {
  return (
    <div className="community-actions">
      <span className={`community-tag community-bounty-status is-${item.status}`}>{bountyStatuses[item.status]}</span>
      <span className="community-tag community-tag-neutral">{bountyCategories[item.category]}</span>
    </div>
  );
}

export function BountyPager({ route, filters, page, hasMore }: {
  route: string;
  filters?: { q?: string; status?: string };
  page: number;
  hasMore: boolean;
}) {
  if (page === 1 && !hasMore) return null;
  function href(nextPage: number) {
    const query = new URLSearchParams({ page: String(nextPage) });
    if (filters?.q) query.set("q", filters.q);
    if (filters?.status) query.set("status", filters.status);
    return `${route}?${query}`;
  }
  return (
    <nav className="community-actions community-pager" aria-label="Pagination">
      {page > 1 && <Link className="community-secondary" href={href(page - 1)}>Previous page</Link>}
      <span>Page {page}</span>
      {hasMore && page < 9999 && <Link className="community-secondary" href={href(page + 1)}>Next page</Link>}
    </nav>
  );
}

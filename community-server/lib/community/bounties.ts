import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireWebIdentity } from "./auth";
import { db } from "./database";
import type { Bounty, BountyReply, BountyStatus, Contributor } from "./types";
import { CommunityError, type parseBounty } from "./validation";

export function canManageBounties(contributor: Contributor | null) {
  return Boolean(contributor && process.env.COMMUNITY_BOUNTY_EDITOR_IDS?.split(",").some((id) => id.trim() === contributor.id));
}

export async function requireBountyEditor(request: NextRequest) {
  const contributor = await requireWebIdentity(request, true);
  if (!canManageBounties(contributor)) throw new CommunityError(403, "Only CrossOmics editors can manage bounties.");
  return contributor;
}

export function requireBountyId(id: string) {
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) throw new CommunityError(404, "Bounty not found.");
}

const bountyFields = `
  b.id, b.author, b.title, b.description, b.category, b.status, b.reward,
  b.project_url AS "projectUrl", b.created_at AS "createdAt",
  (SELECT count(*)::integer FROM community_bounty_replies r WHERE r.bounty_id = b.id) AS "replyCount"`;

export async function listBounties(query: string, status: BountyStatus | null, page: number) {
  const { rows } = await db().query<Bounty>(
    `SELECT ${bountyFields}
     FROM community_bounties b
     WHERE ($1::text IS NULL OR b.status = $1)
       AND ($2::text = '' OR strpos(lower(b.title || ' ' || b.description), lower($2)) > 0)
     ORDER BY b.created_at DESC, b.id DESC LIMIT 21 OFFSET $3`,
    [status, query, (page - 1) * 20]
  );
  return { items: rows.slice(0, 20), page, hasMore: rows.length > 20 };
}

export async function getBounty(id: string, page: number) {
  requireBountyId(id);
  const { rows: [item] } = await db().query<Bounty>(
    `SELECT ${bountyFields} FROM community_bounties b WHERE b.id = $1`,
    [id]
  );
  if (!item) throw new CommunityError(404, "Bounty not found.");
  const { rows } = await db().query<BountyReply>(
    `SELECT id, author, message, created_at AS "createdAt"
     FROM community_bounty_replies WHERE bounty_id = $1
     ORDER BY created_at DESC, id DESC LIMIT 21 OFFSET $2`,
    [id, (page - 1) * 20]
  );
  return { item, replies: rows.slice(0, 20), page, hasMore: rows.length > 20 };
}

export async function createBounty(draft: ReturnType<typeof parseBounty>, contributor: Contributor) {
  const id = randomUUID();
  await db().query(
    `INSERT INTO community_bounties (id, author, title, description, category, project_url, reward)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, contributor.login, draft.title, draft.description, draft.category, draft.projectUrl, draft.reward]
  );
  return { id };
}

export async function changeBountyStatus(id: string, status: BountyStatus) {
  requireBountyId(id);
  const result = await db().query("UPDATE community_bounties SET status = $2 WHERE id = $1", [id, status]);
  if (!result.rowCount) throw new CommunityError(404, "Bounty not found.");
  return { status };
}

export async function createBountyReply(id: string, message: string, contributor: Contributor) {
  requireBountyId(id);
  const replyId = randomUUID();
  const result = await db().query(
    `WITH target AS (SELECT id, status FROM community_bounties WHERE id = $1 FOR UPDATE)
     INSERT INTO community_bounty_replies (id, bounty_id, author, message)
     SELECT $2, target.id, $3, $4 FROM target WHERE target.status <> 'closed'`,
    [id, replyId, contributor.login, message]
  );
  if (!result.rowCount) {
    const target = await db().query("SELECT id FROM community_bounties WHERE id = $1", [id]);
    if (!target.rowCount) throw new CommunityError(404, "Bounty not found.");
    throw new CommunityError(409, "This bounty is closed to new replies.");
  }
  return { id: replyId };
}

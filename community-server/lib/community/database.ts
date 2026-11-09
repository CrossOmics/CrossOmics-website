import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { Contribution, ContributionInput, Contributor, Impact } from "./types";
import { CommunityError, evidenceKey } from "./validation";

const runtime = globalThis as typeof globalThis & { communityPool?: Pool };

export function db() {
  if (!process.env.DATABASE_URL) throw new CommunityError(503, "The contribution database is not configured.");
  if (!runtime.communityPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      statement_timeout: 8000
    });
    pool.on("error", () => console.error("An idle Community database connection was lost."));
    runtime.communityPool = pool;
  }
  return runtime.communityPool;
}

const contributionFields = `
  c.id, c.type, c.subject_kind AS "subjectKind", c.subject_name AS "subjectName",
  c.catalog_id AS "catalogId", c.summary, c.occurred_on::text AS "occurredOn",
  c.project_url AS "projectUrl", c.evidence_url AS "evidenceUrl", c.project_scope AS "projectScope",
  c.channel, c.created_at AS "createdAt",
  json_build_object('id', c.github_id, 'login', c.github_login) AS contributor,
  COALESCE((
    SELECT json_agg(json_build_object('metric', i.metric, 'value', i.value, 'evidenceUrl', i.evidence_url,
      'observedAt', i.observed_at) ORDER BY i.metric)
    FROM community_impact i WHERE i.contribution_id = c.id
  ), '[]'::json) AS impact`;

export async function listContributions(filters: { author?: string; catalogId?: string; page: number }) {
  const { rows } = await db().query<Contribution>(
    `SELECT ${contributionFields} FROM community_contributions c
     WHERE ($1::text IS NULL OR c.github_id = $1) AND ($2::text IS NULL OR c.catalog_id = $2)
     ORDER BY c.created_at DESC, c.id DESC LIMIT 21 OFFSET $3`,
    [filters.author ?? null, filters.catalogId ?? null, (filters.page - 1) * 20]
  );
  return { items: rows.slice(0, 20), page: filters.page, hasMore: rows.length > 20 };
}

export async function saveContribution(input: ContributionInput, contributor: Contributor, channel: Contribution["channel"]) {
  const key = evidenceKey(input.evidenceUrl);
  const inserted = await db().query(
    `INSERT INTO community_contributions
      (id, github_id, github_login, type, subject_kind, subject_name, catalog_id, summary, occurred_on,
       project_url, evidence_url, evidence_key, project_scope, channel)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (github_id, evidence_key) DO NOTHING`,
    [randomUUID(), contributor.id, contributor.login, input.type, input.subjectKind, input.subjectName,
      input.catalogId, input.summary, input.occurredOn, input.projectUrl, input.evidenceUrl, key, input.projectScope, channel]
  );
  const { rows } = await db().query<Contribution>(
    `SELECT ${contributionFields} FROM community_contributions c WHERE c.github_id = $1 AND c.evidence_key = $2`,
    [contributor.id, key]
  );
  return { item: rows[0], reused: inserted.rowCount === 0 };
}

export async function contributionCount(author: string) {
  const { rows } = await db().query<{ count: number }>(
    "SELECT count(*)::integer AS count FROM community_contributions WHERE github_id = $1", [author]
  );
  return rows[0].count;
}

export async function saveImpact(id: string, contributor: Contributor, impact: Impact): Promise<Impact> {
  const { rows } = await db().query<Impact>(
    `INSERT INTO community_impact (contribution_id, metric, value, evidence_url)
     SELECT id, $3, $4, $5 FROM community_contributions WHERE id = $1 AND github_id = $2
     ON CONFLICT (contribution_id, metric) DO UPDATE
       SET value = EXCLUDED.value, evidence_url = EXCLUDED.evidence_url, observed_at = now()
     RETURNING metric, value, evidence_url AS "evidenceUrl", observed_at AS "observedAt"`,
    [id, contributor.id, impact.metric, impact.value, impact.evidenceUrl]
  );
  if (!rows.length) throw new CommunityError(404, "Contribution not found.");
  return rows[0];
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueAppToken(contributor: Contributor) {
  const token = `cox_${randomBytes(32).toString("base64url")}`;
  const { rows } = await db().query<{ expiresAt: Date }>(
    `INSERT INTO community_app_tokens (github_id, github_login, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + interval '90 days')
     ON CONFLICT (github_id) DO UPDATE SET github_login = EXCLUDED.github_login,
       token_hash = EXCLUDED.token_hash, expires_at = EXCLUDED.expires_at
     RETURNING expires_at AS "expiresAt"`,
    [contributor.id, contributor.login, tokenHash(token)]
  );
  return { token, expiresAt: rows[0].expiresAt };
}

export async function revokeAppToken(contributor: Contributor) {
  await db().query("DELETE FROM community_app_tokens WHERE github_id = $1", [contributor.id]);
}

export async function appTokenIdentity(token: string): Promise<Contributor | null> {
  if (!/^cox_[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { rows } = await db().query<Contributor>(
    'SELECT github_id AS id, github_login AS login FROM community_app_tokens WHERE token_hash = $1 AND expires_at > now()',
    [tokenHash(token)]
  );
  return rows[0] ?? null;
}

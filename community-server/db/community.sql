BEGIN;

-- Legacy column names are retained for existing deployments. They hold
-- Community account IDs and handles from any supported sign-in provider.

CREATE TABLE IF NOT EXISTS community_contributions (
  id uuid PRIMARY KEY,
  github_id text NOT NULL,
  github_login text NOT NULL,
  type text NOT NULL CHECK (type IN ('new_pipeline', 'algorithm_update', 'bug_fix', 'optimization', 'maintenance')),
  subject_kind text NOT NULL CHECK (subject_kind IN ('pipeline', 'tool', 'algorithm')),
  subject_name text NOT NULL,
  catalog_id text,
  summary text NOT NULL,
  occurred_on date NOT NULL,
  project_url text NOT NULL,
  evidence_url text NOT NULL,
  evidence_key text NOT NULL,
  project_scope text NOT NULL CHECK (project_scope IN ('commons', 'external')),
  channel text NOT NULL CHECK (channel IN ('web', 'gardener')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (github_id, evidence_key)
);

CREATE INDEX IF NOT EXISTS community_contributions_recent ON community_contributions (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS community_contributions_personal ON community_contributions (github_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS community_contributions_catalog ON community_contributions (catalog_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS community_impact (
  contribution_id uuid NOT NULL REFERENCES community_contributions(id) ON DELETE CASCADE,
  metric text NOT NULL CHECK (metric IN ('usage', 'stars', 'citations')),
  value integer NOT NULL CHECK (value >= 0),
  evidence_url text NOT NULL,
  observed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contribution_id, metric)
);

CREATE TABLE IF NOT EXISTS community_app_tokens (
  github_id text PRIMARY KEY,
  github_login text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS community_bounties (
  id uuid PRIMARY KEY,
  author text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('maintenance', 'workflow', 'tooling', 'benchmark', 'documentation')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  project_url text,
  reward text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_bounties_recent ON community_bounties (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS community_bounty_replies (
  id uuid PRIMARY KEY,
  bounty_id uuid NOT NULL REFERENCES community_bounties(id),
  author text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_bounty_replies_recent ON community_bounty_replies (bounty_id, created_at DESC, id DESC);

COMMIT;

# Governor and Cross Community Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Validate each slice before integration.

**Goal** — Move Community registry publication into Cross, preserve legacy behavior during transition, and connect Governor through shared GitHub identity and explicit MCP contracts.

**Spec** — `docs/superpowers/specs/2026-11-09-governor-cross-community-registry.md`

**Global constraints** — Preserve existing production data, existing provider accounts and old clients during rollout. Keep all new registry publishing behind an explicit server flag. Deploy separately. Use local test data and mocked GitHub writes.

- [x] Reproduce the legacy duplicate authorization start, guard the browser and recover repeated callbacks by exact attempt. Verify the website start and callback against a mocked GitHub API and PostgreSQL.
- [x] Add Cross registry v2 storage, import, public catalog, GitHub submissions and admin review. Rehearse imports and permissions with PostgreSQL. Provide the Supabase connection and data migration procedure.
- [x] Add website v2 form, submitted/own history and admin review paths, v2 catalog/version detail and same-origin API forwarding. Keep the v1 path available while the v2 flag is off.
- [x] Add shared GitHub desktop sign-in and Governor's independent Cross catalog consumer. Verify identity preservation, callback replay rejection and the offline-compatible path.
- [x] Derive the reviewed MCP operation contract from explicit FastAPI annotations. Prove that discovery and invocation keep existing scope checks and fail closed.
- [x] Verify the changed repositories, review the combined contracts and record remaining environment-specific deployment steps.

## Deployment checks

- [ ] Rehearse against the team's Supabase staging project, verify the three administrator identities, and reconcile the production data snapshot.
- [ ] Verify the existing GitHub OAuth flow in the browser and the packaged Governor sign-in on a target device. Coordinate the final legacy Registry freeze and deploy both systems.

## Cross API contract

`GET /api/community/v2/catalog?q=&type=` returns `{ items, generatedAt }`. `GET /api/community/v2/catalog/{id}` returns `{ item }`. Keep existing catalog metadata, with optional legacy kind. v2 versions use `type`, `id`, `label`, `parent`, `repo`, `commit`, `improvement`, `released_at`, `withdrawn`, `authors` and `maintainers`.

`POST /api/community/v2/registry/submissions` takes `{ requestId, type, name, domain, description, repository, label, commit, pipelineId?, parentVersionId?, changeSummary?, authors, maintainers }`. Credits have `{ name, github?, orcid?, url? }`. It returns `{ submission }`, with `id`, `status`, and submitted fields. GET the collection for own submissions, and use `?all=1` for an administrator queue. GET `/submissions/{id}` returns the caller-owned record or an admin-visible record. POST `/submissions/{id}/review` takes `{ decision, reason? }` with `published | rejected`. The v1 session distinguishes `registryV2Enabled` from `registryV2Available` and reports `canManageRegistry`. The Governor snapshot uses `?snapshot=1` so existing local links retain withdrawal status. Registry admins can correct imported attribution with an audit reason.

## Review focus

- Duplicate authorization start before React commits a disabled button and a repeated callback after success.
- Invalid parent lineage, missing authors, duplicate source and idempotency conflict.
- An unauthenticated or read-only account attempting an admin action.
- Wrong GitHub account, callback code reuse and cancellation.
- An unannotated REST endpoint invoked through the agent bridge.


## Task 7: Preserve optional Registry evidence links

Add optional `evidenceUrl` for improved/update/fix submissions, validated as HTTPS, without breaking old clients or records. Preserve it through stored submission, administrator review, publication and public version metadata (`evidence_url`). Show an optional field in the website form and links in the review queue and published details. Origins do not need evidence. Use the existing JSON payload/metadata rather than a new SQL column. Worktrees: CrossOmics-website and sibling pipeline-submission-api/CrossOmics-website-backend. Do not edit migration scripts or README (Task 9).

Tests first: invalid URLs rejected; an HTTPS URL survives submission, idempotent retry and administrator publication; omitted evidence preserves old request behavior. Use isolated local PostgreSQL and mocked GitHub requests, never live Supabase fixtures. Verify both builds and the changed v2 integration tests. Expected: all assertions and builds pass. Commit scoped changes in each repository and record commands/results in the task report.

## Task 8: Finish reviewed input-source-group MCP annotations

After integration with current Governor `origin/dev`, extend the annotation pilot to the remaining already reviewed model-callable input-source-group operations. Preserve existing operation names, scope/parameter validation and host-only confirmation for destructive actions. Read OpenAPI schemas instead of adding parallel manual tool schemas. Unannotated migrated operations must fail closed for named and generic invocation. Other route families continue their existing allowlist pending a separate migration.

Tests first: the additional group operations appear in the contract and real agent discovery; removed annotations reject both named and generic calls; malformed metadata and forbidden operations remain rejected. Run backend contract/scope tests, agent bridge tests, Pi runtime build and Electron tests. Expected: all changed suites pass. Commit Governor changes and document the exact migrated family.

## Task 9: Deliver safe Community backup and restore scripts

Provide a user-runnable source export using Compose PostgreSQL and a restore into a provisioned Supabase target. Include the six durable v1 tables and optional desktop sessions; omit ephemeral OAuth attempts and preserve Registry v2 tables already imported at the target. Support older sources missing optional tables. Use a consistent snapshot, restrictive file permissions, atomic output, no silent overwrite, and fail before restoring into nonempty target Community tables. Validate table allowlist and restore in a transaction; preserve IDs, token hashes and timestamps. Do not print credentials. Document the final stop-writes, final backup, restore, reconcile and hosted Compose restart sequence, preserving existing OAuth/session variables. Do not stop the user's production service or switch traffic without access and a source snapshot.

Tests first with local PostgreSQL: round-trip contributions, impact, bounties/replies, editor allowlist and token hashes; optional absent tables; reject a nonempty target with no partial writes. Expected: all data and refusal assertions pass. Commit scripts, tests and runbook. Prepare feature-branch PRs for all three repositories, base main for Web/API and dev for Governor. Production migration and three verified admin grants depend on server access/source backup and verified identities.

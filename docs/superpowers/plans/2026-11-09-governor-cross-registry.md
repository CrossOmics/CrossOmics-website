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

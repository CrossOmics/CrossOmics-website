# Open Bounty Publishing Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution and one final independent review.

**Goal:** Every signed-in Community user can publish a bounty, without contribution or editor requirements.
**Architecture:** Keep existing authentication, origin validation and editor/admin management. The backend reports canPostBounties=true for any supported authenticated identity. The board exposes Post a bounty to every visitor; the existing new-bounty route sends anonymous visitors to sign-in and shows the form to authenticated users.
**Tech Stack:** Next.js, TypeScript, PostgreSQL, Node test runner.
**Spec:** User request, 2026-11-15: open bounty publishing to everyone; interpreted consistently with existing Community authentication as all signed-in Google/Apple/GitHub users.

## Global Constraints

- Publishing still requires an authenticated same-origin browser request. No anonymous writes.
- Status changes stay editor-only; editor allowlist changes stay administrator-only.
- No SQL migration, OAuth configuration changes, contribution writes or production test data.

## Review Focus

Anonymous/cross-origin requests remain denied; all three providers work without contributions; editor revocation does not revoke publishing; management permissions stay separate; publication links and login return paths stay accessible.

### Task 1: Backend publishing permissions

**Files:** backend lib/community/bounties.ts, tests/bounties.mjs, scripts/test-community-login.py, README.md, .env.example.
**Interfaces:** bountyPermissions(null) remains false/false; any authenticated identity gets canPostBounties=true. requireBountyPublisher uses requireWebIdentity(request,true). Editor lookup failure must fail closed for management without revoking basic publication.

- [x] Add local PostgreSQL regressions for three provider identities without contributions, origin/auth denial, author attribution, management isolation and managed editor revocation.
- [x] Observe failure against current backend, remove contribution/editor publication gate and retain editor-only management.
- [x] Run isolated API suites and build. Expected: all pass; no migration required.

### Task 2: Frontend entry point

**Files:** bounty list/new pages, tests/registry-submit.mjs, tests/community.mjs, README.md.
**Interfaces:** Post a bounty points to /community/bounties/new; anonymous login preserves this return path; signed-in users see NewBountyForm even without legacy eligibility flags.

- [x] Write failing board/form/login-return tests, implement public entry + authenticated form, update obsolete integration expectations.
- [x] Run complete fixture tests and build. Expected: all pass, editor-only status UI untouched.

### Task 3: Review and delivery

- [x] Fresh read-only review; fix important findings with regression coverage.
- [x] Push both branches and create paired PRs; verify frontend preview.
- [x] Explain backend rebuild then frontend deployment, with no database migration or whitelist changes.

## Verification and handoff

Web26/26; backend7unit+7Registry/bounty integration+5legacy/login tests passed; both production builds passed. Old gates reproduced new-provider publishing failures before the fix. Independent whole-change review found no Critical, Important or actionable minor issues. Vercel preview Ready; actual browser confirmed visible Post a bounty and anonymous redirect preserving /community/bounties/new.

Backend PR: https://github.com/CrossOmics/CrossOmics-website-backend/pull/7
Web PR: https://github.com/CrossOmics/CrossOmics-website/pull/27
Preview: https://cross-omics-website-git-codex-open-5c3154-jre2000kr-s-projects.vercel.app/community/bounties

Neither PR has been merged or deployed to production by this task. Operator rebuilds backend with existing Supabase/HTTPS Compose overlays, then releases frontend. No schema migration or environment values change. Production OAuth/database state and live write behavior were not exercised; all write tests used local isolated fixtures.

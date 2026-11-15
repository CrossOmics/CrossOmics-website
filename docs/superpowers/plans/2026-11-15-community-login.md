# Community Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Focused standalone login, 30-day sessions and provider-independent project submission.
**Architecture:** Preserve the existing signed-cookie/OAuth system. Add only an API duration field, broaden Registry submitter validation through an additive SQL migration, and retain separate GitHub authorization for the dormant legacy PR API. Move the existing sign-in URL to an auth route group.
**Tech Stack:** Next.js 15, React 19, TypeScript, PostgreSQL, Node tests.
**Spec:** ../specs/2026-11-15-community-login-design.md

## Global Constraints

- Preserve current account IDs, ownership, GitHub admin allowlist and provider callbacks; no email linking or persisted GitHub write tokens.
- New cookies expire after exactly 30 days; existing signed-cookie expiry stays authoritative.
- `/community/sign-in` remains the URL; old backend UI duration fallback is 7 days.
- Registry v2 never creates PRs; legacy PR endpoints stay disabled when v2 is enabled.
- Tests use isolated local database + fake providers; never read `.env` or write real Supabase.

## Review Focus

- Google/Apple identity must not gain administrator access or read another user's submissions.
- Invalid/expired cookies and cross-origin writes must remain blocked.
- GitHub operation callbacks must retain the Community identity and deny cross-account/replayed attempts.
- Anonymous, provider-unavailable, expired-login and already-authenticated routes must return safely.
- Standalone/mobile sign-in must not duplicate the Community action toolbar or imply unavailable providers work.

### Task 1: Backend session and authorization boundaries

**Files:** Backend `lib/community/{auth,registry-v2,registry-submission,registry-github}.ts`, `app/api/community/v1/session/route.ts`, `db/002-registry-community-identity.sql`, `tests/{registry-v2,registry-submission,session}.mjs`, README/migration helpers.
**Interfaces:** `sessionAge = 60 * 60 * 24 * 30`; session API adds `sessionDurationDays: 30`. `requireRegistryIdentity` accepts the existing three identity forms. `publishRegistryPullRequest` accepts the Community submitter but uses verified authorized GitHub identity for attribution, preserving same-GitHub-account checks for numeric primary IDs.

- [ ] Add failing tests: 30-day cookie/expiry, Google/Apple Registry submission+own-history+moderation/ownership, Google/Apple legacy GitHub authorization retains cookie; anonymous/cross-origin/mismatched identity denied.
- [ ] Run isolated local PostgreSQL + mock-provider baseline and new tests; observe intended failures.
- [ ] Implement identity/session changes and idempotent narrow SQL migration; update deployment/migration commands.
- [ ] Run backend build, session tests, Registry v2 and legacy PR suites with local fixtures. Expected: no failures; no production writes.
- [ ] Commit backend change.

### Task 2: Standalone login and any-provider Registry UI

**Files:** Frontend `app/(auth)/community/sign-in/{page.tsx,sign-in.css}`, existing `app/community/SignIn.tsx`, `lib/community/service.ts`, Registry submit/history pages, `tests/registry-submit.mjs`.
**Interfaces:** `communitySession` returns backend `sessionDurationDays` with safe legacy fallback; `<SignIn>` renders accessible provider actions and dynamic session-duration copy. Registry submit/history gates on `session.contributor`, not numeric GitHub IDs. Preserve legacy outcome links without restoring PR form.

- [ ] Add failing HTTP fixture tests: standalone login, all provider links + safe returnTo, old-backend fallback, expiration/service errors, signed-in redirect, Google+Apple form/history and anonymous redirect retaining pipelineId.
- [ ] Run `npm run test:registry-submit`; observe intended failures.
- [ ] Implement focused auth route group and responsive page; remove GitHub-only UI gates for site review.
- [ ] Run full fixture suite and production build; inspect desktop/mobile in actual browser. Expected: passing tests and no overflow/duplicate actions.
- [ ] Commit frontend change.

### Task 3: Review and deliver operator-ready changes

**Files:** both READMEs, PR descriptions, design/plan completion record.
**Interfaces:** SQL migration → updated backend → frontend; frontend remains usable against old backend except new provider submission requires backend update first.

- [ ] Fresh independent review of whole change, fix Important/Critical findings with regression tests.
- [ ] Verify migration rerun and existing data preserved, provider isolation, current callbacks and deployment commands.
- [ ] Push both branches and create PRs with validation and deployment ordering. Do not claim backend production deployment or real provider sign-in was tested.
- [ ] Save browser screenshots and deliver exact migration/deployment commands and PR links.

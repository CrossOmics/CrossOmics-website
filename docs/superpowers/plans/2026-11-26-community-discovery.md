# Community Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the accepted contributor-name, lineage and value-summary changes.
**Architecture:** Add a private optional public-name column and self-profile API. The website consumes that API and derives a conservative implementation diagram from validated version ancestry; full version records remain secondary.
**Tech Stack:** Next.js, React, TypeScript, PostgreSQL, Node test runner.
**Spec:** docs/superpowers/specs/2026-11-26-community-discovery.md

## Global Constraints
- Preserve stable slugs, existing permissions, identity bindings and historical author credits.
- Choosing a name alone does not make an account publicly discoverable.
- Profile writes require a same-origin website session; desktop bearer credentials cannot edit names.
- Only valid recorded parent links create lineage edges; never invent benchmark or compatibility claims.
- No production writes or automatic merge/deploy.

## Review Focus
- Same-name accounts must remain distinct, with unchanged slugs.
- Clearing a name restores fallback; login refresh must not erase a chosen name.
- Multiple parents or cyclic implementation ancestry must remain unconnected and diagnosed.
- Hash navigation and repeated top-link clicks must open the diagram.
- Missing profile API or evidence must fail gracefully without false claims.

### Task 1: Backend self-owned public names
**Workspace:** /private/tmp/crossomics-governance-api-20261122 (clean isolated clone; create codex/community-public-name).
**Files:** lib/community/contributors.ts; new app/api/community/v2/me/profile/route.ts; new db/007-community-public-names.sql and scripts/apply-public-names.py; test fixture migration list, tests/community-restructure.mjs; rollout docs.
**Interfaces:** GET/PATCH /api/community/v2/me/profile returns {displayName: string|null, contributor: {slug:string,name:string,login:string|null}}. PATCH accepts only {displayName:string|null}, empty trimmed string clears. Reject extra properties, targets, nonstrings, more than 120 Unicode codepoints, control and bidi override characters. Use requireToolWebIdentity(request) and established same-origin write guard. Register own identity if needed without overriding public_name.
Public name precedence: explicit public_name, existing bound maintainer name, current public login or generic fallback. Directory/profile use the same choice and existing visibility boundary; do not expose private provider IDs or login strings for Google/Apple.
- [x] Add failing real database/API tests for ordinary member name save/search, unchanged slug, duplicates, clear fallback, session refresh preservation, invisible draft-only account, invalid/cross-origin/bearer/anonymous writes.
- [x] Run focused tests and record RED.
- [x] Implement additive idempotent migration, API and safe helper following apply-contributors.py libpq-env pattern. Existing owner role grants remain unchanged.
- [x] Run relevant backend suites and type/build validation, record evidence; commit only task files.
- [x] Report in task-1-report.md with status, commits, red/green evidence, deployment order and concerns. Do not spawn agents or merge/push.

### Task 2: Website profile, implementation lineage and value summaries
**Files:** app/community/mine/PublicName.tsx, mine/page.tsx, lib/community/service.ts, API proxy; ToolLineage.tsx, VersionLineage.tsx and CSS, repositories.ts, RepositoryVersions.tsx; existing profile/lineage/proxy tests.
**Consumes:** Task 1 profile API contract.
- [x] Add failing interaction tests for one-click/direct-hash lineage opening, implementation-name nodes, secondary full history, mouse wheel zoom anchored at the pointer with bounds and scoped scroll capture, disconnected/ambiguous ancestry and registered-over-observed selection; name form save/clear/failure; safe proxy restrictions.
- [x] Implement a repository projection that connects implementations only when recorded cross-repository ancestry has a unique valid parent; conflicting parents and cycles have explicit unavailable relationships. Keep complete version graph in a secondary disclosure.
- [x] Implement public name form and graceful old-backend fallback, narrow GET/PATCH proxy allowlist with bearer rejection.
- [x] Present purpose, compatibility, performance status and evidence in repository cards, keeping technical details secondary. NuSTAR facts must come from the published version text/evidence, not a universal repository claim.
- [x] Run frontend suites and production build. Run paired local acceptance with new migration on disposable fixture; capture desktop/mobile evidence and open preview.
- [x] Review full diff, fix material findings, commit and record final evidence.

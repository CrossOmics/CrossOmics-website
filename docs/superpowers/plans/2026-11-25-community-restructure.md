# Community Restructure Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Tool-centered discovery, transparent contributions and usable role management from the supplied meeting update.
**Architecture:** Extend existing Next.js UI and paired Community API. Reuse published registry history, personal sections and governance permissions; keep private account bindings behind the API.
**Tech Stack:** Next.js 15, React 19, TypeScript, PostgreSQL, node:test/jsdom.
**Spec:** docs/superpowers/specs/2026-11-25-community-restructure.md

## Global Constraints
- Preserve signed governance and existing review permissions.
- No production writes, deployment, invented metrics, fabricated lineage or public internal IDs.
- Reuse existing repositories and dependencies. Preserve backward-compatible URLs.

## Task 1: Paired backend contributor and management APIs
- [x] Add meaningful failing tests for public-directory/profile privacy, repository filtering, registered maintainer validation and admin authorization.
- [x] Implement public GET v2/contributors?q=&page= and GET v2/contributors/:slug with independent maintainedPage/originalPage/updatePage query pagination. Return {contributor:{slug,name,login},sections:{maintained,original,update}} with PersonalContributions-shaped sections and only published entries. Directory returns {items:[{slug,name,login}],page,hasMore}. Slugs are stable public digests, never internal provider IDs.
- [x] Implement GET v2/admin/tools?q=&page= with {items,page,hasMore}, authenticated administrator-only, and server-side checks on all maintainer changes. Validate every assigned maintainer against registered accounts. Public Tool maintainers only show account-bound maintainers; original author credits remain untouched. Existing governance must remain functional. Add explicit lead role only if it can preserve current governance state/log invariants; otherwise document the conflicting policy rather than invent grants.
- [x] Repository-filtered contributions must match canonical project repository, retain pagination and never return other repositories. Retire direct web recording while preserving existing records/desktop contracts.
- [x] Verify backend tests/typecheck/build and supply rollout notes, no deployment.

## Task 2: Registry and submission UI
- [x] Test new global ancestry, compact repository search/order, evidence links and per-repository contribution navigation.
- [x] Move graph to Tool scope with full cross-repository parents. Remove header source/record buttons. Compact repository cards and remove hashes from normal display; retain historical details/credits and authorized actions behind disclosures.
- [x] Search and last-update sorting with pinned first; optional stars only when real data exists. Display human-readable highlights and existing benchmark/evidence links without fabricated metrics.
- [x] Retain reviewed chooser for Tool vs Update, contextual entry points, redirect legacy recording URLs. Contribution history supports repository filter.

## Task 3: Contributor, admin and website UI
- [x] Shared anchored profile sections, all three visible; independent section pagination and public-safe PersonalEntries.
- [x] Public directory and profile integrate Task 1 contract. Signed-in own profile keeps private controls; admin dashboard only renders after server authorization.
- [x] Add community governance index, guide and about/community context; simplify global navigation and logo; Request copy across board/form/errors.
- [x] Add narrowly scoped proxy routes; verify anonymous and unauthorized responses, old service fallback and mobile layout.

## Task 4: Final verification
- [x] Run all isolated registry/governance/UI suites and production builds; inspect actual desktop/mobile pages.
- [x] Fresh review of completed code and fix material findings, record backend rollout requirements and limitations.

## Progress and decisions
- Existing frontend branch is codex/community-governance; work in place without disturbing other worktrees. Paired governance API clone is clean on same-named branch; sibling backend checkout is older and must be left alone.
- Detailed user brief authorizes implementation; do not add an intermediate approval gate.


## Verification ledger
- Frontend isolated test suite passed 114/114 before final review date-sort regression; final rerun recorded below.
- Browser used the real isolated PostgreSQL governance API and current Next website. Desktop home/tool/contributor/admin screens reviewed; 390px mobile overflow checks passed for five routes; graph selection, repository search/contribution navigation, public profile privacy and all three personal sections passed; browser JavaScript errors: 0.
- Backend initial combined signed-governance/restructure/verifier run 45/45, existing compatibility 35/35, pure validation 23/23, typecheck/build passed. Final name-search/publication-date regression checks added during review.
- Review fix: legacy platform endorsements retain their provenance rather than falsely being called Maintainer Picks (failing then passing interaction test).
- Review fix: registered web versions without released_at use actual published_at as an explicitly labeled publication fallback for latest selection and date sorting (failing then passing behavior test; backend real published-row test).
- Policy limitation: no privileged Lead role is added over the existing signed majority/acceptance policy; no new global administrator grant flow is invented. See rollout notes for the decision and migration prerequisite.

- Final fresh frontend suite: 115/115 passed (`npm test`); final typecheck passed. Backend final: 47/47 focused/governance/verifier +23/23 pure +35/35 compatibility, typecheck/build passed. Backend commit 5fda840 imported into the durable sibling repository as codex/community-restructure without changing its active checkout.
- Independent review completed with no unresolved findings; both P2 diagnoses fixed with regression tests. Full report retained at /private/tmp/community-restructure-review.md.

- Final production-build browser pass against freshly copied updated PostgreSQL API passed: bound public name search, graph, repository navigation, public privacy, five mobile layouts, administration and unified own profile; zero browser JavaScript errors. Both final production builds passed. No deferred code findings.

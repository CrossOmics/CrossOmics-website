# Community Account Center Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline, with one independent final review.

**Goal:** Give members a personal home and a coherent private account area.
**Architecture:** Reuse existing authenticated/public data, add a cached account context and shared frame, and expose a verified sign-in provider from the session. Extend exact OAuth route allowlists without broadening external redirects.
**Tech Stack:** Next.js, React, TypeScript, Node tests, existing PostgreSQL fixtures.
**Spec:** docs/superpowers/specs/2026-11-26-account-center-design.md

## Global Constraints
- Settings, provider identifiers, tokens, drafts and administration remain private; public directory visibility stays activity-based.
- Existing identity binding, author credits and permission checks remain unchanged; no account linking or automatic identity merging.
- Existing mine/submission bookmarks and explicit OAuth/desktop destinations remain valid.
- No new SQL migration, dependency, automatic merge or deployment.

## Review Focus
- Anonymous/dead-session redirects retain exact private destinations without loops or open redirects.
- Google/Apple sessions never present internal member hashes as public names or claim another provider is linked.
- Empty and temporarily unavailable public profiles have different messages and no dead public-profile link.
- Admin shortcuts honor each capability; server pages/API still reject non-admin and desktop credentials.
- Account menu works with Escape, outside click, route changes and narrow screens.

### Task 1: Session metadata and OAuth destinations
- [x] Add failing tests for validated provider metadata and exact allowed account routes, preserving desktop and explicit old destinations.
- [x] Add session signInProvider and extend both return allowlists; generic login defaults to account home.
- [x] Run session/OAuth regression coverage and record RED/GREEN.

### Task 2: Private account center and signed-in menu
- [x] Add failing real Next tests for account routes, name editor relocation, sign-in status, role-based menu, old backend fallback and redirected private destinations; add menu interaction tests.
- [x] Implement cached account context, menu, shared sidebar/frame and account overview/settings/security pages. Reframe existing mine, personal submissions and administration pages, preserving pagination and backend permissions.
- [x] Move display-name/Gardener settings off contribution history into their dedicated destinations; keep clear links from history and public page.
- [x] Run the focused tests, then complete frontend suite and build.

### Task 3: Public personal home and acceptance
- [x] Improve existing public contributor home with identity and public contribution summaries, without private controls or provider IDs.
- [x] Verify owner/public/anonymous/administrator and provider variations; update guide and local fixture preview.
- [x] Perform independent whole-change review, fix material findings, run appropriate final checks, capture local acceptance and preserve preview. Commit changes; do not merge until requested.

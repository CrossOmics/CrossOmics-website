# Community Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development task by task. Steps use checkbox (`- [x]`) syntax.

**Goal:** Implement the approved governance workflows in the real Community website and PostgreSQL-backed API, using English UI.

**Architecture:** Retain existing Community web sessions, Registry v2 and its transaction/Tool locks. Add an opt-in persistent governance service and append-only signed log, public evidence endpoints, and an English explorer. Real independent witnesses, user-held signing keys and public-chain anchors are deployment/integration phases, never simulated in the production UI.

**Tech Stack:** Next 15 / React 19 / TypeScript, PostgreSQL, Node crypto Ed25519 and SHA-256.

**Spec:** ../specs/2026-11-21-governance-transparency-spec.md, ../specs/2026-11-21-governance-lineage-design.md; user's instruction to implement directly and use English.

## Global constraints

- No browser-local keys, synthetic accounts or resettable logs in real Community pages.
- Backend repository: <backend checkout> (isolated checkout of backend origin/main 8b36c5f).
- Frontend: <frontend checkout>, branch codex/community-governance; retain previous Registry PR branch unchanged.
- Both repositories keep secrets out of the browser; production signing requires explicit configured key and log identity. No production database migrations or deployment automatically.
- Public log excludes session tokens, provider subject IDs, private invitation IDs, draft payloads and email addresses. Use stable public account digests.
- Service signatures attest the authenticated backend's record, not personal user signatures. No independent-witness or blockchain guarantee without those actual integrations.

## Review focus

- Anonymous public read must never expose private account bindings or drafts.
- Voting uses the exact member snapshot, strict majority and candidate acceptance; membership changes invalidate old proposals even after ABA.
- Old maintainer-assignment endpoints cannot bypass acceptance once governance is enabled.
- Every public state mutation must append its signed event in the same transaction; signer failure rolls back business changes.
- Replays, stale versions and concurrent writes must not produce duplicate events or reuse approvals.

## Task 1: Contract, signing and proofs

- [x] Define the public event/state/command contract and reusable signing/proof module.
- [x] Write failing tests for canonicalization, event/checkpoint signatures, non-power-of-two Merkle trees, tamper/truncation and externally pinned trust.
- [x] Implement deterministic hashes, Ed25519 signing and proof verification; run tests.

## Task 2: Persistent governance and existing mutation integration

- [x] Migration for state, private account bindings, idempotent commands, events and checkpoints; runtime cannot update/delete log rows.
- [x] Pure governance transitions with tests for invitation acceptance, majority, handoff, removal, leaving, emergency revocation, Tool scope and concurrency versions.
- [x] PostgreSQL transaction adapter: expected-version checks, command replay, current admin authorization, state/catalog projection and atomic signed append.
- [x] Public read/proof/trust endpoints and authenticated commands; capability gating; incorporate metadata, publication, withdrawal and legacy credit changes into public log. Gate legacy binding writes and prevent self-review.
- [x] Real isolated PostgreSQL/API integration tests, backend typecheck/build and existing tests.

## Task 3: English Community UI

- [x] Add real Tool governance explorer and command forms using contract; no demo imports.
- [x] Provide public event detail, governance dependencies, repository context, proof download/verification and honest storage/assurance states.
- [x] Extend proxy allowlist narrowly; link Tool/manage pages and source repository cards to governance.
- [x] Test anonymous access, capability-unavailable fallback, vote/accept flows, stale links and secret-free output. Run frontend tests/build and browser desktop/mobile checks.

## Task 4: English demo and delivery

- [x] Translate demo runtime strings and fixture reasons into English; preserve behavior and regenerate local demo evidence only.
- [x] Keep matching source copies, publish updated private demo after checks.
- [x] Independent whole-change review; fix material findings; document key provisioning/migration/rollback and remaining deployment prerequisites.

## Execution ledger

User approved demo/spec and requested implementation directly; no further design approval is needed. Native backend worktree creation did not return after several minutes and was terminated; Git worktree list confirmed no new worktree. A separate local clone under /private/tmp provides isolation without altering the user's backend checkout.

## Verification and review result

- Crypto: Ed25519/Merkle/checkpoint implementation reviewed independently; invalid persisted signatures now fail before re-attestation. Offline CLI requires separately pinned trust and optionally checks a retained checkpoint for rollback.
- Policy/storage: reviewed invitation/majority/acceptance, ABA, stale credits, private bindings, lock ordering and receipt recovery. Fixed signed emergency trust registration, publication with the emergency private key offline, receipt-time admin snapshots and insertion-ordered receipt publication. Added scoped Update queue/detail and consistent Repository-to-Tool locks.
- Frontend: independent review found target serialization and stale asynchronous trust-result issues; both fixed with failing-then-passing interaction tests. Private moderation data is projected before rendering to exclude provider IDs from SSR/RSC output.
- Verification: frontend build and typecheck; 78 isolated frontend/Registry submission checks, 15 Registry checks and 15 governance checks. Backend build/typecheck; 39 crypto/policy/verifier/Registry-input checks; 14 real PostgreSQL/API scenarios. Existing isolated login/Registry/bounty/import/maintenance harness passed. Demo 14 tests passed, English update published to same owner-private URL.
- Browser: real local API + English Community UI verified anonymously, proof check passed, desktop/mobile layout checked, candidate accepted before role assignment and then saved a fixed-version recommendation through the real proxy. A screenshot records the public log. No production account, database, key or permission was modified.

Ruling: deliver service-signed P1 and explicitly expose absent independent witnesses/user signing/blockchain; operational P2/P3 controls require real operators and provisioning rather than simulated production proofs. No claim of operator resistance or global catalog state root. Rollout documentation records fixed-key recovery, full-tree scaling limits, live-source observations and observed global-admin snapshots.
Ruling: user requested implementation directly; proceed without another design approval. Prepared paired review branches; production activation remains a separate owner rollout.

Compatibility: preserved the previously approved repository-level NuSTAR administrator pin even before a NuSTAR version is registered. Repository filters canonicalize GitHub owner/repository case and include the migration baseline.

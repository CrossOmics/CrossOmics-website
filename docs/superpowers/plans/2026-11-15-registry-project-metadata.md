# Registry project metadata implementation plan

> Use superpowers:executing-plans for inline implementation; review the complete change once.

Goal: optional metadata survives registration/review and empty values disappear; STAR is updated in place after deployment.
Architecture: Next.js form → existing authenticated proxy → validated JSON payload → PostgreSQL metadata, plus audited admin corrections.
Spec: ../specs/2026-11-15-registry-project-metadata.md

## Constraints and review focus
- Four optional string arrays, maximum 20 items × 120 Unicode characters; no controls or malformed Unicode. Empty arrays explicitly clear, omitted arrays preserve existing values.
- Existing clients and old payloads remain compatible; duplicate commits remain rejected.
- Metadata cannot change without admin review/correction and same-origin web authentication.
- Production update is separate from code verification; never forge a session or delete/re-register STAR.
- Validate least-privilege runtime grants and transactional audit failure rollback.

## Tasks
- [x] Backend tests first: parser normalization/errors/omission, publish and reviewed update persistence, admin-only correction/clearing/alias handling, preserved versions and audit, runtime grants. Run RED.
- [x] Extend registry-v2-input.ts and registry-v2.ts; add catalog/[id]/metadata route, SQL003 + fresh Compose mount, narrow runtime grant and migration helper. Run local isolated PostgreSQL/API tests GREEN.
- [x] Frontend tests first: optional fields, review display, public partial/empty fields, admin correction controls and proxy allowlist. Run RED.
- [x] Shared RegistryMetadataFields/RegistryMetadata display, registration/review integration, admin correction, types/proxy. Run GREEN and builds.
- [ ] Verify STAR details against official manual; prepare exact metadata and rollout instructions/Postman request. Review/commit/push two feature branches and PRs. Update the actual STAR only after the new backend is deployed via the real signed-in browser.

## Progress
- Existing linked worktrees clean; both branches based on origin/main (bounty PRs merged).

## Verification ledger
- Parser RED: metadata absent; correction parser missing. GREEN: normalization, bounds, optional omission and explicit clearing.
- API RED: published metadata empty. GREEN: isolated API/DB tests as community_runtime, 9 Registry/bounty tests + 5 legacy/login + 3 reset tests; audit contents and narrow runtime grants checked via owner fixture.
- Frontend RED: optional fields missing, empty values visible, metadata proxy returns 404. GREEN: 31 tests including review fixes.
- Both production builds passed; 9 backend unit tests passed.
- Browser local fixture: new registration serializes trimmed/deduplicated lists and empty arrays; history shows supplied fields only; admin save refreshes detail with four values; initial empty detail has no metadata/section. Screenshots /tmp/registry-metadata-empty.png and /tmp/registry-metadata-filled.png. No local test mutated production.
- Ruling: supplement published STAR in place rather than re-registering: source+commit deduplication correctly blocks duplicate origins; existing version/contribution references must survive.
- Production STAR update remains dependent on operator deployment of the new API/SQL003. No SSH access; operator has elected to deploy manually.

- Final review found two important issues, both fixed: untouched prefilled fields could overwrite an admin correction when a later version publishes; semicolon-delimited UI could split valid metadata strings. RED→GREEN tests now require unchanged fields to be omitted and explicit clears retained, and one-value-per-line editing preserves semicolons.

- Final browser regression confirms untouched metadata keys are absent from later-version POST payload. Final rerun: 31 frontend tests + 9 backend unit tests + 17 isolated integration/reset tests, all green; both production builds passed. No deferred minor findings.

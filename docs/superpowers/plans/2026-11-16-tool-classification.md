# Unified Tool classification implementation plan

> Use superpowers:executing-plans; independent backend implementation and one final review can be delegated.

Goal: Tool-only registry and a consistent Original/Update classification across registration, versions and contributions.
Architecture: canonical public taxonomy with legacy storage adapters; no row deletion or ID migration. Shared classification definitions per repo drive menus and backend validation.
Spec: ../specs/2026-11-16-tool-classification.md

## Tasks
- [x] Backend: establish canonical taxonomy; preserve existing storage keys; update registry parsing/presentation/filtering and kind enforcement; unify Contribution parsing/read/write. Extend isolated DB/API and parser regressions, RED→GREEN. Document deployment and legacy compatibility.
- [x] Frontend: reusable Tool type constant/normalizer; tool-only catalog and forms; replace Project vocabulary; unify contribution menu/remove item-kind selector; normalize transitional API responses; regression tests and production build.
- [x] Verify both independently, browser-test forms/filter/history against disposable fixtures, final review.
- [ ] Push frontend PR; backend PR #9 is open. Production deployment remains operator-managed.

## Review focus
- Legacy improved/fix and contribution subtypes must normalize to Update, not disappear.
- Update filter must include legacy subtypes; Original selection must retain no-parent semantics.
- Do not delete workflows or change IDs while hiding them from the Tool catalog.
- Evidence deduplication, idempotent registration replay and manual contribution ownership stay intact.
- Frontend must work with legacy responses during rollout; request aliases support either backend generation.

## Review fixes
- Missing/empty-kind legacy tools remain visible; explicit workflow/algorithm kinds stay hidden. Regression RED→GREEN.
- Preserve legacy request aliases in the new UI so frontend-first deployment works against either backend; old response values normalize on reads. New backend returns canonical types plus legacy metadata.

- Transitional catalog filters run over normalized returned versions in the frontend, so Original works against the old API and Update includes improved/fix versions before backend rollout. New API clients can use the canonical server filter. Regression RED→GREEN.

## Verification
- Frontend: 38 regression tests passed; production build passed.
- Backend: 8 parser tests, isolated PostgreSQL/API fixture (12 registry/bounty, 6 legacy, 3 reset checks), production build passed.
- Browser: local production build verified Original and Update form submissions and request payloads; separate Contribution submission; Original/Update directory filtering; workflow fixture exclusion. No production data was changed.
- Review rulings: missing-kind legacy tools remain readable; v1 catalog preserves kind and adds canonical type; frontend-first deployment uses legacy-compatible write aliases and normalizes types before filtering. Existing database keys and IDs remain intact.

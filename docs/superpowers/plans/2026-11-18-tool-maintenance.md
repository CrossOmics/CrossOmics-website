# Tool maintenance implementation plan

Goal: Original-only Tool discovery, personal contribution groups, Tool-level maintenance and up to two recommended versions.
Architecture: additive backend model with explicit Community ID authority, and server-rendered UI over existing authenticated proxy. Preserve separate contribution and registration writes.
Spec: ../specs/2026-11-18-tool-maintenance.md

- [x] Builder check spec and freeze contracts; backend and frontend implementation can be delegated by independent repository domain.
- [ ] Backend: additive idempotent SQL + runtime grants/operator script; migrate Tool-level display credits without automatic privileges; authenticated management/personal APIs; atomic recommendations/revocation/withdrawal; isolated runtime-role API and migration tests, production build.
- [x] Frontend: shared types/services/proxy/return routes; Original-only Search Tools home; Tool-level maintainers and sorted recommended versions/contextual actions; paginated My Contributions groups; protected management page with metadata/recommendations/admin assignments. RED→GREEN regressions and production build.
- [ ] Final independent whole-change review, fix Important findings once with regression proof; browser verify desktop/mobile; publish separate PRs and exact migration/deploy instructions. No production mutations, no automatic merges/deployment.

## Verification ledger
- Frontend RED: 5 regressions failed for Original-only search, Tool-level maintainers/recommendations, personal grouping, and protected management routing. First GREEN44; expanded proxy bearer-rejection regression failed before its fix, final suite47 passed. Production build passed.
- Browser (disposable local fixtures): personal tabs, Tool management metadata/maintainer/recommendation forms, submitted JSON payloads, top two recommendations and third-checkbox limit, and390px personal/management layouts without horizontal overflow. No production data or account permissions changed.
- Final independent reviewer found one Important issue: author-only legacy credit corrections must preserve an empty version-maintainer list. Backend fix is undergoing RED→GREEN proof; public Tool credits must remain unchanged. No other Critical/Important findings.
- Ruling: new frontend preserves PR34 navigation/footer changes in its ancestry. Existing backend API consumers retain version credits; public new UI uses authoritative global Tool credits and no per-version maintainer editing.
- Ruling: metadata/recommendation permissions require a web session and reject bearer headers at both proxy and backend. Historical data continues to render when the new backend endpoints are absent.

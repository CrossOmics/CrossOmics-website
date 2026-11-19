# Update author credits implementation plan

Goal: distinguish NuSTAR's developers from STAR's upstream authors throughout registration and publication.
Spec: ../specs/2026-11-18-update-author-credits.md
Architecture: additive typed JSON credits, existing authenticated/reviewed publishing flow, explicit rollout capability.

- [x] Backend: failing validation and runtime tests for distinct credits, invalid/empty credits, parent snapshotting, idempotent replay, legacy requests and publication. Add validated updateAuthors, capability, parent-credit snapshot and version metadata persistence. Run unit and isolated PostgreSQL/API suites plus an env-free build.
- [x] Frontend: failing SSR tests for empty required Update author input, read-only upstream context, separate citation, backend rollout gate and distinct detail/review display. Implement conditional form, payload/types/capability and display. Check real browser input and captured submission payload across Tool/type/parent changes. Run frontend suites and build.
- [ ] Final review: inspect both diffs with one fresh reviewer, fix material findings with regressions, verify desktop/mobile screenshots, open paired PRs and document backend-first Docker rebuild without new SQL scripts.

Constraints: keep Original registration intact; support old client payloads and old catalog records; preserve signed-in identity and maintainers; never mutate production data during verification; exclude private env files from local fixtures.

Review findings and rulings: the fresh reviewer identified immediate-parent Update authors being skipped, stale-form loss on backend downgrade, and legacy citation/maintainer display changes. Each was reproduced before the fix. Parent attribution is now shown only for the selected eligible version; new forms send authors: [] and the server snapshots credits. Legacy history uses neutral recorded-credit labels and retains nonempty maintainer credits. Pending new-format reviews must stay on the capable backend during any downgrade (backend runbook). Correcting already-published native Updates remains outside this registration fix; old rows are preserved rather than guessing developer attribution.

Verification note: the independent legacy test:community smoke command was attempted without its required local services on ports 3017/4100, producing four connection-refused failures and four conditional skips. It is not used as passing evidence. The self-contained Registry SSR suite and isolated PostgreSQL/API suite provide the relevant regressions; production builds are verified separately.

Final verification: frontend 50/50 isolated SSR and helper tests; backend 18/18 unit and 30/30 isolated runtime-role PostgreSQL/API tests. Both production builds pass. Local browser verified empty required Update authors, three-version parent attribution, independent Original/Update input state, preserved typed citation, 390px layout without document overflow, successful submission and captured authors: [] / updateAuthors payload.

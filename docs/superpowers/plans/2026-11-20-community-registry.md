# Community Registry Implementation Plan

> **For agentic workers:** Execute inline using the existing checkout. Steps use checkbox syntax for tracking.

**Goal:** Integrate maintenance ranking and show repository-based Versions with NuSTAR pinned.

**Architecture:** Keep the existing catalog service; add pure repository grouping and ranking projections. Render ranking and repository lineage as native Community pages/components. Curated configuration supplements the upstream registry until NuSTAR is registered there.

**Tech Stack:** Next.js 15, React 19, TypeScript, existing CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-20-community-registry-design.md`

## Global Constraints

- Preserve existing branding and original repository metrics.
- One latest update per repository card; lineage parents stay within the repository.
- Pin BioCode-Commons/NuSTAR for cp_star only; no new dependencies or deployment.

## Review Focus

- Equivalent GitHub URLs must produce one repository card.
- Unsorted, withdrawn or undated versions must not displace a newer active version.
- Cross-repository parents and cycles must not create misleading lineage or hangs.
- Missing metrics are unranked; score zero remains eligible.
- GitHub failure must retain usable NuSTAR data and the original STAR card.

### Task 1: Repository versions

- [x] Add failing behavior tests for grouping, latest selection, pinning and lineage isolation.
- [x] Export registry version/repository types; implement curated NuSTAR configuration and repository grouping.
- [x] Add cached latest-commit enrichment with a verified snapshot fallback.
- [x] Replace flat Versions with repository cards and expandable lineage.
- [x] Run repository behavior tests and type checks.

### Task 2: Native maintenance ranking

- [x] Add failing tests for ranking partitions, zero scores and citation years.
- [x] Carry optional registry metadata through the service; implement ranking projection.
- [x] Render native ranking, stable and excluded sections with methodology and internal tool links.
- [x] Update Community navigation, Registry and tutorial links, CSS and README.
- [x] Run behavior tests, builds and available integration/browser checks; review final diff.

## Validation

- `npm run test:registry`: 10 passed, including review regressions for shared commits and HTTP GitHub aliases.
- `npm run test:community`: 5 passed; 4 OAuth/database-dependent tests skipped because test credentials were not configured.
- Website production build and Community server TypeScript check passed.
- Browser verified NuSTAR pinning, original STAR lineage expansion, native ranking, and 390px responsive layouts without whole-page horizontal overflow.
- Final review findings corrected; no dependencies added or deployment performed.

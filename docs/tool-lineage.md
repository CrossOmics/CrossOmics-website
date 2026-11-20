# Tool version lineage

The Tool detail page now offers **View lineage** alongside the existing version list. Connections follow saved parent version IDs, including branches and withdrawn ancestry. Selecting a node renders the same full detail card as the list, preserving author/citation metadata, recommendation markers and authorized admin controls.

Controls: **− / +** (10%–200%), **Fit to view**, **Reset** (100%), drag to pan, pinch to zoom. Tab reaches version buttons; focused offscreen buttons are brought into view for keyboard navigation, and arrow keys pan the canvas itself. The caption is “Select a version to view details”.

Missing/cyclic parents stay visible with a warning, without fabricated connecting links or self-parent claims. Author roles remain neutral when ancestry is unavailable. No backend change, database migration, new credentials or npm dependency is required.

## Verification

- `npm run test:registry-submit`: 59/59 pass, including seven pure layout/gesture tests and real Next detail-page tests. Covered out-of-order branches, cycle/orphan relationships, a 5,000-version chain, fit/zoom bounds and anchored pinch/pan calculations.
- `npm run build`: pass.
- Built-in browser, production build: STAR → NuSTAR selection and full details; list toggle; 100% → 80% → 100%; Fit and Reset; a 34-version, eight-branch local fixture; drag preserving selection; node-origin drag; keyboard selection after drag; withdrawn state; clipped-node tap; 390px layout without body overflow. No browser console errors.
- Physical-device pinch was not exercised; gesture math is covered by unit tests.
- `npm run test:community` was attempted without the prerequisite services on localhost:3017/4100. Four tests failed with ECONNREFUSED: “registry discovery returns real catalog records without signing in”, “publishing and personal history require authentication”, “community tracker is reachable from the existing site”, and “Google and Apple callbacks reject an attempt started for the other provider”. Four credential/database-dependent tests skipped. These results are not counted as passing.

An independent final review identified node-origin drag, malformed ancestry labels, and pointer focus moving a clipped node before click. The fixes were verified RED→GREEN and the complete 59-test registry suite rerun; no deferred code findings remain.

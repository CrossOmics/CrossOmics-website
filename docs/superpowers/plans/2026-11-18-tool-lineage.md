# Tool version lineage implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the approved interactive version lineage with large-graph navigation.
**Architecture:** Pure iterative forest layout plus a React client canvas. Server-rendered version cards supply both list and selected detail without duplicating attribution or admin logic.
**Tech Stack:** Existing Next.js 15, React 19, TypeScript, SVG and pointer events; no new dependencies.
**Spec:** docs/superpowers/specs/2026-11-18-tool-lineage-design.md

## Global constraints
- Existing backend and database contract; no migration.
- All version IDs, authored credits, recommendation/withdrawn status and admin actions are preserved.
- Controls: 10%–200% zoom, Reset (100%), Fit to view; drag/pinch navigation.
- Caption: Select a version to view details.

## Review focus
- Cycle/missing parent must not invent root ancestry or hide a version.
- Long branches must not overflow the JS call stack.
- Recommendation sorting must not determine graph ancestry.
- Pan/zoom must not activate a version when completing a drag/pinch.
- Keyboard focus and mobile controls must expose offscreen nodes.

### Task 1: Version lineage, integration and navigation
**Files:** Create lib/community/lineage.ts, app/community/catalog/[id]/VersionLineage.tsx and its CSS module; modify detail page, package.json and registry rendering tests; create tests/lineage.mjs.
**Interfaces:** buildLineage(versions) returns nodes (id,x,y,issue), edges and bounds; fitLineage(bounds, viewport) returns scale/x/y; zoomLineage(view, scale, anchor) preserves anchor. Client receives versions/recommended IDs and server version-detail slots.

- [x] Write failing behavior tests for branched/out-of-order parents, cycles/orphans, a long chain, anchored zoom and bounded fit; add a real Next detail assertion for the lineage entry.
- [x] Run node --test tests/lineage.mjs and npm run test:registry-submit; expect failures because lineage is absent.
- [x] Implement iterative layout, accessible node selection and zoom/pan controls; integrate existing cards as server slots.
- [x] Run npm run test:registry-submit and npm run build; expect all relevant tests and build to pass. Run legacy test:community and report environmental failures if prerequisites are unavailable.
- [x] Use the built-in browser against local real frontend/controlled API data to exercise actual, branched and narrow-screen cases; save screenshots.
- [x] Review complete change, fix material findings, record verification and create a reviewable frontend PR.

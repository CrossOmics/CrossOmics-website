# Governance Lineage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Explain a governance action's authorization and repository target in the existing interactive demo.

**Architecture:** Build a read-only projection from existing signed events; do not modify the ledger/signatures. Render linked dependency lanes alongside the event inspector. Retain existing private hosting.

**Tech Stack:** Buildless ES modules, Web Crypto, node:test, existing CSS.

**Spec:** docs/superpowers/specs/2026-11-21-governance-lineage-design.md

## Global Constraints

Browser-local simulation, no real blockchain transactions or shared persistence. No fabricated source ancestry. Preserve Site identity/audience and existing governance behavior.

## Review Focus

- A historical recommendation keeps its original authorization after that maintainer leaves.
- Transferred maintainers depend on the threshold vote and acceptance; candidate cannot self-authorize.
- Missing/cross-Tool grants display incomplete evidence rather than borrow a current role.
- Repository recommendations never imply a commit pin.
- Stale hash links from another browser/session display unavailable evidence.

### Task 1: Read-only lineage projection

**Files:** Create dist/lineage.mjs; extend tests.mjs in the demo.

**Interfaces:** buildLineage(events, selectedHash) => {nodes, edges, missing, target, selected}; eventRoute(tab, hash), parseRoute(hash, events) => {tab, index, unavailable}.

- [x] Add failing tests for the five review conditions, plus unrelated event isolation.
- [x] Run node --test tests.mjs; expect missing-module failure.
- [x] Project dependencies using historical active grants and proposal IDs, scoped to cp_star; distinguish prior Hash from causal edges. Resolve exact signed recommendation commit only.
- [x] Run node --test tests.mjs; expect all pass.

### Task 2: Interactive explorer and evidence context

**Files:** Modify dist/app.mjs, index.html, styles.css; README.md and spec.md.

**Interfaces:** Consume buildLineage and routing functions; preserve ledger API.

- [x] Add lineage tab, selected event selector, dependency buttons, repository context, anchor explanation, and view-record/download/verify actions.
- [x] Add event hash session links with unavailable state and explicit no-shared-history wording.
- [x] Check all modules with node --check; run node --test tests.mjs.
- [x] Browser-check desktop/mobile, historical grant navigation, proposal path and proof verification.

### Task 3: Review and publish

- [x] Fresh reviewer checks changed source, test coverage, evidence claims and accessible navigation; fix material findings.
- [x] Sync demo copies and append spec addendum to editable Page where supported.
- [x] Run demo suite, package exact pushed Site source, deploy to same audience; confirm terminal deployment URL.

## Execution ledger

Baseline: existing 8 tests pass in isolated demo checkout. Existing demo lives in a dedicated /private/tmp Site source checkout, separate from Community PR. Retain that isolation; publishing uses its configured source branch. User approved continuation of the previously described lineage design. No change to Community PR or audience is authorized by this extension.

Task 1 complete: baseline 8/8; added 5 behavior tests, observed missing-module failure, implemented projection, suite 13/13 passes. Historical grants and session links covered.
Task 2 in progress: lineage tab, dependency links, repository evidence context, private/demo storage disclosure and session routes implemented. node --check passes for app and lineage modules. Local browser confirmed recommendation → historical grant navigation.

Task 2 complete: Node module checks and suite 14/14 pass. Desktop/mobile UI checked; original evidence passes and tampered evidence fails. Handoff plus successor repository recommendation exercised.
Final review: independent reviewer found missing threshold vote warnings and stale-route download; missing-vote test observed RED then GREEN; stale-route browser check observed download enabled then disabled after fix. Keyboard focus returns to selector and recommendation shortcut wording corrected. No unresolved findings.
Task 3: Spec Page updated to revision 0.2, sequence 4, read back; preparing source package and deployment.

Task 3 complete: private Site published successfully from 9095d7616ca4fc6b0ec4422aed839acd75916bcb, deployment appgdep_6b026d971024819183b3feb9a780eb38. Hosted lineage UI observed and screenshot saved. Same owner-only audience retained. Community PR source/branch not changed; demo and spec copies remain local untracked additions.

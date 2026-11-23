# Governance lineage explorer

Extends the accepted governance transparency spec and the user's approval to continue the demo. Community members need to inspect why an action was authorized and what repository/version it affected.

## Approach

Retain the current buildless browser demo. Add a deterministic projection of signed events into a governance dependency graph and an interactive lineage tab. A chronological hash chain alone cannot explain authorization. A production blockchain backend is a later phase: this extension must not imply it exists.

## Behavior

- Each event links to its applicable policy, the actor's active grant at that historical point, and relevant proposal/votes/acceptance. Follow earlier dependencies recursively; exclude unrelated later grants, revoked grants and cross-Tool events. Admin authority is an explicitly disclosed demo trust-root assumption.
- Distinguish authorization, proposal, vote, candidate acceptance and policy edges from the global previous-event Hash. Missing references show incomplete evidence, never an invented grant.
- Selected event inspector provides lineage, session-only event links, checkpoint root, full Hash and evidence download. Hash URLs must show an unavailable state after a session reset rather than silently select another event. No claim of permanent shared links.
- Repository context links to the exact recommended commit when version-scoped; repository-scoped recommendation explicitly has no fixed version. Show relevant recommendation/pick history, clearly separate from source-code lineage; link to upstream commits for real source history. Do not fabricate commit ancestry or infer STAR/NuSTAR parentage without evidence.
- Public-access explainer: production anonymous explorer; present demo hosted privately, browser-local, no real chain tx or independent witnesses. Display “未接入公链” with no fake explorer URL.
- Preserve existing mutation and verification flows and audience. Use current navy/blue/system CJK typography, keyboard buttons and responsive vertical dependency lanes.

## Verification

Exercise historical grants after handoff, votes and candidate acceptance, missing/cross-Tool evidence, hash links from another session, version-vs-repository targets. Verify original/tampered proof flow, desktop/mobile lineage navigation and redeploy the same private Site.

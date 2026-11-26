# Community restructure rollout

This change updates the Community website and its paired API. No production deployment or database write is performed by the implementation.

## Shipped behavior

- Tool-wide lineage includes recorded cross-repository parents. Compact repository cards have independent contribution links, highlights, current evidence links, searchable names and newest-update sorting with picks first. Registered versions without a release date use their actual publication timestamp, labeled Latest publication. GitHub-star sorting appears only when actual repository star counts are supplied. No benchmark figures or verification claims are invented.
- Reviewed Tool and Update submissions replace direct web self-recording. `/community/submit` remains a small public chooser; old `mode=record` URLs redirect to reviewed registration, preserving a selected Tool. Direct web POSTs to the old recording endpoint return 410; existing records and desktop contracts remain available.
- Public `/community/contributors` searches public names/usernames; `/community/contributors/{public slug}` shares three anchored profile sections with `/community/mine`. Each section paginates independently. Public profiles exclude private drafts, provider/internal account IDs and management controls.
- `/community/admin` requires the existing platform administrator capability and uses an administrator-authorized API to list/manage tools. Existing Tool management and signed invitation/proposal workflows remain authoritative.
- Original author credits are distinct from Community maintainers. New submissions record authors; maintainer assignment binds an actual registered account afterward. Unbound historical names no longer appear as current Tool maintainers. Historical version credits remain intact, including STAR author credits.
- Community-level Public Governance, User Guide, Community overview and Who We Are pages explain the platform. Header GitHub CTA is removed; the new logo represents connected contributions. Tools Wanted uses Request vocabulary and retains existing URLs/storage.

## Backend source and activation

The compatible API is in `/private/tmp/crossomics-governance-api-20261122`, branch `codex/community-restructure`, based on the previous governance implementation. The branch has also been imported into the durable repository at `../CrossOmics-website-backend` as `codex/community-restructure`. Its older active checkout and existing untracked files were left untouched.

Read that backend's `docs/community-restructure-rollout.md` and apply its additive `db/006-community-contributors.sql` migration using the owner migration helper before deploying the backend, then this frontend. Registered-account observation/backfill never derives identity from original author display credits. Preserve all existing OAuth/session, database and signed-log keys/settings. The earlier governance rollout prerequisites still apply; see `docs/governance-rollout.md`.

Older services show unavailable directory/admin notices rather than fabricated members. Newly submitted tools no longer include free-text maintainer credits, so deploy the paired backend before enabling this frontend's submission form.

## Policy decisions retained

- Maintainer Picks use existing tool-scoped recommendation authority. Historical administrator endorsements remain recorded under their existing signed action and are labeled Platform endorsement in governance; no historical event is rewritten.
- Signed governance currently uses membership proposals, majority votes and candidate acceptance. A privileged Lead Maintainer able to remove members unilaterally conflicts with that existing policy. This update does not introduce that authority; a versioned policy change is required to resolve it. Tool maintainers can use existing invitations/proposals, and administrators retain audited revocation authority.
- Existing review permissions and self-review prevention remain unchanged. The dashboard does not grant new global administrator privileges; its Role Management sketch was not a finalized permission-grant policy.
- Benchmark integration follows existing external evidence links. Automatic JSON metric ingestion is not added without a confirmed source/schema. Formal verification remains unclaimed.

## Verification

`npm test` runs the isolated fixture-backed website, component, registry and governance suites. `npm run build` checks the production build. Final website run: 115 tests passed; backend runs: 47 focused/governance/verifier, 23 pure checks, 35 existing compatibility cases passed. Both typechecks and production builds passed. The backend has separate real-PostgreSQL tests for profile privacy, registration binding, repository filtering and server authorization, alongside its existing signed-governance and compatibility tests.

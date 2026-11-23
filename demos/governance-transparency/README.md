# CrossOmics governance demo

Browser-only review prototype. No Community account or production permission is changed. Actor keys, log key and both witness keys are generated in the same browser; they do not establish real identities or independent witness operation. Refreshing resets all state.

The interface, seeded event reasons, verification results, and exported evidence notes are in English. The document language is `en` and displayed times use `en-US`. User-entered public reasons retain their original language; no language restriction is applied. Longer labels wrap or scroll within the existing responsive layout.

The authoritative implementation spec is in `../../docs/superpowers/specs/2026-11-21-governance-transparency-spec.md`. The editable review copy is https://chatgpt.com/space/page_c73051fc75948191b5f013ceeaccd6d7.

Private hosted review demo: https://crossomics-governance-demo.fantasticode32.chatgpt.site

## Run locally

```sh
python3 -m http.server 3026 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:3026/`. Web Crypto requires a secure context (HTTPS or loopback).

## Test

```sh
node --test tests.mjs
```

Requires a recent Node.js with global Web Crypto (the tests were run on Node.js 24). No third-party dependencies or build step.

## Review paths

- Select a public event to inspect the before/after change and signed original.
- Verify an original record, alter a copy, or truncate a copy; download the evidence bundle and separately inspect the demo trust roots.
- As AAA, propose transferring maintenance to CCC. As BBB, approve; as CCC, accept. AAA then loses management rights.
- As administrator, invite a new maintainer. The candidate must accept before gaining rights.
- Try changing BWA from the STAR management view; the attempt is rejected and no successful event is appended.

SHA-256, ECDSA P-256 signatures and Merkle inclusion proofs actually run. Append-only consistency is checked by full history replay. The verifier compares with the current session's separately retained checkpoint to reject rollback to an older, otherwise valid history. Production requires independently pinned trust roots, real user confirmation and independent witnesses, as defined in the spec.

## Governance lineage extension

The governance lineage tab derives historical authorization, proposal and vote dependencies from recorded events. Click dependencies to inspect their originals; verify them separately. Missing threshold votes and cross-Tool grants show incomplete evidence. Repository context links to a signed fixed commit only for version recommendations and to upstream history; the demo does not import source commit ancestry.

Event links contain the full event Hash and work only within the generating browser session. Reset/refresh creates a different log; unavailable links disable evidence download until a local record is explicitly selected. No real blockchain transactions, shared persistent history or independent witnesses are present. The hosted Site audience remains private.

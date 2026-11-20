# Community navigation implementation plan

Goal: make tool discovery, maintenance, wanted tools and contribution submission understandable without duplicate homepage actions.
Architecture: shared navigation labels with existing routes; preserve existing persistence and authentication behavior.
Spec: ../specs/2026-11-18-community-navigation.md

- [x] Update shared navigation, active destinations, footer history label and homepage actions. Verify anonymous and authenticated states and small screens.
- [x] Preserve the previously confirmed separate-registration model behind one explained submission hub; retain catalog selection and sign-in return destinations.
- [x] Run existing regression suite and production build, inspect browser behavior, publish a frontend PR.

Verification: 41 regression tests and production build passed. Browser checks covered the unified submission entry, both existing form branches, desktop layout and 390px mobile layout without horizontal overflow. Tests preserve Google/Apple/GitHub access, selected Tool IDs and record-mode login return destinations. Existing backend writes remain separate; no production data changed.

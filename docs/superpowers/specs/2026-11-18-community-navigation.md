# Community navigation clarification

User-supplied screenshots request task-oriented navigation and removal of duplicate submission actions. Primary destinations: Submit a Contribution, Explore Existing Tools, Maintenance Needed, Tools Wanted. Maintenance Needed opens the existing external maintenance ranking; Tools Wanted opens the bounty board. The homepage should present tool discovery without a second Register a tool button or maintenance ranking link. Contribution history remains accessible from existing history/detail links and an explicitly named footer link.

Submission behavior follows the user’s earlier confirmed separate-registration rule: the existing reviewed tool registration and directly published contribution record are separate operations. The unified submission page explains both choices and links to the existing reviewed Tool form or directly published record form. Do not merge writes, create automatic contribution credit, or remove existing history. Authentication, ownership, review and API contracts remain intact.

Implementation uses existing Next.js pages, shared navigation definitions and responsive CSS. No backend or database change is needed for the agreed navigation changes.

User follow-up: remove the repeated footer brand and GitHub link. Keep useful footer destinations, Gardener, and the copyright line; retain the main header identity/home link. Shorten redundant brand mentions in explanatory and fallback-page copy.

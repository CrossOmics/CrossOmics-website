# Tool-only Community and unified classification

User request: rename Project to Tool across the catalog/registration experience; list only tools (STAR/StringTie, no workflows); use only Original and Update, where Update includes performance improvements and bug fixes; make Contribution use the same classification.

User-confirmed scope: unify classification, keep tool registration/moderation and manual contribution evidence as separate operations. Do not automatically create contribution records.

Public API and UI canonical types are `original` and `update`. Share one classification constant and legacy normalization helper per repository. Original maps from origin/new_pipeline/original; Update maps from improved/fix/update/algorithm_update/bug_fix/optimization/maintenance. Reject unknown types. Historical metadata/IDs/source commits/credits/impact and evidence deduplication must survive. Keep existing PostgreSQL storage enum keys internal for compatibility; no destructive data migration is needed. Normalize at API boundaries and map new writes into existing storage keys. Preserve old keys in legacyType response metadata when needed.

Only tools enter the catalog: new registry metadata has kind=tool; reject explicit workflow/algorithm kind. Exclude imported workflows from public catalog and detail APIs without deleting them. Legacy directory routes must not offer workflows either. Existing unknown-kind project registrations are tools under the new model. Keep cp_/cv_ identifiers and pipelineId wire field names to avoid breaking references.

Tool creation and tool versions retain administrator review. Update requires a published parent and change summary. All Update subclasses are described in the summary, not separate top-level options. Contribution records use the same Original/Update menu and tool name/URL; remove its item-kind selector and submit subjectKind=tool. Historical subject-kind data remains readable without mislabelling workflows as tools. Registering a Tool does not automatically prove authorship or create contribution credit.

Bounties and ranking-source taxonomy are outside this requested Tool directory change. Retain their independent categories and existing historical records.

Approach: normalize the API/model and reuse shared type definitions, rather than changing labels alone (which leaves behavior inconsistent) or rewriting/deleting stored history (unnecessary data loss). Deploy the frontend first using legacy-compatible request aliases, then deploy the backend; no SQL or OAuth changes. Tests prove normalization, Update filtering of all legacy update subtypes, parent validation, tool-only catalog, contribution write/read consistency and preserved evidence/impact IDs.

Rollout adapter: new UI writes original as Registry origin / Contribution new_pipeline and Update as Registry update / Contribution algorithm_update. These requests work with both backend generations; responses accept old and canonical type values. Deploy new frontend first, new backend second; rollback backend first. New external API clients may use canonical original/update directly after backend rollout.

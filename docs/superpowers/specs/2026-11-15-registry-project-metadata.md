# Optional Registry project metadata

User-approved scope: collect modalities, algorithms, inputs and outputs as optional lists, hide empty values in public details, and supplement the existing published STAR instead of registering a duplicate.

Use the existing JSON payload and pipeline metadata. Registration accepts optional arrays (at most 20 entries of 120 characters each), trimmed and deduplicated. Omission preserves compatibility; explicit empty arrays clear values. Origin publication persists them; later reviewed versions update only supplied fields. Show supplied metadata in the review queue.

Provide an administrator-only project metadata correction form and POST endpoint with a required reason and before/after audit. Serialize with publication by pipeline lock; preserve repository, versions, credits and contribution identity. Anonymous, non-admin and bearer-token requests cannot modify metadata. Add an idempotent audit-action migration and minimal runtime column grant.

Approach: extend existing JSON storage and add a small correction endpoint. Re-registration would duplicate the same source and commit and is already rejected; inventing a code release for metadata is misleading. No new project or version for STAR.

Empty fields are hidden individually, and the Algorithms and data section is omitted if all three data fields are empty. Fields contain descriptions, not an executable workflow contract.

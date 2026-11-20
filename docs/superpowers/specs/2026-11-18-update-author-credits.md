# Separate Update authors from upstream authors

An Update currently copies the Original authors and citation into editable version fields. A NuSTAR submission can therefore attribute the update to STAR's authors and never identify its actual developers. Fix the form, persisted submission and published version together.

Use an additive `updateAuthors?: RegistryCredit[]` field. Existing `authors` retains its upstream/original meaning and legacy records remain unchanged. Original registration keeps its existing required authors and optional citation. New Update forms require the actual update authors, start that field empty, show the selected parent's authors/citation as read-only context, and start the update's own optional citation blank. Submitter identity remains separate; do not assume the signed-in user is an author. Based-on changes refresh upstream context without erasing typed Update author/citation values.

The backend validates 1–20 Update credits if supplied, rejects the field for Originals, snapshots the immediate parent's explicit Update authors, falling back to its recorded authors, from the published parent for new submissions using this field, and stores Update credits in existing version JSON metadata. Missing upstream credits may remain empty. New forms send an empty legacy authors array so older backends reject stale forms rather than discard Update authors. Legacy clients omitting the field remain compatible; never invent Update credits for old records. Public detail and review queue show distinct upstream and Update credits. Update registration never changes Tool maintainers or gives management authority.

Advertise `registryUpdateAuthorsAvailable` in the existing session capabilities. Frontend Update publishing is disabled against an older backend so new author information cannot be silently discarded. Backend deploy comes first. No SQL migration or credentials/config changes are needed.

Approach: additive fields preserve old authors without retroactively changing their meaning. Reinterpreting existing `authors` would misattribute legacy updates; a new SQL credit role would require an unnecessary schema migration for this bounded fix.

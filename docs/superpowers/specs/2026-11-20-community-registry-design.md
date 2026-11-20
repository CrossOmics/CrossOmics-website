# Community registry integration

The requested change keeps registry discovery and maintenance ranking inside the existing Community website. Tool Versions represent repositories, rather than individual releases: one card per repository, the latest available update on the card, and expandable lineage restricted to that repository. STAR includes the original and the administrator-selected BioCode-Commons/NuSTAR repository, pinned first.

Use native Next.js pages and the existing Community styles. An iframe would preserve the separate site's navigation and prevent integrated tool links; duplicating the Python site would introduce a second frontend. Instead, render the existing registry metrics at `/community/ranking`, linking each entry to its Community detail page. Preserve ranked, stable and excluded sections, collection dates, badges and scoring methodology.

Group repository URLs canonically, order updates by date rather than input order, exclude withdrawn records from the latest selection when an active record exists, and never resolve a lineage parent across repositories. Keep withdrawn history visible and handle missing dates/parents without inventing provenance.

Store administrator choices in a small server-owned configuration. Bootstrap NuSTAR with a verified public commit because the published registry currently only contains original STAR. Refresh its latest commit through a cached, bounded GitHub request, retaining registered history and the verified snapshot if GitHub is unavailable. This does not change the original repository's maintenance metrics. No new account roles or management UI are required.

Verify grouping and ranking with isolated Node tests, run type checks/builds, and inspect desktop/mobile pages when local browser preview is available. No dependency changes or deployment are needed for this repository task.

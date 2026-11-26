# Community discovery follow-up

Accepted scope: the four findings in the November 26 review.

1. Members can set or clear their own public display name under My Contributions. Published contributor search and profiles use that name; stable profile slugs, credits, identity bindings and permissions remain unchanged. Choosing a name alone does not make an account publicly discoverable.
2. Default tool lineage emphasizes implementation names (STAR → NuSTAR), with versions as supporting information. Only recorded, valid parent links create edges. Complete version history remains available separately, including observed snapshots; a snapshot must not displace a published implementation in the default diagram.
3. The top View lineage link opens and scrolls to the diagram in one action, including direct hash navigation and repeated clicks.
4. Repository cards show purpose, compatibility, performance evidence and review links in a readable summary. Never invent speedups, benchmark verification or drop-in compatibility. NuSTAR has a native index requirement; currently published performance measurements are pending.

No production writes, policy changes, author/account inference, or automatic merge/deploy. Keep existing public-directory activity boundary. Profile writes require a same-origin website session. Public names are optional, trimmed, at most 120 Unicode characters; reject control and bidi override characters. Clear restores the existing public-name fallback. Unknown summary facts stay explicitly unavailable.

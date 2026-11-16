# Community sign-in and submission access

Approved by the user on 2026-11-15: implement the recommended approach from the preceding design discussion.

## Intent and approach

Use one independent Community sign-in screen for Google, Apple and GitHub. Keep the website session after navigation and browser restarts for 30 days. Allow every authenticated Community identity to submit projects for administrator review. Request GitHub repository authorization only for actual GitHub writes, without replacing the Community session.

Considered alternatives: continue requiring GitHub at project submission (extra login for Google/Apple users), or merge provider accounts automatically (changes ownership and risks incorrect linking). The user chose independent Community login and operation-specific GitHub authorization.

## Behavior

- Keep `/community/sign-in` and existing OAuth callback URLs. Render sign-in outside the Registry navigation/layout with a focused account panel, provider icons and full-width buttons, return link and clear error/service states. An authenticated visitor returns to their safe original destination.
- New sessions expire after exactly 30 days. Existing valid sessions retain their original expiry; no forced sign-out or silent lifetime extension. Continue using signed HttpOnly, Secure-on-HTTPS, SameSite=Lax cookies; do not put login credentials in localStorage.
- Expose `sessionDurationDays` in the session API. The frontend uses this value for copy and falls back to the previous 7-day duration against an older backend.
- All supported identities can create/read their own Registry v2 submissions. Preserve same-origin writes, ownership isolation, replay/deduplication, source validation and administrator-only publication. Registry administrator membership remains the existing GitHub numeric-ID allowlist.
- Add an idempotent SQL migration permitting existing numeric GitHub IDs and the existing `google:<64-hex>` / `apple:<64-hex>` IDs in `registry_submissions.contributor_id`; do not broaden reviewer/admin identity constraints.
- Current Registry v2 remains database submission plus site review. Do not re-enable the legacy PR form or add a new PR requirement.
- Preserve legacy PR API compatibility: a signed-in Google/Apple user can start operation-specific GitHub OAuth. Bind preview/state/attempt ownership to their original Community ID. Validate the authorized GitHub user for PR author/fork/commit attribution, never replace the Community cookie, and discard/revoke the transient token after use. Existing GitHub Community users must still authorize their same GitHub account.
- Do not merge accounts by matching emails or migrate existing contribution ownership. A Google Community identity with an authorized GitHub operation remains the same Google Community identity.

## Visual direction

Retain Community's blue (#0b57d0), ink (#182e4a), pale blue (#eff5fc), white and border (#d8e2ee), and existing Inter typography. Use a quiet two-column desktop composition: Community purpose and small pipeline lineage sketch on the left; a compact white sign-in panel on the right. Stack on narrow screens. No dashboard tabs or duplicate Sign in button on this page. Provide visible focus and adequate touch targets; no new animation or external icon assets.

## Scope and validation

Frontend and backend repositories change together. No Supabase Auth migration, permanent OAuth token storage, email-based account linking, DNS changes or desktop identity changes. Backend deployment and SQL migration are operator-run on the Droplet; supply exact commands and apply the migration before the new backend. Verify using an isolated local PostgreSQL database and mock identity/GitHub services, never production/Supabase writes. Test cookie expiry/signatures, provider-based ownership, moderation, cross-origin denial, callback replay/cross-account denial and unchanged session cookies. Verify real frontend desktop/mobile layouts and safe return navigation.

# Community account center

The user wants each person to have a home page and a signed-in settings area containing contributions, settings, sign-in methods and applicable administration.

## Approach

Use a dedicated private account center with persistent sidebar and a compact signed-in name/avatar menu in the existing Community navigation. Reuse the stable public contributor page for public work. A dropdown alone would keep account tasks scattered; a single long settings page would bury contribution and administrator workflows. The account center provides clear destinations while retaining existing contribution/submission URLs and bookmarks.

## Structure

- /community/account: personal home, identity and role, contribution counts and shortcuts, public-profile link when publicly available.
- /community/mine: existing paginated contribution history inside the same account frame.
- /community/registry/submissions: existing personal submissions and permitted review queue, inside the frame.
- /community/account/settings: public display name and private account identifier.
- /community/account/security: current sign-in provider, supported site sign-in providers clearly distinguished, session retention and existing Gardener access management.
- /community/admin: current registry administration with existing server authorization, linked only for authorized accounts. Existing bounty administration is linked only when its permission applies.
- /community/contributors/<stable slug>: public personal home, public contribution statistics and public history; owner controls and private identity data never appear there.

Signed-in menu: Account home; My Contributions; My Tool Submissions; Profile settings; Sign-in & access; applicable administration; Sign out. Public profile stays reachable from personal home when the public API confirms it exists. Every authenticated account has a private personal home, including new members without public activity.

## Boundaries and behavior

Public discoverability still requires public activity. Drafts, provider IDs, credentials, role-management actions and account settings stay private. The account center only links to existing administration; server role checks remain authoritative. Show only a verified current provider and accurately label other enabled site providers; adding, linking or merging identities is outside this request. Do not create fake connected-account controls or expose emails inferred from OAuth. No new database migration is needed.

Existing explicit post-login destinations and desktop approvals remain intact. New account routes are added to both OAuth return allowlists; default generic sign-in returns to account home. Older backends lacking profile/provider metadata degrade gracefully. No production writes, automatic merge or deployment.

## Visual direction

Reuse the website's blue, white, ink and pale-blue palette, existing font and type scale. A quiet identity strip and a narrow vertical account navigation organize the page; contribution counts and existing work are the main content. On narrow screens the navigation becomes a collapsed current-page selector, with visible active state and keyboard focus. Public home uses the same identity vocabulary without private navigation.


## Layout refinement from screenshot feedback

The user requested overall organization after seeing the account page at narrow width. Account routes use a single compact brand/community/account header; public navigation and the breadcrumb remain on public Community pages. Desktop account links are grouped into Work, Account and Administration without a duplicate identity strip. Narrow layouts use a closed current-page disclosure; links remain available on expansion and it closes after path/query navigation. The account home consolidates identity, role, edit/public-profile actions into one heading, followed by contribution statistics and work. Remove duplicate public-home prose and redundant footer shortcut cards. Preserve all existing permissions, routes, data and fallbacks.

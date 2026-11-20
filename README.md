# CrossOmics Community

The Community website at [www.cross-omics.com](https://www.cross-omics.com/): pipeline discovery, registration and review, bounties, contributions, and shared Community accounts.

Gardener product pages and tutorials are maintained separately in [CrossOmics/Gardener-website](https://github.com/CrossOmics/Gardener-website), at [crossomics-gardener.vercel.app](https://crossomics-gardener.vercel.app/), with their own Vercel project. The desktop app, execution backend, and agent remain in their existing repositories.

## Development

```bash
npm ci
cp .env.example .env.local
# Set COMMUNITY_SERVICE_URL to your development Community API.
npm run dev
```

Use `npm run build` and `npm run start` for a production build. The website does not connect directly to PostgreSQL/Supabase and does not need database or OAuth secrets.

## Deployment

Keep the existing `cross-omics-website` Vercel project and its domain bindings:

- `www.cross-omics.com`: Community production.
- `cross-omics.com`: existing redirect to www.
- `COMMUNITY_SERVICE_URL`: existing Community API origin, in Production and Preview.
- `COMMUNITY_PUBLIC_SERVICE_URL`: public Community API address used by Gardener users.
- `GARDENER_WEBSITE_URL`: `https://crossomics-gardener.vercel.app`, configured in Production and Preview after verifying the separate Gardener deployment.

Retain existing approved contact settings. Do not copy database URLs, signing secrets, or OAuth client secrets to either frontend. Community authentication continues through `/api/community/auth/...`, so existing provider callback registrations and the backend `COMMUNITY_WEB_ORIGIN` stay unchanged.

Deploy and verify Gardener first, configure its actual URL in Community, then deploy the reviewed Community change. No DNS changes or database migrations are needed. Existing production deployments and Git history provide a rollback to the original combined website.

## Routes and compatibility

| Route | Behavior |
| --- | --- |
| `/` | Registry, including query filters |
| `/community` | Temporary redirect to `/`, preserving repeated query parameters |
| `/community/**` | Existing details, bounties, contribution, account, review, and desktop-auth pages |
| `/api/community/**` | Existing same-origin API proxy, including OAuth callbacks |
| `/about`, `/tutorial/**`, `/research`, `/approach`, `/roadmap`, `/future`, `/value` | Known migrated pages temporarily redirect to the corresponding Gardener URL |

Unknown paths return 404. Missing, invalid, or self-referencing `GARDENER_WEBSITE_URL` disables external migration links and shows a clear unavailable notice for known migrated pages. It does not restore old product content or redirect to an unverified destination. Root-page sign-in uses the compatible `/community?...` return path so registry filters survive OAuth.

## Verification

```bash
npm run test:registry
npm run test:registry-submit
GARDENER_TEST_TARGET= npm run test:registry-submit  # missing-destination fallback
npm run build
```

The above tests use a local fixture API in an isolated temporary application, without reading local `.env` files or writing production data. They cover registration, root/legacy navigation, safe external targets, query preservation, and existing proxy boundaries. Existing integration tests use a separately running development API and website:

```bash
COMMUNITY_TEST_URL=http://localhost:3000 COMMUNITY_TEST_SERVICE_URL=http://localhost:4100 npm run test:community
```

Optional database and OAuth cases require their existing `COMMUNITY_TEST_*` fixtures. Real provider/desktop sign-in should also be checked by the account owner after deployment.

## Community sign-in

`/community/sign-in` is a standalone login page for Google, Apple and GitHub. The signed HttpOnly cookie persists across page visits and browser restarts until its expiry or sign-out. The backend sets new sessions to 30 days and reports `sessionDurationDays`; an older backend without that field displays the previous 7-day duration.

Any supported Community identity can register a project and view its own submissions. Registry v2 uses site moderation and does not create GitHub PRs. A GitHub write operation requires separate operation-specific authorization and does not replace the Community identity or merge provider accounts.

Deploy the paired backend change and run its `db/002-registry-community-identity.sql` migration before deploying this frontend. Use the backend's `scripts/apply-community-login.py` and deployment commands in its README. Existing OAuth client settings and callback URLs stay the same. Real provider sign-in and browser-restart persistence should be smoke-tested by an account owner after deployment.

## Bounty publishing

Every signed-in Community account can post a bounty, without a prior contribution or editor membership. The board always shows **Post a bounty**; anonymous visitors sign in before reaching the form. Status management remains editor-only. Deploy the paired backend update before this frontend. No database migration or environment changes are needed.

## Repository versions and maintenance ranking

`/community/ranking` renders maintenance scores, citation/activity metrics, collection dates, stable entries and exclusions inside Community. It uses the existing v1 metrics endpoint and infers citation years when optional metadata is absent. Tool links use the current Registry v2 detail route; the homepage remains `/` and `/community` keeps its compatibility redirect.

Each Tool's Versions section has one card per repository, showing its latest known active update. **View lineage** opens the existing pan/zoom graph for that repository only, and selecting a node shows its full attribution, citations, verification and permitted administrator actions. Registry v2 recommendations pin their repository cards without overriding which update is latest. Withdrawn records remain selectable in history. Cycles and unavailable parents use the existing lineage diagnostics.

`lib/community/repositories.ts` holds administrator-curated repositories. STAR currently pins `BioCode-Commons/NuSTAR`, with a verified commit snapshot until the registry includes it. Tool details refresh its latest GitHub commit with a 15-minute cache and four-second timeout. Observed commit snapshots retain a fallback during outages and do not expose registry mutation controls or invent authors/parents. Original repository maintenance metrics stay unchanged.

`npm run test:registry` covers grouping, latest selection, pinning, shared lineage validation, GitHub fallback, ranking, and interactive per-repository history. `npm run test:registry-submit` covers the existing Registry v2 workflows and native ranking route using an isolated API fixture.

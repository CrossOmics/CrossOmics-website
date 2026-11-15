# CrossOmics Community

The Community website at [www.cross-omics.com](https://www.cross-omics.com/): pipeline discovery, registration and review, bounties, contributions, and shared Community accounts.

Gardener product pages and tutorials are maintained separately in [CrossOmics/Gardener-website](https://github.com/CrossOmics/Gardener-website), with their own Vercel project. The desktop app, execution backend, and agent remain in their existing repositories.

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
- `GARDENER_WEBSITE_URL`: actual HTTPS origin of the separate Gardener Vercel project; set only after the new website is verified.

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
npm run test:registry-submit
GARDENER_TEST_TARGET= npm run test:registry-submit  # missing-destination fallback
npm run build
```

The above tests use a local fixture API in an isolated temporary application, without reading local `.env` files or writing production data. They cover registration, root/legacy navigation, safe external targets, query preservation, and existing proxy boundaries. Existing integration tests use a separately running development API and website:

```bash
COMMUNITY_TEST_URL=http://localhost:3000 COMMUNITY_TEST_SERVICE_URL=http://localhost:4100 npm run test:community
```

Optional database and OAuth cases require their existing `COMMUNITY_TEST_*` fixtures. Real provider/desktop sign-in should also be checked by the account owner after deployment.

# Community server

Deploy this directory as a separate Node service. It owns the shared Community API, sign-in, PostgreSQL access and desktop tokens. The website talks to this service through its same-origin proxy. Gardener connects to this service over HTTPS with a Gardener access token.

## Deploy on a separate server

On the server, check out this repository and enter `community-server/`. For the first install, copy the environment template.

```sh
umask 077
cp .env.example .env
```

Set `COMMUNITY_WEB_ORIGIN` to the public website origin, for example `https://www.example.org`. Generate separate random hex values for `COMMUNITY_SESSION_SECRET` and `COMMUNITY_DB_PASSWORD` with `openssl rand -hex 32`. Configure the sign-in providers you want to enable using the callback paths below.

```sh
docker compose config -q
docker compose up -d --build --wait
docker compose ps
curl -fsS http://127.0.0.1:4100/api/community/v1/bounties
```

PostgreSQL initializes the schema on a new volume. The API health check verifies that the API can query the database. The API listens on the host’s loopback port 4100, and PostgreSQL is reachable on the Compose network.

Point your API hostname, for example `community.example.org`, at this server. Configure your HTTPS reverse proxy to forward that hostname to `127.0.0.1:4100`. This example uses Caddy on the host.

```caddy
community.example.org {
    reverse_proxy 127.0.0.1:4100
}
```

On the website host, set `COMMUNITY_SERVICE_URL` to the API origin, for example `https://community.example.org`. Set `COMMUNITY_PUBLIC_SERVICE_URL` to the HTTPS address Gardener users should enter. OAuth callbacks stay on the website domain. After deploying the website, verify `/api/community/v1/catalog` on both domains and sign in from the website.

For an existing Compose database, apply the current schema before rebuilding the API. PostgreSQL runs the initialization script automatically when it creates a fresh database volume.

```sh
docker compose up -d --wait db
docker compose exec -T db psql -U community -d community -v ON_ERROR_STOP=1 < db/community.sql
docker compose up -d --build --wait
```

## DigitalOcean with a Duck DNS hostname

1. Create a Droplet, install Docker and the Compose plugin, and allow inbound TCP ports 80 and 443. Keep SSH access limited to the addresses that administer the server. [DigitalOcean Droplet setup](https://docs.digitalocean.com/products/droplets/getting-started/recommended-droplet-setup/)
2. In Duck DNS, point `crossomics-community.duckdns.org` at the Droplet's public IPv4 address. The hostname is set in `COMMUNITY_API_DOMAIN` in the environment template. [Duck DNS](https://www.duckdns.org/)
3. Fill in the other `.env` values above. Set `COMMUNITY_WEB_ORIGIN` to the website's origin, including `https://`. Then start the API, PostgreSQL and Caddy from this directory.

```sh
docker compose -f compose.yaml -f compose.https.yaml config -q
docker compose -f compose.yaml -f compose.https.yaml up -d --build --wait
```

Caddy proxies the public hostname to the API on the Compose network and obtains and renews TLS certificates. Its certificate data persists in the `caddy-data` volume. Use the HTTPS overlay when Caddy can bind ports 80 and 443. The base Compose file works with an existing reverse proxy on the Droplet. [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https)

After DNS resolves and HTTPS is ready, check the API from outside the Droplet.

```sh
curl -fsS https://crossomics-community.duckdns.org/api/community/v1/bounties
```

Set `COMMUNITY_SERVICE_URL` and `COMMUNITY_PUBLIC_SERVICE_URL` on the website host to `https://crossomics-community.duckdns.org`. Use the website domain for OAuth return URLs.

## Configure sign-in

The website lists the providers configured on the Community server. Use the public website origin for every callback.

| Provider | Callback path | Community server environment |
|---|---|---|
| Google | `/api/community/auth/callback/google` | `COMMUNITY_GOOGLE_CLIENT_ID`, `COMMUNITY_GOOGLE_CLIENT_SECRET` from a Web application OAuth client |
| Apple | `/api/community/auth/callback/apple` | `COMMUNITY_APPLE_CLIENT_ID` (Services ID), `COMMUNITY_APPLE_TEAM_ID`, `COMMUNITY_APPLE_KEY_ID`, `COMMUNITY_APPLE_PRIVATE_KEY` |
| GitHub | `/api/community/auth/callback` | `COMMUNITY_GITHUB_CLIENT_ID`, `COMMUNITY_GITHUB_CLIENT_SECRET` |

For Apple, register the website’s HTTPS domain and full return URL on the Services ID. Put the contents of the associated `.p8` key in the private key variable. A single-line value may use literal `\n` escapes. The service uses the key to sign short-lived client secrets. [Apple web configuration](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple)

Each provider gives the user a separate Community identity. Existing GitHub IDs, sessions and records retain their ownership. Google and Apple use an assigned Community username for public attribution. All three providers can generate Gardener access tokens. Syncing a registry PR requires the GitHub account that opened it.

## Run with an existing PostgreSQL server

Apply the schema with `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/community.sql`. Copy `.env.example` to `.env.local` and configure the server variables. Run `npm ci && npm run build && npm start` with Node.js 22. For local development, `npm run dev` serves the API on port 4100. Start the website separately and point its `COMMUNITY_SERVICE_URL` at the API.

## Configure the bounty board

Reapply `db/community.sql` to an existing database to add the bounty and reply tables. Set `COMMUNITY_BOUNTY_EDITOR_IDS` to a comma-separated list of Community account IDs. Editors can find their account ID in the signed-in response from the website’s `/api/community/v1/session` endpoint.

Editors can post bounties and update their status. Visitors can browse and search, and signed-in contributors can reply until a bounty is closed. An optional reward field displays terms as text.

## Move existing records

If the earlier website backend was used with PostgreSQL, back up its database, pause writes during cutover, apply the schema on the new database, and export and restore the Community tables. Keep the session secret across cutover if existing browser sessions should remain valid.

```sh
pg_dump "$OLD_DATABASE_URL" --data-only \
  --table=public.community_contributions \
  --table=public.community_impact \
  --table=public.community_app_tokens \
  --table=public.community_bounties \
  --table=public.community_bounty_replies \
  --file=community-data.sql
psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f community-data.sql
```

For backups predating the bounty board, omit the two bounty table options. Restore into empty Community tables and verify counts and a sample of authenticated history before switching the website URL. Keep the original database backup until cutover has been verified.

Gardener workspace databases contain registry PR tracking, local pipeline links and an offline registry cache. To add existing PRs to shared contribution history, connect Gardener with the same GitHub account that opened those PRs, then use **Community → Register → My submissions → Sync** in each workspace. The service verifies PR ownership against GitHub and deduplicates imports. New PRs sync after submission when Gardener is connected. If the service is offline, the workspace retains the PR and users can retry **Sync**.

# CrossOmics — Gardener Landing Site

Marketing site for [Gardener](https://github.com/CrossOmics/Gardener-Agent), an AI co-pilot for single-cell RNA sequencing analysis.

Built with **Next.js 15** (App Router) + **TypeScript** + **Framer Motion**.

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Other commands:

```bash
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## Project Layout

```
app/
├── page.tsx              # home — hero + section-card row + latest
├── layout.tsx            # root layout, Inter via next/font, metadata
├── globals.css           # all styles (no Tailwind, hand-rolled CSS)
├── about/page.tsx        # About — what Gardener is
├── tutorial/page.tsx     # Tutorial — Gardener intro
│   ├── pipelines/       # v3 Pipeline & Community guide, linked from the intro
│   └── setup/            # setup guide + sphere-node companion page
├── research/page.tsx     # Research — publications list
├── approach/page.tsx     # Approach — HPC-native / three-party computation
└── roadmap/page.tsx      # Roadmap — what's next

components/
├── SiteHeader.tsx        # sticky white header, active-route nav
├── SiteFooter.tsx        # shared footer
├── Hero.tsx              # home hero block (headline + CTAs)
├── SectionCards.tsx      # the horizontal row of five section cards
├── Highlights.tsx        # latest paper + setup-guide callouts
├── PageShell.tsx         # shared inner-page chrome (header / title / footer)
└── Reveal.tsx            # scroll-triggered fade-up wrapper

lib/
├── nav.ts                # nav entries + GitHub URL (header, footer)
├── sections.ts           # the five home cards
└── papers.ts             # publications (home Highlights + Research page)

public/
├── plants/               # card illustrations (cell / lavender / fern / value / tree)
├── setup/                # setup-guide screenshots
├── tutorial-v3/           # real Gardener UI screenshots for the v3 guide
└── bg*.png, bg*.jpg      # retired — the old painterly backgrounds, no longer referenced
```

## Design Notes

The site follows a white, card-driven system modelled on deepmind.google.

**Home**: a scrollable landing page — headline hero, then a horizontal row of five
section cards (About / Tutorial / Research / Approach / Roadmap), then a "Latest"
band. The cards are real `<Link>`s, so middle-click and keyboard navigation work.

**Inner pages**: share a `PageShell` — breadcrumb, large `h1`, lede, and a rule
closing the title block. Section blocks reuse a small set of layout primitives
(`.section`, `.pillars`, `.biz-segment`, `.news-list`) defined in `app/globals.css`.

**Tokens**: every colour, radius and width comes from custom properties on `:root`
in `app/globals.css` — `--bg` `#ffffff`, `--fg` `#1f1f1f`, `--muted` `#5f6368`,
`--line` `#e3e3e3`, accent `#0b57d0` with `--accent-soft` `#e8f0fe`. There is no
dark theme; `color-scheme: only light` keeps browsers from inventing one.

**Typography**: Inter throughout, loaded via `next/font/google` with a system-font
fallback stack. Weights 400/500/600/700 only. No serif.

## Assets

`public/tutorial-v3/` contains four screenshots captured from the running Gardener
frontend on 2026-11-03: community search, STAR's version tree, the maintenance
ranking, and a STAR/StringTie comparison canvas. No credentials or chat contents
are included. Ranking values are examples from the collection date shown, not
live website metrics. The guide links each image at full size for readability.

### Plant Illustrations (`public/plants/`)

All five card illustrations are ChatGPT-generated oil-painting style images.

| File | Section | Image |
|---|---|---|
| `cell.png`     | About    | cell cluster illustration |
| `lavender.jpg` | Tutorial | DNA helix illustration |
| `fern.jpg`     | Research | cell illustration |
| `value.jpg`    | Approach | protein structure illustration |
| `tree.jpg`     | Roadmap  | landscape and omics profile illustration |

### Retired backgrounds (`public/bg-painting.png`, `public/bg2-6.*`)

Oil-painting compositions that backed the pre-restyle design. Still on disk,
no longer referenced by any code.

## Adding a New Section

1. Add an entry to `NAV` in `lib/nav.ts` (`{ href, label }`) — this drives the
   header and the footer.
2. Add the matching entry to `SECTIONS` in `lib/sections.ts`
   (`{ key, label, blurb, image, href }`) — this drives the home card row.
3. Create `app/<route>/page.tsx` using `<PageShell title="…" subtitle="…" breadcrumb="…">`.
4. Drop the card image in `public/plants/`.

## Deployment

The website runs on its existing Next.js host with Node.js 22. It calls a separately deployed Community service for the registry, contributions and sign-in. The website only needs the Community service URL. PostgreSQL and Google, Apple, and GitHub sign-in credentials belong to the Community server.

## Community Tracking

Open `/community` to search the Gardener registry, explore algorithms and versions, or open its maintenance ranking. The Community navigation also links to the bounty board and sign-in page. Web and Gardener use the same shared contribution history and account. Contributions accept public HTTPS evidence from BioCode Commons and external projects. Each distinct record counts once. A recorded Impact value of zero means someone checked and observed no activity.

Deploy the API and PostgreSQL to a separate machine using the [Community backend deployment instructions](https://github.com/CrossOmics/CrossOmics-website-backend#deploy-on-a-separate-server). Set `COMMUNITY_SERVICE_URL` on the website host and optionally set `COMMUNITY_PUBLIC_SERVICE_URL` to show the public API address in My history. Set the optional contact values to approved public links and email.

### Shared API for Gardener

A signed-in user generates a token under **My history → Manage Gardener access**, then enters the Community server address and token in **Gardener → Community → Contributions**. The desktop app encrypts the token using the system credential store and sends it only to the configured server as `Authorization: Bearer <token>` over HTTPS. Each account has one active token with a 90-day lifetime. The site shows a newly generated token once, stores its hash, and allows immediate revocation. Browser mutations use the session cookie and require a same-origin request.

All routes below are relative to `/api/community/v1`. JSON writes use `Content-Type: application/json`.

| Method and path | Request and result |
|---|---|
| `GET /catalog?q=&kind=` | Public catalog with `items` and `generatedAt`. Omit `kind` or use `tool` or `workflow`. Use `id` to look up a single registry item. |
| `GET /session` | Identify the current browser session or validate a Gardener token. |
| `GET /contributions?page=1` | Public feed. Optional `catalogId` filters to a registry entry. Returns `items`, `page`, and `hasMore`. |
| `GET /contributions?mine=1&page=1` | Authenticated history, with `total` for the signed-in account when no catalog filter is applied. |
| `POST /contributions` | Publish a record. Returns `{ item, reused }` with HTTP 201 for a new record and 200 for a repeated evidence link for the same account. |
| `PUT /contributions/{id}/impact` | Save the latest reported observation for a metric. Requires record ownership. Returns `{ impact }`. |
| `POST /registry-import` | Sync a Gardener registry PR using `{ number }`. The service verifies the PR author with GitHub before adding it to history. |

Example contribution body

```json
{
  "type": "bug_fix",
  "subjectKind": "tool",
  "subjectName": "Example aligner",
  "summary": "Fixed parsing for empty FASTQ records.",
  "occurredOn": "2026-10-15",
  "projectUrl": "https://github.com/example/aligner",
  "evidenceUrl": "https://github.com/example/aligner/pull/42"
}
```

Contribution types are `new_pipeline`, `algorithm_update`, `bug_fix`, `optimization`, and `maintenance`. Item kinds are `pipeline`, `tool`, and `algorithm`. Include `catalogId` when the contribution refers to a known registry entry. The server assigns the author, source channel, and project scope. Contribution and impact evidence are self-reported. An impact body contains `metric` (`usage`, `stars`, or `citations`), a nonnegative integer `value`, and an HTTPS `evidenceUrl`. Errors include a `message` and may identify a `field`.

After you connect Gardener, new CrossOmics registry pull requests also sync to shared history. In **Register → My submissions**, use **Sync** on older PRs or retry an interrupted sync. Open each workspace that holds submissions you want to sync. The local registry cache, pipeline links and PR status stay with the Gardener workspace.

### Verify locally

Run `npm run test:community` with the website at `http://localhost:3017` and the Community service at `http://localhost:4100`. Override those origins with `COMMUNITY_TEST_URL` and `COMMUNITY_TEST_SERVICE_URL`. For the authenticated test, configure an isolated test database and set `COMMUNITY_TEST_DATABASE_URL` and `COMMUNITY_TEST_SESSION_SECRET` to the values used by the service. The test creates and removes its own rows. Set `COMMUNITY_TEST_OAUTH=1` to check redirect and cookie forwarding with OAuth configuration present.

## License

The site source is internal to CrossOmics. Third-party assets follow their respective licenses (see [Assets](#assets)).

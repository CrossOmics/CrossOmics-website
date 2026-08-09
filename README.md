# CrossOmics — Gardener Landing Site

Marketing site for [Gardener](https://github.com/CrossOmics/Gardener-Agent), an AI co-pilot for single-cell RNA sequencing analysis.

Built with **Next.js 14** (App Router) + **TypeScript** + **Framer Motion**.

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

Static-friendly — works on Vercel, Netlify, or any Node host. No environment variables required.

## License

The site source is internal to CrossOmics. Third-party assets follow their respective licenses (see [Assets](#assets)).

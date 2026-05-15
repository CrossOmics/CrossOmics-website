# CrossOmics — Gardener-Agent landing site

Marketing site for [Gardener-Agent](https://github.com/CrossOmics/Gardener-Agent), an AI co-pilot for single-cell RNA sequencing analysis.

Built with **Next.js 14** (App Router) + **TypeScript** + **Framer Motion**.

## Quick start

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

## Project layout

```
app/
├── page.tsx              # home (diagonal-peek hero menu)
├── layout.tsx            # root layout + metadata
├── globals.css           # all styles (no Tailwind, hand-rolled CSS)
├── tutorial/page.tsx     # Tutorial — Gardener-Agent intro
├── research/page.tsx     # Research — publications list
├── value/page.tsx        # Value — Privacy / Reproducibility / Scalability
└── future/page.tsx       # Future — roadmap

components/
├── Hero.tsx              # home hero — diagonal card deck + menu
└── PageShell.tsx         # shared inner-page chrome (header / footer / blurred bg)

public/
├── bg-painting.png       # oil painting — blurred bg of inner pages
├── bg2.png – bg5.jpg     # 4 section backgrounds for the home hero
└── plants/               # card illustrations (lavender / fern / wheat / tree)
```

## Design notes

**Home hero**: a "diagonal-peek" carousel. The active section's card sits in the center; the previous wraps to the bottom-left, the next to the top-right. Hovering or clicking a left menu item, or any card, switches the active section. The page background image (`bg2`–`bg5`) cross-fades in sync.

**Inner pages**: share a `PageShell` with a sticky header, four-link nav (Tutorial / Research / Value / Future), and a blurred copy of `bg-painting.png` as a calm background. Section blocks reuse a small set of layout primitives (`.section`, `.pillars`, `.biz-segment`, `.news-list`) defined in `app/globals.css`.

**Typography**: serif headings (Playfair Display fallback chain), sans-serif body (system fonts).

## Assets

### Plant illustrations (`public/plants/`)

All four are from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license) — free for commercial and non-commercial use, no attribution required (but appreciated).

| File | Section | Source |
|---|---|---|
| `lavender.jpg` | Tutorial | <https://unsplash.com/photos/d264edd596ec> |
| `fern.jpg`     | Research | <https://unsplash.com/photos/91b2f5f229cc> |
| `yellow-flowers.jpg` | Value | <https://unsplash.com/photos/aa100abba749> |
| `tree.jpg`     | Future   | <https://unsplash.com/photos/f009c37129b9> |

### Backgrounds (`public/bg-painting.png`, `public/bg2-5.*`)

Oil-painting compositions used as page backgrounds. Original assets.

## Adding a new section

1. Add an entry to the `MENU` array in `components/Hero.tsx` (`{ key, label, vertical, bg, card, href }`).
2. Add the matching entry to the `NAV` array in `components/PageShell.tsx`.
3. Create `app/<route>/page.tsx` using `<PageShell title="…" subtitle="…" breadcrumb="…">`.
4. Drop background + card assets in `public/`.

## Deployment

Static-friendly — works on Vercel, Netlify, or any Node host. No environment variables required.

## License

The site source is internal to CrossOmics. Third-party assets follow their respective licenses (see [Assets](#assets)).

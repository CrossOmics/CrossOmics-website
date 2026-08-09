# DeepMind-style restyle — design

Date: 2026-08-09
Branch: `deepmind-restyle` (worktree, based on `jx-gardener-setup` @ 8212d46)
Reference: <https://deepmind.google/>

## Goal

Replace the site's current dark-hero / painterly-background visual system with a
white, sans-serif, card-driven system modelled on deepmind.google. Three things
the user asked for explicitly:

1. On the home page, delete the left-hand `ABOUT / TUTORIAL / ...` text menu and
   lay the five section images out as a horizontal row.
2. Every page background becomes white — inner sections *and* the home page.
3. The whole site follows the reference site's style, not just the home page.

## Decisions already made

| Question | Decision |
|---|---|
| Home page structure | DeepMind-style scrollable landing page (hero → card row → highlights → footer), not a 100vh splash |
| Card count in the row | 5 — About / Tutorial / Research / Approach / Roadmap |
| How far to push the style | Fully: drop the serif, drop all background imagery, geometric sans throughout |
| Scope | Whole site, including `/tutorial/setup` and `/tutorial/setup/sphere-node` |
| Accent colour | `#0b57d0` deep blue, with `#e8f0fe` soft tint |

## Non-goals

- No new copy. Existing text stays as-is except the Roadmap title fix below.
- No new imagery. The five existing plant/cell photos are reused; only their
  layout changes.
- No dark theme. `color-scheme: only light` stays.
- No change to setup-guide *structure* (side index, topology switcher, video
  embeds keep their current markup and behaviour) — styling only.

---

## 1. Foundations

### Typography

Playfair Display is currently declared in `--serif` but **never loaded** — no
`next/font`, no `@font-face`, no stylesheet link. Every "serif heading" on the
site today renders as Times New Roman. The restyle removes `--serif` entirely
and loads a real font.

Load Inter through `next/font/google` in `app/layout.tsx`, exposed as a CSS
variable so `globals.css` can consume it:

```ts
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// <html lang="en" className={inter.variable}>
```

`--sans` resolves to `var(--font-inter)` followed by the existing system stack,
so a build without network access still renders sensibly.

Scale (desktop; all sizes clamp down on narrow viewports):

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Home hero h1 | `clamp(40px, 5.2vw, 72px)` / 1.08 | 700 | `-0.03em` |
| Page h1 | `clamp(34px, 4vw, 56px)` / 1.1 | 700 | `-0.02em` |
| Section h2 | 32px / 1.2 | 600 | `-0.02em` |
| Card / pillar title | 18–20px / 1.3 | 600 | `-0.01em` |
| Body | 17px / 1.6 | 400 | 0 |
| Small / caption | 14px / 1.5 | 400 | 0 |
| Eyebrow, breadcrumb | 12px / 1.4 | 500 | `0.06em`, uppercase |

Weights used: 400, 500, 600, 700. Nothing else.

### Colour tokens

```css
:root {
  color-scheme: only light;
  --bg: #ffffff;
  --surface: #f8f9fa;        /* code blocks, table headers, hover fills */
  --fg: #1f1f1f;
  --muted: #5f6368;
  --line: #e3e3e3;
  --accent: #0b57d0;
  --accent-soft: #e8f0fe;
  --accent-hover: #0842a0;
  --sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, "Helvetica Neue", Arial, sans-serif;
  --radius-card: 16px;
  --radius-pill: 999px;
  --maxw: 1280px;
  --maxw-prose: 760px;
}
```

`--serif`, `--bg: #0a0a0a`, `--fg: #ffffff` and the translucent `--muted` /
`--line` values are deleted.

### Rhythm

- Content column: `max-width: var(--maxw)`, `padding-inline: clamp(20px, 5vw, 64px)`.
- Prose column inside a section: `max-width: var(--maxw-prose)`.
- Section spacing: `120px` desktop, `72px` below 900px.
- All internal gaps are multiples of 4; the common ones are 8 / 12 / 16 / 24 / 32.

### Motion

`Reveal` keeps its scroll-triggered fade-up but loses `filter: blur(8px)` (reads
as a rendering glitch on white) and loses the default `whileHover` lift with the
warm-brown shadow. Hover affordances move into CSS per component. Distance drops
from `y: 28` to `y: 16`; duration stays `0.72s` on the same easing.

---

## 2. Component structure

`Hero.tsx` and `PageShell.tsx` each contain their own copy of the header, and
`PageShell` also owns the footer. Restyling both would fork the markup, so the
shared chrome is extracted first.

### New files

**`components/SiteHeader.tsx`** — white sticky header, `height: 72px`,
`border-bottom: 1px solid var(--line)`, `backdrop-filter: blur(12px)` with a
`rgba(255,255,255,0.85)` background so content scrolling underneath stays
legible. Contents: `CrossOmics` wordmark (600, 20px, links to `/`), the five nav
links (15px, `--muted`, `--fg` on hover, `--accent` when the route matches), and
a GitHub pill on the right. Needs `"use client"` for `usePathname()` to mark the
active link. Below 900px the nav links collapse into a horizontally scrollable
strip — no hamburger menu.

**`components/SiteFooter.tsx`** — lifted verbatim from `PageShell`, restyled:
`border-top: 1px solid var(--line)`, three columns (wordmark / nav / copyright)
that stack below 700px.

**`components/SectionCards.tsx`** — the horizontal image row. Props: none;
it owns the `SECTIONS` array (key, label, blurb, image, href) that used to live
in `Hero.tsx` as `MENU`. Renders a `<ul>` of `<li><Link>` — real links, so
middle-click and keyboard navigation work, which the current
`onClick + router.push` cards do not.

```
.home-cards        display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;
.home-card-media   aspect-ratio: 4/5; border-radius: 16px; overflow: hidden;
                   background-size: cover; background-position: center;
.home-card-title   18px/600; margin-top: 14px;
.home-card-desc    14px; color: var(--muted); margin-top: 4px;
```

Hover / focus-visible: media `transform: scale(1.04)` over 480ms
`cubic-bezier(0.22,1,0.36,1)`, title turns `--accent`, a `→` fades in after it.
Focus ring: `outline: 2px solid var(--accent); outline-offset: 4px` on the link.

Responsive:
- `≥1200px` — 5 columns.
- `900–1199px` — 3 columns, rows wrap.
- `<900px` — horizontal scroll-snap strip, cards `min-width: 240px`,
  `scroll-snap-type: x mandatory`, padding-inline matching the content gutter so
  the first card aligns with the text above it.

**`components/Highlights.tsx`** — two-column band below the cards: the ACL 2026
paper (tag pill + title + authors, linking out) and a setup-guide callout
linking to `/tutorial/setup`. Stacks to one column below 900px.

**`lib/papers.ts`** — the `PAPERS` array currently inlined in
`app/research/page.tsx`, lifted so `Highlights` and the Research page read one
source instead of holding two copies that drift.

### Rewritten

**`components/Hero.tsx`** — reduced to the landing hero block only: h1, a
`max-width: 640px` lede paragraph, and two pill CTAs (`Get started` → solid
accent, `View on GitHub` → outlined). No client-side state, so the
`"use client"` directive and the `framer-motion` import both go.

Everything else in the current file is deleted: the `MENU` diagonal card deck
(`slotStyle`, `.deck`, `.card-active`, `.card-peek`), the vertical rotating
label, the circular Enter button, the per-item background image crossfade, and
the `route-transition` circular-wipe overlay. Roughly 220 lines of CSS go with
them.

**`app/page.tsx`** — composes the landing page:

```tsx
<SiteHeader />
<main>
  <Hero />
  <SectionCards />
  <Highlights />
</main>
<SiteFooter />
```

### Modified

**`components/PageShell.tsx`** — drops the `page-bg-painting` div and the
`backgroundImage` prop, and delegates chrome to `SiteHeader` / `SiteFooter`. The
title block becomes: breadcrumb (12px uppercase `--muted`, `/` separators
instead of `›`), h1, then the subtitle as a 20px `--muted` lede capped at
`--maxw-prose`. A `1px solid var(--line)` rule closes the block.

**`components/Reveal.tsx`** — as described under Motion.

**`app/layout.tsx`** — adds the Inter font variable to `<html>`.

---

## 3. Section pages

All five call sites drop `backgroundImage`. `bg2.png`–`bg6.png` and
`bg-painting.png` become unreferenced; they stay in `public/` (deleting assets is
out of scope) but nothing loads them.

Page JSX is otherwise almost untouched — the restyle works through the existing
class names:

| Class | Current | New |
|---|---|---|
| `.section-eyebrow` | uppercase letterspaced text | pill: `--accent-soft` bg, `--accent` text, 6px/12px padding, `--radius-pill` |
| `.pillar` (About, Approach) | translucent white panel | white card, `1px solid var(--line)`, `--radius-card`, 28px padding; hover → border `--accent`, no lift |
| `.pillar-num` | `— 01` | `01` in `--accent`, 13px/600 |
| `.news-item` (Research) | translucent panel, hover white wash | row with `border-bottom: 1px solid var(--line)`, 28px vertical padding; hover → `--surface` fill bleeding 16px past the text column |
| `.news-tag` | outlined chip | `--accent-soft` / `--accent` pill |
| `.news-arrow` | circular outline | plain `→` glyph, translates 4px on row hover |
| `.biz-segment` (Roadmap) | alternating grid | same grid; image gets `--radius-card` and `aspect-ratio: 16/10`, text column vertically centred |
| `.timeline`, `.ir-*` | dark-era borders | retuned to `--line`; kept even though no page currently renders them |
| `.code-block` | dark panel | `--surface` bg, `1px solid var(--line)`, 12px radius, 14px mono |
| `.cta-link` | inline arrow link | `--accent`, arrow translates 4px on hover |

**Bug fixed in passing:** `app/roadmap/page.tsx` renders `title="FUTURE"`,
`subtitle="What's Next"`, `breadcrumb="Future"` and exports `FuturePage`, while
the route, the nav and the home card all say Roadmap. Retitle to `ROADMAP` /
`breadcrumb="Roadmap"` and rename the export to `RoadmapPage`. `app/future/page.tsx`
and `app/value/page.tsx` are 1-line stubs and are left alone.

---

## 4. Setup guide

`/tutorial/setup` (`page.tsx`, `SetupGuide`, `SetupIndex`, `PartDesktop`,
`PartRemote`, `parts.tsx`, `VideoEmbed`) and `/tutorial/setup/sphere-node`.
Markup and behaviour unchanged; styles retuned:

- **`.setup-index`** — `1px solid var(--line)` left rule; each item 8px/16px
  padding, `--muted`; the active item gets a 2px `--accent` bar in place of the
  rule segment plus `--fg` 500 text.
- **`.topo-chooser` / `.topo-card`** — white, `1px solid var(--line)`,
  `--radius-card`. Selected state changes from a filled black card to
  `border-color: var(--accent)` + `background: var(--accent-soft)` +
  `--accent` label. Hover lifts the border to `--fg` only. This is the one place
  where the current "fill it black" treatment would look wrong on white.
- **`.setup-note`** — left border 3px + tinted background:
  info `--accent` on `--accent-soft`; warn `#b26a00` on `#fef7e0`;
  danger `#b3261e` on `#fce8e6`. Body text stays `--fg`.
- **`.setup-step-num`** — `--accent`, 13px/600, no em-dash prefix.
- **`.setup-table`** — header row `--surface`, cells separated by `--line`,
  outer `--radius-card` via `overflow: hidden` on a wrapper.
- **`.setup-figure`, `.video-frame`, `.video-play`** — `--radius-card`,
  `1px solid var(--line)`, no drop shadows.
- **`.setup-crosslink`** — white card with `--line` border; hover → `--accent`
  border and accent title.
- **`.setup-pill`, `.setup-tag`** — `--accent-soft` / `--accent`.
- **`.setup-inline-link`** — `--accent` with a 1px underline at 40% opacity that
  goes solid on hover.
- Every `font-family: var(--serif)` reference (`.video-title`,
  `.topo-card-label`, `.setup-crosslink-title`, `.setup-part-title`,
  `.setup-index-title`, `.timeline-year`, `.ir-card-title`, `.logo-word`, …)
  becomes sans at 600.

---

## 5. `app/globals.css` rewrite plan

The file is 1078 lines and every rule assumes either a dark hero or a
translucent-white-on-painting inner page, so it is rewritten rather than patched.
Target order:

1. Tokens + reset + base elements (`html, body` → white, `overflow: hidden`
   removed so the landing page can scroll).
2. Shared primitives: `.container`, `.pill-btn`, `.pill-btn--solid`,
   `.tag-pill`, `.cta-link`, `.code-block`, focus-visible ring.
3. Header / footer.
4. Home: `.home-hero`, `.home-cards`, `.home-highlights`.
5. Page shell: `.page`, `.page-main`, `.page-title-block`, `.breadcrumb`.
6. Section content: `.section`, `.pillars`, `.news-*`, `.biz-*`, `.timeline`,
   `.ir-*`.
7. Setup guide.
8. Responsive overrides, grouped at the end at 1200 / 900 / 640px.

Deleted outright: `.hero*`, `.menu*`, `.stage`, `.deck`, `.card*`, `.overlay`,
`.rot-label`, `.vertical-label`, `.enter-btn`, `@keyframes ring-pulse`,
`.route-transition*`, `.page-bg-painting`, and the
`html:has(.page), body:has(.page)` dark-background overrides.

---

## 6. Verification

Manual, since the project has no test setup:

1. `npm run build` — must pass with no type errors.
2. `npm run dev`, then check each route at 1440px and 390px widths:
   `/`, `/about`, `/tutorial`, `/research`, `/approach`, `/roadmap`,
   `/tutorial/setup`, `/tutorial/setup/sphere-node`.
3. Confirm on every route: background is `#ffffff`, no painting or blur layer
   renders, no Times New Roman anywhere.
4. Home page: five cards in one row at 1440px; scroll-snap strip at 390px; each
   card navigates to the right route; keyboard tab order reaches all five.
5. Setup guide: side index active state tracks scroll; topology switcher still
   swaps content; video embeds still play.
6. `grep -rn "var(--serif)\|bg-painting\|route-transition" app components` returns
   nothing.

## Risks

- **Inter via `next/font/google` needs network at build time.** If the build
  environment is offline the build fails. Mitigation: the system stack is listed
  as fallback in `--sans`; if this bites, switch to a self-hosted woff2 in
  `public/` behind `@font-face`.
- **`SetupIndex` scroll-spy** reads element offsets. The header changes from
  fixed-transparent to sticky-72px, so `scroll-margin-top` on `.setup-part`
  (currently 96px) and `.video-embed` (110px) must be re-measured against the new
  header height or anchors will land under it.
- **The `Highlights` band duplicates paper metadata.** Lifting it to
  `lib/papers.ts` is in scope; skipping that would leave two copies to drift.

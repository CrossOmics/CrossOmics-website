# DeepMind-style Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's dark-hero / painterly-background visual system with a white, sans-serif, card-driven system modelled on deepmind.google, across every route including the setup guide.

**Architecture:** Extract the duplicated header/footer chrome into shared components first, then rewrite `app/globals.css` section by section, converting each consumer in the same task that deletes its old rules. The home page changes from a 100vh interactive splash to a scrollable landing page whose centrepiece is a horizontal row of five section cards.

**Tech Stack:** Next.js 14.2.5 (App Router), React 18, TypeScript 5.5, framer-motion 11, `next/font/google` (Inter). No test framework in this project — verification is `npm run build` plus scripted route checks.

## Global Constraints

- Design tokens (exact values): `--bg: #ffffff`, `--surface: #f8f9fa`, `--fg: #1f1f1f`, `--muted: #5f6368`, `--line: #e3e3e3`, `--accent: #0b57d0`, `--accent-soft: #e8f0fe`, `--accent-hover: #0842a0`.
- Radii: `--radius-card: 16px`, `--radius-pill: 999px`. Widths: `--maxw: 1280px`, `--maxw-prose: 760px`.
- Font weights used site-wide: 400, 500, 600, 700 only.
- Section spacing: `120px` desktop, `72px` below 900px. Internal gaps are multiples of 4.
- `color-scheme: only light` stays in `:root`; `app/layout.tsx` keeps `viewport.colorScheme = "only light"`.
- `--serif` is deleted. No `font-family: var(--serif)` may remain anywhere.
- No page may render a background image or blur layer. `bg2.png`–`bg6.png` and `bg-painting.png` stay on disk but must be unreferenced by code.
- No new body copy. The only text changes allowed are the Roadmap retitle (Task 4) and short labels/blurbs for the five home cards and two Highlights entries.
- Responsive breakpoints, used consistently: `1200px`, `900px`, `640px`.
- Every task ends with `npm run build` passing and a commit.

**Intermediate states are visually inconsistent by design.** Tasks 1–2 leave the site half-converted. Only after Task 7 is the result user-facing. The build must stay green at every commit regardless.

---

### Task 1: Foundations — Inter, tokens, primitives, motion

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css:1-24` (replace `:root`, reset, base elements) and append a primitives block after it
- Modify: `components/Reveal.tsx:31-33`

**Interfaces:**
- Consumes: nothing
- Produces: CSS custom properties listed in Global Constraints; utility classes `.container`, `.pill-btn`, `.pill-btn--solid`, `.tag-pill`, `.cta-link`, `.code-block`; `--font-inter` on `<html>`

- [ ] **Step 1: Load Inter in the root layout**

Replace `app/layout.tsx` entirely:

```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CrossOmics — Gardener",
  description: "An AI co-pilot for single-cell RNA sequencing analysis. Local-first, lineage-tracked, and scalable from laptop to HPC."
};

// Matches `color-scheme: only light` in globals.css — keeps browser-level dark mode
// from auto-inverting a design that has no dark theme.
export const viewport: Viewport = {
  colorScheme: "only light"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Replace the token layer and base elements**

Replace `app/globals.css` lines 1–24 (`:root` through the `button` rule) with:

```css
:root {
  /* Light-only design. Without this, Chrome's "Auto Dark Mode for Web
     Contents" inverts the page into an unintended dark theme. */
  color-scheme: only light;

  --bg: #ffffff;
  --surface: #f8f9fa;
  --fg: #1f1f1f;
  --muted: #5f6368;
  --line: #e3e3e3;
  --accent: #0b57d0;
  --accent-soft: #e8f0fe;
  --accent-hover: #0842a0;

  --sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, "Helvetica Neue", Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  --radius-card: 16px;
  --radius-pill: 999px;
  --maxw: 1280px;
  --maxw-prose: 760px;
  --gutter: clamp(20px, 5vw, 64px);
  --header-h: 72px;
  --section-gap: 120px;
}

@media (max-width: 900px) {
  :root { --section-gap: 72px; }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  /* Anchor targets must clear the sticky header. */
  scroll-padding-top: calc(var(--header-h) + 24px);
}

html, body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--sans);
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
button { background: none; border: none; color: inherit; cursor: pointer; font: inherit; }
img { max-width: 100%; display: block; }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Note what changed beyond colour: `overflow: hidden` is gone from `html, body` — it existed only so the 100vh splash could not scroll, and it would prevent the new landing page from scrolling at all.

- [ ] **Step 3: Append the shared primitives block**

Insert immediately after the base-element rules, before the existing `/* ---------- Header ---------- */` comment:

```css
/* ---------- Primitives ---------- */
.container {
  width: 100%;
  max-width: var(--maxw);
  margin: 0 auto;
  padding-inline: var(--gutter);
}

.prose { max-width: var(--maxw-prose); }

.pill-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  font-size: 15px; font-weight: 500;
  color: var(--fg);
  background: transparent;
  transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
}
.pill-btn:hover { background: var(--surface); border-color: var(--fg); }
.pill-btn svg { transition: transform 200ms ease; }
.pill-btn:hover svg { transform: translateX(3px); }

.pill-btn--solid {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.pill-btn--solid:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: #fff; }

.tag-pill {
  display: inline-flex; align-items: center;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.04em;
}

.cta-link {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--accent);
  font-weight: 500;
  transition: gap 200ms ease;
}
.cta-link:hover { gap: 12px; color: var(--accent-hover); }

.code-block {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--fg);
}
```

The old `.cta-link` and `.code-block` rules further down the file are now duplicated. Delete both old definitions (search for `.cta-link {` and `.code-block {` in the lower half of the file) so only these remain.

- [ ] **Step 4: Soften the Reveal motion**

In `components/Reveal.tsx`, replace lines 31–33:

```tsx
const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

const transition = { duration: 0.72, ease: [0.22, 1, 0.36, 1] };
const hoverState = { y: 0 };
```

The `filter: blur(8px)` is dropped — on white it reads as a rendering glitch rather than a reveal. `hoverState` becomes a no-op so the warm-brown `boxShadow` disappears; hover affordances now live in CSS per component. Leave the `hover` prop and its call sites in place so no page needs editing.

- [ ] **Step 5: Verify the build compiles and Inter resolves**

```bash
npm run build
```

Expected: `✓ Compiled successfully`, all 9 routes listed, no type errors. If it fails with a network error fetching Inter, fall back to the self-hosted route noted in the spec's Risks section.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css components/Reveal.tsx
git commit -m "Load Inter, swap in the light token layer and shared primitives"
```

---

### Task 2: Shared header and footer

**Files:**
- Create: `components/SiteHeader.tsx`
- Create: `components/SiteFooter.tsx`
- Create: `lib/nav.ts`
- Modify: `app/globals.css` (replace the `/* ---------- Header ---------- */` block; replace `.page-header*`, `.page-nav*`, `.page-footer`, `.footer-*` rules)

**Interfaces:**
- Consumes: `.container`, `.pill-btn` from Task 1
- Produces: `NAV: { href: string; label: string }[]` from `lib/nav.ts`; `<SiteHeader />` and `<SiteFooter />` taking no props. Both are consumed by Tasks 3 and 5.

- [ ] **Step 1: Create the shared nav list**

`lib/nav.ts` — the same five entries `PageShell` currently hard-codes, now the single source for header, footer and (Task 5) the home cards' ordering:

```ts
export type NavEntry = { href: string; label: string };

export const NAV: NavEntry[] = [
  { href: "/about", label: "About" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/research", label: "Research" },
  { href: "/approach", label: "Approach" },
  { href: "/roadmap", label: "Roadmap" }
];

export const GITHUB_URL = "https://github.com/CrossOmics/Gardener-Agent";
```

- [ ] **Step 2: Create SiteHeader**

`components/SiteHeader.tsx`. It needs `"use client"` for `usePathname()`, which drives the active-link state:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, GITHUB_URL } from "@/lib/nav";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link href="/" className="site-logo">CrossOmics</Link>

        <nav className="site-nav" aria-label="Main">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <a
          className="pill-btn site-header-cta"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create SiteFooter**

`components/SiteFooter.tsx` — a server component, no client hooks:

```tsx
import Link from "next/link";
import { NAV, GITHUB_URL } from "@/lib/nav";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner container">
        <Link href="/" className="site-logo">CrossOmics</Link>

        <nav className="site-footer-nav" aria-label="Footer">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>

        <p className="site-footer-copy">© {new Date().getFullYear()} CrossOmics, Inc.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Replace the header and footer CSS**

Delete the whole `/* ---------- Header ---------- */` block (`.header`, `.logo`, `.logo-mark`, `.logo-word`, `.header-right`) and the `.page-header`, `.page-header .logo`, `.page-nav`, `.page-nav a`, `.page-nav a:hover`, `.page-header-right`, `.page-footer`, `.footer-inner`, `.footer-logo`, `.footer-nav`, `.footer-nav a`, `.footer-copy` rules. Replace with:

```css
/* ---------- Site chrome ---------- */
.site-header {
  position: sticky; top: 0; z-index: 50;
  height: var(--header-h);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(1.6) blur(12px);
  -webkit-backdrop-filter: saturate(1.6) blur(12px);
  border-bottom: 1px solid var(--line);
}
.site-header-inner {
  height: 100%;
  display: flex; align-items: center; gap: 32px;
}

.site-logo {
  font-size: 20px; font-weight: 600; letter-spacing: -0.01em;
  color: var(--fg); white-space: nowrap;
}

.site-nav {
  display: flex; align-items: center; gap: 28px;
  margin-right: auto;
  font-size: 15px;
}
.site-nav a {
  color: var(--muted);
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: color 180ms ease, border-color 180ms ease;
}
.site-nav a:hover { color: var(--fg); }
.site-nav a.is-active { color: var(--accent); border-bottom-color: var(--accent); }

.site-header-cta { padding: 8px 18px; font-size: 14px; flex-shrink: 0; }

.site-footer {
  border-top: 1px solid var(--line);
  margin-top: var(--section-gap);
  padding: 48px 0;
}
.site-footer-inner {
  display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
}
.site-footer-nav {
  display: flex; gap: 24px; flex-wrap: wrap;
  margin-right: auto;
  font-size: 14px; color: var(--muted);
}
.site-footer-nav a:hover { color: var(--fg); }
.site-footer-copy { font-size: 13px; color: var(--muted); }

@media (max-width: 900px) {
  .site-header-inner { gap: 16px; }
  .site-nav {
    gap: 20px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .site-nav::-webkit-scrollbar { display: none; }
  .site-header-cta { display: none; }
  .site-footer-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
  .site-footer-nav { margin-right: 0; }
}
```

Below 900px the GitHub pill is hidden rather than wrapped — the footer still carries the link, so nothing becomes unreachable.

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: compiles. The new components are not yet imported anywhere, so no visual change.

- [ ] **Step 6: Commit**

```bash
git add lib/nav.ts components/SiteHeader.tsx components/SiteFooter.tsx app/globals.css
git commit -m "Extract SiteHeader and SiteFooter into shared components"
```

---

### Task 3: PageShell on white

**Files:**
- Modify: `components/PageShell.tsx` (full rewrite)
- Modify: `app/globals.css` (replace `.page`, `html:has(.page)`, `.page-main`, `.page-title-block`, `.breadcrumb*`, `.page-title`, `.page-subtitle`; delete `.page-bg-painting` and `.page-bg-painting::after`)

**Interfaces:**
- Consumes: `SiteHeader`, `SiteFooter` from Task 2
- Produces: `PageShell` with props `{ title: string; subtitle?: string; breadcrumb?: string | Crumb[]; children: ReactNode }` — note `backgroundImage` is **removed**; Task 4 updates the five call sites that still pass it.

- [ ] **Step 1: Rewrite PageShell**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";

type Crumb = { label: string; href?: string };

export default function PageShell({
  title,
  subtitle,
  breadcrumb,
  children
}: {
  title: string;
  subtitle?: string;
  /** A single label, or a trail of ancestors ending with the current page. */
  breadcrumb?: string | Crumb[];
  children: ReactNode;
}) {
  const crumbs: Crumb[] = typeof breadcrumb === "string" ? [{ label: breadcrumb }] : breadcrumb ?? [];

  return (
    <div className="page">
      <SiteHeader />

      <main className="page-main container">
        <Reveal className="page-title-block" hover={false}>
          {crumbs.length > 0 && (
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              {crumbs.map((c) => (
                <span key={c.label} className="breadcrumb-crumb">
                  <span aria-hidden>/</span>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </nav>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </Reveal>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
```

`TOP` in the breadcrumb becomes `Home` — `TOP` was a leftover from the Japanese-corporate-site idiom the old design borrowed, and reads as a scroll-to-top control rather than a link to `/`.

- [ ] **Step 2: Replace the page-shell CSS**

Delete `.page-bg-painting` and `.page-bg-painting::after` (they are the only consumers of `bg-painting.png`), and delete the `html:has(.page), body:has(.page)` / `html:has(.page)` / `body:has(.page)` overrides that forced the dark background and scroll behaviour. Replace the remaining page-shell rules with:

```css
/* ---------- Page shell ---------- */
.page { min-height: 100vh; display: flex; flex-direction: column; }
.page-main { flex: 1; padding-top: 72px; padding-bottom: 40px; }

.page-title-block {
  padding-bottom: 40px;
  margin-bottom: var(--section-gap);
  border-bottom: 1px solid var(--line);
}

.breadcrumb {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 24px;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted);
}
.breadcrumb a:hover { color: var(--accent); }
.breadcrumb-crumb { display: flex; align-items: center; gap: 8px; }

.page-title {
  font-size: clamp(34px, 4vw, 56px);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.page-subtitle {
  max-width: var(--maxw-prose);
  margin-top: 20px;
  font-size: 20px;
  line-height: 1.55;
  color: var(--muted);
}

@media (max-width: 900px) {
  .page-main { padding-top: 40px; }
  .page-title-block { padding-bottom: 28px; }
}
```

- [ ] **Step 3: Build — expect five type errors**

```bash
npm run build
```

Expected: FAILS with `Property 'backgroundImage' does not exist on type ...` at `app/about/page.tsx`, `app/approach/page.tsx`, `app/research/page.tsx`, `app/roadmap/page.tsx`, `app/tutorial/page.tsx`. This is the intended signal that Task 4 has exactly five call sites to fix; it confirms none were missed.

- [ ] **Step 4: Commit**

Commit despite the red build — Task 4 immediately follows and the pair is what makes inner pages coherent. Note the state in the message:

```bash
git add components/PageShell.tsx app/globals.css
git commit -m "Rewrite PageShell for the white shell

Drops the painterly background layer and the backgroundImage prop.
Build is red until the five call sites are updated in the next commit."
```

---

### Task 4: Section pages

**Files:**
- Modify: `app/about/page.tsx:33` (remove `backgroundImage`)
- Modify: `app/tutorial/page.tsx:8` (remove `backgroundImage`)
- Modify: `app/research/page.tsx:26` (remove `backgroundImage`)
- Modify: `app/approach/page.tsx:36` (remove `backgroundImage`)
- Modify: `app/roadmap/page.tsx:33-46` (remove `backgroundImage`, retitle, rename export)
- Modify: `app/globals.css` (`.section*`, `.pillars`, `.pillar*`, `.news-*`, `.pagination`, `.biz-*`, `.timeline*`, `.ir-*`, `.about-*`, `.setup-cta-row`, `.setup-btn`)

**Interfaces:**
- Consumes: `PageShell` without `backgroundImage` (Task 3); `.tag-pill`, `.cta-link` (Task 1)
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Drop `backgroundImage` from all five call sites**

Delete the `backgroundImage="..."` line from each `<PageShell>` invocation. In `app/about/page.tsx` the JSX becomes:

```tsx
    <PageShell
      title="ABOUT"
      subtitle="Meet Gardener"
      breadcrumb="About"
    >
```

Apply the same removal in `app/tutorial/page.tsx`, `app/research/page.tsx`, `app/approach/page.tsx`, `app/roadmap/page.tsx`.

- [ ] **Step 2: Fix the Roadmap identity mismatch**

`app/roadmap/page.tsx` renders `title="FUTURE"` / `breadcrumb="Future"` and exports `FuturePage`, while its route, the nav entry and the home card all say Roadmap. Change the component signature and the shell call:

```tsx
export default function RoadmapPage() {
  return (
    <PageShell title="ROADMAP" subtitle="What's Next" breadcrumb="Roadmap">
```

Leave `app/future/page.tsx` and `app/value/page.tsx` alone — they are 1-line stubs outside this scope.

- [ ] **Step 3: Restyle section content**

Replace the `.section` block through `.ir-*` (and the `.about-*` and `.setup-btn` rules) with:

```css
/* ---------- Section content ---------- */
.section { margin-bottom: var(--section-gap); }
.section-header { margin-bottom: 32px; }
.section-eyebrow {
  display: inline-flex; align-items: center;
  padding: 5px 12px;
  margin-bottom: 16px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px; font-weight: 500; letter-spacing: 0.04em;
}
.section-title {
  font-size: 32px; line-height: 1.2; font-weight: 600; letter-spacing: -0.02em;
}
.section-body {
  max-width: var(--maxw-prose);
  font-size: 17px; line-height: 1.65; color: #3c4043;
}
.section-body p + p { margin-top: 1em; }
.section-body strong { font-weight: 600; color: var(--fg); }

/* About / Approach four-up */
.pillars { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.pillar {
  padding: 28px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  transition: border-color 200ms ease, background-color 200ms ease;
}
.pillar:hover { border-color: var(--accent); background: var(--bg); }
.pillar-num { margin-bottom: 12px; font-size: 13px; font-weight: 600; color: var(--accent); }
.pillar-title { font-size: 19px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.pillar-sub { margin-top: 6px; font-size: 14px; color: var(--muted); }
.pillar-desc { margin-top: 12px; font-size: 15px; line-height: 1.65; color: #3c4043; }

.about-intro { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 48px; align-items: start; }
.about-copy .section-body { max-width: 100%; }
.about-cell-image {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-card);
  background: url('/plants/cell.png') center / cover no-repeat;
}

/* Research list */
.news-list { display: flex; flex-direction: column; border-top: 1px solid var(--line); }
.news-item {
  display: grid; grid-template-columns: 120px 1fr 32px; gap: 24px; align-items: start;
  padding: 28px 16px;
  margin-inline: -16px;
  border-bottom: 1px solid var(--line);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 200ms ease;
}
.news-item:hover { background: var(--surface); }
.news-date { font-size: 13px; font-weight: 500; color: var(--muted); }
.news-meta { display: flex; flex-direction: column; gap: 10px; }
.news-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.news-tag {
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px; font-weight: 500;
}
.news-title { font-size: 21px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.news-authors { font-size: 14px; line-height: 1.6; color: var(--muted); }
.news-venue { font-size: 13.5px; line-height: 1.6; font-style: italic; color: var(--muted); }
.news-arrow {
  align-self: center;
  font-size: 18px; color: var(--muted);
  transition: transform 200ms ease, color 200ms ease;
}
.news-item:hover .news-arrow { transform: translateX(4px); color: var(--accent); }

.pagination { display: flex; gap: 8px; margin-top: 40px; }
.pagination a {
  display: grid; place-items: center;
  width: 40px; height: 40px;
  border: 1px solid var(--line); border-radius: var(--radius-pill);
  font-size: 14px; color: var(--muted);
  transition: border-color 200ms ease, color 200ms ease;
}
.pagination a:hover { border-color: var(--fg); color: var(--fg); }
.pagination a.current { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }

/* Roadmap image/text rows */
.biz-segment {
  display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
  margin-bottom: var(--section-gap);
}
.biz-segment:nth-child(even) > .biz-image { order: 2; }
.biz-image {
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-card);
  background-size: cover; background-position: center;
}
.biz-num { margin-bottom: 12px; font-size: 13px; font-weight: 600; color: var(--accent); }
.biz-title { font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
.biz-sub { margin-top: 8px; font-size: 16px; color: var(--muted); }
.biz-desc { margin-top: 16px; font-size: 16px; line-height: 1.65; color: #3c4043; }

/* Not rendered by any current page; kept consistent so they don't rot. */
.timeline { border-left: 1px solid var(--line); padding-left: 32px; }
.timeline-row {
  display: grid; grid-template-columns: 120px 1fr; gap: 24px;
  padding: 16px 0; border-bottom: 1px solid var(--line);
}
.timeline-year { font-size: 19px; font-weight: 600; }
.timeline-body { font-size: 15px; line-height: 1.65; color: #3c4043; }

.ir-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.ir-card {
  padding: 28px;
  border: 1px solid var(--line); border-radius: var(--radius-card);
  display: flex; flex-direction: column; gap: 16px;
}
.ir-card-title { font-size: 20px; font-weight: 600; }
.ir-card-list { list-style: none; display: flex; flex-direction: column; }
.ir-card-list a {
  display: flex; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid var(--line);
  font-size: 15px; color: var(--muted);
}
.ir-card-list a:hover { color: var(--accent); }

/* Tutorial → setup guide button */
.setup-cta-row { margin-top: 28px; }
.setup-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 26px;
  border-radius: var(--radius-pill);
  background: var(--accent); color: #fff;
  font-size: 15px; font-weight: 500;
  transition: background-color 200ms ease;
}
.setup-btn:hover { background: var(--accent-hover); }
.setup-btn svg { transition: transform 200ms ease; }
.setup-btn:hover svg { transform: translateX(3px); }

@media (max-width: 900px) {
  .pillars, .ir-grid { grid-template-columns: 1fr; }
  .about-intro { grid-template-columns: 1fr; gap: 32px; }
  .biz-segment { grid-template-columns: 1fr; gap: 24px; }
  .biz-segment:nth-child(even) > .biz-image { order: 0; }
  .news-item { grid-template-columns: 1fr; gap: 12px; }
  .news-arrow { display: none; }
  .section-title { font-size: 26px; }
}
```

`.about-cell-image` now carries its own `background` — the old rule relied on a declaration further down the file that is being deleted, so inlining it here keeps the About illustration rendering.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — the five type errors from Task 3 are resolved.

- [ ] **Step 5: Check the four converted routes render on white**

```bash
npm run dev &
sleep 6
for r in about tutorial research approach roadmap; do
  echo "--- /$r"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/$r"
done
```

Expected: `200` for all five.

- [ ] **Step 6: Commit**

```bash
git add app/about app/tutorial app/research app/approach app/roadmap app/globals.css
git commit -m "Restyle the five section pages on white

Also fixes roadmap/page.tsx, which titled itself FUTURE while its
route, nav entry and home card all said Roadmap."
```

---

### Task 5: Home page

**Files:**
- Create: `lib/sections.ts`
- Create: `lib/papers.ts`
- Create: `components/SectionCards.tsx`
- Create: `components/Highlights.tsx`
- Modify: `components/Hero.tsx` (full rewrite)
- Modify: `app/page.tsx`
- Modify: `app/research/page.tsx` (import `PAPERS` instead of declaring it)
- Modify: `app/globals.css` (delete `.hero*`, `.menu*`, `.stage`, `.deck`, `.card*`, `.overlay`, `.rot-label`, `.vertical-label`, `.enter-btn*`, `@keyframes ring-pulse`, `.route-transition*`; add `.home-*`)

**Interfaces:**
- Consumes: `SiteHeader`, `SiteFooter` (Task 2); `.container`, `.pill-btn`, `.tag-pill`, `.cta-link` (Task 1)
- Produces: `SECTIONS: SectionEntry[]` from `lib/sections.ts` where `SectionEntry = { key: string; label: string; blurb: string; image: string; href: string }`; `PAPERS: Paper[]` from `lib/papers.ts` where `Paper = { date: string; tags: string[]; title: string; authors: string; venue: string; excerpt: string; href: string }`

- [ ] **Step 1: Create the section card data**

`lib/sections.ts`. The images and hrefs come from the existing `MENU` in `Hero.tsx`; the `blurb` values are new one-line descriptions derived from each page's existing subtitle:

```ts
export type SectionEntry = {
  key: string;
  label: string;
  blurb: string;
  image: string;
  href: string;
};

export const SECTIONS: SectionEntry[] = [
  { key: "about",    label: "About",    blurb: "What Gardener is and what it enables.",        image: "/plants/cell.png",     href: "/about" },
  { key: "tutorial", label: "Tutorial", blurb: "Install, connect, and run your first analysis.", image: "/plants/lavender.jpg", href: "/tutorial" },
  { key: "research", label: "Research", blurb: "Papers and system demonstrations.",             image: "/plants/fern.jpg",     href: "/research" },
  { key: "approach", label: "Approach", blurb: "How reasoning, interaction, and compute split.", image: "/plants/value.jpg",    href: "/approach" },
  { key: "roadmap",  label: "Roadmap",  blurb: "Where the project is headed next.",             image: "/plants/tree.jpg",     href: "/roadmap" }
];
```

- [ ] **Step 2: Lift the paper data out of the Research page**

Create `lib/papers.ts` holding the `PAPERS` array currently inlined at `app/research/page.tsx:6-21`, moved verbatim:

```ts
export type Paper = {
  date: string;
  tags: string[];
  title: string;
  authors: string;
  venue: string;
  excerpt: string;
  href: string;
};

export const PAPERS: Paper[] = [
  {
    date: "2026/07",
    tags: ["ACL 2026", "System Demonstrations"],
    title: "Gardener: An Agentic AI System for Single-Cell RNA Sequence Analysis",
    authors: "Junhan Liu, Zhenke Liu, Yongcheng Shi, Peilin Yu, Minxing Zhang, Jiapeng Zhang",
    venue:
      "Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 3: System Demonstrations), pages 408–417",
    excerpt:
      "An interactive agentic system for scRNA-seq analysis that supports expert-steered, iterative workflows under strict data-residency requirements. Reasoning is grounded in a local scientific engine and an Experiment Management Kernel holding persistent, immutable snapshots; cloud-hosted LLMs see only snapshot identifiers and sanitized summaries, while raw expression matrices stay on the user's device.",
    href: "https://aclanthology.org/2026.acl-demo.40.pdf"
  }
];
```

Then in `app/research/page.tsx`, delete the local `PAPERS` declaration and add `import { PAPERS } from "@/lib/papers";`. The rest of that file is unchanged.

- [ ] **Step 3: Rewrite Hero as the landing hero block**

Replace `components/Hero.tsx` entirely. All 251 lines of splash machinery go; what remains needs no state, so `"use client"` and the `framer-motion` import go with them:

```tsx
import Link from "next/link";
import { GITHUB_URL } from "@/lib/nav";

export default function Hero() {
  return (
    <section className="home-hero container">
      <h1 className="home-hero-title">
        An AI operating system
        <br />
        for single-cell biology
      </h1>
      <p className="home-hero-lede">
        Gardener helps you retrieve public datasets, connect to your own HPC
        environment, and run rigorous dry-lab pipelines — with every command,
        parameter, and result tracked. Your raw data never leaves your machine.
      </p>
      <div className="home-hero-actions">
        <Link className="pill-btn pill-btn--solid" href="/tutorial/setup">
          Get started
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </Link>
        <a className="pill-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create SectionCards — the horizontal row**

`components/SectionCards.tsx`. Each card is a real `<Link>`, so middle-click, right-click-open and keyboard Tab all work — none of which the current `onClick` + `router.push` cards support:

```tsx
import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export default function SectionCards() {
  return (
    <section className="home-cards-section container" aria-labelledby="explore-heading">
      <h2 id="explore-heading" className="home-cards-heading">Explore</h2>

      <ul className="home-cards">
        {SECTIONS.map((s) => (
          <li key={s.key} className="home-card">
            <Link href={s.href} className="home-card-link">
              <span className="home-card-media" style={{ backgroundImage: `url(${s.image})` }} aria-hidden />
              <span className="home-card-title">
                {s.label}
                <svg className="home-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </span>
              <span className="home-card-desc">{s.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

All children are `<span>` because they sit inside an `<a>`, where block-level `<div>`/`<p>` would be invalid HTML.

- [ ] **Step 5: Create Highlights**

`components/Highlights.tsx`:

```tsx
import Link from "next/link";
import { PAPERS } from "@/lib/papers";

export default function Highlights() {
  const paper = PAPERS[0];

  return (
    <section className="home-highlights container" aria-labelledby="highlights-heading">
      <h2 id="highlights-heading" className="home-cards-heading">Latest</h2>

      <div className="home-highlights-grid">
        <a className="home-highlight" href={paper.href} target="_blank" rel="noopener noreferrer">
          <span className="tag-pill">{paper.tags[0]}</span>
          <span className="home-highlight-title">{paper.title}</span>
          <span className="home-highlight-desc">{paper.authors}</span>
          <span className="cta-link">Read the paper →</span>
        </a>

        <Link className="home-highlight" href="/tutorial/setup">
          <span className="tag-pill">Setup guide</span>
          <span className="home-highlight-title">Install Gardener and connect your compute</span>
          <span className="home-highlight-desc">
            macOS and Windows install, your first project, and connecting a Slurm
            cluster, an SSH server, or a SPHERE testbed node.
          </span>
          <span className="cta-link">Open the guide →</span>
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Compose the landing page**

`app/page.tsx`:

```tsx
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/Hero";
import SectionCards from "@/components/SectionCards";
import Highlights from "@/components/Highlights";

export default function Page() {
  return (
    <div className="page">
      <SiteHeader />
      <main className="page-main-home">
        <Hero />
        <SectionCards />
        <Highlights />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 7: Delete the splash CSS and add the home styles**

Delete every rule in the `/* ---------- Hero ---------- */` and `/* ---------- Menu ---------- */` regions: `.hero`, `.hero-bg`, `.hero-bg-img`, `.hero-bg::after`, `.hero-bg-sharp`, `.hero-bg-sharp::after`, `.menu`, `.menu-list`, `.menu-item`, `.menu-item .label`, `.menu-item.active`, `.menu-item:hover:not(.active)`, `.stage`, `.deck`, `.card`, `.card-active`, `.card-peek`, `.card-peek:hover`, `.overlay`, `.overlay > *`, `.rot-label`, `.vertical-label`, `.vertical-label:hover`, `.enter-btn`, `.enter-btn:hover`, `.enter-btn::before`, `.enter-btn::after`, `.enter-btn:hover::before`, `.enter-btn:hover::after`, `.enter-btn svg`, `.enter-btn:hover svg`, `@keyframes ring-pulse`, `.route-transition`, `.route-transition-bg`, `.route-transition-bg::after`, `.route-transition-label`, and the `@media (max-width: 900px)` block that only adjusts `.menu` / `.card` / `.rot-label`. Add in their place:

```css
/* ---------- Home ---------- */
.page-main-home { flex: 1; }

.home-hero { padding: clamp(72px, 11vh, 128px) var(--gutter) clamp(56px, 8vh, 96px); }
.home-hero-title {
  font-size: clamp(40px, 5.2vw, 72px);
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.home-hero-lede {
  max-width: 640px;
  margin-top: 28px;
  font-size: 19px; line-height: 1.6;
  color: var(--muted);
}
.home-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 36px; }

.home-cards-heading {
  padding-bottom: 20px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--line);
  font-size: 14px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted);
}

.home-cards-section { margin-bottom: var(--section-gap); }
.home-cards {
  list-style: none;
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;
}
.home-card-link { display: flex; flex-direction: column; }
.home-card-media {
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-card);
  background-size: cover; background-position: center;
  overflow: hidden;
  transform: scale(1);
  transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.home-card-title {
  display: flex; align-items: center; gap: 6px;
  margin-top: 14px;
  font-size: 18px; font-weight: 600; letter-spacing: -0.01em;
  transition: color 200ms ease;
}
.home-card-arrow {
  opacity: 0; transform: translateX(-4px);
  transition: opacity 200ms ease, transform 200ms ease;
}
.home-card-desc { margin-top: 4px; font-size: 14px; line-height: 1.5; color: var(--muted); }

.home-card-link:hover .home-card-media,
.home-card-link:focus-visible .home-card-media { transform: scale(1.04); }
.home-card-link:hover .home-card-title,
.home-card-link:focus-visible .home-card-title { color: var(--accent); }
.home-card-link:hover .home-card-arrow,
.home-card-link:focus-visible .home-card-arrow { opacity: 1; transform: translateX(0); }

.home-highlights { margin-bottom: var(--section-gap); }
.home-highlights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.home-highlight {
  display: flex; flex-direction: column; align-items: flex-start; gap: 12px;
  padding: 32px;
  border: 1px solid var(--line); border-radius: var(--radius-card);
  transition: border-color 200ms ease, background-color 200ms ease;
}
.home-highlight:hover { border-color: var(--accent); background: var(--surface); }
.home-highlight-title { font-size: 21px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.home-highlight-desc { font-size: 15px; line-height: 1.6; color: var(--muted); }

@media (max-width: 1199px) {
  .home-cards { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}

@media (max-width: 899px) {
  .home-cards {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    /* Bleed to the viewport edges so the strip reads as scrollable, while the
       first card still lines up with the heading above it. */
    margin-inline: calc(var(--gutter) * -1);
    padding-inline: var(--gutter);
    padding-bottom: 4px;
  }
  .home-cards::-webkit-scrollbar { display: none; }
  .home-card { flex: 0 0 240px; scroll-snap-align: start; }
  .home-highlights-grid { grid-template-columns: 1fr; }
  .home-highlight { padding: 24px; }
}
```

- [ ] **Step 8: Build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. `/` should now be listed as a static route rather than a client-rendered one, since `Hero` no longer needs `"use client"`.

- [ ] **Step 9: Commit**

```bash
git add lib components app/page.tsx app/research/page.tsx app/globals.css
git commit -m "Replace the splash home page with hero, card row and highlights

The left ABOUT/TUTORIAL text menu and the diagonal card deck are gone;
the five section images now sit in one horizontal row of real links."
```

---

### Task 6: Setup guide

**Files:**
- Modify: `app/globals.css` (`.setup-layout`, `.setup-index*`, `.setup-part*`, `.video-*`, `.topo-*`, `.setup-step*`, `.setup-sub`, `.setup-optional`, `.setup-list`, `.setup-ol`, `.setup-tag`, `.setup-pill`, `.setup-figure*`, `.setup-table`, `.setup-note*`, `.setup-crosslink*`, `.setup-end`, `.setup-inline-link`)
- Modify: `app/tutorial/setup/SetupIndex.tsx` (only if the scroll-spy offset needs adjusting)

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: nothing

- [ ] **Step 1: Read the current setup rules before replacing them**

```bash
grep -n "setup-\|topo-\|video-" app/globals.css | head -80
```

This lists every rule in scope so none is dropped silently. The setup markup does not change — only these declarations.

- [ ] **Step 2: Restyle the setup block**

Rewrite the region from `.setup-layout` to the end of the file per the spec's section 4. The substantive changes, each of which must be present:

- `.setup-index-list a` — `color: var(--muted)`, `padding: 8px 16px`, `border-left: 2px solid transparent`.
- `.setup-index-list a.active` — `color: var(--fg)`, `font-weight: 500`, `border-left-color: var(--accent)`. The container `.setup-index-inner` carries `border-left: 1px solid var(--line)` and the items use `margin-left: -1px` so the active bar replaces the rule segment rather than sitting beside it.
- `.setup-index-title` — sans 600, 13px, uppercase, `letter-spacing: 0.06em`, `color: var(--muted)`.
- `.topo-card` — `background: var(--bg)`, `border: 1px solid var(--line)`, `border-radius: var(--radius-card)`, no transform on hover; `:hover` sets `border-color: var(--fg)`.
- `.topo-card.is-selected` — `border-color: var(--accent)`, `background: var(--accent-soft)`; `.topo-card.is-selected .topo-card-label` gets `color: var(--accent)`. The old rule filled the card `#141414` with white text, which is the one treatment that would look wrong on white.
- `.topo-card-label` — sans 600, 19px (was `var(--serif)` 21px).
- `.setup-note` — `border-left: 3px solid var(--accent)`, `background: var(--accent-soft)`, `border-radius: 0 12px 12px 0`, `padding: 16px 20px`, `color: var(--fg)`.
- `.setup-note--warn` — `border-left-color: #b26a00; background: #fef7e0;`
- `.setup-note--danger` — `border-left-color: #b3261e; background: #fce8e6;`
- `.setup-part-num`, `.setup-step-num` — `color: var(--accent)`, 13px, 600, no em-dash prefix.
- `.setup-part-title` — sans 600, 30px, `letter-spacing: -0.02em`.
- `.setup-step-title` — sans 600, 19px.
- `.setup-table` — wrapper `border: 1px solid var(--line); border-radius: var(--radius-card); overflow: hidden;`, `th` on `var(--surface)` with 600 weight, `td` separated by `1px solid var(--line)`, no outer shadow.
- `.setup-figure img`, `.video-frame`, `.video-play img` — `border-radius: var(--radius-card)`, `border: 1px solid var(--line)`, no `box-shadow`.
- `.video-play-btn` — `background: rgba(255,255,255,0.92)`, `color: var(--fg)`, `border: 1px solid var(--line)`.
- `.video-title` — sans 600, 17px. `.video-note`, `.setup-figure figcaption` — 13px `var(--muted)`.
- `.setup-crosslink` — white card, `1px solid var(--line)`, `--radius-card`; `:hover` → `border-color: var(--accent)` and `.setup-crosslink-title { color: var(--accent) }`. `.setup-crosslink-title` becomes sans 600, 21px.
- `.setup-tag`, `.setup-pill` — `background: var(--accent-soft)`, `color: var(--accent)`, `--radius-pill`.
- `.setup-inline-link` — `color: var(--accent)`, `border-bottom: 1px solid rgba(11, 87, 208, 0.4)`; `:hover` → `border-bottom-color: var(--accent)`.
- `.setup-step-body code` — `background: var(--surface)`, `border: 1px solid var(--line)`, `border-radius: 6px`, `padding: 2px 6px`, `font-family: var(--mono)`, `font-size: 0.9em`.
- `.setup-list li::before` — bullet `color: var(--accent)`.
- `.setup-layout` — keep the grid; set the sticky index `top: calc(var(--header-h) + 24px)`.

- [ ] **Step 3: Re-measure the anchor offsets against the new header**

The header changed from fixed-transparent to a sticky 72px bar, so the hard-coded `scroll-margin-top` values are now wrong. Set both to clear it:

```css
.setup-part { margin-bottom: var(--section-gap); scroll-margin-top: calc(var(--header-h) + 24px); }
.video-embed { margin: 26px 0; scroll-margin-top: calc(var(--header-h) + 24px); }
```

- [ ] **Step 4: Check the scroll-spy offset in SetupIndex**

```bash
grep -n "offsetTop\|scrollY\|getBoundingClientRect\|IntersectionObserver\|rootMargin" app/tutorial/setup/SetupIndex.tsx
```

If it compares against a hard-coded pixel offset, change that constant to `96` (header 72 + 24). If it uses `IntersectionObserver` with a `rootMargin`, set the top margin to `-96px`. If it uses neither, no change is needed.

- [ ] **Step 5: Confirm no serif reference survives**

```bash
grep -rn "var(--serif)" app components
```

Expected: no output.

- [ ] **Step 6: Build and check both setup routes**

```bash
npm run build
npm run dev &
sleep 6
curl -s -o /dev/null -w 'setup %{http_code}\n' http://localhost:3000/tutorial/setup
curl -s -o /dev/null -w 'sphere %{http_code}\n' http://localhost:3000/tutorial/setup/sphere-node
```

Expected: build compiles; both routes return `200`.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/tutorial/setup
git commit -m "Restyle the setup guide on white"
```

---

### Task 7: Verification pass and cleanup

**Files:**
- Modify: `app/globals.css` (only if the checks below find leftovers)
- Modify: `README.md` (only if it documents the old visual system)

**Interfaces:**
- Consumes: everything
- Produces: a verified, mergeable branch

- [ ] **Step 1: Prove the old visual system is fully gone**

```bash
grep -rn "var(--serif)\|bg-painting\|route-transition\|hero-bg\|menu-item\|card-peek\|enter-btn\|backgroundImage=\"/bg" app components
```

Expected: no output. Any hit is a leftover rule or call site to delete.

- [ ] **Step 2: Confirm the retired background images are unreferenced**

```bash
for f in bg2.png bg3.png bg4.jpg bg5.jpg bg6.png bg-painting.png; do
  printf '%s: ' "$f"; grep -rl "$f" app components lib 2>/dev/null | tr '\n' ' '; echo
done
```

Expected: every line ends with nothing after the colon. The files stay in `public/` — deleting assets is out of scope.

- [ ] **Step 3: Build clean**

```bash
rm -rf .next && npm run build
```

Expected: `✓ Compiled successfully`, no warnings about missing modules, all routes listed.

- [ ] **Step 4: Check every route responds**

```bash
npm run dev &
sleep 6
for r in "" about tutorial research approach roadmap tutorial/setup tutorial/setup/sphere-node; do
  printf '/%s -> ' "$r"
  curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/$r"
done
```

Expected: `200` on all eight.

- [ ] **Step 5: Visual check at two widths**

Load each of the eight routes at 1440px and at 390px. Confirm on every one:
- background is `#ffffff` with no painting, blur or gradient layer;
- no Times New Roman anywhere (headings should be visibly Inter);
- the sticky header sits above content and anchors do not land under it;
- nothing overflows horizontally at 390px.

On `/` specifically: five cards in one row at 1440px; a scroll-snap strip at 390px; each card navigates to its own route; Tab reaches all five cards.

On `/tutorial/setup`: the side index active state tracks scroll, the topology switcher still swaps content, and video embeds still play.

- [ ] **Step 6: Update the README if it describes the old design**

```bash
grep -n "serif\|Playfair\|painting\|hero\|dark" README.md
```

Amend any line that describes the retired visual system. If there are no hits, skip.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "Verification pass: remove leftovers from the old visual system"
```

---

## Self-Review

**Spec coverage.** Spec §1 Foundations → Task 1. §2 Component structure: SiteHeader/SiteFooter → Task 2; SectionCards, Highlights, `lib/papers.ts`, Hero, `app/page.tsx` → Task 5; PageShell → Task 3; Reveal → Task 1 Step 4; layout.tsx → Task 1 Step 1. §3 Section pages → Task 4, including the Roadmap retitle. §4 Setup guide → Task 6, including the `scroll-margin-top` risk. §5 globals.css rewrite order → distributed across Tasks 1–6 in the order the file is read top to bottom. §6 Verification → Task 7. Both spec risks are addressed: the Inter fallback in Task 1 Step 5, the anchor offsets in Task 6 Steps 3–4.

**Placeholder scan.** No TBD/TODO. Every CSS and TSX step carries its literal content. The two conditional steps (Task 6 Step 4, Task 7 Step 6) state the exact grep to run and the exact change each possible result implies.

**Type consistency.** `SectionEntry` fields (`key`, `label`, `blurb`, `image`, `href`) match their use in `SectionCards`. `Paper` fields match both `Highlights` (`tags[0]`, `title`, `authors`, `href`) and the untouched `research/page.tsx` render (`date`, `tags`, `title`, `authors`, `venue`, `excerpt`, `href`). `NAV`/`GITHUB_URL` are imported identically in `SiteHeader`, `SiteFooter` and `Hero`. `PageShell`'s prop type drops `backgroundImage` in Task 3 and all five call sites drop it in Task 4 — the deliberately red build between those commits is what proves the set is complete.

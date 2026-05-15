"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NavMenu from "@/components/NavMenu";

type MenuEntry = {
  key: string; label: string; vertical: string; bg: string; card: string; href: string;
};

const MENU: MenuEntry[] = [
  { key: "tutorial", label: "TUTORIAL", vertical: "Meet Gardener-Agent", bg: "/bg2.png", card: "/plants/lavender.jpg", href: "/tutorial" },
  { key: "research", label: "RESEARCH", vertical: "Publications",        bg: "/bg3.png", card: "/plants/fern.jpg",     href: "/research" },
  { key: "value",    label: "VALUE",    vertical: "What we stand for",   bg: "/bg4.jpg", card: "/plants/wheat.jpg",    href: "/value" },
  { key: "future",   label: "FUTURE",   vertical: "What's next",         bg: "/bg5.jpg", card: "/plants/tree.jpg",     href: "/future" }
];

const TICKER = [
  { date: "2026/04/10", title: "The expansion of co-creation triggered by obtaining advanced certification." },
  { date: "2026/03/22", title: "New flagship venue announced in Kyoto, opening this winter." },
  { date: "2026/02/08", title: "Annual sustainability report 2025 is now available for download." }
];

// Diagonal peek layout:
//   offset -1 -> bottom-left small (previous item)
//   offset  0 -> center large       (active item)
//   offset +1 -> top-right small    (next item)
//   others    -> hidden off-screen
function slotStyle(offset: number) {
  const map: Record<number, { x: number; y: number; scale: number; opacity: number; z: number }> = {
    [-1]: { x: -680, y:  280, scale: 0.5,  opacity: 0.4,  z: 2 },
    [0]:  { x:    0, y:    0, scale: 1.0,  opacity: 1.0,  z: 5 },
    [1]:  { x:  620, y: -260, scale: 0.45, opacity: 0.4,  z: 2 }
  };
  return (
    map[offset] ?? {
      x: offset > 0 ? 900 : -900,
      y: offset > 0 ? -260 : 260,
      scale: 0.4,
      opacity: 0,
      z: 0
    }
  );
}

export default function Hero() {
  const router = useRouter();
  const [active, setActive] = useState(0); // start on TUTORIAL
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    MENU.forEach((m) => {
      [m.bg, m.card].forEach((src) => { const img = new Image(); img.src = src; });
    });
  }, []);
  useEffect(() => { const id = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 5000); return () => clearInterval(id); }, []);

  const len = MENU.length;
  const current = MENU[active];

  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="logo-word">CROSS OMICS</span>
        </div>
        <div className="header-right">
          <a href="/research">Research</a>
          <a href="https://github.com/CrossOmics/Gardener-Agent" target="_blank" rel="noopener noreferrer">GitHub</a>
          <NavMenu />
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" aria-hidden>
          <AnimatePresence>
            <motion.div
              key={current.key + "-bg"}
              className="hero-bg-sharp"
              style={{ backgroundImage: `url(${current.bg})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </AnimatePresence>
        </div>

        <div className="menu">
          <ul className="menu-list" role="menu">
            {MENU.map((m, i) => (
              <li
                key={m.key}
                className={`menu-item ${i === active ? "active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => router.push(m.href)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(m.href); }}
                tabIndex={0}
                role="menuitem"
              >
                <span className="label">{m.label}</span>
              </li>
            ))}
          </ul>

          <div className="stage">
            <div className="deck">
              {MENU.map((m, i) => {
                // signed offset, but clamp far items to ±2 so they don't all stack on the same exit spot
                let offset = i - active;
                // wrap-around so neighbors of first/last loop nicely
                if (offset > len / 2) offset -= len;
                if (offset < -len / 2) offset += len;
                const s = slotStyle(offset);
                const visible = offset >= -1 && offset <= 1;
                const isPeek = offset !== 0 && visible;
                return (
                  <motion.button
                    key={m.key}
                    className={`card ${offset === 0 ? "card-active" : "card-peek"}`}
                    style={{ backgroundImage: `url(${m.card})` }}
                    animate={{
                      x: s.x,
                      y: s.y,
                      scale: s.scale,
                      opacity: visible ? s.opacity : 0,
                      zIndex: s.z
                    }}
                    whileHover={
                      isPeek
                        ? {
                            scale: s.scale * 1.32,
                            opacity: 1,
                            y: s.y + (offset < 0 ? -18 : 18),
                            zIndex: 6,
                            transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                          }
                        : undefined
                    }
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => {
                      if (offset === 0) router.push(m.href);
                      else setActive(i);
                    }}
                    aria-label={m.label}
                  />
                );
              })}

              <div className="overlay">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key + "-rot"}
                    className="rot-label"
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                  >
                    {current.label}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.a
                    key={current.key + "-vert"}
                    className="vertical-label"
                    href={current.href}
                    aria-label={current.vertical}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {current.vertical.split("").map((c, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.4, delay: 0.4 + i * 0.022, ease: "easeOut" }}
                        style={{ display: "inline-block", whiteSpace: "pre" }}
                      >
                        {c}
                      </motion.span>
                    ))}
                  </motion.a>
                </AnimatePresence>

                <a className="enter-btn" href={current.href} aria-label="Enter">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M4 12h16M14 6l6 6-6 6" />
                  </svg>
                  <svg className="arrow-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M4 12h16M14 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker" role="status" aria-live="polite">
        <div className="ticker-date">{TICKER[tickerIdx].date}</div>
        <AnimatePresence mode="wait">
          <motion.div key={tickerIdx} className="ticker-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            {TICKER[tickerIdx].title}
          </motion.div>
        </AnimatePresence>
        <div className="ticker-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 12h16M14 6l6 6-6 6" /></svg>
        </div>
      </div>
    </>
  );
}

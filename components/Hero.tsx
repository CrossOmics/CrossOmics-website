"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MenuEntry = {
  key: string; label: string; vertical: string; image: string; href: string;
};

const MENU: MenuEntry[] = [
  { key: "company", label: "COMPANY", vertical: "Company information", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", href: "/company" },
  { key: "business", label: "BUSINESS", vertical: "Our business lines", image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80", href: "/business" },
  { key: "sustainability", label: "SUSTAINABILITY", vertical: "A circle of happiness", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80", href: "/sustainability" },
  { key: "ir", label: "IR", vertical: "Investor relations", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80", href: "/ir" },
  { key: "news", label: "NEWS", vertical: "Latest news and topics", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80", href: "/news" },
  { key: "dev", label: "DEVELOPMENT / CONSULTING", vertical: "Development and consulting", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80", href: "/development" },
  { key: "blog", label: "BLOG", vertical: "Stories from the team", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80", href: "/blog" }
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
    [-1]: { x: -620, y:  260, scale: 0.38, opacity: 0.35, z: 2 },
    [0]:  { x:    0, y:    0, scale: 1.2,  opacity: 1.0,  z: 5 },
    [1]:  { x:  580, y: -250, scale: 0.3,  opacity: 0.32, z: 2 }
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
  const [active, setActive] = useState(1); // start on BUSINESS so peek demo is visible
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => { MENU.forEach((m) => { const img = new Image(); img.src = m.image; }); }, []);
  useEffect(() => { const id = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 5000); return () => clearInterval(id); }, []);

  const len = MENU.length;
  const current = MENU[active];

  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="logo-mark">C&amp;O</span>
          <span className="logo-word">CROSS OMICS</span>
        </div>
        <div className="header-right">
          <a href="/news">News</a>
          <a href="/recruitment">Recruitment</a>
          <div className="burger" aria-label="menu"><span /><span /></div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg hero-bg-painting" aria-hidden />

        <div className="menu">
          <ul className="menu-list" role="menu">
            {MENU.map((m, i) => (
              <li
                key={m.key}
                className={`menu-item ${i === active ? "active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
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
                    style={{ backgroundImage: `url(${m.image})` }}
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
                    onClick={() => setActive(i)}
                    aria-label={m.label}
                  />
                );
              })}

              <div className="overlay">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key + "-rot"}
                    className="rot-label"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {current.label}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key + "-vert"}
                    className="vertical-label"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.55, ease: "easeOut", delay: 0.25 }}
                  >
                    {current.vertical}
                  </motion.div>
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

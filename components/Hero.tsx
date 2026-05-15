"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type MenuEntry = {
  key: string; label: string; vertical: string; bg: string; card: string; href: string;
};

const MENU: MenuEntry[] = [
  { key: "about",    label: "ABOUT",    vertical: "Gardener-Agent overview", bg: "/bg6.png", card: "/plants/cell.png", href: "/about" },
  { key: "tutorial", label: "TUTORIAL", vertical: "Meet Gardener-Agent", bg: "/bg2.png", card: "/plants/lavender.jpg", href: "/tutorial" },
  { key: "research", label: "RESEARCH", vertical: "Publications",        bg: "/bg3.png", card: "/plants/fern.jpg",     href: "/research" },
  { key: "value",    label: "APPROACH", vertical: "How Gardener-Agent works", bg: "/bg4.jpg", card: "/plants/value.jpg", href: "/value" },
  { key: "future",   label: "FUTURE",   vertical: "What's next",         bg: "/bg5.jpg", card: "/plants/tree.jpg",     href: "/future" }
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
  const [active, setActive] = useState(0); // start on ABOUT
  const [transitionItem, setTransitionItem] = useState<MenuEntry | null>(null);

  useEffect(() => {
    MENU.forEach((m) => {
      [m.bg, m.card].forEach((src) => { const img = new Image(); img.src = src; });
    });
  }, []);

  const len = MENU.length;
  const current = MENU[active];

  function enterSubpage(item: MenuEntry) {
    if (transitionItem) return;
    setTransitionItem(item);
    window.setTimeout(() => {
      router.push(item.href);
    }, 620);
  }

  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="logo-word">CrossOmics</span>
        </div>
        <div className="header-right">
          <a href="https://github.com/CrossOmics/Gardener-Agent" target="_blank" rel="noopener noreferrer">GitHub</a>
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
                onClick={() => enterSubpage(m)}
                onKeyDown={(e) => { if (e.key === "Enter") enterSubpage(m); }}
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
                      if (offset === 0) enterSubpage(m);
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
                    onClick={(e) => {
                      e.preventDefault();
                      enterSubpage(current);
                    }}
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

                <a
                  className="enter-btn"
                  href={current.href}
                  aria-label="Enter"
                  onClick={(e) => {
                    e.preventDefault();
                    enterSubpage(current);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M4 12h16M14 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {transitionItem && (
          <motion.div
            className="route-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            aria-hidden
          >
            <motion.div
              className="route-transition-bg"
              style={{ backgroundImage: `url(${transitionItem.bg})` }}
              initial={{
                clipPath: "circle(0% at 50% 50%)",
                scale: 1,
                filter: "blur(0px) saturate(1.05)"
              }}
              animate={{
                clipPath: "circle(145% at 50% 50%)",
                scale: 1.06,
                filter: "blur(18px) saturate(1.12)"
              }}
              transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div
              className="route-transition-label"
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.28, delay: 0.14, ease: "easeOut" }}
            >
              {transitionItem.label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

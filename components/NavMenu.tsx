"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Link = { href: string; label: string; external?: boolean };

const LINKS: Link[] = [
  { href: "/", label: "Home" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/research", label: "Research" },
  { href: "/value", label: "Value" },
  { href: "/future", label: "Future" },
  {
    href: "https://github.com/CrossOmics/Gardener-Agent",
    label: "GitHub ↗",
    external: true
  }
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`burger${open ? " burger-open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          >
            <nav
              className="nav-overlay-inner"
              onClick={(e) => e.stopPropagation()}
            >
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.08 + i * 0.05,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div
                className="nav-overlay-foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <span>Press ESC or click outside to close</span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

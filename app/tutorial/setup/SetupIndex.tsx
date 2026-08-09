"use client";

import { useEffect, useState } from "react";

export type IndexGroup = {
  title: string;
  /** DOM id of the section wrapper, so its header activates the group's first item. */
  sectionId?: string;
  items: { id: string; label: string }[];
};

export default function SetupIndex({ groups }: { groups: IndexGroup[] }) {
  const ids = groups.flatMap((g) => g.items.map((i) => i.id));
  // Scroll targets in document order: each section header, then its own steps.
  const targets = groups.flatMap((g) => [
    ...(g.sectionId ? [{ watch: g.sectionId, activates: g.items[0].id }] : []),
    ...g.items.map((i) => ({ watch: i.id, activates: i.id }))
  ]);
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      // The target that has most recently crossed the upper third of the viewport.
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const t of targets) {
        const el = document.getElementById(t.watch);
        if (el && el.getBoundingClientRect().top <= line) current = t.activates;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targets.map((t) => t.watch + ">" + t.activates).join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav className="setup-index" aria-label="Setup steps">
      {/* The <nav> stretches to the full column; only this inner box is sticky. */}
      <div className="setup-index-inner">
        {groups.map((g) => (
          <div key={g.title} className="setup-index-group">
            <div className="setup-index-title">{g.title}</div>
            <ul className="setup-index-list">
              {g.items.map((i) => (
                <li key={i.id}>
                  <a
                    href={`#${i.id}`}
                    className={active === i.id ? "active" : undefined}
                    aria-current={active === i.id ? "true" : undefined}
                  >
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

"use client";

import { useId, useState } from "react";
export default function TypeHelp({ label, entries }: {
  label: string;
  entries: { name: string; description: string }[];
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="community-item-type-info"
      onMouseEnter={() => setOpen(true)} onMouseLeave={(event) => {
        if (!event.currentTarget.contains(event.currentTarget.ownerDocument.activeElement)) setOpen(false);
      }}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); event.stopPropagation(); } }}>
      <button type="button" className="community-info-button" aria-label={label}
        aria-expanded={open} aria-describedby={id} onClick={() => setOpen(true)}>
        <span aria-hidden="true">ⓘ</span>
      </button>
      <div className="community-item-type-tooltip" role="tooltip" id={id} hidden={!open}>
        <dl>
          {entries.map(({ name, description }) => (
            <div key={name}><dt>{name}</dt><dd>{description}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

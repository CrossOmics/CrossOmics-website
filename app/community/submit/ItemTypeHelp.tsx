"use client";

import { useId, useState } from "react";
import { subjectKinds } from "@/lib/community/types";
import { subjectDescriptions } from "@/lib/community/form-copy";

export default function ItemTypeHelp() {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="community-item-type-info"
      onMouseEnter={() => setOpen(true)} onMouseLeave={(event) => {
        if (!event.currentTarget.contains(event.currentTarget.ownerDocument.activeElement)) setOpen(false);
      }}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); event.stopPropagation(); } }}>
      <button type="button" className="community-info-button" aria-label="About item types"
        aria-expanded={open} aria-describedby={id} onClick={() => setOpen(true)}>
        <span aria-hidden="true">ⓘ</span>
      </button>
      <div className="community-item-type-tooltip" role="tooltip" id={id} hidden={!open}>
        <dl>
          {(Object.keys(subjectKinds) as Array<keyof typeof subjectKinds>).map((value) => (
            <div key={value}><dt>{subjectKinds[value]}</dt><dd>{subjectDescriptions[value]}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

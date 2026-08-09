"use client";

import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

export function Step({
  id,
  num,
  title,
  children
}: {
  id: string;
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    // "some": steps run taller than the viewport, so a fractional threshold would never fire.
    <Reveal as="article" className="setup-step" hover={false} amount="some">
      <div className="setup-step-num" aria-hidden>
        {num}
      </div>
      <div className="setup-step-main">
        <h3 className="setup-step-title" id={id}>
          {title}
        </h3>
        <div className="setup-step-body">{children}</div>
      </div>
    </Reveal>
  );
}

export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  size = "lg"
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <figure className={`setup-figure setup-figure--${size}`}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function Note({
  tone = "info",
  children
}: {
  tone?: "info" | "warn" | "danger";
  children: ReactNode;
}) {
  return <p className={`setup-note setup-note--${tone}`}>{children}</p>;
}

export function Sub({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h4 className="setup-sub" id={id}>
      {children}
    </h4>
  );
}

export function PartHead({
  num,
  title,
  children
}: {
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal className="setup-part-head" hover={false}>
      <div className="setup-part-num">{num}</div>
      <h2 className="setup-part-title">{title}</h2>
      <p className="setup-part-lede">{children}</p>
    </Reveal>
  );
}

export function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

/** Shared step 01 — identical in all three topology guides. */
export function OpenPanelStep() {
  return (
    <Step id="remote-panel" num="01" title="Open the Connection Panel">
      <p>
        Click <strong>HPC</strong> in the header, or <strong>HPC Connection</strong> in the sidebar
        footer.
      </p>
      <Figure
        src="/setup/10-hpc-entry.webp"
        alt="HPC Connection entry points in the header and sidebar footer"
        caption="HPC Connection entry point"
        width={1600}
        height={930}
      />
    </Step>
  );
}

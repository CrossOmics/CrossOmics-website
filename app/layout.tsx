import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

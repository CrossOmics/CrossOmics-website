import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossOmics — Gardener-Agent",
  description: "An AI co-pilot for single-cell RNA sequencing analysis. Local-first, lineage-tracked, and scalable from laptop to HPC."
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

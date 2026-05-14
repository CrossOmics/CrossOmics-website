import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossOmics",
  description: "CrossOmics — editorial hero menu inspired by tgn.co.jp"
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

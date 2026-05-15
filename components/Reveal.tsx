"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { motion } from "framer-motion";

type RevealElement = "div" | "section" | "article" | "li" | "nav";

type RevealProps = {
  as?: RevealElement;
  children?: ReactNode;
  "aria-label"?: string;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  style?: CSSProperties;
};

const reveal = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" }
};

const transition = { duration: 0.72, ease: [0.22, 1, 0.36, 1] };
const hoverState = { y: -6, boxShadow: "0 28px 70px rgba(30, 24, 18, 0.16)" };

export default function Reveal({
  as = "div",
  children,
  "aria-label": ariaLabel,
  className,
  delay = 0,
  hover = true,
  onClick,
  style
}: RevealProps) {
  const props = {
    className,
    initial: "hidden",
    whileInView: "show",
    viewport: { once: true, amount: 0.24 },
    variants: reveal,
    transition: { ...transition, delay },
    whileHover: hover ? hoverState : undefined,
    onClick,
    "aria-label": ariaLabel,
    style
  };

  if (as === "section") return <motion.section {...props}>{children}</motion.section>;
  if (as === "article") return <motion.article {...props}>{children}</motion.article>;
  if (as === "li") return <motion.li {...props}>{children}</motion.li>;
  if (as === "nav") return <motion.nav {...props}>{children}</motion.nav>;
  return <motion.div {...props}>{children}</motion.div>;
}

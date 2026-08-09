export type SectionEntry = {
  key: string;
  label: string;
  blurb: string;
  image: string;
  href: string;
};

export const SECTIONS: SectionEntry[] = [
  { key: "about",    label: "About",    blurb: "What Gardener is and what it enables.",           image: "/plants/cell.png",     href: "/about" },
  { key: "tutorial", label: "Tutorial", blurb: "Install, connect, and run your first analysis.",  image: "/plants/lavender.jpg", href: "/tutorial" },
  { key: "research", label: "Research", blurb: "Papers and system demonstrations.",               image: "/plants/fern.jpg",     href: "/research" },
  { key: "approach", label: "Approach", blurb: "How reasoning, interaction, and compute split.",  image: "/plants/value.jpg",    href: "/approach" },
  { key: "roadmap",  label: "Roadmap",  blurb: "Where the project is headed next.",               image: "/plants/tree.jpg",     href: "/roadmap" }
];

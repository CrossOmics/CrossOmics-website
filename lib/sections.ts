export type SectionEntry = {
  key: string;
  label: string;
  blurb: string;
  image: string;
  href: string;
};

export const SECTIONS: SectionEntry[] = [
  { key: "about",    label: "About",    blurb: "See what Gardener does",                    image: "/bg-painting.png", href: "/about" },
  { key: "tutorial", label: "Tutorial", blurb: "Install, connect your HPC, run your first analysis", image: "/bg2.png",     href: "/tutorial" },
  { key: "research", label: "Research", blurb: "Read the papers behind it",                  image: "/bg3.png",         href: "/research" },
  { key: "approach", label: "Approach", blurb: "Why it runs on your own HPC",               image: "/bg4.jpg",         href: "/approach" },
  { key: "roadmap",  label: "Roadmap",  blurb: "See where it's headed",                     image: "/bg5.jpg",         href: "/roadmap" }
];

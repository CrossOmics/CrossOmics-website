/**
 * Single source of editable copy for the whole site.
 *
 * This file is for *writing* — headlines, body prose, labels, CTAs. Change the
 * text here and it updates wherever it is used. Structural data (image paths,
 * links, routes, the GitHub release fetch) stays in its own lib files:
 *   - lib/nav.ts       nav routes + GitHub URL
 *   - lib/sections.ts  homepage card images + hrefs (labels/blurbs live here)
 *   - lib/papers.ts    paper metadata + links (prose lives here)
 *   - lib/releases.ts  release-fetch logic
 */

export const content = {
  // ── Homepage: hero ──────────────────────────────────────────────
  hero: {
    // Split across two lines; the <br> is hidden below 640px where it wraps anyway.
    titleLine1: "An Operating System",
    titleLine2: "for Genomics",
    lede:
      "Gardener helps you retrieve public datasets from NIH and Illumina and run " +
      "rigorous dry-lab pipelines, with every command, parameter, and result tracked. " +
      "It all runs on your own HPC, so your raw data never leaves your machine.",
    primaryCta: "Get started",
    secondaryCta: "View on GitHub"
  },

  // ── Homepage: Explore cards ─────────────────────────────────────
  // Card labels + blurbs live with their image/href in lib/sections.ts.
  explore: {
    heading: "Explore what Gardener does"
  },

  // ── Homepage: Latest ────────────────────────────────────────────
  latest: {
    heading: "Latest from the project",
    researchTag: "Research",
    releaseTag: "Release",
    readPaperCta: "Read the paper →",
    seeReleaseCta: "See the release →"
  },

  // ── About page ──────────────────────────────────────────────────
  about: {
    title: "About",
    subtitle: "Meet Gardener",
    breadcrumb: "About",
    overviewEyebrow: "01 / OVERVIEW",
    overviewTitle: "What Is Gardener?",
    // Rendered with <strong>Gardener</strong> at the start; the rest is plain prose.
    overviewLead: "Gardener",
    overviewBody:
      " is an operating system for genomics, built for biologists and " +
      "bioinformaticians. It helps you retrieve public datasets from sources like " +
      "NIH and Illumina, connect to your own HPC environment, and run rigorous " +
      "dry-lab analyses through established pipelines such as nf-core. Every step is " +
      "tracked, and your raw data stays on your machine.",
    openSourceLead: "The project is open source.",
    viewOnGithub: "View on GitHub",
    featuresEyebrow: "02 / FEATURES",
    featuresTitle: "What It Enables",
    features: [
      {
        num: "01",
        title: "Your Data Stays Put",
        desc: "Datasets live and run on your own HPC environment. Gardener coordinates the analysis and records every step, while raw biological data never leaves your machine."
      },
      {
        num: "02",
        title: "Data Management",
        desc: "Every dataset, command, parameter, and result is organized as the analysis progresses. You can return to an earlier step, try another direction, or compare outcomes without losing track of what happened."
      },
      {
        num: "03",
        title: "Rigorous Pipeline Execution",
        desc: "Gardener can help retrieve public datasets, connect to your compute environment, and launch trusted dry-lab workflows such as nf-core pipelines with clear records of each run."
      },
      {
        num: "04",
        title: "Expert-Driven Workflow",
        desc: "Gardener handles execution, organization, and routine analysis work. Biological interpretation and scientific decisions stay with you."
      }
    ]
  },

  // ── Approach page ───────────────────────────────────────────────
  approach: {
    title: "Approach",
    subtitle: "How Gardener Works",
    breadcrumb: "Approach",
    methodEyebrow: "01 / METHOD",
    methodTitle: "Built for Real Biological Computing",
    methodBody: [
      "Gardener is designed around the way modern biological analysis actually happens: data is large, compute is distributed, and decisions require expert judgment.",
      "Instead of moving raw datasets off your machine, Gardener keeps interaction, coordination, and computation separate. It is a privacy-preserving workflow where your data stays where it belongs."
    ],
    principlesEyebrow: "02 / CORE PRINCIPLES",
    principlesTitle: "Our Approach",
    pillars: [
      {
        num: "01",
        title: "Reproducibility and Robustness",
        sub: "Compute where the data lives",
        desc: "Gardener treats HPC as the primary execution environment, not an afterthought. Datasets remain on the compute system where they belong, while Gardener helps launch, monitor, and organize analysis jobs."
      },
      {
        num: "02",
        title: "Accessibility",
        sub: "Interface, coordination, and compute each play a clear role",
        desc: "The workflow separates interaction, coordination, and execution. The desktop app keeps you in control, Gardener helps plan and organize the work, and your HPC performs the data-intensive computation without exposing raw data."
      },
      {
        num: "03",
        title: "Privacy",
        sub: "Built around rigorous dry-lab workflows",
        desc: "Gardener is built to work with established community pipelines such as nf-core. Instead of relying on ad hoc commands, analyses can be launched, recorded, and repeated through trusted workflow standards."
      },
      {
        num: "04",
        title: "Scalability",
        sub: "Automation without replacing judgment",
        desc: "Gardener helps with execution, record-keeping, and routine coordination, while biological interpretation and scientific decisions remain with the researcher."
      }
    ]
  },

  // ── Research page ───────────────────────────────────────────────
  // Paper entries (title, authors, venue, excerpt) live in lib/papers.ts.
  research: {
    title: "Research",
    subtitle: "Publications",
    breadcrumb: "Research"
  },

  // ── Roadmap page ────────────────────────────────────────────────
  roadmap: {
    title: "Roadmap",
    subtitle: "What's Next",
    breadcrumb: "Roadmap",
    introEyebrow: "01 / DIRECTION",
    introTitle: "Where We're Headed",
    introBody: [
      "Three directions we are working toward: an open plugin ecosystem, agentic workflows that keep you in control, and higher analysis throughput that cuts false positives."
    ],
    // Card images stay inline below; text lives here.
    items: [
      {
        num: "01",
        title: "Plugin Ecosystem",
        sub: "Share algorithms others can run in minutes",
        desc: "We are abstracting the backend into a common interface, so anyone can package a method with its code and environment and publish it as a plugin. Others drop it in, reproduce the run, and try the algorithm on their own data without setting anything up.",
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80"
      },
      {
        num: "02",
        title: "Agentic Workflows",
        sub: "Automation that keeps a human in the loop",
        desc: "We are building agentic workflows that handle the routine steps while every scientific decision stays with you. The agent is still in beta, and the work now is turning it into complete, real-world workflows you can trust.",
        image: "https://images.unsplash.com/photo-1702794130211-8fdb84960cce?auto=format&fit=crop&w=1200&q=80"
      },
      {
        num: "03",
        title: "Higher Throughput",
        sub: "More analyses, fewer false positives",
        desc: "We want to help you maximize analysis throughput and build data-driven, data-mining workflows on top of it. Running more analyses gives you more ways to cross-check a result and cut false positives.",
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  }
} as const;

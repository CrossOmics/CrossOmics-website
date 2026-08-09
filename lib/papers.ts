export type Paper = {
  date: string;
  tags: string[];
  title: string;
  authors: string;
  venue: string;
  excerpt: string;
  href: string;
};

export const PAPERS: Paper[] = [
  {
    date: "2026/07",
    tags: ["ACL 2026 Demo"],
    title: "Gardener: An Agentic AI System for Single-Cell RNA Sequence Analysis",
    authors: "Junhan Liu, Zhenke Liu, Yongcheng Shi, Peilin Yu, Minxing Zhang, Jiapeng Zhang",
    venue:
      "Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 3: System Demonstrations), pages 408–417",
    excerpt:
      "An interactive agentic system for scRNA-seq analysis that supports expert-steered, iterative workflows under strict data-residency requirements. Reasoning is grounded in a local scientific engine and an Experiment Management Kernel holding persistent, immutable snapshots; cloud-hosted LLMs see only snapshot identifiers and sanitized summaries, while raw expression matrices stay on the user's device.",
    href: "https://aclanthology.org/2026.acl-demo.40.pdf"
  }
];

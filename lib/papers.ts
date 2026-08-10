export type Paper = {
  date: string;
  tags: string[];
  title: string;
  authors: string;
  venue: string;
  excerpt: string;
  href: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "2026/07" → "Jul 2026", so a paper sits next to a release date without the two
 * reading as different kinds of value. The Research page keeps the raw form,
 * where the column is dates and the format is unambiguous.
 */
export function formatPaperDate(date: string): string {
  const [year, month] = date.split("/");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : date;
}

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

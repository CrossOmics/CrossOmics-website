"use client";

import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

const PAPERS = [
  {
    date: "2026/07",
    tags: ["ACL 2026", "System Demonstrations"],
    title: "Gardener: An Agentic AI System for Single-Cell RNA Sequence Analysis",
    authors: "Junhan Liu, Zhenke Liu, Yongcheng Shi, Peilin Yu, Minxing Zhang, Jiapeng Zhang",
    venue:
      "Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 3: System Demonstrations), pages 408–417",
    excerpt:
      "An interactive agentic system for scRNA-seq analysis that supports expert-steered, iterative workflows under strict data-residency requirements. Reasoning is grounded in a local scientific engine and an Experiment Management Kernel holding persistent, immutable snapshots; cloud-hosted LLMs see only snapshot identifiers and sanitized summaries, while raw expression matrices stay on the user's device.",
    href: "https://aclanthology.org/2026.acl-demo.40.pdf"
  }
];

export default function ResearchPage() {
  return (
    <PageShell title="RESEARCH" subtitle="Publications" breadcrumb="Research">
      <ul className="news-list">
        {PAPERS.map((p, idx) => (
          <Reveal
            key={idx}
            as="li"
            className="news-item"
            onClick={() => window.open(p.href, "_blank")}
          >
            <div className="news-date">{p.date}</div>
            <div className="news-meta">
              <div className="news-tags">
                {p.tags.map((t) => (
                  <span key={t} className="news-tag">{t}</span>
                ))}
              </div>
              <div className="news-title">{p.title}</div>
              <div className="news-authors">{p.authors}</div>
              <div className="news-venue">{p.venue}</div>
              <div className="pillar-desc">{p.excerpt}</div>
            </div>
            <div className="news-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </div>
          </Reveal>
        ))}
      </ul>

      <Reveal as="nav" className="pagination" aria-label="pagination" hover={false}>
        <a href="#" className="current">1</a>
      </Reveal>
    </PageShell>
  );
}

"use client";

import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { PAPERS } from "@/lib/papers";

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

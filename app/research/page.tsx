"use client";

import PageShell from "@/components/PageShell";

// TODO: confirm paper title + abstract from https://www.biorxiv.org/content/10.1101/2025.05.30.656746v1
const PAPERS = [
  {
    date: "2025/05/30",
    tags: ["bioRxiv", "Preprint"],
    title: "CrossOmics — Featured preprint",
    excerpt:
      "A preprint from the CrossOmics group describing the foundations behind Gardener-Agent. Click through for the full text on bioRxiv.",
    href: "https://www.biorxiv.org/content/10.1101/2025.05.30.656746v1",
    thumb:
      "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?auto=format&fit=crop&w=600&q=70"
  }
];

export default function ResearchPage() {
  return (
    <PageShell title="RESEARCH" subtitle="Publications" breadcrumb="Research">
      <ul className="news-list">
        {PAPERS.map((p, idx) => (
          <li key={idx} className="news-item" onClick={() => window.open(p.href, "_blank")}>
            <div className="news-thumb" style={{ backgroundImage: `url(${p.thumb})` }} />
            <div className="news-date">{p.date}</div>
            <div className="news-meta">
              <div className="news-tags">
                {p.tags.map((t) => (
                  <span key={t} className="news-tag">{t}</span>
                ))}
              </div>
              <div className="news-title">{p.title}</div>
              <div className="pillar-desc">{p.excerpt}</div>
            </div>
            <div className="news-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </div>
          </li>
        ))}
      </ul>

      <nav className="pagination" aria-label="pagination">
        <a href="#" className="current">1</a>
      </nav>
    </PageShell>
  );
}

import PageShell from "@/components/PageShell";

const POSTS = [
  { date: "2026/05/02", title: "Notes from a season of outdoor weddings.", excerpt: "Three months, eleven venues, and what we learned about planning around weather you can't control.", thumb: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=70" },
  { date: "2026/04/19", title: "Why we stopped using stock floral templates.", excerpt: "The case for letting florists do their own work — and what it changed for our couples.", thumb: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=70" },
  { date: "2026/03/30", title: "A short tour of our smallest venue.", excerpt: "Twenty-six seats, one kitchen, and the operational decisions that make it work.", thumb: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=70" },
  { date: "2026/02/14", title: "What inclusive planning looks like in practice.", excerpt: "Less language, more logistics: the small choices that make a guest list feel welcome.", thumb: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70" }
];

export default function BlogPage() {
  return (
    <PageShell title="BLOG" subtitle="Stories from the team" breadcrumb="Blog">
      <ul className="news-list">
        {POSTS.map((p, idx) => (
          <li key={idx} className="news-item">
            <div className="news-thumb" style={{ backgroundImage: `url(${p.thumb})` }} />
            <div className="news-date">{p.date}</div>
            <div className="news-meta">
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
    </PageShell>
  );
}

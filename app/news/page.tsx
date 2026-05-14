"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";

type NewsItem = {
  date: string;
  year: string;
  category: string;
  tags: string[];
  title: string;
  thumb: string;
};

const ITEMS: NewsItem[] = [
  { date: "2026/04/10", year: "2026", category: "Announcement", tags: ["Announcement", "Corporate"], title: "The expansion of co-creation triggered by obtaining Sapporo SDGs Advanced Company certification.", thumb: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=70" },
  { date: "2026/03/22", year: "2026", category: "Press Release", tags: ["Press Release", "Business"], title: "New flagship venue announced in Kyoto, opening this winter.", thumb: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=600&q=70" },
  { date: "2026/02/08", year: "2026", category: "Announcement", tags: ["Announcement", "Sustainability"], title: "Annual sustainability report 2025 is now available for download.", thumb: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=70" },
  { date: "2026/01/30", year: "2026", category: "Corporate", tags: ["Corporate"], title: "2026 New Employee Welcome Ceremony will be held.", thumb: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=70" },
  { date: "2025/12/12", year: "2025", category: "Press Release", tags: ["Press Release", "Business"], title: "T&G's casual wedding business won the Video Release Project Award at the 3rd Japan New Business Awards.", thumb: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=70" },
  { date: "2025/11/04", year: "2025", category: "Announcement", tags: ["Announcement"], title: "Notice of regular general meeting of shareholders for the fiscal year ending March 2026.", thumb: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=70" },
  { date: "2025/09/18", year: "2025", category: "Press Release", tags: ["Press Release", "Sustainability"], title: "T&G to exhibit at Asia's largest LGBTQ+ event 'Tokyo Pride 2026' — Inclusive Wedding Advisor appointed.", thumb: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70" }
];

const CATEGORIES = ["All", "Announcement", "Press Release", "Corporate", "Business", "Sustainability"];
const YEARS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020"];

export default function NewsPage() {
  const [category, setCategory] = useState("All");
  const [year, setYear] = useState("All");

  const filtered = useMemo(
    () =>
      ITEMS.filter(
        (i) =>
          (category === "All" || i.tags.includes(category)) &&
          (year === "All" || i.year === year)
      ),
    [category, year]
  );

  return (
    <PageShell title="NEWS" subtitle="News and topics" breadcrumb="News">
      <div className="news-controls">
        <select
          className="news-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="news-select"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <ul className="news-list">
        {filtered.map((n, idx) => (
          <li key={idx} className="news-item">
            <div className="news-thumb" style={{ backgroundImage: `url(${n.thumb})` }} />
            <div className="news-date">{n.date}</div>
            <div className="news-meta">
              <div className="news-tags">
                {n.tags.map((t) => (
                  <span key={t} className="news-tag">{t}</span>
                ))}
              </div>
              <div className="news-title">{n.title}</div>
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
        <a href="#">2</a>
        <a href="#">3</a>
        <a href="#">…</a>
        <a href="#">10</a>
      </nav>
    </PageShell>
  );
}

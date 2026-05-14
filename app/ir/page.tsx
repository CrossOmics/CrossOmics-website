import PageShell from "@/components/PageShell";

const CARDS = [
  {
    title: "Management Policy",
    items: [
      { label: "Management strategy", href: "#" },
      { label: "Mid-term plan", href: "#" },
      { label: "Risk management", href: "#" }
    ]
  },
  {
    title: "Financial Highlights",
    items: [
      { label: "Consolidated results", href: "#" },
      { label: "Quarterly earnings", href: "#" },
      { label: "Earnings forecast", href: "#" }
    ]
  },
  {
    title: "IR Library",
    items: [
      { label: "Earnings briefing (PDF)", href: "#" },
      { label: "Annual report (PDF)", href: "#" },
      { label: "Securities report (PDF)", href: "#" }
    ]
  },
  {
    title: "Stock Information",
    items: [
      { label: "Stock price", href: "#" },
      { label: "Dividend policy", href: "#" },
      { label: "Shareholder meeting", href: "#" }
    ]
  }
];

export default function IRPage() {
  return (
    <PageShell title="IR" subtitle="Investor relations" breadcrumb="IR">
      <section className="section">
        <div className="ir-grid">
          {CARDS.map((c) => (
            <div key={c.title} className="ir-card">
              <h2 className="ir-card-title">{c.title}</h2>
              <ul className="ir-card-list">
                {c.items.map((i) => (
                  <li key={i.label}>
                    <a href={i.href}>
                      <span>{i.label}</span>
                      <span>›</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">CONTACT</div>
          <h2 className="section-title">IR inquiries</h2>
        </div>
        <div className="section-body">
          <p>For investor-relations questions, reach the IR team through the dedicated form.</p>
        </div>
      </section>
    </PageShell>
  );
}

import PageShell from "@/components/PageShell";

const HISTORY = [
  { year: "1998", body: "Founded in Tokyo as a hospitality services startup." },
  { year: "2004", body: "Listed on the Tokyo Stock Exchange Mothers section." },
  { year: "2010", body: "Expanded into hotel operations and group-wide brand consolidation." },
  { year: "2016", body: "Opened first overseas flagship venue." },
  { year: "2020", body: "Launched the EVOL2030 long-term strategy." },
  { year: "2024", body: "Reached 500,000 ceremonies served across all brands." }
];

const OFFICERS = [
  { name: "Hiroshi Tanaka", role: "Chairman & Representative Director" },
  { name: "Akiko Sato", role: "President & CEO" },
  { name: "Kenji Yamada", role: "CFO & Director" },
  { name: "Mari Nakamura", role: "CHRO & Director" },
  { name: "Daisuke Ito", role: "COO & Director" },
  { name: "Yuko Hashimoto", role: "Outside Director" }
];

export default function CompanyPage() {
  return (
    <PageShell title="COMPANY" subtitle="Company information" breadcrumb="Company">
      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">01 / PHILOSOPHY</div>
          <h2 className="section-title">Philosophy</h2>
        </div>
        <div className="section-body">
          <p>
            We design moments that matter. From the first conversation to the
            last toast of the evening, our work is to make every gathering feel
            like it could only have happened here, between these people, on
            this day.
          </p>
          <p>
            Our values are simple: <em>Creativity</em>, <em>Challenge</em>, and
            <em> Kindness</em>. They shape how we hire, how we plan, and how we
            answer the phone at 11 p.m. on a Friday.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">02 / LONG-TERM STRATEGY</div>
          <h2 className="section-title">EVOL2030</h2>
        </div>
        <div className="section-body">
          <p>
            EVOL2030 is our long-term commitment to evolve the business toward
            a more inclusive, lower-impact, and creatively ambitious operation
            by the end of the decade.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">03 / MESSAGE</div>
          <h2 className="section-title">Message from the Chairman</h2>
        </div>
        <div className="section-body">
          <p>
            When we started, weddings looked one way. Today they look like
            their people. That has been the most rewarding shift to witness —
            and the work we are most proud to have helped along.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">04 / HISTORY</div>
          <h2 className="section-title">History</h2>
        </div>
        <div className="timeline">
          {HISTORY.map((h) => (
            <div key={h.year} className="timeline-row">
              <div className="timeline-year">{h.year}</div>
              <div className="timeline-body">{h.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">05 / OFFICERS</div>
          <h2 className="section-title">Leadership</h2>
        </div>
        <div className="pillars">
          {OFFICERS.map((o) => (
            <div key={o.name} className="pillar">
              <div className="pillar-num">{o.role}</div>
              <div className="pillar-title">{o.name}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

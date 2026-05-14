import PageShell from "@/components/PageShell";

const PILLARS = [
  { num: "01", title: "Environmental Impact", desc: "Reducing energy, waste, and material footprint across every event we operate." },
  { num: "02", title: "Industry Well-being", desc: "Supporting the long-term health of the hospitality talent who make the work possible." },
  { num: "03", title: "Community Contribution", desc: "Investing in the places we operate — local growers, artisans, and civic projects." },
  { num: "04", title: "Corporate Governance", desc: "Independent board oversight, transparent reporting, and clear ethics across the group." }
];

export default function SustainabilityPage() {
  return (
    <PageShell
      title="SUSTAINABILITY"
      subtitle="A circle of happiness — so we keep creating happiness"
      breadcrumb="Sustainability"
    >
      <section className="section">
        <div className="section-body">
          <p>
            Our work depends on places, people, and traditions that take a long
            time to build and almost no time to lose. Sustainability, for us,
            is the daily practice of not losing them — and where we can,
            adding to them.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">FOUR PILLARS</div>
          <h2 className="section-title">Where we focus</h2>
        </div>
        <div className="pillars">
          {PILLARS.map((p) => (
            <div key={p.num} className="pillar">
              <div className="pillar-num">— {p.num}</div>
              <div className="pillar-title">{p.title}</div>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

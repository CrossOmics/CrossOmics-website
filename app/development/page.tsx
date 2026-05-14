import PageShell from "@/components/PageShell";

const SERVICES = [
  { num: "01", title: "Venue Development", desc: "Architecture, interior, and operational design for new venues and renovations." },
  { num: "02", title: "Brand Consulting", desc: "Positioning, identity, and service design for hospitality groups." },
  { num: "03", title: "Operational Audit", desc: "On-site review of existing operations with a punch-list of changes that pay back quickly." },
  { num: "04", title: "Training Programs", desc: "Front-of-house and event-management training built on what we run ourselves." }
];

export default function DevelopmentPage() {
  return (
    <PageShell
      title="DEVELOPMENT"
      subtitle="Development and consulting"
      breadcrumb="Development"
    >
      <section className="section">
        <div className="section-body">
          <p>
            We design, build, and advise on venues and operations beyond our
            own portfolio. The work falls into four practices, all run by
            people who still operate live venues themselves.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="pillars">
          {SERVICES.map((s) => (
            <div key={s.num} className="pillar">
              <div className="pillar-num">— {s.num}</div>
              <div className="pillar-title">{s.title}</div>
              <p className="pillar-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

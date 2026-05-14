import PageShell from "@/components/PageShell";

export default function RecruitmentPage() {
  return (
    <PageShell title="RECRUITMENT" subtitle="Join the team" breadcrumb="Recruitment">
      <section className="section">
        <div className="section-body">
          <p>
            We hire from a wide range of backgrounds — hospitality, design,
            engineering, finance — and we look for people who can hold a high
            bar without making the room feel tense.
          </p>
          <p>
            Open roles are posted on the careers portal. If nothing fits, an
            introduction over email is always welcome.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="pillars">
          <div className="pillar">
            <div className="pillar-num">— 01</div>
            <div className="pillar-title">Operations</div>
            <p className="pillar-desc">Event managers, venue leads, and front-of-house coordinators across our portfolio.</p>
          </div>
          <div className="pillar">
            <div className="pillar-num">— 02</div>
            <div className="pillar-title">Design</div>
            <p className="pillar-desc">Floral, set, and graphic designers working on events and brand projects.</p>
          </div>
          <div className="pillar">
            <div className="pillar-num">— 03</div>
            <div className="pillar-title">Technology</div>
            <p className="pillar-desc">Engineers and product folks building the platform our couples and operators use.</p>
          </div>
          <div className="pillar">
            <div className="pillar-num">— 04</div>
            <div className="pillar-title">Corporate</div>
            <p className="pillar-desc">Finance, HR, legal, and IR — the team that keeps the rest of the work possible.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { content } from "@/lib/content";

const approach = content.approach;

export default function ValuePage() {
  return (
    <PageShell title={approach.title} subtitle={approach.subtitle} breadcrumb={approach.breadcrumb}>
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">{approach.methodEyebrow}</div>
          <h2 className="section-title">{approach.methodTitle}</h2>
        </div>
        <div className="section-body">
          {approach.methodBody.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">{approach.principlesEyebrow}</div>
          <h2 className="section-title">{approach.principlesTitle}</h2>
        </div>
        <div className="pillars">
          {approach.pillars.map((p) => (
            <Reveal key={p.num} className="pillar">
              <div className="pillar-num">— {p.num}</div>
              <div className="pillar-title">{p.title}</div>
              <div className="pillar-sub">{p.sub}</div>
              <p className="pillar-desc">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </PageShell>
  );
}

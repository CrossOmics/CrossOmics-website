import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { content } from "@/lib/content";

const roadmap = content.roadmap;

export default function RoadmapPage() {
  return (
    <PageShell title={roadmap.title} subtitle={roadmap.subtitle} breadcrumb={roadmap.breadcrumb}>
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">{roadmap.introEyebrow}</div>
          <h2 className="section-title">{roadmap.introTitle}</h2>
        </div>
        <div className="section-body">
          {roadmap.introBody.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Reveal>

      {roadmap.items.map((r) => (
        <Reveal key={r.num} as="article" className="biz-segment">
          <div className="biz-image" style={{ backgroundImage: `url(${r.image})` }} />
          <div>
            <div className="biz-num">— {r.num}</div>
            <h2 className="biz-title">{r.title}</h2>
            <div className="biz-sub">{r.sub}</div>
            <p className="biz-desc">{r.desc}</p>
          </div>
        </Reveal>
      ))}
    </PageShell>
  );
}

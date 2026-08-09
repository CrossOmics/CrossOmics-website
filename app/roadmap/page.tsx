import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

// Sandbox, Skills, and Multi-Omics Integration have shipped — dropped from the roadmap.
const ROADMAP = [
  {
    num: "01",
    title: "Notebook Export",
    sub: "Lineage → Jupyter",
    desc: "Render any saved lineage as a runnable Jupyter notebook for handoff to collaborators or archival in a lab's existing workflow.",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    num: "02",
    title: "Team Workspaces",
    sub: "Shared lineages across a lab",
    desc: "Move from a single-user tool to a shared workspace: lineages, skills, and annotated runs that a whole lab can read, comment on, and fork.",
    image: "https://images.unsplash.com/photo-1454425064867-83bc48b40c4d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    num: "03",
    title: "Benchmarks",
    sub: "Open evals for agent quality",
    desc: "Public benchmarks measuring agent analysis quality on real scRNA-seq tasks, so progress is visible and improvements are accountable.",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80"
  }
];

export default function FuturePage() {
  return (
    <PageShell title="FUTURE" subtitle="What's Next" breadcrumb="Future" backgroundImage="/bg5.jpg">
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">ROADMAP — directional, not committed dates</div>
          <h2 className="section-title">Where We're Headed</h2>
        </div>
        <div className="section-body">
          <p>
            Three directions we are actively investing in. Order indicates rough
            priority, not a sequenced timeline — several of these will land in
            parallel.
          </p>
        </div>
      </Reveal>

      {ROADMAP.map((r) => (
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

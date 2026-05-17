import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

const PILLARS = [
  {
    num: "01",
    title: "Reproducibility and Robustness",
    sub: "Compute where the data lives",
    desc: "Gardener-Agent treats HPC as the primary execution environment, not an afterthought. Datasets remain on the compute system where they belong, while the agent helps launch, monitor, and organize analysis jobs."
  },
  {
    num: "02",
    title: "Accessbility",
    sub: "LLM, desktop GUI, and HPC each play a clear role",
    desc: "The workflow separates reasoning, interaction, and execution. The LLM assists with planning and coordination, the GUI keeps the user in control, and the HPC performs data-intensive computation without exposing raw data to the model."
  },
  {
    num: "03",
    title: "Privacy",
    sub: "Built around rigorous dry-lab workflows",
    desc: "Gardener-Agent is built to work with established community pipelines such as nf-core. Instead of relying on ad hoc commands, analyses can be launched, recorded, and repeated through trusted workflow standards."
  },
  {
    num: "04",
    title: "Scalability",
    sub: "Automation without replacing judgment",
    desc: "The agent helps with execution, record-keeping, and routine coordination, while biological interpretation and scientific decisions remain with the researcher."
  }
];

export default function ValuePage() {
  return (
    <PageShell title="APPROACH" subtitle="How Gardener-Agent works" breadcrumb="Approach" backgroundImage="/bg4.jpg">
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">01 / METHOD</div>
          <h2 className="section-title">Built for Real Biological Computing</h2>
        </div>
        <div className="section-body">
          <p>
            Gardener-Agent is designed around the way modern biological
            analysis actually happens: data is large, compute is distributed,
            and decisions require expert judgment.
          </p>
          <p>
            Instead of sending raw datasets into a cloud chatbot, Gardener-Agent
            separates reasoning, interaction, and computation into a
            privacy-preserving workflow.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">02 / CORE PRINCIPLES</div>
          <h2 className="section-title">Our Approach</h2>
        </div>
        <div className="pillars">
          {PILLARS.map((p) => (
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

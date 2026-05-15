import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

const FEATURES = [
  {
    num: "01",
    title: "Data Privacy & Three-Party Computation",
    desc: "Gardener-Agent keeps the LLM, desktop GUI, and HPC environment in separate roles. Data lives and runs on your HPC, while the LLM only helps coordinate the work without seeing raw biological data."
  },
  {
    num: "02",
    title: "Data Management",
    desc: "Every dataset, command, parameter, and result is organized as the analysis progresses. You can return to an earlier step, try another direction, or compare outcomes without losing track of what happened."
  },
  {
    num: "03",
    title: "Rigorous Pipeline Execution",
    desc: "Gardener-Agent can help retrieve public datasets, connect to your compute environment, and launch trusted dry-lab workflows such as nf-core pipelines with clear records of each run."
  },
  {
    num: "04",
    title: "Expert-Driven Workflow",
    desc: "The agent acts as a trustworthy helper for execution, organization, and routine analysis work. Biological interpretation and scientific decisions stay with the expert."
  }
];

export default function AboutPage() {
  return (
    <PageShell
      title="ABOUT"
      subtitle="Meet Gardener-Agent"
      breadcrumb="About"
      backgroundImage="/bg6.png"
    >
      <Reveal as="section" className="about-intro section">
        <div className="about-copy">
          <div className="section-header">
            <div className="section-eyebrow">01 / OVERVIEW</div>
            <h2 className="section-title">What is Gardener-Agent?</h2>
          </div>
          <div className="section-body">
            <p>
              <strong>Gardener-Agent</strong> is an AI-powered operating system
              for biologists and bioinformaticians. It helps you retrieve and
              download public datasets from NIH, connect to your personal HPC
              environment, and run rigorous dry-lab analyses through established
              pipelines such as nf-core.
            </p>
            <p>
              The project is open source.{" "}
              <a
                className="cta-link"
                href="https://github.com/CrossOmics/Gardener-Agent"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </a>
            </p>
          </div>
        </div>
        <Reveal className="about-cell-image" aria-label="Cell illustration" delay={0.12} />
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">02 / FEATURES</div>
          <h2 className="section-title">What it enables</h2>
        </div>
        <div className="pillars">
          {FEATURES.map((feature) => (
            <Reveal key={feature.num} className="pillar">
              <div className="pillar-num">— {feature.num}</div>
              <div className="pillar-title">{feature.title}</div>
              <p className="pillar-desc">{feature.desc}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </PageShell>
  );
}

import PageShell from "@/components/PageShell";

const FEATURES = [
  { num: "01", title: "Data Privacy", desc: "Raw expression matrices never leave your machine. Cloud LLMs only receive sanitized structural metadata." },
  { num: "02", title: "Experiment Lineage", desc: "Every analysis step is captured as a versioned snapshot. Roll back, branch, and compare runs without losing context." },
  { num: "03", title: "Autonomous Agent", desc: "Drive complex bioinformatic workflows through natural-language instructions, with the agent orchestrating tools end-to-end." },
  { num: "04", title: "Human-in-the-Loop GUI", desc: "Real-time UMAPs, DotPlots, and quality metrics keep you in the loop and let you steer the analysis as it unfolds." }
];

export default function TutorialPage() {
  return (
    <PageShell title="TUTORIAL" subtitle="Meet Gardener-Agent" breadcrumb="Tutorial">
      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">01 / OVERVIEW</div>
          <h2 className="section-title">What is Gardener-Agent?</h2>
        </div>
        <div className="section-body">
          <p>
            <strong>Gardener-Agent</strong> is an AI co-pilot for single-cell
            RNA sequencing analysis. It pairs an autonomous reasoning agent
            with a local-first execution model: your raw data stays on your
            machine, while the agent handles the orchestration of tools and
            the bookkeeping of every step it takes.
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
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">02 / FEATURES</div>
          <h2 className="section-title">What it does</h2>
        </div>
        <div className="pillars">
          {FEATURES.map((f) => (
            <div key={f.num} className="pillar">
              <div className="pillar-num">— {f.num}</div>
              <div className="pillar-title">{f.title}</div>
              <p className="pillar-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">03 / GET STARTED</div>
          <h2 className="section-title">Install &amp; run</h2>
        </div>
        <div className="section-body">
          <p>
            Pre-built binaries are published on the GitHub Releases page. Grab
            the binary for your platform, make it executable, and launch:
          </p>
          <pre className="code-block">
            <code>{`# macOS / Linux
chmod +x gardener-agent
./gardener-agent

# Then open the local UI at
# http://localhost:8080`}</code>
          </pre>
          <p>
            <a
              className="cta-link"
              href="https://github.com/CrossOmics/Gardener-Agent/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download latest release
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

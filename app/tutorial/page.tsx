import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

export default function TutorialPage() {
  return (
    <PageShell title="TUTORIAL" subtitle="Meet Gardener-Agent" breadcrumb="Tutorial" backgroundImage="/bg2.png">
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">01 / OVERVIEW</div>
          <h2 className="section-title">Brief introduction</h2>
        </div>
        <div className="section-body">
          <p>
            This tutorial page will guide users through the core workflows of
            <strong> Gardener-Agent</strong>, from preparing datasets to
            connecting compute resources and launching reproducible dry-lab
            analyses.
          </p>
          <p>
            Introduction videos will be added here to help users understand how
            to use the system step by step. These videos are planned but have
            not been recorded yet.
          </p>
        </div>
      </Reveal>
    </PageShell>
  );
}

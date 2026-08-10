import Link from "next/link";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { Arrow } from "./setup/parts";

export default function TutorialPage() {
  return (
    <PageShell title="Tutorial" subtitle="Meet Gardener" breadcrumb="Tutorial">
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">01 / SETUP</div>
          <h2 className="section-title">Install and Connect Your HPC</h2>
        </div>
        <div className="section-body">
          <p>
            Install Gardener on macOS or Windows, create a project, and import your
            dataset, then connect the app to your own HPC, whether that is a Slurm
            cluster, a single server over SSH, or a SPHERE testbed node. Everything
            runs where your data already lives.
          </p>
          <p className="setup-cta-row">
            <Link className="setup-btn" href="/tutorial/setup">
              Open the setup guide <Arrow />
            </Link>
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">02 / ANALYSIS</div>
          <h2 className="section-title">Configure a Pipeline and Run</h2>
        </div>
        <div className="section-body">
          <p>
            Select your dataset, pick an analysis, and fill in the form, then run a
            single step or the whole pipeline, with every command, parameter, and
            result tracked. Demos walk through single-cell RNA-seq, bulk RNA-seq,
            ATAC-seq, ChIP-seq, and whole-genome sequencing end to end.
          </p>
          <p className="setup-cta-row">
            <Link className="setup-btn" href="/tutorial/analysis">
              Open the analysis guide <Arrow />
            </Link>
          </p>
        </div>
      </Reveal>
    </PageShell>
  );
}

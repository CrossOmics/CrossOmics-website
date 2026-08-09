import Link from "next/link";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

export default function TutorialPage() {
  return (
    <PageShell title="TUTORIAL" subtitle="Meet Gardener" breadcrumb="Tutorial">
      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">01 / OVERVIEW</div>
          <h2 className="section-title">Brief Introduction</h2>
        </div>
        <div className="section-body">
          <p>
            This tutorial page will guide users through the core workflows of
            <strong> Gardener</strong>, from preparing datasets to
            connecting compute resources and launching reproducible dry-lab
            analyses.
          </p>
          <p>
            Demo videos walk through the system step by step: one covers the
            install and a full single-cell RNA run, and four more cover the
            bulkRNA, ATAC, ChIP, and WGS pipelines. They are embedded in the
            setup guide below.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="section-header">
          <div className="section-eyebrow">02 / SETUP</div>
          <h2 className="section-title">Install and Connect</h2>
        </div>
        <div className="section-body">
          <p>
            The setup guide covers installing Gardener on macOS or Windows,
            creating your first project, importing a dataset, and running a
            stage — then connecting a remote machine for sandbox execution,
            whether that is a Slurm cluster, a single server over SSH, or a
            SPHERE testbed node.
          </p>
          <p className="setup-cta-row">
            <Link className="setup-btn" href="/tutorial/setup">
              Open the setup guide
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </Link>
          </p>
        </div>
      </Reveal>
    </PageShell>
  );
}

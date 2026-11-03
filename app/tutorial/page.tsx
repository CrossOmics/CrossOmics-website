import Link from "next/link";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { Arrow } from "./setup/parts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutorial — Gardener | CrossOmics",
  description: "Get started with Gardener: install the app, run an analysis, build custom pipelines, explore community versions, and trace and share your results."
};

export default function TutorialPage() {
  return (
    <PageShell title="Tutorial" subtitle="Meet Gardener. Build, trace and share your analysis." breadcrumb="Tutorial">
      <section className="tutorial-intro" aria-labelledby="v3-intro-title">
        <span className="setup-pill">Gardener 3.0</span>
        <h2 id="v3-intro-title">From a community workflow to your own reproducible run</h2>
        <p>
          Find a tool or workflow in the community browser, inspect its versions,
          and import a runnable package. Then use the canvas to adapt the pipeline,
          follow its runs and outputs, and share a version with others.
        </p>
        <Link className="setup-btn" href="/tutorial/pipelines">
          Explore the new features <Arrow />
        </Link>
      </section>
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

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">03 / BUILD &amp; TRACK</div>
          <h2 className="section-title">Make a Pipeline Your Own</h2>
        </div>
        <div className="section-body">
          <p>
            Build a graph with Code and Loop nodes, connect your inputs, and save a
            version. Inspect individual attempts, parameters and output files, use
            the Agent alongside the canvas, and publish a package when you are
            ready to share it.
          </p>
          <p className="setup-cta-row">
            <Link className="setup-btn" href="/tutorial/pipelines#canvas">
              Open the pipeline guide <Arrow />
            </Link>
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">04 / COMMUNITY</div>
          <h2 className="section-title">Find Versions and Contribute Improvements</h2>
        </div>
        <div className="section-body">
          <p>
            Open the globe beside Pipelines to search Originals, explore releases
            and optimizations in a version tree, register your work, and check
            which widely used pipelines may need community maintenance.
          </p>
          <p className="setup-cta-row">
            <Link className="setup-btn" href="/tutorial/pipelines#community">
              Learn the community workflow <Arrow />
            </Link>
          </p>
        </div>
      </Reveal>
    </PageShell>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import VideoEmbed from "../setup/VideoEmbed";
import { Figure, Note } from "../setup/parts";
import { INTRO_VIDEO, ASSAY_DEMOS } from "../setup/data";

export const metadata: Metadata = {
  title: "Analysis — Gardener | CrossOmics",
  description:
    "Configure and run an analysis in Gardener: select a dataset, pick an analysis, and run a single step or a full pipeline, with demos for single-cell RNA-seq, bulk RNA-seq, ATAC-seq, ChIP-seq, and whole-genome sequencing."
};

export default function AnalysisPage() {
  return (
    <PageShell
      title="Analysis"
      subtitle="Configure a Pipeline and Run"
      breadcrumb={[{ label: "Tutorial", href: "/tutorial" }, { label: "Analysis" }]}
    >
      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">01 / RUN</div>
          <h2 className="section-title">Run an Analysis</h2>
        </div>
        <div className="section-body">
          <p>
            Once the app is installed and your data is imported (see the{" "}
            <a className="cta-link" href="/tutorial/setup">
              setup guide
            </a>
            ), running an analysis takes a few clicks. Every command, parameter, and result is
            tracked, so you can revisit or compare runs later.
          </p>
          <ol className="setup-ol">
            <li>Select the dataset.</li>
            <li>Pick an analysis and fill in the form.</li>
            <li>
              Choose <strong>Run Analysis</strong> for a single step, or{" "}
              <strong>Run Pipeline</strong> for the whole workflow.
            </li>
          </ol>
          <Figure
            src="/setup/07-run-stage.webp"
            alt="Analysis configuration form with the Run Analysis button"
            caption="Analysis form and Run button"
            width={1600}
            height={927}
          />
          <Note>No LLM API key is required for this path.</Note>
        </div>
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">02 / DEMOS</div>
          <h2 className="section-title">See the Pipelines Run</h2>
        </div>
        <div className="section-body">
          <p>
            Five demos, one per assay. The intro covers a full single-cell RNA-seq run, then
            bulk RNA-seq, ATAC-seq, ChIP-seq, and whole-genome sequencing end to end.
          </p>
        </div>
        <div className="video-grid">
          <VideoEmbed {...INTRO_VIDEO} note="Intro, setup, and a full single-cell RNA-seq run" />
          {ASSAY_DEMOS.map((v) => (
            <VideoEmbed key={v.id} {...v} />
          ))}
        </div>
      </Reveal>
    </PageShell>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import VideoEmbed from "../setup/VideoEmbed";
import { Figure, Note } from "../setup/parts";
import { INTRO_VIDEO, ASSAY_DEMOS } from "../setup/data";

export const metadata: Metadata = {
  title: "Analysis — Gardener | CrossOmics",
  description:
    "Configure and run an analysis in Gardener: select a dataset, pick an analysis, run a single step or a full pipeline, or rerun a pipeline from any node, with demos for single-cell RNA-seq, bulk RNA-seq, ATAC-seq, ChIP-seq, and whole-genome sequencing."
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
          <div className="section-eyebrow">02 / RERUN</div>
          <h2 className="section-title">Run From a Node</h2>
        </div>
        <div className="section-body">
          <p>
            You do not have to rerun a whole pipeline after changing one step. Start the run from
            that node, and Gardener runs it and everything downstream. Upstream nodes run too, but
            only when no earlier run left an output to reuse.
          </p>
          <ol className="setup-ol">
            <li>
              Open the pipeline on the canvas and click <strong>Run from here</strong> (the play
              button in the node&rsquo;s header). It is shown on Code and Tool nodes.
            </li>
            <li>
              Read the summary at the top of the Run dialog. It lists the nodes this run executes,
              including any upstream nodes it pulls in, and says why each one runs.
            </li>
            <li>
              Under <strong>Reuse outputs from</strong>, pick the earlier run to take outputs from.
              The latest run that can supply them is selected for you.
            </li>
            <li>
              Click <strong>Run</strong>. Inputs that already have a source stay collapsed as{" "}
              <strong>Inputs · N ready</strong>. You only need to open the list to change a source
              or to fill an input marked in red.
            </li>
          </ol>
          <p>Each input that comes from another node can take one of three sources:</p>
          <table className="setup-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>What happens</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Reuse from run</strong>
                </td>
                <td>
                  The input reads that node&rsquo;s output from the selected earlier run. This is the
                  default when that run produced the output and nothing upstream has changed since.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Run upstream</strong>
                </td>
                <td>
                  The node that produces the input runs again in this run. This is the default when
                  no earlier run can supply the output, or when the pipeline changed upstream since
                  that run.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Independent data</strong>
                </td>
                <td>
                  The input reads a file you pick instead: a project dataset or an external path.
                  Other inputs fed by the same node are not affected.
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            Inputs that come straight from the pipeline&rsquo;s Start node use the data bound on
            the canvas, or independent data if you switch them.
          </p>
          <Note>
            When a run pulls in upstream nodes, the Run status drawer names them in an{" "}
            <strong>Also ran</strong> line. Resuming or retrying that run keeps them in scope.
          </Note>
        </div>
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">03 / DEMOS</div>
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

import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { Figure, Note } from "../setup/parts";

export const metadata: Metadata = {
  title: "Pipelines & Community — Gardener | CrossOmics",
  description: "A practical guide to Gardener 3.0: community search and version trees, custom pipelines and Loops, run tracking, the Agent, package sharing, registration and maintenance rankings."
};

const topics = [
  ["community", "Find a community pipeline"],
  ["versions", "Choose a version"],
  ["canvas", "Build on the canvas"],
  ["runs", "Inspect a run"],
  ["agent", "Work with the Agent"],
  ["packages", "Import and publish packages"],
  ["register", "Register your contribution"],
  ["ranking", "Read the risk ranking"],
  ["more", "Datasets, sandboxes & benchmarks"]
] as const;

function Screenshot({ file, alt, caption }: { file: string; alt: string; caption: string }) {
  return (
    <div>
      <Figure src={`/tutorial-v3/${file}.png`} alt={alt} caption={caption} width={1280} height={720} />
      <a className="cta-link tutorial-image-link" href={`/tutorial-v3/${file}.png`} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size screenshot: ${caption}`}>
        Open full-size screenshot
      </a>
    </div>
  );
}

export default function PipelinesGuide() {
  return (
    <PageShell
      title="Pipelines & Community"
      subtitle="A hands-on introduction to Gardener 3.0"
      breadcrumb={[{ label: "Tutorial", href: "/tutorial" }, { label: "Pipelines & Community" }]}
    >
      <div className="feature-guide-lede">
        <p>
          Start with a tool or workflow from the community, adapt it on the canvas,
          and keep a record of the inputs, parameters and results. This guide
          shows where to find the new features and how to use them together.
        </p>
        <Note>
          First install the app and open a project using the <Link className="cta-link" href="/tutorial/setup">setup guide</Link>.
          Browsing the registry does not need an LLM API key. Running a pipeline
          needs a suitable local sandbox or a connected HPC; using the Agent also
          needs a configured model and API key.
        </Note>
      </div>

      <nav className="feature-guide-topics" aria-label="On this page">
        {topics.map(([id, label], index) => (
          <a key={id} href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>
        ))}
      </nav>

      <section className="section feature-guide-section" aria-labelledby="community">
        <div className="section-header">
          <div className="section-eyebrow">01 / SEARCH</div>
          <h2 className="section-title" id="community">Find a community pipeline</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>In an open project, find <strong>Pipelines</strong> in the left sidebar. Click the <strong>globe icon</strong> to open Community pipelines.</li>
            <li>Choose <strong>Search</strong>. Enter a tool name, such as <strong>STAR</strong>, or a term describing your task.</li>
            <li>Narrow the results by <strong>Kind</strong> (Tool or Workflow), <strong>Modality</strong> or <strong>Domain</strong>. Use <strong>Runnable in Gardener</strong> when you want a version with a Gardener package.</li>
            <li>Open a result to see its repository, papers, contributors, metrics and version tree.</li>
          </ol>
          <Note>
            Results list <strong>Originals</strong>: the main tool or workflow
            entries. Releases and community optimizations appear inside each
            Original, rather than as separate search results. If a task keyword
            does not match an entry, try its name or the modality filters.
          </Note>
          <Screenshot file="community-search" alt="Community Search with STAR entered, modality and domain filters, and matching Original pipelines" caption="The globe opens Community pipelines. Search results lead to an Original’s details and versions." />
          <p>Use <strong>Refresh</strong> to check for a new index. Once downloaded, the cached index can still be browsed offline; the header shows when it was updated and checked.</p>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="versions">
        <div className="section-header">
          <div className="section-eyebrow">02 / VERSION TREE</div>
          <h2 className="section-title" id="versions">Choose the implementation you need</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>Open an Original, then scroll to <strong>Versions and optimizations</strong>.</li>
            <li>Select a node in the tree. <strong>Original</strong> denotes an upstream release; <strong>Optimization</strong> denotes a contributed improvement based on another version of that Original.</li>
            <li>Review the repository and commit, contribution notes, and any listed test datasets or benchmark results.</li>
            <li>If the selected version provides a Gardener package, use its import action to bring it into your project. Otherwise, use the repository and commit links to inspect the source.</li>
          </ol>
          <Screenshot file="version-tree" alt="STAR detail panel showing the connected 2.7.11a and 2.7.11b Original versions, the selected commit, and Submit an optimization of this version" caption="Select a tree node to inspect that version. A registered source version does not necessarily include a runnable package." />
          <p>For an existing local pipeline, <strong>Link to community version…</strong> in the canvas header lets you record its community association. Linking records a relationship; it does not replace or import the pipeline’s code.</p>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="canvas">
        <div className="section-header">
          <div className="section-eyebrow">03 / CANVAS</div>
          <h2 className="section-title" id="canvas">Build a pipeline and save a version</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>Click the <strong>plus icon beside Pipelines</strong> to create a pipeline, or open an imported pipeline. Choose <strong>Browse templates</strong> to start from a published template.</li>
            <li>Drag nodes from the palette, or use their plus buttons. Define inputs on <strong>Start</strong>, connect node ports, and declare the results on <strong>End</strong>. Use <strong>Data</strong> and <strong>Folder</strong> for typed file slots, and <strong>Code</strong> or built-in tools for processing.</li>
            <li>Use each node’s edit button to configure its inputs, parameters and supported execution settings. A <strong>Loop</strong> contains a body graph and bounded feedback iterations; configure its body, bindings and iteration limit before running it.</li>
            <li>Click <strong>Save</strong> to keep the draft. Then choose <strong>Create Version</strong> to snapshot it. <strong>History</strong> lets you inspect saved versions and their actions.</li>
            <li>Click <strong>Run</strong>, check the input bindings and run settings, then submit. Independent nodes may run concurrently within the configured limit; connected nodes wait for the outputs they need.</li>
          </ol>
          <Screenshot file="pipeline-canvas" alt="A real STAR and StringTie comparison pipeline with the node palette, connected standard and Opti2x branches, Run, Save and History controls" caption="The canvas connects inputs, processing steps and results. This example compares standard and Opti2x implementations." />
          <Note>
            Saving updates the editable draft. Creating a version makes a
            snapshot; running captures its own configuration. Editing the draft
            later does not rewrite the configuration of an earlier run.
          </Note>
          <p>For an analysis walkthrough and assay demos, continue to the <Link className="cta-link" href="/tutorial/analysis">analysis guide</Link>.</p>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="runs">
        <div className="section-header">
          <div className="section-eyebrow">04 / RUN HISTORY</div>
          <h2 className="section-title" id="runs">Inspect what actually ran</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>Click <strong>Runs</strong> above the canvas, or expand a pipeline’s run history in the sidebar.</li>
            <li>Select a run and a node execution. Inspect its status, attempts, captured parameters, inputs and available outputs. Loop iterations and retries have distinct execution records.</li>
            <li>Open output files from the run details or the sidebar’s results. Use available provenance and dataset-usage views to follow the input/output relationships.</li>
            <li>For an interrupted or failed run, use the available <strong>Resume</strong> or <strong>Retry</strong> action after inspecting the failure. When multiple attempts exist, select the specific execution you mean.</li>
          </ol>
          <p>Supported run parameter overrides apply to that execution. Use <strong>Save to draft</strong> when you explicitly want those changes in the editable pipeline, including parameters inside a Loop.</p>
          <Note>
            A declared input is not proof that a run consumed it. Historical
            records may also have less detail than new runs. If a scheduler
            submission is uncertain, Gardener keeps it unresolved rather than
            automatically launching another job; check the actual job before retrying.
          </Note>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="agent">
        <div className="section-header">
          <div className="section-eyebrow">05 / AGENT</div>
          <h2 className="section-title" id="agent">Ask about a specific execution</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>Configure a supported model and API key in Settings, then open the Agent panel beside the canvas. If it is collapsed, use the <strong>chat bubble at the right edge</strong> to reopen it.</li>
            <li>In the run details, use <strong>Use in chat</strong> for the execution you want the Agent to investigate.</li>
            <li>Ask a focused question, such as <em>“Read this execution’s parameters and logs, and explain the failure using the recorded evidence.”</em></li>
          </ol>
          <p>Gardener uses the selected execution context to help the Agent locate the relevant records. Keep the same chat to continue a discussion, and inspect the tool evidence and output links when checking its answer.</p>
          <Note>The Agent needs access to the relevant backend and files to inspect them. Selecting a node provides context; it does not mean every file has already been read.</Note>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="packages">
        <div className="section-header">
          <div className="section-eyebrow">06 / PACKAGES</div>
          <h2 className="section-title" id="packages">Import once, adapt, then share</h2>
        </div>
        <div className="section-body">
          <h3>Import a package</h3>
          <ol className="setup-ol">
            <li>Click the <strong>cloud-download icon beside Pipelines</strong>, or choose the import action on a community version that provides a package.</li>
            <li>Enter the published registry reference, including its <strong>sha256 digest</strong>. Provide registry credentials in the desktop app when required.</li>
            <li>Review the import options and wait for verification. Depending on the package and chosen options, runtime images or supported public input data may also need downloading.</li>
            <li>Open the imported pipeline, review its description and inputs, and supply any user-provided data before running.</li>
          </ol>
          <h3>Publish a package</h3>
          <ol className="setup-ol">
            <li><strong>Save</strong> the draft and <strong>Create Version</strong>.</li>
            <li>Open <strong>History</strong>, find the version, and choose <strong>Publish</strong>.</li>
            <li>Set the target registry and package options, review the included environment and data references, and publish.</li>
            <li>Share the resulting digest-pinned reference. Publish records carry signed provenance, and registry tokens stay in the desktop credential store.</li>
          </ol>
          <Note>Publishing a package uploads runnable material to a registry. Registering it in Community is a separate step that makes the version discoverable.</Note>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="register">
        <div className="section-header">
          <div className="section-eyebrow">07 / CONTRIBUTE</div>
          <h2 className="section-title" id="register">Register an Original or an Optimization</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>Open the globe beside Pipelines, then select <strong>Register</strong>.</li>
            <li>Choose <strong>Original</strong> for a new tool or workflow entry. For an <strong>Optimization</strong>, first select the existing Original and the parent version your improvement builds on.</li>
            <li>Fill in the repository, source commit, version and contributor details. For an optimization, describe what improved; add test datasets, benchmark results and an optional Gardener package reference when available.</li>
            <li>Resolve field errors and inspect the generated preview. Connect your GitHub account using the desktop app’s token controls, then submit.</li>
            <li>Gardener opens a pull request to the <a className="cta-link" href="https://github.com/CrossOmics/pipeline-registry" target="_blank" rel="noopener noreferrer">community registry</a>. Follow its status in the submission list. After review and merge, it appears when the published index is rebuilt and refreshed.</li>
          </ol>
          <Note>Submit the source commit that actually produced your version. Registry submission creates a reviewable PR; it does not immediately publish an entry or merge the PR.</Note>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="ranking">
        <div className="section-header">
          <div className="section-eyebrow">08 / MAINTENANCE</div>
          <h2 className="section-title" id="ranking">Read the risk ranking</h2>
        </div>
        <div className="section-body">
          <ol className="setup-ol">
            <li>In Community pipelines, select <strong>Risk ranking</strong>.</li>
            <li>Compare the risk score with <strong>Original GitHub update</strong>, the activity details and the three annual citation columns. On a narrow window, scroll the table horizontally to see every column.</li>
            <li>Read <strong>BioCode maintenance</strong> separately to see whether replacement maintenance is registered or planned. Follow the <a className="cta-link" href="https://github.com/BioCode-Commons" target="_blank" rel="noopener noreferrer">BioCode Commons</a> link for community maintenance projects.</li>
            <li>Use <strong>Open public page</strong> to view or share the <a className="cta-link" href="https://crossomics.github.io/pipeline-registry/ranking/" target="_blank" rel="noopener noreferrer">ranking without installing Gardener</a>. Enable <strong>Include mature (stable) pipelines</strong> if you also want those entries.</li>
          </ol>
          <Screenshot file="risk-ranking" alt="Risk ranking with risk scores, original GitHub update dates, BioCode maintenance statuses, and citation columns" caption="Rankings use the original author’s repository. BioCode maintenance is recorded separately; values reflect the collection date shown in the app." />
          <Note>
            Higher risk means a widely cited pipeline may need community attention;
            it is not a verdict on code quality. The ranking stays ordered by risk
            score. Replacement maintenance does not change the original
            repository’s activity score. The citation window is the previous two
            full years plus the current year to date.
          </Note>
        </div>
      </section>

      <section className="section feature-guide-section" aria-labelledby="more">
        <div className="section-header">
          <div className="section-eyebrow">09 / MORE TO TRY</div>
          <h2 className="section-title" id="more">Datasets, sandboxes and benchmarks</h2>
        </div>
        <div className="section-body">
          <ul className="setup-list">
            <li><strong>Merge datasets:</strong> use <strong>Merge</strong> beside the sidebar’s unused-data section to combine eligible scRNA-seq datasets into a new dataset. At least two datasets are needed, and their gene sets must match; mismatches are reported before proceeding.</li>
            <li><strong>Choose a sandbox:</strong> enable optional R or C/C++ support under <strong>Settings → Sandbox</strong>. Local execution uses compatible Docker/Podman images; HPC execution requires the corresponding remote runtime and images.</li>
            <li><strong>Compare Opti2x:</strong> open the <strong>flask icon beside Pipelines</strong> for the STAR / StringTie benchmark. Review inputs and resources, compare the standard and experimental Opti2x implementations, and inspect both resource metrics and biological QC. Stock tools remain the default; results depend on your data and execution environment.</li>
          </ul>
          <p>Need help? Join the <a className="cta-link" href="https://cross-omics.slack.com/archives/C0B6JCYNSCD" target="_blank" rel="noopener noreferrer">CrossOmics Slack</a>. When reporting a problem, include the app version, the relevant run or node, and a log excerpt with credentials and private paths removed.</p>
        </div>
      </section>
    </PageShell>
  );
}

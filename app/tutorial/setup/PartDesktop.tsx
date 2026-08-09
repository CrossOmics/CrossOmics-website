"use client";

import { Figure, Note, PartHead, Step, Sub } from "./parts";
import VideoEmbed from "./VideoEmbed";
import { ASSAY_DEMOS, RELEASES } from "./data";

export default function PartDesktop() {
  return (
    <section className="setup-part" id="part-desktop">
      <PartHead num="PART I" title="Desktop Setup">
        Installing on macOS or Windows, first launch, creating a project, importing a dataset,
        running a stage, and configuring the AI model.
      </PartHead>

      <Step id="install" num="01" title="Install">
        <p>
          Download from{" "}
          <a className="setup-inline-link" href={RELEASES} target="_blank" rel="noopener noreferrer">
            GitHub Releases
          </a>{" "}
          and choose the latest version for your platform:
        </p>
        <ul className="setup-list">
          <li>
            <span className="setup-tag">macOS</span> Apple Silicon — <code>.dmg</code>
          </li>
          <li>
            <span className="setup-tag">Windows</span> <code>.exe</code>
          </li>
        </ul>
        <Figure
          src="/setup/01-releases.webp"
          alt="Gardener GitHub Releases page listing the .dmg and .exe assets"
          caption="Releases page"
          width={1600}
          height={1070}
        />

        <Sub>macOS</Sub>
        <p>After downloading the dmg file, double-click it and drag the app to Applications.</p>
        <Figure
          src="/setup/02-macos-gatekeeper.webp"
          alt="macOS Gatekeeper prompt — right-click Open, then confirm"
          caption="Right-click Open, then confirm"
          width={1600}
          height={1125}
          size="sm"
        />
        <p>
          When it finishes, search for <strong>Lotus Biological Agent</strong> by pressing{" "}
          <code>⌘ + Space</code> and open it.
        </p>
        <Figure
          src="/setup/02-open.webp"
          alt="Spotlight search opening Lotus Biological Agent"
          caption="Open from Spotlight"
          width={1600}
          height={1174}
          size="md"
        />
        <p>If Gatekeeper still blocks the app, clear the quarantine flag instead:</p>
        <pre className="code-block">
          {`xattr -d com.apple.quarantine "/Applications/Lotus Biological Agent.app"`}
        </pre>

        <Sub>Windows</Sub>
        <p>
          Run the installer. At the SmartScreen prompt, choose <strong>next</strong>.
        </p>
        <Figure
          src="/setup/03-windows-smartscreen.webp"
          alt="Windows SmartScreen prompt during installation"
          caption="SmartScreen bypass"
          width={1600}
          height={1200}
          size="md"
        />
        <p>
          Select your preferred installation path and click <strong>Install</strong>.
        </p>
        <Figure
          src="/setup/03-windows-install.webp"
          alt="Windows installer with installation path selection"
          caption="Choose a path, then Install"
          width={1600}
          height={1200}
          size="md"
        />
      </Step>

      <Step id="first-launch" num="02" title="First Launch">
        <p>Open the app and wait for the backend to start.</p>
        <Figure
          src="/setup/04-Launch.webp"
          alt="Gardener landing page after the backend starts"
          caption="Landing page"
          width={1600}
          height={900}
          size="md"
        />
      </Step>

      <Step id="project" num="03" title="Create a Project and Import Data">
        <p>Create a project.</p>
        <Figure
          src="/setup/05-new-project.webp"
          alt="New project dialog in Gardener"
          caption="New project"
          width={1600}
          height={927}
        />
        <p>Then import your dataset.</p>
        <Figure
          src="/setup/06-import-dataset.webp"
          alt="Import dataset view in Gardener"
          caption="Import dataset"
          width={1600}
          height={928}
        />
      </Step>

      <Step id="run-stage" num="04" title="Run a Stage">
        <ol className="setup-ol">
          <li>Select the dataset.</li>
          <li>Pick a stage and fill in the form.</li>
          <li>
            Choose <strong>Run This Stage</strong>, or <strong>Run Pipeline</strong>.
          </li>
        </ol>
        <Figure
          src="/setup/07-run-stage.webp"
          alt="Stage configuration form with the Run This Stage button"
          caption="Stage form and Run button"
          width={1600}
          height={927}
        />
        <Note>No LLM API key is required for this path.</Note>

        <Sub>Pipeline Walkthroughs</Sub>
        <p>
          One demo per assay, each running the pipeline start to finish. Single-cell RNA is covered
          in the{" "}
          <a className="setup-inline-link" href="#walkthrough">
            intro walkthrough
          </a>{" "}
          at the top of this page.
        </p>
        <div className="video-grid">
          {ASSAY_DEMOS.map((v) => (
            <VideoEmbed key={v.id} {...v} />
          ))}
        </div>
      </Step>

      <Step id="api-key" num="05" title="Add an LLM API Key">
        <p className="setup-optional">Optional — skip it if you are not using LLM features.</p>
        <p>Required only for:</p>
        <ul className="setup-list">
          <li>agent chat</li>
          <li>sandbox execution</li>
          <li>
            the <strong>LLM Annotation</strong> switch
          </li>
          <li>
            resolving samplesheets whose columns are not <code>sample</code> / <code>fastq_1</code>
          </li>
        </ul>
        <ol className="setup-ol">
          <li>
            Open <strong>Settings</strong> at the bottom of the project sidebar.
          </li>
          <li>
            Choose <strong>AI Model Config</strong> in the left nav.
          </li>
          <li>Select a provider, paste the key, and save.</li>
        </ol>
        <Figure
          src="/setup/09-model-config.webp"
          alt="Settings screen showing AI Model Config with provider and API key fields"
          caption="Settings → AI Model Config"
          width={1600}
          height={930}
        />
        <p>
          Accepted providers: OpenAI, Anthropic, Google, Google Gemma, Hugging Face, Mistral, Qwen,
          DeepSeek.
        </p>
        <Note tone="warn">
          Leave <strong>LLM Annotation</strong> off if no key is configured — the annotation stage
          will fail rather than fall back.
        </Note>
      </Step>
    </section>
  );
}

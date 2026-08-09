import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import SetupGuide from "./SetupGuide";
import VideoEmbed from "./VideoEmbed";
import { Arrow } from "./parts";
import { INTRO_VIDEO, RELEASES } from "./data";

export const metadata: Metadata = {
  title: "Setup — Gardener | CrossOmics",
  description:
    "Install Gardener on macOS or Windows, create your first project, run a stage, and connect the app to a Slurm cluster, a single server over SSH, or a SPHERE testbed node."
};

export default function SetupPage() {
  return (
    <PageShell
      title="SETUP"
      subtitle="Install Gardener, Then Connect a Machine"
      breadcrumb={[{ label: "Tutorial", href: "/tutorial" }, { label: "Setup" }]}
    >
      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">00 / BEFORE YOU START</div>
          <h2 className="section-title">Two Parts, One Afternoon</h2>
        </div>
        <div className="section-body">
          <p>
            <strong>Gardener</strong> (Lotus Biological Agent) is a desktop app for running
            biological data analysis pipelines, with optional execution on a remote machine.
            Part&nbsp;I gets the app installed and a first stage running on your own laptop — no API
            key, no cluster. Part&nbsp;II connects it to a remote machine, which is required for
            sandbox execution because that cannot run locally on macOS or Windows.
          </p>
          <p>
            Three remote topologies are supported — a Slurm cluster, a single server over SSH, or a
            SPHERE testbed node. Pick one in Part&nbsp;II and the steps follow your choice.
          </p>
          <p className="setup-cta-row">
            <a className="setup-btn" href={RELEASES} target="_blank" rel="noopener noreferrer">
              Download the latest release <Arrow />
            </a>
            <a className="cta-link" href="#remote-panel">
              Skip to remote setup <Arrow />
            </a>
          </p>
          <p>
            Prefer to watch first? This walkthrough covers the install, the first project, and an
            scRNA run end to end.
          </p>
          <div id="walkthrough">
            <VideoEmbed {...INTRO_VIDEO} note="Covers Part I, plus a full single-cell RNA run" />
          </div>
        </div>
      </Reveal>

      <SetupGuide />
    </PageShell>
  );
}

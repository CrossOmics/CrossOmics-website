import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import SetupGuide from "./SetupGuide";
import { Arrow } from "./parts";
import { RELEASES } from "./data";

export const metadata: Metadata = {
  title: "Setup — Gardener | CrossOmics",
  description:
    "Install Gardener on macOS or Windows, create your first project, and connect the app to a Slurm cluster, a single server over SSH, or a SPHERE testbed node."
};

export default function SetupPage() {
  return (
    <PageShell
      title="Setup"
      subtitle="Install Gardener, Then Connect a Machine"
      breadcrumb={[{ label: "Tutorial", href: "/tutorial" }, { label: "Setup" }]}
    >
      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">00 / BEFORE YOU START</div>
          <h2 className="section-title">One-Time Installation</h2>
        </div>
        <div className="section-body">
          <p>
            <strong>Gardener</strong> is a desktop app for running biological data analysis
            pipelines, with optional execution on a remote machine. Part&nbsp;I gets the app
            installed. Part&nbsp;II connects it to a remote HPC, which handles the heavy compute.
          </p>
          <p>
            We currently support three remote setups: a Slurm cluster, a single server over SSH, or a
            SPHERE testbed node. Part&nbsp;II adapts to whichever you pick.
          </p>
          <p className="setup-cta-row">
            <a className="setup-btn" href={RELEASES} target="_blank" rel="noopener noreferrer">
              Download the latest release <Arrow />
            </a>
            <a className="cta-link" href="#remote-panel">
              Skip to remote setup <Arrow />
            </a>
          </p>
        </div>
      </Reveal>

      <SetupGuide />
    </PageShell>
  );
}

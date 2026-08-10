export { RELEASES_URL as RELEASES } from "@/lib/releases";

export type Video = {
  id: string;
  /** Short label for the page. */
  title: string;
  /** The upload's own title, used for the iframe title and the play button's label. */
  full: string;
};

export const INTRO_VIDEO: Video = {
  id: "hPXpYxSJ2-U",
  title: "Intro, Setup & scRNA",
  full: "CrossOmics Gardener Demo - Intro, setup, and scRNA"
};

/** Node-side companion guide for the Sphere topology. */
export const NODE_GUIDE = "/tutorial/setup/sphere-node";

/** Per-assay pipeline walkthroughs. scRNA is covered by INTRO_VIDEO. */
export const ASSAY_DEMOS: Video[] = [
  { id: "z3JXRlij_lk", title: "bulkRNA", full: "CrossOmics Gardener Demo - bulkRNA" },
  { id: "xDdGzFzfwKI", title: "ATAC", full: "CrossOmics Gardener Demo - ATAC" },
  { id: "qKy4FHHEn60", title: "ChIP", full: "CrossOmics Gardener Demo - ChIP" },
  { id: "jAabsdyeLWM", title: "WGS", full: "CrossOmics Gardener Demo - WGS" }
];

export type TopologyKey = "slurm" | "ssh" | "sphere";

export type Topology = {
  key: TopologyKey;
  /** Exactly as it appears in the app's Connection Topology control. */
  label: string;
  when: string;
  blurb: string;
};

export const TOPOLOGIES: Topology[] = [
  {
    key: "slurm",
    label: "HPC via Slurm",
    when: "Login node + Slurm",
    blurb: "A cluster that schedules work through Slurm. The default."
  },
  {
    key: "ssh",
    label: "Direct SSH",
    when: "Single server",
    blurb: "One machine you can SSH into — a lab workstation, a cloud VM, a standalone GPU box."
  },
  {
    key: "sphere",
    label: "Sphere XDC",
    when: "SPHERE testbed",
    blurb: "A compute node reached through the Merge portal and the XDC jump chain."
  }
];

/** Step ids are shared across topologies so anchors and scroll position survive a switch. */
export function remoteIndexItems(topology: TopologyKey) {
  const access = topology === "sphere" ? "04  MRG Access" : "04  SSH";
  const prereq =
    topology === "ssh"
      ? [{ id: "remote-prereq", label: "00  Requirements" }]
      : topology === "sphere"
        ? [{ id: "remote-prereq", label: "00  Before You Start" }]
        : [];

  return [
    ...prereq,
    { id: "remote-panel", label: "01  Connection Panel" },
    { id: "remote-topology", label: "02  Topology" },
    { id: "remote-fields", label: "03  Fields" },
    { id: "remote-access", label: access },
    { id: "remote-storage", label: "05  Storage" },
    { id: "remote-connect", label: "06  Connect" },
    { id: "remote-disconnect", label: "07  Disconnect" }
  ];
}

export const DESKTOP_INDEX_ITEMS = [
  { id: "install", label: "01  Install" },
  { id: "first-launch", label: "02  First Launch" },
  { id: "project", label: "03  Project & Data" },
  { id: "run-stage", label: "04  Run a Stage" },
  { id: "api-key", label: "05  LLM API Key" }
];

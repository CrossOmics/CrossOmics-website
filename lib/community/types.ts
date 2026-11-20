import { toolTypes } from "./tool-types";

export const contributionTypes = toolTypes;

export const subjectKinds = {
  pipeline: "Pipeline",
  tool: "Tool",
  algorithm: "Algorithm"
} as const;

export const impactMetrics = {
  usage: "Uses",
  stars: "GitHub stars",
  citations: "Citations"
} as const;

export const signInLabels = { github: "GitHub", google: "Google", apple: "Apple" } as const;
export type SignInProvider = keyof typeof signInLabels;

export type Contributor = { id: string; login: string };
export type ContributionInput = {
  type: keyof typeof contributionTypes;
  subjectKind: keyof typeof subjectKinds;
  subjectName: string;
  catalogId: string | null;
  summary: string;
  occurredOn: string;
  projectUrl: string;
  evidenceUrl: string;
  projectScope: "commons" | "external";
};

export type Impact = {
  metric: keyof typeof impactMetrics;
  value: number;
  evidenceUrl: string;
  observedAt?: string;
};

export type Contribution = ContributionInput & {
  id: string;
  contributor: Contributor;
  channel: "web" | "gardener";
  createdAt: string;
  impact: Impact[];
};

export type RegistryVersion = {
  id: string;
  kind: "original" | "optimization";
  label: string;
  parent: string | null;
  repo: string;
  commit: string;
  released_at: string | null;
  improvement: string | null;
  withdrawn: boolean;
  source?: "repository";
};

export type RegistryRepository = { url: string; primary: boolean; name?: string; pinned?: boolean; description?: string };

export type RegistryMetrics = {
  recent_citations: number | null;
  priority?: number | null;
  priority_reason?: string | null;
  citations_by_year?: Record<string, number>;
  collected_at?: string | null;
  stale_since?: string | null;
  activity?: {
    archived?: boolean;
    moved_to_url?: string | null;
    last_commit_at?: string | null;
    commits?: number | null;
    releases?: number | null;
    merged_prs?: number | null;
    closed_issues?: number | null;
  } | null;
};

export type RegistryItem = {
  id: string;
  name: string;
  kind: "tool" | "workflow";
  description: string;
  domain: string;
  status: string;
  modalities: string[];
  algorithms: string[];
  keywords: string[];
  inputs: string[];
  outputs: string[];
  repositories: RegistryRepository[];
  papers: { title: string | null; doi: string | null; url: string | null }[];
  versions: RegistryVersion[];
  metrics: RegistryMetrics | null;
  biocode_maintenance?: { status: "planned" | "available"; repository?: string };
};

export type RegistryCatalog = {
  items: RegistryItem[];
  generatedAt: string;
  metricsCollectedAt?: string | null;
  config?: { citation_years: number[]; activity_window_days: number };
};

export const bountyCategories = {
  maintenance: "Maintenance",
  workflow: "Workflow",
  tooling: "Tooling",
  benchmark: "Benchmark",
  documentation: "Documentation"
} as const;

export const bountyStatuses = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed"
} as const;

export type BountyStatus = keyof typeof bountyStatuses;
export type Bounty = {
  id: string;
  title: string;
  description: string;
  category: keyof typeof bountyCategories;
  status: BountyStatus;
  projectUrl: string | null;
  reward: string | null;
  author: string;
  createdAt: string;
  replyCount: number;
};

export type BountyReply = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export const contributionTypes = {
  new_pipeline: "New pipeline",
  algorithm_update: "Algorithm update",
  bug_fix: "Bug fix",
  optimization: "Optimization",
  maintenance: "Maintenance"
} as const;

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

type RegistryVersion = {
  id: string;
  kind: "original" | "optimization";
  label: string;
  parent: string | null;
  repo: string;
  commit: string;
  released_at: string | null;
  improvement: string | null;
  withdrawn: boolean;
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
  repositories: { url: string; primary: boolean }[];
  papers: { title: string | null; doi: string | null; url: string | null }[];
  versions: RegistryVersion[];
  metrics: { recent_citations: number | null } | null;
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

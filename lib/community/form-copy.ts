export const subjectDescriptions = {
  pipeline: "Connects several analysis steps, such as alignment, counting, and quality checks.",
  tool: "Software you can run, such as STAR, MAFFT, or Scanpy.",
  algorithm: "A method used inside a tool, such as sequence alignment or clustering."
} as const;

export const contributionDescriptions = {
  new_pipeline: "Create a new workflow, program, or method, such as a new RNA-seq pipeline.",
  algorithm_update: "Change or add a computational method, such as replacing a clustering method.",
  bug_fix: "Correct a defect, such as a crash, wrong result, or broken input handling.",
  optimization: "Reduce runtime or memory use while preserving the intended results, such as speeding up alignment.",
  maintenance: "Keep a project usable by updating documentation, dependencies, or platform compatibility."
} as const;

export function contributionSummary(type: string) {
  if (type === "new_pipeline") return {
    label: "What does it do?", placeholder: "Describe the new project, the data it accepts, and the results it produces."
  };
  if (type === "bug_fix") return {
    label: "What problem did you fix?", placeholder: "Describe the problem and how it behaves after your fix."
  };
  if (type === "optimization") return {
    label: "What did you improve?", placeholder: "Describe the time or memory improvement and link to the comparison."
  };
  if (type === "maintenance") return {
    label: "What did you maintain?", placeholder: "Describe the documentation, dependencies, or compatibility you updated."
  };
  return { label: "What did you add or change?", placeholder: "Describe the method or feature you added and what it enables." };
}

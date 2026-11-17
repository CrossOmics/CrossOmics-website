import { normalizeToolType } from "./tool-types";

export const subjectDescriptions = {
  tool: "Software you can run, such as STAR, StringTie, MAFFT, or Scanpy."
} as const;

export const contributionDescriptions = {
  original: "Create an original tool, such as a new analysis program.",
  update: "Update a tool through performance improvements, bug fixes, new features, compatibility, documentation or maintenance."
} as const;

export function contributionSummary(type: string) {
  if (normalizeToolType(type) === "original") return {
    label: "What does it do?", placeholder: "Describe the tool, the data it accepts, and the results it produces."
  };
  return {
    label: "What did you update?", placeholder: "Describe your performance improvement, bug fix, feature or maintenance change, and link to the supporting evidence."
  };
}

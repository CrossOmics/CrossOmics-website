import type { RegistryMetadata as Metadata } from "@/lib/community/registry-v2";

export default function RegistryMetadata({ metadata }: { metadata: Partial<Metadata> }) {
  const fields = [["modalities", "Modalities"], ["algorithms", "Algorithms"], ["inputs", "Inputs"], ["outputs", "Outputs"]] as const;
  const populated = fields.filter(([key]) => metadata[key]?.some(value => value.trim()));
  if (!populated.length) return null;
  return <dl className="community-detail-grid">{populated.map(([key, label]) =>
    <div key={key}><dt>{label}</dt><dd>{metadata[key]!.filter(value => value.trim()).join(", ")}</dd></div>
  )}</dl>;
}

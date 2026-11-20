import type { RegistryMetadata } from "@/lib/community/registry-v2";

const fields = [
  ["modalities", "Modalities", "RNA-seq\nsingle-cell RNA-seq"],
  ["algorithms", "Algorithms", "Splice-aware alignment"],
  ["inputs", "Inputs", "FASTQ reads\nreference genome index"],
  ["outputs", "Outputs", "SAM or BAM alignments\nsplice junctions"]
] as const;

export function readRegistryMetadata(form: FormData): RegistryMetadata {
  return Object.fromEntries(fields.map(([key]) => [key,
    [...new Set(String(form.get(key) ?? "").split(/\r?\n/).map(value => value.trim()).filter(Boolean))]
  ])) as RegistryMetadata;
}

export function changedRegistryMetadata(metadata: RegistryMetadata, previous: Partial<RegistryMetadata>): Partial<RegistryMetadata> {
  return Object.fromEntries(fields.filter(([key]) => JSON.stringify(metadata[key]) !== JSON.stringify(previous[key] ?? []))
    .map(([key]) => [key, metadata[key]]));
}

export default function RegistryMetadataFields({ metadata = {} }: { metadata?: Partial<RegistryMetadata> }) {
  return <fieldset>
    <legend>Tool data and methods (optional)</legend>
    <p>Describe supported data, methods, and file formats. Enter one value per line, up to 20 values of 120 characters each. Leave unknown information blank.</p>
    <div className="community-form-grid">
      {fields.map(([key, label, example]) => <label key={key}>{label} (optional)
        <textarea name={key} defaultValue={metadata[key]?.join("\n") ?? ""} rows={2} maxLength={2500} placeholder={example} />
      </label>)}
    </div>
  </fieldset>;
}

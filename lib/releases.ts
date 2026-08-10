export const RELEASES_URL = "https://github.com/CrossOmics/Gardener-Agent/releases";

export type Release = {
  version: string;
  /** What shipped, in one sentence. Keep it to two clauses — the card is narrow. */
  summary: string;
  href: string;
};

/**
 * Hand-maintained: nothing reads the GitHub API. Update this when a release is
 * cut, or the home page will keep announcing an old version.
 */
export const LATEST_RELEASE: Release = {
  version: "2.1.0",
  summary:
    "GEO and Illumina BaseSpace downloads through a unified Download from Web flow, plus Bulk RNA-seq and WGS (nf-core/sarek) workflows with a shared samplesheet editor.",
  href: RELEASES_URL
};

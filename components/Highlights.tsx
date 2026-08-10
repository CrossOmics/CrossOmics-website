import { PAPERS, formatPaperDate } from "@/lib/papers";
import { getLatestRelease, formatReleaseDate } from "@/lib/releases";
import { content } from "@/lib/content";

export default async function Highlights() {
  const { latest } = content;
  const paper = PAPERS[0];
  const release = await getLatestRelease();
  const released = formatReleaseDate(release.publishedAt);

  return (
    <section className="home-highlights container" aria-labelledby="highlights-heading">
      <h2 id="highlights-heading" className="home-cards-heading">{latest.heading}</h2>

      <div className="home-highlights-grid">
        {/* Broad category labels, not the specific venue or page name — a reader
            scanning "Latest" wants to know what kind of item this is. */}
        <a className="home-highlight" href={paper.href} target="_blank" rel="noopener noreferrer">
          <span className="home-highlight-head">
            <span className="tag-pill">{latest.researchTag}</span>
            <span className="home-highlight-date">{formatPaperDate(paper.date)}</span>
          </span>
          <span className="home-highlight-title">{paper.title}</span>
          <span className="home-highlight-desc">{paper.authors}</span>
          <span className="cta-link">{latest.readPaperCta}</span>
        </a>

        <a
          className="home-highlight"
          href={release.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="home-highlight-head">
            <span className="tag-pill">{latest.releaseTag}</span>
            {released && <span className="home-highlight-date">{released}</span>}
          </span>
          <span className="home-highlight-title">Gardener {release.version}</span>
          <span className="home-highlight-desc">{release.summary}</span>
          <span className="cta-link">{latest.seeReleaseCta}</span>
        </a>
      </div>
    </section>
  );
}

import { PAPERS } from "@/lib/papers";
import { LATEST_RELEASE } from "@/lib/releases";

export default function Highlights() {
  const paper = PAPERS[0];

  return (
    <section className="home-highlights container" aria-labelledby="highlights-heading">
      <h2 id="highlights-heading" className="home-cards-heading">Latest</h2>

      <div className="home-highlights-grid">
        {/* Broad category labels, not the specific venue or page name — a reader
            scanning "Latest" wants to know what kind of item this is. */}
        <a className="home-highlight" href={paper.href} target="_blank" rel="noopener noreferrer">
          <span className="tag-pill">Research</span>
          <span className="home-highlight-title">{paper.title}</span>
          <span className="home-highlight-desc">{paper.authors}</span>
          <span className="cta-link">Read the paper →</span>
        </a>

        <a
          className="home-highlight"
          href={LATEST_RELEASE.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="tag-pill">Release</span>
          <span className="home-highlight-title">Gardener {LATEST_RELEASE.version}</span>
          <span className="home-highlight-desc">{LATEST_RELEASE.summary}</span>
          <span className="cta-link">See the release →</span>
        </a>
      </div>
    </section>
  );
}

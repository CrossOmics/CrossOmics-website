import Link from "next/link";
import { PAPERS } from "@/lib/papers";

export default function Highlights() {
  const paper = PAPERS[0];

  return (
    <section className="home-highlights container" aria-labelledby="highlights-heading">
      <h2 id="highlights-heading" className="home-cards-heading">Latest</h2>

      <div className="home-highlights-grid">
        <a className="home-highlight" href={paper.href} target="_blank" rel="noopener noreferrer">
          <span className="tag-pill">{paper.tags[0]}</span>
          <span className="home-highlight-title">{paper.title}</span>
          <span className="home-highlight-desc">{paper.authors}</span>
          <span className="cta-link">Read the paper →</span>
        </a>

        <Link className="home-highlight" href="/tutorial/setup">
          <span className="tag-pill">Setup guide</span>
          <span className="home-highlight-title">Install Gardener and connect your compute</span>
          <span className="home-highlight-desc">
            macOS and Windows install, your first project, and connecting a Slurm
            cluster, an SSH server, or a SPHERE testbed node.
          </span>
          <span className="cta-link">Open the guide →</span>
        </Link>
      </div>
    </section>
  );
}

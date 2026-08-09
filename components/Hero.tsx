import Link from "next/link";
import { GITHUB_URL } from "@/lib/nav";

export default function Hero() {
  return (
    <section className="home-hero container">
      <h1 className="home-hero-title">
        An AI operating system
        {/* Hidden below 640px, where the line already wraps on its own. */}
        <br className="home-hero-break" />
        for single-cell biology
      </h1>
      <p className="home-hero-lede">
        Gardener helps you retrieve public datasets, connect to your own HPC
        environment, and run rigorous dry-lab pipelines — with every command,
        parameter, and result tracked. Your raw data never leaves your machine.
      </p>
      <div className="home-hero-actions">
        <Link className="pill-btn pill-btn--solid" href="/tutorial/setup">
          Get started
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </Link>
        <a className="pill-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </div>
    </section>
  );
}

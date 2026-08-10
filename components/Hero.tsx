import Link from "next/link";
import { GITHUB_URL } from "@/lib/nav";
import { content } from "@/lib/content";

export default function Hero() {
  const { hero } = content;
  return (
    <section className="home-hero container">
      <h1 className="home-hero-title">
        {hero.titleLine1}{" "}
        {/* Hidden below 640px, where the line wraps on its own; the space above
            keeps the two lines from colliding once the <br> is gone. */}
        <br className="home-hero-break" />
        {hero.titleLine2}
      </h1>
      <p className="home-hero-lede">{hero.lede}</p>
      <div className="home-hero-actions">
        <Link className="pill-btn pill-btn--solid" href="/tutorial/setup">
          {hero.primaryCta}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </Link>
        <a className="pill-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          {hero.secondaryCta}
        </a>
      </div>
    </section>
  );
}

import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export default function SectionCards() {
  return (
    <section className="home-cards-section container" aria-labelledby="explore-heading">
      <h2 id="explore-heading" className="home-cards-heading">Explore</h2>

      <ul className="home-cards">
        {SECTIONS.map((s) => (
          <li key={s.key} className="home-card">
            {/* Children are spans, not divs — block-level elements inside an <a> are invalid HTML. */}
            <Link href={s.href} className="home-card-link">
              <span className="home-card-media" style={{ backgroundImage: `url(${s.image})` }} aria-hidden />
              <span className="home-card-title">
                {s.label}
                <svg className="home-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </span>
              <span className="home-card-desc">{s.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

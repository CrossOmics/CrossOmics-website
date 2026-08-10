import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { GITHUB_URL } from "@/lib/nav";
import { content } from "@/lib/content";

const about = content.about;

export default function AboutPage() {
  return (
    <PageShell
      title={about.title}
      subtitle={about.subtitle}
      breadcrumb={about.breadcrumb}
    >
      <Reveal as="section" className="about-intro section">
        <div className="about-copy">
          <div className="section-header">
            <div className="section-eyebrow">{about.overviewEyebrow}</div>
            <h2 className="section-title">{about.overviewTitle}</h2>
          </div>
          <div className="section-body">
            <p>
              <strong>{about.overviewLead}</strong>{about.overviewBody}
            </p>
            <p>
              {about.openSourceLead}{" "}
              <a
                className="cta-link"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {about.viewOnGithub}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </a>
            </p>
          </div>
        </div>
        <Reveal className="about-cell-image" aria-label="Cell illustration" delay={0.12} />
      </Reveal>

      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">{about.featuresEyebrow}</div>
          <h2 className="section-title">{about.featuresTitle}</h2>
        </div>
        <div className="pillars">
          {about.features.map((feature) => (
            <Reveal key={feature.num} className="pillar">
              <div className="pillar-num">— {feature.num}</div>
              <div className="pillar-title">{feature.title}</div>
              <p className="pillar-desc">{feature.desc}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </PageShell>
  );
}

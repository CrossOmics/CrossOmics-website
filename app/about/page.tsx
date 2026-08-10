import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { content } from "@/lib/content";

// Placeholder while the About content is reworked. The full copy still lives in
// lib/content.ts (about.features etc.) so it is easy to restore later.
const about = content.about;

export default function AboutPage() {
  return (
    <PageShell title={about.title} subtitle={about.subtitle} breadcrumb={about.breadcrumb}>
      <Reveal as="section" className="section" hover={false}>
        <div className="section-header">
          <div className="section-eyebrow">Coming soon</div>
          <h2 className="section-title">More on the way</h2>
        </div>
        <div className="section-body">
          <p>We are reworking this page. It will be back soon with more.</p>
        </div>
      </Reveal>
    </PageShell>
  );
}

import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { content } from "@/lib/content";

// Placeholder while the Approach content is reworked. The full copy still lives in
// lib/content.ts (approach.pillars etc.) so it is easy to restore later.
const approach = content.approach;

export default function ApproachPage() {
  return (
    <PageShell title={approach.title} subtitle={approach.subtitle} breadcrumb={approach.breadcrumb}>
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

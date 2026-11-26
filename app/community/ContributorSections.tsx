import Link from "next/link";
import type { PersonalContributions, PersonalSection } from "@/lib/community/tool-maintenance";
import PersonalEntries from "./mine/PersonalEntries";

export const profileSections = [
  { key: "maintained", label: "Maintained Tools", description: "Tools this member is responsible for maintaining in the community." },
  { key: "original", label: "Original Tools", description: "New tools submitted by this member. Submission credit is separate from original authorship." },
  { key: "update", label: "Updates & Contributions", description: "Improvements and contributions to existing tools." }
] as const;
export type ProfilePages = Partial<Record<PersonalSection, string>>;
export type ProfileSections = Record<PersonalSection, PersonalContributions | null>;

export default function ContributorSections({ route, sections, pages = {}, mine = false }: {
  route: string; sections: ProfileSections; pages?: ProfilePages; mine?: boolean;
}) {
  function pageHref(section: PersonalSection, page: number) {
    const query = new URLSearchParams();
    for (const { key } of profileSections) {
      const current = key === section ? String(page) : pages[key];
      if (current && /^\d{1,4}$/.test(current)) query.set(key + "Page", current);
    }
    return `${route}?${query}#${section}`;
  }
  return <>
    <nav className="community-personal-tabs" aria-label="Contribution sections">
      {profileSections.map(({ key, label }) => <a key={key} href={`#${key}`}>{label}<span>{sections[key]?.total ?? "—"}</span></a>)}
    </nav>
    {profileSections.map(({ key, label, description }) => {
      const section = sections[key];
      return <section className="community-section community-profile-section" id={key} key={key} aria-labelledby={`${key}-title`}>
        <h2 id={`${key}-title`}>{label}</h2><p className="community-group-description">{description}</p>
        {section ? <>
          <PersonalEntries entries={section.entries} mine={mine} />
          {(section.page > 1 || section.hasMore) && <nav className="community-actions community-pager" aria-label={`${label} pages`}>
            {section.page > 1 && <Link className="community-secondary" href={pageHref(key, section.page - 1)}>Previous page</Link>}
            <span>Page {section.page}</span>
            {section.hasMore && <Link className="community-secondary" href={pageHref(key, section.page + 1)}>Next page</Link>}
          </nav>}
        </> : <p className="community-notice">This section is temporarily unavailable. Try refreshing this page.</p>}
      </section>;
    })}
  </>;
}

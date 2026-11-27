import Link from "next/link";
import { notFound } from "next/navigation";
import { publicContributor } from "@/lib/community/service";
import ContributorSections from "../../ContributorSections";

export default async function ContributorProfile({params,searchParams}: {
  params:Promise<{slug:string}>; searchParams:Promise<{maintainedPage?:string;originalPage?:string;updatePage?:string}>;
}) {
  const [{slug},query] = await Promise.all([params,searchParams]);
  const {data,status} = await publicContributor(slug, query);
  if (status === 404) notFound();
  if (!data) return <p className="community-notice">This contributor profile is temporarily unavailable. Try again shortly.</p>;
  return <>
    <header className="community-heading community-public-home"><Link className="community-link" href="/community/contributors">← Contributors</Link>
      <div className="community-public-identity"><span className="community-account-avatar" aria-hidden>{([...data.contributor.name][0] ?? "").toUpperCase()}</span><div><h1>{data.contributor.name}</h1>
        <p>Community member profile{data.contributor.login ? ` · @${data.contributor.login}` : ""}</p></div></div>
      <p>Research software maintained, shared and improved by {data.contributor.name}.</p>
    </header>
    <dl className="community-account-counts" aria-label="Public contribution summary">
      <div><dt>Maintained tools</dt><dd>{data.sections.maintained.total}</dd></div>
      <div><dt>Original tools</dt><dd>{data.sections.original.total}</dd></div>
      <div><dt>Updates & contributions</dt><dd>{data.sections.update.total}</dd></div>
    </dl>
    <ContributorSections route={`/community/contributors/${slug}`} pages={{maintained:query.maintainedPage,original:query.originalPage,update:query.updatePage}} sections={data.sections} />
  </>;
}

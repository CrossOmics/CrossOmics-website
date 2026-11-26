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
    <header className="community-heading"><Link className="community-link" href="/community/contributors">← Contributors</Link><h1>{data.contributor.name}</h1>
      <p>Community member profile{data.contributor.login ? ` · @${data.contributor.login}` : ""}</p></header>
    <ContributorSections route={`/community/contributors/${slug}`} pages={{maintained:query.maintainedPage,original:query.originalPage,update:query.updatePage}} sections={data.sections} />
  </>;
}

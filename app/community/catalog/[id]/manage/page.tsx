import Link from "next/link";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/lib/community/return-path";
import { communitySession, toolManagement } from "@/lib/community/service";
import EditProjectMetadata from "../EditProjectMetadata";
import RecommendationsForm from "./RecommendationsForm";
import MaintainersForm from "./MaintainersForm";

export default async function ManageTool({params}:{params:Promise<{id:string}>}) {
  const [{id},session]=await Promise.all([params,communitySession()]);
  if(!session?.contributor)redirect(communitySignInPath(`/community/catalog/${id}/manage`));
  const {data,status}=await toolManagement(id);
  if(!data)return <section className="community-notice"><h1>Tool management unavailable</h1>
    <p>{status===403?"Only assigned Tool maintainers and administrators can manage this tool.":"This tool cannot be managed right now. Please try again after the service is available."}</p>
    <Link className="community-link" href={`/community/catalog/${id}`}>← Back to tool</Link></section>;
  return <>
    <header className="community-heading">
      <Link className="community-link" href={`/community/catalog/${data.item.id}`}>← Back to tool</Link>
      <h1>Manage {data.item.name}</h1>
      <p>Maintain Tool data and choose recommended versions. Version publication, withdrawal and maintainer assignments are controlled by administrators.</p>
    </header>
    {session.governanceEnabled ? <section className="community-section"><h2>Team governance and recommendations</h2>
      <p>Manage invitations, team proposals, recommendations and administrator picks with a public record of each change.</p>
      <Link className="community-primary" href={`/community/catalog/${data.item.id}/governance?tab=team`}>Open governance</Link>
    </section> : <RecommendationsForm item={data.item} />}
    <EditProjectMetadata pipelineId={data.item.id} metadata={data.item} />
    {!session.governanceEnabled && data.canAssignMaintainers && <section className="community-section"><h2>Administrator controls</h2><MaintainersForm id={data.item.id} maintainers={data.maintainers} /></section>}
  </>;
}

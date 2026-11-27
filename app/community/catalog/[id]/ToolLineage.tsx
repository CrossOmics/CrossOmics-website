import { implementationLineage, repositoryGroups, type RepositoryItem, type RepositoryVersion } from "@/lib/community/repositories";
import { toolTypeLabel } from "@/lib/community/tool-types";
import { buildLineage } from "@/lib/community/lineage";
import VersionLineage from "./VersionLineage";
import VersionDetails from "./VersionDetails";
import LineageHistory from "./LineageHistory";

export default function ToolLineage({ item, v2 = false, canManage = false }: { item: RepositoryItem; v2?: boolean; canManage?: boolean }) {
  const versions = repositoryGroups(item).flatMap(repo => repo.versions);
  const implementations = implementationLineage(item);
  const byId = new Map(versions.map(version => [version.id, version]));
  const graph = buildLineage(versions);
  const parents = new Map(graph.edges.map(edge => [edge.child, edge.parent]));
  const issues = new Map(graph.nodes.map(node => [node.id, node.issue]));
  const recommended = "recommendedVersionIds" in item ? item.recommendedVersionIds ?? [] : [];
  const authors = (version: RepositoryVersion) => ("authors" in version ? version.updateAuthors ?? version.authors : []).map(credit => credit.name).join("; ");
  const details = (version: RepositoryVersion) => <VersionDetails key={version.id} version={version}
    parent={byId.get(parents.get(version.id) ?? "") ?? null} upstreamParent={null} issue={issues.get(version.id) ?? null}
    pipelineId={item.id} canManage={canManage && version.source !== "repository"} v2={v2} recommended={recommended.includes(version.id)} />;
  return <div id="lineage" className="community-tool-lineage">
    <p>Follow how implementations of {item.name} are related. Connections come from recorded version ancestry; unknown origins remain unconnected.</p>
    <VersionLineage toolLevel implementationLevel versions={implementations.map(node => ({ id: node.version.id, label: node.name,
      subtitle: node.version.source === "repository" ? "Observed repository update" : node.version.label,
      parent: node.parent, issue: node.issue, type: node.repository.primary ? "Original implementation" : "Community implementation",
      repo: node.repository.url, withdrawn: node.version.withdrawn, authors: authors(node.version) }))}
      recommendedIds={recommended} latestId={implementations[0]?.version.id} details={implementations.map(node => details(node.version))} />
    <LineageHistory>
      <p>All published versions and observed repository updates, with their exact recorded parent relationships.</p>
      <VersionLineage versions={versions.map(version => ({id:version.id, label:version.source === "repository" ? "Observed repository update" : version.label,
        parent:version.parent, type:toolTypeLabel("type" in version ? version.type : version.kind), repo:version.repo,
        withdrawn:version.withdrawn, authors:authors(version)}))} recommendedIds={recommended} details={versions.map(details)} />
    </LineageHistory>
  </div>;
}

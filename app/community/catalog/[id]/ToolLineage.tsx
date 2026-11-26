import { repositoryGroups, type RepositoryItem } from "@/lib/community/repositories";
import { toolTypeLabel } from "@/lib/community/tool-types";
import { buildLineage } from "@/lib/community/lineage";
import VersionLineage from "./VersionLineage";
import VersionDetails from "./VersionDetails";

export default function ToolLineage({ item, v2 = false, canManage = false }: { item: RepositoryItem; v2?: boolean; canManage?: boolean }) {
  const versions = repositoryGroups(item).flatMap(repo => repo.versions);
  const byId = new Map(versions.map(version => [version.id, version]));
  const graph = buildLineage(versions);
  const parents = new Map(graph.edges.map(edge => [edge.child, edge.parent]));
  const issues = new Map(graph.nodes.map(node => [node.id, node.issue]));
  const recommended = "recommendedVersionIds" in item ? item.recommendedVersionIds ?? [] : [];
  return <div id="lineage" className="community-tool-lineage">
    <p>Explore the recorded ancestry across this tool’s repositories. Unrecorded relationships are shown without a connecting line.</p>
    <VersionLineage toolLevel versions={versions.map(version => ({ id: version.id, label: version.source === "repository" ? "Observed repository update" : version.label,
      parent: version.parent, type: toolTypeLabel("type" in version ? version.type : version.kind), repo: version.repo,
      withdrawn: version.withdrawn, authors: ("authors" in version ? version.updateAuthors ?? version.authors : []).map(credit => credit.name).join("; ") }))}
      recommendedIds={recommended} details={versions.map(version => <VersionDetails key={version.id} version={version}
        parent={byId.get(parents.get(version.id) ?? "") ?? null} upstreamParent={null} issue={issues.get(version.id) ?? null}
        pipelineId={item.id} canManage={canManage && version.source !== "repository"} v2={v2} recommended={recommended.includes(version.id)} />)} />
  </div>;
}

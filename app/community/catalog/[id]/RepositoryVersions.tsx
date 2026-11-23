import type { GovernanceState } from "@/lib/community/governance";
import { repositoryUrl, repositoryGroups, type RepositoryItem } from "@/lib/community/repositories";
import { toolTypeLabel } from "@/lib/community/tool-types";
import VersionLineage from "./VersionLineage";
import VersionDetails from "./VersionDetails";

export default function RepositoryVersions({ item, v2 = false, canManage = false, governanceState }: {
  item: RepositoryItem; v2?: boolean; canManage?: boolean; governanceState?: GovernanceState;
}) {
  const groups = repositoryGroups(item);
  const matches = (target: import("@/lib/community/governance").GovernanceTarget, repository: typeof groups[number]) => repositoryUrl(target.repository)?.toLowerCase() === repositoryUrl(repository.url)?.toLowerCase();
  if (governanceState) groups.sort((a,b) => Number(!!governanceState.adminPick && matches(governanceState.adminPick,b)) - Number(!!governanceState.adminPick && matches(governanceState.adminPick,a)) || Number(governanceState.recommendations.some(target=>matches(target,b))) - Number(governanceState.recommendations.some(target=>matches(target,a))));
  const recommended = governanceState ? governanceState.recommendations.flatMap(target=>target.versionId?[target.versionId]:[]) : "recommendedVersionIds" in item ? item.recommendedVersionIds ?? [] : [];
  const registeredIds = new Set(item.versions.filter(version => version.source !== "repository").map(version => version.id));
  return (
    <section className="community-section" id="versions" aria-labelledby="versions-title">
      <div className="community-section-heading">
        <div>
          <h2 id="versions-title">Versions</h2>
          <p>One card per repository, showing its latest known update. Explore each repository’s own lineage below.</p>
        </div>
        <span className="community-tag">{groups.length} {groups.length === 1 ? "repository" : "repositories"}</span>
      </div>
      {groups.length === 0 ? <p className="community-notice">No repositories have been registered yet.</p> : (
        <ul className="community-repositories">
          {groups.map((repo) => (
            <li key={repo.url} className={`community-repository${(governanceState ? !!governanceState.adminPick && matches(governanceState.adminPick,repo) || governanceState.recommendations.some(target=>matches(target,repo)) : repo.pinned) ? " is-pinned" : ""}`} data-repository={repo.url}>
              <div className="community-repository-heading">
                <div>
                  <div className="community-actions">
                    <h3>{repo.name}</h3>
                    {!governanceState && repo.pinned && <span className="community-tag community-pinned-tag">{repo.adminSelected ? "Pinned · Admin selected" : "Pinned · Recommended"}</span>}
                    {governanceState?.adminPick && matches(governanceState.adminPick,repo) && <span className="community-tag community-pinned-tag">Administrator pick{governanceState.adminPick.versionId ? " · Version" : " · Repository"}</span>}
                    {governanceState?.recommendations.some(target=>matches(target,repo)) && <span className="community-tag">Team recommended</span>}
                    <span className="community-tag community-tag-neutral">{repo.primary ? "Original repository" : "Community repository"}</span>
                  </div>
                  <p className="community-repository-path">{new URL(repo.url).hostname}{new URL(repo.url).pathname}</p>
                </div>
                <a className="community-secondary" href={repo.url}>View repository</a>
              </div>
              <a className="community-link" href={`/community/catalog/${item.id}/governance?${new URLSearchParams({repository:repo.url})}`}>Repository governance records</a>
              {governanceState && [...governanceState.recommendations, ...(governanceState.adminPick?[governanceState.adminPick]:[])].filter(target=>matches(target,repo)&&target.versionId).map((target,index)=><p key={index} className="community-repository-path">Endorsed version: {target.label||target.versionId} · Fixed commit: {target.commit||"Not recorded"}</p>)}
              {repo.description && <p>{repo.description}</p>}
              {repo.latest ? (
                <VersionLineage repositoryName={repo.name} latestId={repo.latest.id} recommendedIds={recommended}
                  versions={repo.lineage.map(({ version, parent, issue }) => ({
                    id: version.id, label: version.label, parent: parent?.id ?? null, issue, repo: version.repo, withdrawn: version.withdrawn,
                    type: toolTypeLabel("type" in version ? version.type : version.kind),
                    authors: ("authors" in version ? version.updateAuthors ?? version.authors : []).map(credit => credit.name).join("; ")
                  }))}
                  details={repo.lineage.map(({ version, parent, upstreamParent, issue }) => (
                    <VersionDetails key={version.id} version={version} parent={parent} upstreamParent={upstreamParent} issue={issue} pipelineId={item.id}
                      canManage={canManage && registeredIds.has(version.id)} v2={v2} recommended={recommended.includes(version.id)} />
                  ))} />
              ) : <p className="community-notice">No updates have been registered for this repository.</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

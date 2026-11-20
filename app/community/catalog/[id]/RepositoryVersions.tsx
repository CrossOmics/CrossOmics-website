import { repositoryGroups, type RepositoryItem } from "@/lib/community/repositories";
import { toolTypeLabel } from "@/lib/community/tool-types";
import VersionLineage from "./VersionLineage";
import VersionDetails from "./VersionDetails";

export default function RepositoryVersions({ item, v2 = false, canManage = false }: {
  item: RepositoryItem; v2?: boolean; canManage?: boolean;
}) {
  const groups = repositoryGroups(item);
  const recommended = "recommendedVersionIds" in item ? item.recommendedVersionIds ?? [] : [];
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
            <li key={repo.url} className={`community-repository${repo.pinned ? " is-pinned" : ""}`} data-repository={repo.url}>
              <div className="community-repository-heading">
                <div>
                  <div className="community-actions">
                    <h3>{repo.name}</h3>
                    {repo.pinned && <span className="community-tag community-pinned-tag">{repo.adminSelected ? "Pinned · Admin selected" : "Pinned · Recommended"}</span>}
                    <span className="community-tag community-tag-neutral">{repo.primary ? "Original repository" : "Community repository"}</span>
                  </div>
                  <p className="community-repository-path">{new URL(repo.url).hostname}{new URL(repo.url).pathname}</p>
                </div>
                <a className="community-secondary" href={repo.url}>View repository</a>
              </div>
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

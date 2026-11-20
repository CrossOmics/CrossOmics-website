import type { RegistryItem, RegistryVersion } from "@/community-server/lib/community/types";
import { repositoryGroups } from "@/lib/community/repositories";

function VersionDate({ version }: { version: RegistryVersion }) {
  return version.released_at ? <time dateTime={version.released_at}>{version.released_at.slice(0, 10)}</time> : <>Date not recorded</>;
}

export default function RepositoryVersions({ item }: { item: RegistryItem }) {
  const groups = repositoryGroups(item);
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
            <li key={repo.url} className={`community-repository${repo.pinned ? " is-pinned" : ""}`}>
              <div className="community-repository-heading">
                <div>
                  <div className="community-actions">
                    <h3>{repo.name}</h3>
                    {repo.pinned && <span className="community-tag community-pinned-tag">Pinned · Admin selected</span>}
                    <span className="community-tag community-tag-neutral">{repo.primary ? "Original repository" : "Community repository"}</span>
                  </div>
                  <p className="community-repository-path">{new URL(repo.url).hostname}{new URL(repo.url).pathname}</p>
                </div>
                <a className="community-secondary" href={repo.url}>View repository</a>
              </div>
              {repo.description && <p>{repo.description}</p>}
              {repo.latest ? (
                <div className="community-repository-latest">
                  <div className="community-actions">
                    <span className="community-repository-label">Latest known {repo.latest.source === "repository" ? "commit" : "version"}</span>
                    <strong>{repo.latest.label}</strong>
                    {repo.latest.withdrawn && <span className="community-tag community-tag-neutral">Withdrawn</span>}
                  </div>
                  <p>Updated <VersionDate version={repo.latest} /></p>
                  {repo.latest.improvement && <p>{repo.latest.improvement}</p>}
                  <code>{repo.latest.commit}</code>
                </div>
              ) : <p className="community-notice">No updates have been registered for this repository.</p>}
              {repo.lineage.length > 0 && (
                <details className="community-lineage">
                  <summary>Repository lineage <span>· {repo.lineage.length} {repo.lineage.length === 1 ? "record" : "records"}</span></summary>
                  <p>Registered versions and observed commits in {repo.name}. Connections show registered parents within this repository.</p>
                  <ol aria-label={`${repo.name} lineage`}>
                    {repo.lineage.map(({ version, parent, depth }) => (
                      <li key={version.id} className={`community-lineage-record${parent ? " has-parent" : ""}`}
                        style={{ marginInlineStart: `${Math.min(depth, 3) * 16}px` }}>
                        <div className="community-actions">
                          <h4>{version.label}</h4>
                          {version.id === repo.latest?.id && <span className="community-tag">Latest</span>}
                          {version.withdrawn && <span className="community-tag community-tag-neutral">Withdrawn</span>}
                        </div>
                        <p><VersionDate version={version} /> · {parent ? `Based on ${parent.label}` : "No parent registered in this repository"}</p>
                        {version.improvement && <p>{version.improvement}</p>}
                        <code>{version.commit}</code>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

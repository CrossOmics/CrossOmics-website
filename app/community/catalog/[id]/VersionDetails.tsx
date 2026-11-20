import type { RepositoryVersion } from "@/lib/community/repositories";
import { toolTypeLabel } from "@/lib/community/tool-types";
import { lineageIssueLabels, type LineageNode } from "@/lib/community/lineage";
import { httpsUrl } from "@/lib/community/https-url";
import RegistryCredits from "../../RegistryCredits";
import WithdrawVersion from "./WithdrawVersion";
import CorrectVersionCredits from "./CorrectVersionCredits";

export default function VersionDetails({ version, parent, upstreamParent, issue, pipelineId, canManage, v2, recommended }: {
  version: RepositoryVersion; parent: RepositoryVersion | null; upstreamParent: RepositoryVersion | null; issue: LineageNode["issue"];
  pipelineId: string; canManage: boolean; v2: boolean; recommended: boolean;
}) {
  const repo = httpsUrl(version.repo);
  const evidence = "evidence_url" in version ? httpsUrl(version.evidence_url) : null;
  const isUpdate = toolTypeLabel("type" in version ? version.type : version.kind) === "Update";
  const registered = version.source !== "repository";
  return (
    <li className="community-record" data-version-id={version.id}>
      <div className="community-actions">
        <h4>{version.label}</h4>
        <span className="community-tag">{toolTypeLabel("type" in version ? version.type : version.kind)}</span>
        {!version.withdrawn && recommended && <span className="community-tag community-recommended">Recommended</span>}
        {version.withdrawn && <span className="community-tag">Withdrawn</span>}
      </div>
      <p>{[version.released_at, parent && `Based on ${parent.label}`].filter(Boolean).join(" · ") || "Date not recorded"}</p>
      {upstreamParent && <p>Derived from {upstreamParent.label} in {upstreamParent.repo}.</p>}
      {issue && <p>{lineageIssueLabels[issue]}</p>}
      {"authors" in version && <dl className="community-detail-grid">
        {version.authors.length > 0 && <div><dt>{version.updateAuthors ? "Upstream authors" : parent || isUpdate || version.parent ? "Recorded authors" : "Original authors"}</dt><dd><RegistryCredits credits={version.authors} /></dd></div>}
        {version.updateAuthors && version.updateAuthors.length > 0 && <div><dt>Update authors</dt><dd><RegistryCredits credits={version.updateAuthors} /></dd></div>}
      </dl>}
      {version.improvement && <p>{version.improvement}</p>}
      {"upstreamCitation" in version && version.upstreamCitation && <div><h4>Upstream citation</h4><p className="community-citation">{version.upstreamCitation}</p></div>}
      {"citation" in version && version.citation && <div><h4>{isUpdate && !version.updateAuthors ? "Recorded citation" : "How to cite this version"}</h4><p className="community-citation">{version.citation}</p></div>}
      {repo && <a href={repo} className="community-link">Version repository</a>}
      {evidence && <a href={evidence} className="community-link">Verification</a>}
      <code>{version.commit}</code>
      {registered && canManage && "legacyKind" in version &&
        <CorrectVersionCredits pipelineId={pipelineId} versionId={version.id} existingAuthors={version.authors} existingMaintainers={version.maintainers} />}
      {registered && v2 && canManage && !version.withdrawn &&
        <WithdrawVersion pipelineId={pipelineId} versionId={version.id} />}
    </li>
  );
}

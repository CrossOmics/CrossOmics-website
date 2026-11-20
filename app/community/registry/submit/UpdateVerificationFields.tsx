"use client";

import { useState } from "react";

type RepositoryContext = { upstreamRepository?: string; originalRepository?: string };

export default function UpdateVerificationFields({
  targetKey, upstreamRepository, originalRepository
}: RepositoryContext & { targetKey: string }) {
  const [source, setSource] = useState("new_repository");

  return <>
    <label className="community-field-wide">Where is this update?
      <select name="updateSource" value={source} onChange={event => setSource(event.target.value)}>
        <option value="new_repository">New repository</option>
        <option value="upstream_pr">PR to the based-on repository</option>
      </select>
    </label>
    <RepositoryAndVerification key={targetKey} source={source}
      upstreamRepository={upstreamRepository} originalRepository={originalRepository} />
  </>;
}

function RepositoryAndVerification({
  source, upstreamRepository, originalRepository
}: RepositoryContext & { source: string }) {
  const [verificationKind, setVerificationKind] = useState("benchmark");
  const upstream = source === "upstream_pr";
  const kind = upstream ? "pull_request" : verificationKind;
  const repository = (upstreamRepository || originalRepository)?.replace(/^http:\/\//i, "https://").replace(/\/+$/, "").replace(/\.git$/i, "") ?? "";

  return <>
    {upstream ? <>
      <label className="community-field-wide">{upstreamRepository ? "PR target repository" : "Original repository"}
        <input name={upstreamRepository ? "repository" : undefined}
          type="url" value={repository} readOnly aria-describedby={repository ? "update-repository-help" : undefined} />
      </label>
      {repository && <p id="update-repository-help" className="community-field-wide">{upstreamRepository
        ? "Filled from the selected based-on version."
        : "This is the tool’s original repository. Choose the based-on version to confirm the PR target."}</p>}
    </> : <label className="community-field-wide">New repository URL
      <input key={source} name="repository" type="url" required maxLength={160} placeholder="https://github.com/owner/new-repository" />
    </label>}
    {upstream ? <input type="hidden" name="verificationKind" value="pull_request" /> :
      <label className="community-field-wide">Verification
        <select name="verificationKind" value={verificationKind} onChange={event => setVerificationKind(event.target.value)}>
          <option value="benchmark">Benchmark (Markdown file)</option>
          <option value="pull_request">Pull request</option>
        </select>
      </label>}
    <label className="community-field-wide">{kind === "benchmark" ? "Verification URL: benchmark" : "Pull Request Link"}
      <input key={source + kind} name="evidenceUrl" type="url" pattern="https://.*" required maxLength={2048}
        aria-describedby="update-verification-help" placeholder={kind === "benchmark"
          ? "https://github.com/owner/new-repository/blob/main/benchmark.md"
          : "https://github.com/owner/repository/pull/123"} />
    </label>
    <p id="update-verification-help" className="community-field-wide">{kind === "benchmark"
      ? "No PR? Link to a benchmark .md file in the new repository. Include the data, commands, environment and results so others can check the comparison."
      : "Link to the pull request that contains this update."}</p>
  </>;
}

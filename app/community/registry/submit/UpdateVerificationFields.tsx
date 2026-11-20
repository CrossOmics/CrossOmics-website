"use client";

import { useState } from "react";

export default function UpdateVerificationFields({ upstreamRepository }: { upstreamRepository?: string }) {
  const [source, setSource] = useState("new_repository");
  const [verificationKind, setVerificationKind] = useState("benchmark");
  const upstream = source === "upstream_pr";
  const kind = upstream ? "pull_request" : verificationKind;
  const repository = upstreamRepository?.replace(/^http:\/\//i, "https://").replace(/\/+$/, "").replace(/\.git$/i, "") ?? "";

  return <>
    <label className="community-field-wide">Where is this update?
      <select name="updateSource" value={source} onChange={event => setSource(event.target.value)}>
        <option value="new_repository">New repository</option>
        <option value="upstream_pr">PR to the original repository</option>
      </select>
    </label>
    {upstream ? <>
      <label className="community-field-wide">Original repository
        <input name="repository" type="url" value={repository} readOnly required aria-describedby="update-repository-help" />
      </label>
      <p id="update-repository-help" className="community-field-wide">{repository
        ? "Reused from the based-on version. You do not need to enter it again."
        : "Choose a based-on version to reuse its repository."}</p>
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
    <label className="community-field-wide">{kind === "benchmark" ? "Verification URL: benchmark" : "Verification URL: pull request"}
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

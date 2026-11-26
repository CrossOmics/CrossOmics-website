import Link from "next/link";
import type { ReactNode } from "react";
import type { GovernanceProposal, GovernanceResponse, GovernanceTarget } from "@/lib/community/governance";
import { httpsUrl } from "@/lib/community/https-url";
import GovernanceForms, { ProposalCommands } from "./GovernanceForms";
import styles from "./governance.module.css";

function readableDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "Date unavailable";
}
function statusOf(proposal: GovernanceProposal) {
  return ["voting", "awaiting_acceptance"].includes(proposal.status) && Date.parse(proposal.expiresAt) <= Date.now() ? "expired" : proposal.status;
}
const statusLabels = { voting: "Awaiting votes", awaiting_acceptance: "Awaiting acceptance", effective: "Completed", superseded: "Superseded", expired: "Expired", rejected: "Rejected" };

function Target({ target }: { target: GovernanceTarget }) {
  const url = httpsUrl(target.repository);
  let repository = target.repository;
  if (url) {
    const parsed = new URL(url);
    repository = parsed.pathname.replace(/^\//, "").replace(/\/$/, "") || parsed.hostname;
  }
  return <div className={styles.target}>
    <span className={styles.targetKind}>{target.versionId ? "Fixed version" : "Repository"}</span>
    {url ? <a className={styles.targetLink} href={url}>{repository}<span aria-hidden>↗</span></a> : <strong>{repository}</strong>}
    {target.label && <p>{target.label}</p>}
    {target.versionId && <details className={styles.recordDetails}><summary>Version details</summary>
      <dl><div><dt>Version</dt><dd>{target.versionId}</dd></div><div><dt>Fixed commit</dt><dd><code>{target.commit || "Not recorded"}</code></dd></div></dl>
    </details>}
  </div>;
}

function Proposal({ proposal, data, path }: { proposal: GovernanceProposal; data: GovernanceResponse; path: string }) {
  const status = statusOf(proposal);
  const titles = { invite: "Maintainer invitation", transfer: "Maintainer handoff", remove: "Remove a maintainer", add: "Add a maintainer" };
  return <li id={`proposal-${proposal.id}`}>
    <div className={styles.panelHeading}><h3>{titles[proposal.kind]}{proposal.candidate ? `: ${proposal.candidate.name}` : ""}</h3>
      <span className={`${styles.status} ${["voting", "awaiting_acceptance"].includes(status) ? styles.statusPending : ""}`}>{statusLabels[status]}</span></div>
    <p className={styles.proposalReason}>{proposal.reason}</p>
    <div className={styles.approvalRow}><span><strong>{proposal.votes.length}</strong> of {proposal.required} approvals</span>
      <div className={styles.approvalTrack} aria-hidden><span style={{ width: `${Math.min(100, proposal.required > 0 ? proposal.votes.length / proposal.required * 100 : 0)}%` }} /></div></div>
    <p className={styles.meta}>Proposed by {proposal.proposer.name} · Expires <time dateTime={proposal.expiresAt}>{readableDate(proposal.expiresAt)}</time></p>
    <div className={styles.proposalActions}><Link className="community-link" href={`${path}/events/${proposal.createdEventId}`}>View proposal record</Link>
      <details className={styles.recordDetails}><summary>Approval details</summary>
        <p>Member snapshot v{proposal.membershipVersion}: {proposal.memberIds.join(", ") || "No members"}</p>
        {proposal.votes.length > 0 && <ul>{proposal.votes.map(vote => <li key={vote.actorId}><Link className="community-link" href={`${path}/events/${vote.eventId}`}>Approval by {vote.actorId}</Link></li>)}</ul>}
      </details></div>
    <ProposalCommands data={data} proposalId={proposal.id} />
  </li>;
}

export default function GovernanceTeam({ data, path, signedIn, signInHref, reviews }: {
  data: GovernanceResponse; path: string; signedIn: boolean; signInHref: string; reviews?: ReactNode;
}) {
  const { state, capabilities } = data;
  const active = state.proposals.filter(proposal => ["voting", "awaiting_acceptance"].includes(statusOf(proposal)));
  const history = state.proposals.filter(proposal => !["voting", "awaiting_acceptance"].includes(statusOf(proposal)));
  const canManage = capabilities.canManage || capabilities.isAdmin;
  return <>
    <dl className={styles.overview} aria-label="Team overview">
      <div><dt>Current maintainers</dt><dd>{state.members.length}</dd></div>
      <div><dt>Open proposals</dt><dd>{active.length}</dd></div>
      <div><dt>Maintainer Picks</dt><dd>{state.recommendations.length}</dd></div>
    </dl>
    <div className={styles.teamLayout}>
      <div className={styles.teamMain}>
        <section className={styles.panel} aria-labelledby="maintainers-title">
          <div className={styles.panelHeading}><div><h2 id="maintainers-title">Current maintainers</h2><p>Community members responsible for this tool.</p></div>
            {canManage && <a className="community-link" href="#manage-governance">Manage team</a>}</div>
          {state.members.length ? <ul className={styles.members}>{state.members.map(member => {
            const github = member.credit.github && httpsUrl(`https://github.com/${encodeURIComponent(member.credit.github)}`);
            const profile = httpsUrl(member.credit.url);
            return <li key={member.actorId}>
              <span className={styles.avatar} aria-hidden>{member.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "?"}</span>
              <div className={styles.memberInfo}><strong>{member.name}</strong><span className={styles.memberRole}>Tool maintainer</span>
                <div className={styles.memberLinks}>{github && <a className="community-link" href={github}>GitHub ↗</a>}{profile && <a className="community-link" href={profile}>Profile ↗</a>}</div>
                <details className={styles.recordDetails}><summary>Public record ID</summary><code>{member.actorId}</code></details>
              </div><Link className="community-link" href={`${path}/events/${member.grantEventId}`}>View authority</Link>
            </li>;
          })}</ul> : <div className={styles.empty}>
            <svg viewBox="0 0 40 40" fill="none" aria-hidden><circle cx="15" cy="13" r="5"/><path d="M5 32v-3a10 10 0 0 1 20 0v3M27 8a5 5 0 0 1 0 10M30 23a9 9 0 0 1 5 8"/></svg>
            <h3>No maintainers assigned yet</h3><p>No maintainer access has been granted. Registered members will appear here when their maintenance role takes effect.</p>
            <Link className="community-link" href="/community/guide#maintainers">How tool maintenance works</Link>
          </div>}
        </section>
        <section className={styles.panel} aria-labelledby="proposals-title">
          <div className={styles.panelHeading}><div><h2 id="proposals-title">Proposals and invitations</h2><p>Follow membership changes and the approvals they need.</p></div><span className={styles.count}>{active.length} open</span></div>
          {active.length ? <ul className={styles.proposals}>{active.map(proposal => <Proposal key={proposal.id} proposal={proposal} data={data} path={path} />)}</ul> :
            <div className={styles.emptyCompact}><strong>No open proposals</strong><p>{state.proposals.length ? "There are no membership changes awaiting a response." : "No proposals have been recorded. Invitations and membership proposals will appear here."}</p></div>}
          {history.length > 0 && <details className={styles.history}><summary>Previous proposals <span>{history.length}</span></summary>
            <ul className={styles.proposals}>{history.map(proposal => <Proposal key={proposal.id} proposal={proposal} data={data} path={path} />)}</ul>
          </details>}
          <p className={styles.sectionFootnote}>Candidates receive access only after accepting an eligible invitation. Membership changes follow the recorded approval rules.</p>
        </section>
        {reviews && <div className={styles.reviewPanel}>{reviews}</div>}
        {!signedIn && <aside className={styles.signInNotice}><div><h3>Take part in tool maintenance</h3><p>Sign in to respond to your invitation or manage a tool assigned to you.</p></div><Link className="community-primary" href={signInHref}>Sign in</Link></aside>}
        {canManage && <div id="manage-governance" className={styles.management}><GovernanceForms data={data} /></div>}
      </div>
      <aside className={styles.teamAside} aria-label="Recommendations and policy">
        <section className={styles.panel}><div className={styles.panelHeading}><h2>Recommendations</h2></div>
          <h3 className={styles.asideLabel}>Maintainer Picks</h3>
          {state.recommendations.length ? state.recommendations.map((target, index) => <Target key={index} target={target} />) : <p className={styles.asideEmpty}>No Maintainer Picks yet.</p>}
          <div className={styles.endorsement}><h3 className={styles.asideLabel}>Platform endorsement</h3>{state.adminPick ? <Target target={state.adminPick} /> : <p className={styles.asideEmpty}>No platform endorsement.</p>}</div>
          <p className={styles.sectionFootnote}>Repository recommendations do not endorse every future commit. Version recommendations apply to the recorded commit only.</p>
        </section>
        <section className={styles.policyPanel}><h2>How membership works</h2><p>Proposals record the requested change and eligible members’ approvals. New maintainers accept their invitation before access begins.</p>
          <Link className="community-link" href="/community/guide#governance">Read the governance guide</Link>
          <details className={styles.recordDetails}><summary>Policy and record details</summary><dl>
            <div><dt>Membership version</dt><dd>{state.membershipVersion}</dd></div><div><dt>Policy</dt><dd>{state.policyVersion}</dd></div><div><dt>State version</dt><dd>{state.version}</dd></div>
          </dl></details>
        </section>
      </aside>
    </div>
  </>;
}

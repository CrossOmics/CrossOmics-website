/** Public governance data only. Private contributor IDs belong only in command requests. */
export type GovernanceTarget = { repository: string; versionId: string | null; commit: string | null; label: string | null };
export type GovernanceProposal = {
  id: string; kind: "invite" | "add" | "transfer" | "remove"; candidate: { id: string; name: string } | null;
  subjectId: string | null; proposer: { id: string; name: string }; memberIds: string[]; membershipVersion: number;
  policyVersion: string; required: number; votes: { actorId: string; eventId: string }[];
  status: "voting" | "awaiting_acceptance" | "effective" | "superseded" | "expired" | "rejected";
  createdAt: string; expiresAt: string; reason: string; createdEventId: string; acceptedEventId: string | null;
};
export type GovernanceState = {
  toolId: string; version: number; membershipVersion: number; policyVersion: string;
  members: { actorId: string; name: string; credit: { name: string; github?: string; url?: string; orcid?: string }; grantEventId: string }[];
  recommendations: GovernanceTarget[]; adminPick: GovernanceTarget | null; proposals: GovernanceProposal[]; lastEventHash: string | null;
};
export type GovernanceEvent = {
  hash: string; signature: string; body: {
    schemaVersion: 1; logId: string; sequence: number; eventId: string; toolId: string; action: string;
    actor: { id: string; name: string }; recordedAt: string; policyVersion: string; reason: string;
    previousEventHash: string; beforeStateHash: string; afterStateHash: string;
    change: { field: string; before: unknown; after: unknown };
    references: { id: string; kind: "policy" | "authority" | "proposal" | "vote" | "acceptance" | "supersedes" }[];
  };
};
export type GovernanceCapabilities = { canManage: boolean; isAdmin: boolean; actorId: string | null };
export type GovernanceAssurance = { signatureType: "service"; independentWitnesses: false; blockchainAnchored: false };
export type GovernanceReceipt = { body: Record<string, unknown>; signature: string; status: "pending" | "published"; publicKey: JsonWebKey };
export type GovernanceCommandResult = { state: GovernanceState; event: GovernanceEvent | null; reused: boolean; receipt?: GovernanceReceipt };
export type GovernanceResponse = { available: true; publishingAvailable?: boolean; pendingReceipts?: GovernanceReceipt[]; state: GovernanceState; events: GovernanceEvent[]; hasMore: boolean; cursor: string | null; capabilities: GovernanceCapabilities; assurance: GovernanceAssurance };
export type GovernanceTrust = { logId: string; keyId: string; publicKey: JsonWebKey; signatureType: "service" };
export type GovernanceCheckpoint = { body: { logId: string; keyId: string; treeSize: number; rootHash: string; lastEventHash: string; stateHash: string; previousCheckpointHash: string | null; recordedAt: string }; signature: string };
export type GovernanceEvidence = { events: GovernanceEvent[]; selectedIndex: number; proof: { side: "left" | "right"; hash: string }[]; checkpoint: GovernanceCheckpoint; previousCheckpoint: GovernanceCheckpoint | null; trust: GovernanceTrust };
export type GovernanceEventDetail = { event: GovernanceEvent; dependencies: GovernanceEvent[]; checkpoint: GovernanceCheckpoint; assurance: GovernanceAssurance };
export type GovernanceAction = "invite" | "propose_add" | "propose_transfer" | "propose_remove" | "vote" | "accept" | "recommend" | "admin_pick" | "revoke" | "leave";

export function proposalActions(proposal: GovernanceProposal, capabilities: GovernanceCapabilities, membershipVersion: number) {
  const current = proposal.membershipVersion === membershipVersion && Date.parse(proposal.expiresAt) > Date.now();
  return {
    canVote: current && proposal.status === "voting" && !!capabilities.actorId && capabilities.canManage &&
      proposal.memberIds.includes(capabilities.actorId) && proposal.candidate?.id !== capabilities.actorId && !proposal.votes.some(vote => vote.actorId === capabilities.actorId),
    canAccept: current && proposal.status === "awaiting_acceptance" && !!capabilities.actorId && proposal.candidate?.id === capabilities.actorId
  };
}
export function governanceActionLabel(action: string) {
  return ({ "tool.initialized": "Tool governance baseline", "administrators.observed": "Administrator authorization snapshot", "maintainer.invited": "Maintainer invited", "proposal.created": "Proposal created", "proposal.voted": "Proposal approval", "maintainer.accepted": "Maintainer invitation accepted", "recommendation.changed": "Team recommendation changed", "admin_pick.changed": "Administrator pick changed", "maintainer.left": "Maintainer left", "maintainer.revoked": "Maintainer revoked", invite: "Invitation", propose_add: "Add maintainer proposal", propose_transfer: "Handoff proposal", propose_remove: "Remove maintainer proposal", vote: "Approval vote", accept: "Invitation accepted", recommend: "Team recommendation", admin_pick: "Administrator pick", revoke: "Emergency revocation", leave: "Maintainer departure" } as Record<string, string>)[action] ?? action.replaceAll("_", " ").replaceAll(".", " ");
}

export function canonicalGovernance(value: unknown): string {
  const seen = new Set<object>();
  function encode(input: unknown): string {
    if (input === null || typeof input === "boolean") return JSON.stringify(input);
    if (typeof input === "number" && Number.isFinite(input)) return JSON.stringify(input);
    if (typeof input === "string") {
      for (let index = 0; index < input.length; index++) {
        const code = input.charCodeAt(index);
        if (code >= 0xd800 && code <= 0xdbff) { const next = input.charCodeAt(++index); if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error("Invalid Unicode."); }
        else if (code >= 0xdc00 && code <= 0xdfff) throw new Error("Invalid Unicode.");
      }
      return JSON.stringify(input);
    }
    if (!input || typeof input !== "object" || seen.has(input)) throw new Error("Invalid canonical JSON.");
    seen.add(input);
    const keys = Reflect.ownKeys(input);
    if (keys.some(key => typeof key === "symbol")) throw new Error("Symbol keys are not canonical JSON.");
    function property(key: string): unknown {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) throw new Error("Canonical JSON requires enumerable data properties.");
      return descriptor.value;
    }
    let output: string;
    if (Array.isArray(input)) {
      if (keys.length !== input.length + 1) throw new Error("Canonical JSON requires dense arrays.");
      const values: string[] = [];
      for (let index = 0; index < input.length; index++) values.push(encode(property(String(index))));
      output = "[" + values.join(",") + "]";
    } else {
      if (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) throw new Error("Invalid JSON object.");
      output = "{" + (keys as string[]).sort().map(key => encode(key) + ":" + encode(property(key))).join(",") + "}";
    }
    seen.delete(input); return output;
  }
  return encode(value);
}
const bytes = (text: string) => new TextEncoder().encode(text);
const hexBytes = (hex: string) => { if (!/^[0-9a-f]{64}$/.test(hex)) throw new Error("Invalid hash."); return Uint8Array.from(hex.match(/../g)!, part => parseInt(part, 16)); };
const join = (...arrays: Uint8Array[]) => { const result = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0)); let offset = 0; for (const array of arrays) { result.set(array, offset); offset += array.length; } return result; };
async function digest(input: Uint8Array) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", input as BufferSource)), byte => byte.toString(16).padStart(2, "0")).join(""); }
async function merkle(events: GovernanceEvent[]): Promise<string> {
  if (!events.length) return digest(new Uint8Array());
  if (events.length === 1) return digest(join(new Uint8Array([0]), bytes(canonicalGovernance(events[0]))));
  let split = 1; while (split * 2 < events.length) split *= 2;
  return digest(join(new Uint8Array([1]), hexBytes(await merkle(events.slice(0, split))), hexBytes(await merkle(events.slice(split)))));
}
/** The caller supplies the trust root. A key bundled in evidence never establishes trust. */
export async function verifyGovernanceEvidence(evidence: GovernanceEvidence, trusted: GovernanceTrust) {
  try {
    const { events, checkpoint, selectedIndex } = evidence;
    if (!events.length || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= events.length || events.length !== checkpoint.body.treeSize) throw new Error("Missing or truncated event history.");
    if (trusted.signatureType !== "service" || checkpoint.body.logId !== trusted.logId || checkpoint.body.keyId !== trusted.keyId || evidence.trust.logId !== trusted.logId || evidence.trust.keyId !== trusted.keyId || canonicalGovernance(evidence.trust.publicKey) !== canonicalGovernance(trusted.publicKey)) throw new Error("The evidence does not match the supplied trust root.");
    const key = await crypto.subtle.importKey("jwk", trusted.publicKey, { name: "Ed25519" }, false, ["verify"]);
    async function signature(domain: string, body: unknown, value: string) {
      const signatureBytes = Uint8Array.from(atob(value), c => c.charCodeAt(0));
      if (!await crypto.subtle.verify("Ed25519", key, signatureBytes, bytes(domain + canonicalGovernance(body)))) throw new Error("Service signature check failed.");
    }
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.body.logId !== trusted.logId || event.body.sequence !== i + 1 || event.body.previousEventHash !== (i ? events[i - 1].hash : "0".repeat(64))) throw new Error("Event sequence or hash chain is incomplete.");
      if (await digest(bytes("crossomics-governance-event-v1\n" + canonicalGovernance(event.body))) !== event.hash) throw new Error("An event hash does not match its content.");
      await signature("crossomics-governance-event-v1\n", event.body, event.signature);
    }
    await signature("crossomics-governance-checkpoint-v1\n", checkpoint.body, checkpoint.signature);
    if (checkpoint.body.lastEventHash !== events.at(-1)!.hash || checkpoint.body.stateHash !== events.at(-1)!.body.afterStateHash || await merkle(events) !== checkpoint.body.rootHash) throw new Error("Checkpoint does not match the complete log.");
    let inclusion = await merkle([events[selectedIndex]]);
    for (const entry of evidence.proof) { if (entry.side !== "left" && entry.side !== "right") throw new Error("Invalid inclusion proof."); inclusion = await digest(join(new Uint8Array([1]), ... (entry.side === "left" ? [hexBytes(entry.hash), hexBytes(inclusion)] : [hexBytes(inclusion), hexBytes(entry.hash)]))); }
    if (inclusion !== checkpoint.body.rootHash) throw new Error("Inclusion proof does not match the checkpoint.");
    if (evidence.previousCheckpoint) {
      const previous = evidence.previousCheckpoint;
      if (previous.body.logId !== trusted.logId || previous.body.keyId !== trusted.keyId || previous.body.treeSize >= events.length || previous.body.treeSize < 1) throw new Error("Invalid previous checkpoint.");
      await signature("crossomics-governance-checkpoint-v1\n", previous.body, previous.signature);
      if (await merkle(events.slice(0, previous.body.treeSize)) !== previous.body.rootHash || await digest(bytes("crossomics-governance-checkpoint-hash-v1\n" + canonicalGovernance(previous))) !== checkpoint.body.previousCheckpointHash) throw new Error("Append-only checkpoint check failed.");
    } else if (checkpoint.body.previousCheckpointHash !== null) throw new Error("Previous checkpoint is missing.");
    return { valid: true, independentlyWitnessed: false, message: "Event hashes, service signatures, inclusion and supplied history are consistent with this trust root." };
  } catch (error) { return { valid: false, independentlyWitnessed: false, message: error instanceof Error ? error.message : "Evidence could not be checked." }; }
}

import assert from "node:assert/strict";
import { test } from "node:test";

const base = process.env.COMMUNITY_TEST_URL || "http://localhost:3017";
const webOrigin = process.env.COMMUNITY_TEST_WEB_ORIGIN || new URL(base).origin;
const service = process.env.COMMUNITY_TEST_SERVICE_URL || "http://localhost:4100";

test("registry discovery returns real catalog records without signing in", async () => {
  const response = await fetch(`${base}/api/community/v1/catalog?q=suffix&kind=tool`);
  assert.equal(response.status, 200);
  const { items } = await response.json();
  const star = items.find((item) => item.id === "cp_star");
  assert.ok(star?.algorithms.length);
  assert.ok(star?.versions.length);
  assert.ok(items.every((item) => item.kind === "tool"));
});

test("publishing and personal history require authentication", async () => {
  const responses = await Promise.all([
    fetch(`${base}/api/community/v1/contributions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    }),
    fetch(`${base}/api/community/v1/contributions?mine=1`)
  ]);
  assert.deepEqual(responses.map((response) => response.status), [401, 401]);
});

test("community tracker is reachable from the existing site", async () => {
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /href="\/community"[^>]*>Explore the community/);
  const response = await fetch(`${base}/community`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Community Tracking/);
  assert.match(html, /href="\/community\/sign-in\?returnTo=%2Fcommunity"[^>]*>Sign in/);
  assert.match(html, /href="\/community\/bounties"[^>]*>Bounties/);
  const personal = await fetch(`${base}/community/mine`, { redirect: "manual" });
  assert.equal(personal.status, 307);
  assert.equal(personal.headers.get("location"), "/community/sign-in?returnTo=%2Fcommunity%2Fmine");
});

test("the website proxies OAuth and keeps callback cookies on the website origin", {
  skip: !process.env.COMMUNITY_TEST_OAUTH
}, async () => {
  const start = await fetch(`${base}/api/community/auth/login?next=submit&catalogId=cp_star`, { redirect: "manual" });
  assert.equal(start.status, 307);
  const authorization = new URL(start.headers.get("location"));
  assert.equal(authorization.origin, "https://github.com");
  assert.equal(authorization.searchParams.get("redirect_uri"), `${webOrigin}/api/community/auth/callback`);
  const cookies = start.headers.getSetCookie();
  assert.match(cookies[0], /^community_oauth=.*HttpOnly/i);

  const failed = await fetch(`${base}/api/community/auth/callback?code=test&state=invalid`, {
    redirect: "manual",
    headers: { cookie: cookies[0].split(";")[0] }
  });
  assert.equal(failed.status, 307);
  assert.equal(failed.headers.get("location"), `${webOrigin}/community/sign-in?returnTo=%2Fcommunity%2Fsubmit%3FcatalogId%3Dcp_star&login=expired`);
  assert.match(failed.headers.getSetCookie()[0], /^community_oauth=;/);
});

test("Google and Apple callbacks reject an attempt started for the other provider", async (t) => {
  const session = await fetch(`${base}/api/community/v1/session`);
  assert.equal(session.status, 200);
  const { signInProviders } = await session.json();
  if (!signInProviders?.includes("google") || !signInProviders.includes("apple")) {
    t.skip("Google and Apple test credentials are required.");
    return;
  }

  for (const [provider, other] of [["google", "apple"], ["apple", "google"]]) {
    const start = await fetch(`${base}/api/community/auth/login?provider=${provider}`, { redirect: "manual" });
    assert.equal(start.status, 307);
    const authorization = new URL(start.headers.get("location"));
    assert.equal(authorization.searchParams.get("redirect_uri"), `${webOrigin}/api/community/auth/callback/${provider}`);
    const state = authorization.searchParams.get("state");
    const wrong = await fetch(`${base}/api/community/auth/callback/${other}?state=${state}&code=unused`, {
      redirect: "manual",
      headers: { cookie: start.headers.getSetCookie()[0].split(";")[0] }
    });
    assert.equal(wrong.status, 307);
    assert.equal(wrong.headers.get("location"), `${webOrigin}/community/sign-in?returnTo=%2Fcommunity%2Fmine&login=expired`);
    assert.ok(wrong.headers.getSetCookie().every((cookie) => !cookie.startsWith("community_session=")));
  }
});

test("Web and Gardener share records, deduplicate evidence and preserve impact zero", {
  skip: !process.env.COMMUNITY_TEST_DATABASE_URL || !process.env.COMMUNITY_TEST_SESSION_SECRET
}, async () => {
  const { createHmac, randomInt, randomUUID } = await import("node:crypto");
  const { Pool } = await import("pg");
  const db = new Pool({ connectionString: process.env.COMMUNITY_TEST_DATABASE_URL });
  const contributor = { id: String(randomInt(1000000000, 9999999999)), login: "community-test" };
  const other = { id: String(Number(contributor.id) + 1), login: "community-other" };

  function browserHeaders(identity) {
    const payload = Buffer.from(JSON.stringify({ ...identity, exp: Date.now() + 60000 })).toString("base64url");
    const signature = createHmac("sha256", process.env.COMMUNITY_TEST_SESSION_SECRET).update(payload).digest("base64url");
    return { cookie: `community_session=${payload}.${signature}`, origin: webOrigin };
  }
  async function api(path, { method = "GET", headers = {}, body } = {}) {
    const target = headers.authorization ? service : base;
    const response = await fetch(`${target}/api/community/v1/${path}`, {
      method,
      headers: { ...headers, ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: response.status, body: await response.json() };
  }

  const browser = browserHeaders(contributor);
  const evidence = `https://github.com/crossomics/example/commit/${randomUUID()}`;
  const input = {
    type: "new_pipeline",
    subjectKind: "pipeline",
    subjectName: "Example workflow",
    summary: "Recorded an example workflow for integration testing.",
    projectUrl: "https://github.com/crossomics/example",
    evidenceUrl: evidence,
    occurredOn: "2025-02-28"
  };

  try {
    const blocked = await api("app-token", { method: "POST", headers: { ...browser, origin: "https://example.org" } });
    assert.equal(blocked.status, 403);
    const issued = await api("app-token", { method: "POST", headers: browser });
    assert.equal(issued.status, 201);
    const gardener = { authorization: `Bearer ${issued.body.token}` };
    const session = await api("session", { headers: gardener });
    assert.deepEqual(session.body.contributor, contributor);
    const invalid = await api("contributions", {
      method: "POST", headers: gardener, body: { ...input, occurredOn: "2025-02-29" }
    });
    assert.equal(invalid.status, 422);

    const attempts = await Promise.all([
      api("contributions", { method: "POST", headers: browser, body: input }),
      api("contributions", { method: "POST", headers: gardener, body: { ...input, evidenceUrl: evidence + "#diff" } })
    ]);
    assert.deepEqual(attempts.map((record) => record.status).sort(), [200, 201]);
    const { item } = attempts.find((result) => result.status === 201).body;
    assert.equal(attempts.find((result) => result.status === 200).body.item.id, item.id);
    assert.equal(item.projectScope, "external");
    assert.deepEqual(item.impact, []);

    const commons = await api("contributions", {
      method: "POST",
      headers: gardener,
      body: {
        ...input, type: "bug_fix", subjectKind: "tool", subjectName: "STAR", catalogId: "cp_star",
        projectUrl: "https://github.com/BioCode-Commons/example",
        evidenceUrl: "https://github.com/BioCode-Commons/example/pull/42",
        channel: "web", contributor: other
      }
    });
    assert.equal(commons.status, 201);
    assert.equal(commons.body.item.channel, "gardener");
    assert.equal(commons.body.item.projectScope, "commons");
    assert.deepEqual(commons.body.item.contributor, contributor);

    const impactPath = `contributions/${item.id}/impact`;
    const impact = { metric: "usage", value: 0, evidenceUrl: "https://example.org/metrics" };
    const forbidden = await api(impactPath, { method: "PUT", headers: browserHeaders(other), body: impact });
    assert.equal(forbidden.status, 404);
    const observed = await api(impactPath, { method: "PUT", headers: browser, body: impact });
    assert.equal(observed.status, 200);
    assert.equal(observed.body.impact.value, 0);

    const webHistory = await api("contributions?mine=1", { headers: browser });
    const appHistory = await api("contributions?mine=1", { headers: gardener });
    assert.deepEqual(appHistory.body, webHistory.body);
    assert.equal(webHistory.body.total, 2);
    assert.equal(appHistory.body.items.find((entry) => entry.id === item.id).impact[0].value, 0);
    const otherHistory = await api("contributions?mine=1", { headers: browserHeaders(other) });
    assert.deepEqual(otherHistory.body.items, []);
    assert.equal((await api("app-token", { method: "DELETE", headers: browser })).status, 200);
    assert.equal((await api("contributions?mine=1", { headers: gardener })).status, 401);
  } finally {
    await db.query("DELETE FROM community_app_tokens WHERE github_id = $1", [contributor.id]);
    await db.query("DELETE FROM community_contributions WHERE github_id = $1", [contributor.id]);
    await db.end();
  }
});

test("bounty publishing is restricted to editors and closing stops new replies", {
  skip: !process.env.COMMUNITY_TEST_DATABASE_URL || !process.env.COMMUNITY_TEST_SESSION_SECRET || !process.env.COMMUNITY_TEST_BOARD_EDITOR_ID
}, async () => {
  const { createHmac, randomInt, randomUUID } = await import("node:crypto");
  const { Pool } = await import("pg");
  const db = new Pool({ connectionString: process.env.COMMUNITY_TEST_DATABASE_URL });
  const editor = { id: process.env.COMMUNITY_TEST_BOARD_EDITOR_ID, login: "bounty-editor" };
  const member = { id: String(randomInt(1000000000, 9999999999)), login: "bounty-member" };
  let id;

  function headers(identity) {
    const payload = Buffer.from(JSON.stringify({ ...identity, exp: Date.now() + 60000 })).toString("base64url");
    const signature = createHmac("sha256", process.env.COMMUNITY_TEST_SESSION_SECRET).update(payload).digest("base64url");
    return { cookie: `community_session=${payload}.${signature}`, origin: webOrigin, "content-type": "application/json" };
  }

  function request(path, method = "GET", identity, body) {
    return fetch(`${base}/api/community/v1/bounties${path}`, {
      method,
      headers: identity ? headers(identity) : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }

  const draft = {
    title: `Document package input rules ${randomUUID()}`,
    category: "documentation",
    description: "Add examples for minimal pipeline inputs.",
    reward: "Contributor credit"
  };

  try {
    assert.equal((await request("", "POST", undefined, draft)).status, 401);
    assert.equal((await request("", "POST", member, draft)).status, 403);
    const created = await request("", "POST", editor, draft);
    assert.equal(created.status, 201);
    ({ id } = await created.json());

    const feed = await request(`?status=open&q=${encodeURIComponent(draft.title)}`);
    assert.equal(feed.status, 200);
    assert.deepEqual((await feed.json()).items.map((item) => item.id), [id]);

    const reply = { message: "I can add the workflow examples." };
    assert.equal((await request(`/${id}/replies`, "POST", undefined, reply)).status, 401);
    assert.equal((await request(`/${id}/replies`, "POST", member, reply)).status, 201);
    const thread = await (await request(`/${id}`)).json();
    assert.equal(thread.item.replyCount, 1);
    assert.equal(thread.replies[0].author, member.login);
    assert.equal(thread.replies[0].message, reply.message);

    assert.equal((await request(`/${id}`, "PATCH", member, { status: "closed" })).status, 403);
    assert.equal((await request(`/${id}`, "PATCH", editor, { status: "closed" })).status, 200);
    assert.equal((await request(`/${id}/replies`, "POST", member, reply)).status, 409);
  } finally {
    if (id) {
      await db.query("DELETE FROM community_bounty_replies WHERE bounty_id = $1", [id]);
      await db.query("DELETE FROM community_bounties WHERE id = $1", [id]);
    }
    await db.end();
  }
});

test("bounty administrators can grant and revoke editor access without granting admin access", {
  skip: !process.env.COMMUNITY_TEST_DATABASE_URL || !process.env.COMMUNITY_TEST_SESSION_SECRET ||
    !process.env.COMMUNITY_TEST_BOARD_EDITOR_ID || !process.env.COMMUNITY_TEST_BOUNTY_ADMIN_ID
}, async () => {
  const { createHmac, randomBytes, randomUUID } = await import("node:crypto");
  const { Pool } = await import("pg");
  const db = new Pool({ connectionString: process.env.COMMUNITY_TEST_DATABASE_URL });
  const admin = { id: process.env.COMMUNITY_TEST_BOUNTY_ADMIN_ID, login: "bounty-admin" };
  const editor = { id: process.env.COMMUNITY_TEST_BOARD_EDITOR_ID, login: "legacy-editor" };
  const hash = randomBytes(32).toString("hex");
  const member = { id: `google:${hash}`, login: `member-${hash.slice(0, 16)}` };
  let bountyId;

  async function request(path, identity, { method = "GET", body, origin = webOrigin } = {}) {
    const headers = { origin };
    if (identity) {
      const payload = Buffer.from(JSON.stringify({ ...identity, exp: Date.now() + 60000 })).toString("base64url");
      const signature = createHmac("sha256", process.env.COMMUNITY_TEST_SESSION_SECRET).update(payload).digest("base64url");
      headers.cookie = `community_session=${payload}.${signature}`;
    }
    if (body !== undefined) headers["content-type"] = "application/json";
    const response = await fetch(`${base}/api/community/v1/${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  }

  const grant = { method: "POST", body: { id: member.id } };
  const revoke = { method: "DELETE", body: { id: member.id } };
  const draft = { title: `Test editor grant ${randomUUID()}`, category: "documentation", description: "Verify delegated bounty access." };
  try {
    assert.equal((await request("bounty-editors", undefined)).status, 401);
    assert.equal((await request("bounty-editors", editor, grant)).status, 403);
    assert.equal((await request("bounty-editors", admin, { ...grant, origin: "https://example.org" })).status, 403);
    assert.equal((await request("bounty-editors", admin, { method: "POST", body: { id: member.login } })).status, 422);
    assert.equal((await request("session", member)).body.canManageBounties, false);

    const attempts = await Promise.all([request("bounty-editors", admin, grant), request("bounty-editors", admin, grant)]);
    assert.deepEqual(attempts.map(({ status }) => status), [200, 200]);
    const list = await request("bounty-editors", admin);
    assert.equal(list.status, 200);
    assert.ok(list.body.configuredIds.includes(editor.id));
    assert.deepEqual(list.body.managedIds.filter((id) => id === member.id), [member.id]);
    assert.equal((await request("session", member)).body.canManageBounties, true);
    assert.equal((await request("bounty-editors", member)).status, 403);
    assert.equal((await request("bounty-editors", member, grant)).status, 403);

    const published = await request("bounties", member, { method: "POST", body: draft });
    assert.equal(published.status, 201);
    bountyId = published.body.id;
    assert.equal((await request("bounty-editors", admin, revoke)).status, 200);
    assert.equal((await request("bounty-editors", admin, revoke)).status, 200);
    assert.equal((await request("session", member)).body.canManageBounties, false);
    assert.equal((await request("bounties", member, { method: "POST", body: draft })).status, 403);
    assert.equal((await request("bounty-editors", admin, { method: "DELETE", body: { id: editor.id } })).status, 409);
    assert.equal((await request("session", editor)).body.canManageBounties, true);
  } finally {
    if (bountyId) await db.query("DELETE FROM community_bounties WHERE id = $1", [bountyId]);
    await request("bounty-editors", admin, revoke).catch(() => {});
    await db.end();
  }
});

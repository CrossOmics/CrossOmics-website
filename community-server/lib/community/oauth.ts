import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import {
  contributorFromGitHub, cookieOptions, createSession, createSignedCookie, oauthCookie,
  publicOrigin, readSignedCookie, sessionAge, sessionCookie
} from "./auth";
import { json } from "./http";
import { communitySignInPath, safeCommunityReturn } from "./return-path";
import { signInLabels, type Contributor, type SignInProvider } from "./types";

const providers: SignInProvider[] = ["github", "google", "apple"];
const attemptAge = 600;
const appleIssuer = "https://appleid.apple.com";
const oidc = {
  google: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    keys: createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))
  },
  apple: {
    authorize: `${appleIssuer}/auth/authorize`,
    token: `${appleIssuer}/auth/token`,
    issuer: appleIssuer,
    keys: createRemoteJWKSet(new URL(`${appleIssuer}/auth/keys`))
  }
};

type ClientSettings = { id: string; secret: () => Promise<string> };

function settings(provider: SignInProvider): ClientSettings | null {
  const signingKey = process.env.COMMUNITY_SESSION_SECRET;
  if (!process.env.COMMUNITY_WEB_ORIGIN || !signingKey || signingKey.length < 32) return null;

  if (provider === "apple") {
    const id = process.env.COMMUNITY_APPLE_CLIENT_ID;
    const team = process.env.COMMUNITY_APPLE_TEAM_ID;
    const keyId = process.env.COMMUNITY_APPLE_KEY_ID;
    const privateKey = process.env.COMMUNITY_APPLE_PRIVATE_KEY;
    if (!id || !team || !keyId || !privateKey) return null;
    const origin = new URL(process.env.COMMUNITY_WEB_ORIGIN);
    if (origin.protocol !== "https:" ||
      !origin.hostname.includes(".") || isIP(origin.hostname)) return null;

    return {
      id,
      async secret() {
        const key = await importPKCS8(privateKey.replace(/\\n/g, "\n"), "ES256");
        return new SignJWT({})
          .setProtectedHeader({ alg: "ES256", kid: keyId })
          .setIssuer(team).setSubject(id).setAudience(appleIssuer)
          .setIssuedAt().setExpirationTime("5m").sign(key);
      }
    };
  }

  const id = provider === "google" ? process.env.COMMUNITY_GOOGLE_CLIENT_ID : process.env.COMMUNITY_GITHUB_CLIENT_ID;
  const secret = provider === "google" ? process.env.COMMUNITY_GOOGLE_CLIENT_SECRET : process.env.COMMUNITY_GITHUB_CLIENT_SECRET;
  return id && secret ? { id, secret: async () => secret } : null;
}

export function enabledSignInProviders() {
  return providers.filter((provider) => settings(provider));
}

function callbackUrl(origin: string, provider: SignInProvider) {
  const base = `${origin}/api/community/auth/callback`;
  return provider === "github" ? base : `${base}/${provider}`;
}

const randomProof = () => randomBytes(32).toString("base64url");
const validCatalogId = (value: unknown): value is string => typeof value === "string" && /^cp_[a-z0-9_]{1,61}$/.test(value);

export function startSignIn(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const provider = query.get("provider") ?? "github";
  if (provider !== "github" && provider !== "google" && provider !== "apple") {
    return json({ message: "Unknown sign-in provider." }, 400);
  }
  const client = settings(provider);
  if (!client) return json({ message: `${signInLabels[provider]} sign-in is not configured.` }, 503);
  const origin = publicOrigin(request);
  const state = randomProof();
  const verifier = randomProof();
  const nonce = randomProof();
  const catalogId = query.get("catalogId");
  const legacy = query.get("next") === "submit"
    ? `/community/submit${validCatalogId(catalogId) ? `?catalogId=${catalogId}` : ""}`
    : "/community/mine";
  const returnTo = safeCommunityReturn(query.get("returnTo"), legacy);
  const authorization = new URL(provider === "github" ? "https://github.com/login/oauth/authorize" : oidc[provider].authorize);
  const params = new URLSearchParams({ client_id: client.id, redirect_uri: callbackUrl(origin, provider), state });
  if (provider !== "apple") {
    params.set("code_challenge", createHash("sha256").update(verifier).digest("base64url"));
    params.set("code_challenge_method", "S256");
  }
  if (provider !== "github") {
    params.set("response_type", "code");
    params.set("nonce", nonce);
    if (provider === "google") params.set("scope", "openid");
    // Apple allows a query callback for a code-only request without name/email scopes.
    if (provider === "apple") params.set("response_mode", "query");
  }
  authorization.search = params.toString();

  const response = NextResponse.redirect(authorization);
  const attempt = createSignedCookie({
    provider, state, verifier, nonce, returnTo,
    exp: Date.now() + attemptAge * 1000
  });
  response.cookies.set(oauthCookie, attempt, { ...cookieOptions(origin), maxAge: attemptAge });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

const providerRequest: RequestInit = { cache: "no-store", redirect: "error" };

async function exchange(
  provider: SignInProvider,
  client: ClientSettings,
  redirectUri: string,
  code: string,
  verifier: string,
  nonce: string
): Promise<Contributor | null> {
  const github = provider === "github";
  const params = new URLSearchParams({
    client_id: client.id,
    client_secret: await client.secret(),
    code,
    redirect_uri: redirectUri
  });
  if (!github) params.set("grant_type", "authorization_code");
  if (provider !== "apple") params.set("code_verifier", verifier);

  const token = await fetch(github ? "https://github.com/login/oauth/access_token" : oidc[provider].token, {
    ...providerRequest,
    method: "POST",
    headers: { Accept: "application/json" },
    body: params,
    signal: AbortSignal.timeout(8000)
  });
  if (!token.ok) return null;

  const tokens = await token.json();
  if (github) {
    if (typeof tokens.access_token !== "string" || !tokens.access_token) return null;
    const profile = await fetch("https://api.github.com/user", {
      ...providerRequest,
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(8000)
    });
    return profile.ok ? contributorFromGitHub(await profile.json()) : null;
  }

  if (typeof tokens.id_token !== "string") return null;
  const { payload } = await jwtVerify(tokens.id_token, oidc[provider].keys, {
    issuer: oidc[provider].issuer,
    audience: client.id,
    algorithms: ["RS256"],
    requiredClaims: ["sub", "exp", "nonce"],
    maxTokenAge: "10m",
    clockTolerance: 5
  });
  if (payload.nonce !== nonce || typeof payload.sub !== "string" || !payload.sub || (payload.azp !== undefined && payload.azp !== client.id)) return null;

  // Keep provider IDs and profile data out of the public contribution feed.
  const hash = createHash("sha256").update(`${provider}:${payload.sub}`).digest("hex");
  return { id: `${provider}:${hash}`, login: `member-${hash.slice(0, 16)}` };
}

export async function finishSignIn(request: NextRequest, provider: SignInProvider) {
  const origin = publicOrigin(request);
  const options = cookieOptions(origin);
  const attempt = readSignedCookie(request.cookies.get(oauthCookie)?.value);
  const params = request.nextUrl.searchParams;
  const returnTo = safeCommunityReturn(attempt?.returnTo);

  function respond(error?: string) {
    const destination = error ? communitySignInPath(returnTo, error) : returnTo;
    const response = NextResponse.redirect(new URL(destination, origin));
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.cookies.set(oauthCookie, "", { ...options, maxAge: 0 });
    return response;
  }

  if (!attempt || attempt.provider !== provider || attempt.state !== params.get("state") ||
    typeof attempt.verifier !== "string" || typeof attempt.nonce !== "string") return respond("expired");
  const code = params.get("code");
  const client = settings(provider);
  if (!code || !client || params.has("error")) return respond("failed");

  try {
    const contributor = await exchange(provider, client, callbackUrl(origin, provider), code, attempt.verifier, attempt.nonce);
    if (!contributor) return respond("failed");
    const response = respond();
    response.cookies.set(sessionCookie, createSession(contributor), { ...options, maxAge: sessionAge });
    return response;
  } catch {
    return respond("failed");
  }
}

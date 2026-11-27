import { cache } from "react";
import { redirect } from "next/navigation";
import { communitySession, myPublicProfile } from "./service";
import { communitySignInPath } from "./return-path";
import type { SignInProvider } from "./types";

export function identityProvider(id: string): SignInProvider | null {
  if (/^[1-9]\d{0,19}$/.test(id)) return "github";
  if (/^google:[a-f0-9]{64}$/.test(id)) return "google";
  if (/^apple:[a-f0-9]{64}$/.test(id)) return "apple";
  return null;
}

export const accountContext = cache(async () => {
  const session = await communitySession();
  if (!session?.contributor) return { session, profile: null, name: "Community member", provider: null };
  const profile = session.registryV2Enabled ? await myPublicProfile() : null;
  const provider = session.signInProvider ?? identityProvider(session.contributor.id);
  return { session, profile, provider,
    name: profile?.contributor.name || (provider === "github" ? session.contributor.login : "Community member") };
});

export async function requireAccount(path: string) {
  const context = await accountContext();
  if (context.session && !context.session.contributor) redirect(communitySignInPath(path));
  return context;
}

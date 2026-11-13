const communityPath = /^\/community(?:\/(?:activity|mine|submit|registry\/(?:submit|submissions)|desktop-sign-in|catalog\/cp_[a-z0-9_]{1,61}|bounties(?:\/(?:new|[a-f0-9-]{36}))?))?$/;

export function safeCommunityReturn(value: unknown, fallback = "/community/mine"): string {
  if (typeof value !== "string" || value.length > 220) return fallback;
  const [path] = value.split("?");
  if (!communityPath.test(path) || /[\\#\u0000-\u0020\u007f]/.test(value)) return fallback;
  return value;
}

export function communitySignInPath(returnTo: string, error?: string) {
  const query = new URLSearchParams({ returnTo: safeCommunityReturn(returnTo) });
  if (error) query.set("login", error);
  return `/community/sign-in?${query}`;
}

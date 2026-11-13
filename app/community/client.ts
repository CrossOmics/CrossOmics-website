export async function communityRequest<T>(path: string, method: string, body?: unknown, version: "v1" | "v2" = "v1"): Promise<T> {
  const response = await fetch(`/api/community/${version}/${path}`, {
    method,
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.message || data?.error || "The request could not be completed.");
  return data as T;
}

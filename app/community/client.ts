export async function communityRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/community/v1/${path}`, {
    method,
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.message || "The request could not be completed.");
  return data as T;
}

import { redirect } from "next/navigation";

export default async function LegacyCommunityIndex({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, values] of Object.entries(await searchParams)) {
    for (const value of Array.isArray(values) ? values : values === undefined ? [] : [values]) query.append(key, value);
  }
  redirect(query.size ? "/?" + query : "/");
}

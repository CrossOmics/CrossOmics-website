import { redirect } from "next/navigation";
import SubmissionChoices from "./SubmissionChoices";

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ catalogId?: string; mode?: string }> }) {
  const query = await searchParams;
  const catalogId = typeof query.catalogId === "string" && /^cp_[a-z0-9_]{1,61}$/.test(query.catalogId) ? query.catalogId : undefined;
  if (query.mode === "record") redirect("/community/registry/submit" + (catalogId ? "?" + new URLSearchParams({ pipelineId: catalogId }) : ""));
  return <SubmissionChoices catalogId={catalogId} />;
}

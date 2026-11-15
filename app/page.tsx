import CommunityLayout from "./community/layout";
import CommunityRegistry from "@/components/CommunityRegistry";

export const dynamic = "force-dynamic";

export default function CommunityHome({ searchParams }: {
  searchParams: Promise<{ q?: string; kind?: string; type?: string }>;
}) {
  return <CommunityLayout><CommunityRegistry searchParams={searchParams} /></CommunityLayout>;
}

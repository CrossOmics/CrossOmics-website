import { redirect } from "next/navigation";
import Link from "next/link";
import { safeCommunityReturn } from "@/lib/community/return-path";
import { communitySession } from "@/lib/community/service";
import SignIn from "../SignIn";

export default async function CommunitySignInPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; login?: string }> }) {
  const [params, session] = await Promise.all([searchParams, communitySession()]);
  const returnTo = safeCommunityReturn(params.returnTo);
  if (session?.contributor) redirect(returnTo);
  return (
    <div className="community-sign-in">
      <header className="community-heading">
        <h1>Sign in to Community</h1>
        <p>Join the discussion, record your work, and see your contribution history across Web and Gardener.</p>
      </header>
      <SignIn returnTo={returnTo} error={params.login} providers={session?.providers} />
      <Link href="/community" className="community-link">Browse the registry</Link>
    </div>
  );
}

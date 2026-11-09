import Link from "next/link";
import { redirect } from "next/navigation";
import { communitySignInPath } from "@/community-server/lib/community/return-path";
import { communitySession } from "@/lib/community/service";
import { NewBountyForm } from "../BountyForms";

export default async function NewBountyPage() {
  const session = await communitySession();
  if (!session?.contributor) redirect(communitySignInPath("/community/bounties/new"));
  return (
    <>
      <header className="community-heading">
        <Link href="/community/bounties" className="community-link">← Back to bounties</Link>
        <h1>Post a bounty</h1>
        <p>Describe a concrete task the community can help with.</p>
      </header>
      {session.canManageBounties ? <NewBountyForm /> : <p className="community-notice">Only CrossOmics editors can post bounties.</p>}
    </>
  );
}

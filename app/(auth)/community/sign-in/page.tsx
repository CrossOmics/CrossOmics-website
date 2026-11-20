import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { safeCommunityReturn } from "@/lib/community/return-path";
import { communitySession } from "@/lib/community/service";
import SignIn from "@/app/community/SignIn";
import "./sign-in.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in | CrossOmics Community" };

export default async function CommunitySignInPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; login?: string }> }) {
  const [params, session] = await Promise.all([searchParams, communitySession()]);
  const returnTo = safeCommunityReturn(params.returnTo, "/community");
  if (session?.contributor) redirect(returnTo);
  return (
    <div className="account-page">
      <header className="account-header container">
        <Link href="/" className="account-brand" aria-label="CrossOmics Community home">CrossOmics <span>Community</span></Link>
        <Link href="/" className="account-back">Browse the registry <span aria-hidden>↗</span></Link>
      </header>
      <main className="account-main container">
        <section className="account-intro" aria-labelledby="account-title">
          <h1 id="account-title">Sign in to{" "}<br />Community</h1>
          <p>A place for the work behind computational biology.</p>
          <ul className="account-benefits">
            <li><strong>Share your work</strong><span>Register a tool or contribute an improvement.</span></li>
            <li><strong>Keep your history</strong><span>Find your submissions and contributions in one place.</span></li>
            <li><strong>Build together</strong><span>Explore bounties and help useful tools grow.</span></li>
          </ul>
          <div className="account-lineage" aria-hidden="true">
            <span>Tool</span><i /><span>Review</span><i /><span>Community</span>
          </div>
        </section>
        <div className="account-panel-wrap">
          <SignIn returnTo={returnTo} error={params.login} providers={session?.providers} sessionDurationDays={session?.sessionDurationDays} />
          <p className="account-authorization-note">Use any account to register a tool. We ask for GitHub permission separately when an action needs it.</p>
        </div>
      </main>
      <footer className="account-footer container">© {new Date().getFullYear()} CrossOmics, Inc.</footer>
    </div>
  );
}

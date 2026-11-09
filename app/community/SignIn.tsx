import { signInLabels, type SignInProvider } from "@/lib/community/types";

export default function SignIn({ returnTo, error, providers = [] }: {
  returnTo: string;
  error?: string;
  providers?: SignInProvider[];
}) {
  const query = new URLSearchParams({ returnTo });
  return (
    <section className="community-notice">
      <h2>Choose a sign-in method</h2>
      {error && <p role="alert">{error === "expired" ? "Your sign-in attempt expired. Start again below." : "Sign-in failed. Try again."}</p>}
      {providers.length > 0 ? (
        <div className="community-actions">
          {providers.map((provider) => {
            const params = new URLSearchParams(query);
            params.set("provider", provider);
            return <a className="community-secondary" key={provider} href={`/api/community/auth/login?${params}`}>Sign in with {signInLabels[provider]}</a>;
          })}
        </div>
      ) : <p>Sign-in is unavailable on this deployment.</p>}
    </section>
  );
}

import { signInLabels, type SignInProvider } from "@/lib/community/types";

function ProviderIcon({ provider }: { provider: SignInProvider }) {
  if (provider === "google") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2c1.9-1.8 3-4.3 3-7.5Z" /><path fill="#34a853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4H3.1v2.6A10 10 0 0 0 12 22Z" /><path fill="#fbbc05" d="M6.4 14.1a6 6 0 0 1 0-4.2V7.2H3.1a10 10 0 0 0 0 9.6l3.3-2.7Z" /><path fill="#ea4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.5 9.5 0 0 0 12 2a10 10 0 0 0-8.9 5.2l3.3 2.7c.8-2.3 3-4 5.6-4Z" /></svg>;
  if (provider === "github") return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.84a9.6 9.6 0 0 1 2.5.34c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.5c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.9-.7s1.8.7 3 .7 1.9-1.1 2.6-2.1c.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.1-.8-2.1-3.9ZM14.2 6.3c.6-.8 1.1-1.8 1-2.8-1 .1-2.1.7-2.8 1.4-.6.7-1.1 1.7-1 2.7 1.1.1 2.1-.5 2.8-1.3Z" /></svg>;
}

export default function SignIn({ returnTo, error, providers = [], sessionDurationDays = 7 }: {
  returnTo: string;
  error?: string;
  providers?: SignInProvider[];
  sessionDurationDays?: number;
}) {
  const available = (["google", "github", "apple"] as SignInProvider[]).filter((provider) => providers.includes(provider));
  return (
    <section className="account-panel" aria-labelledby="sign-in-title">
      <h2 id="sign-in-title">Welcome back</h2>
      <p className="account-panel-description">Choose an account to continue.</p>
      {error && <p className="account-error" role="alert">{error === "expired" ? "Your sign-in attempt expired. Please try again below." : "We couldn’t complete sign-in. Choose an account to try again."}</p>}
      {available.length > 0 ? <>
        <div className="account-providers">
          {available.map((provider) => {
            const params = new URLSearchParams({ returnTo, provider });
            return <a className="account-provider" key={provider} href={`/api/community/auth/login?${params}`}><ProviderIcon provider={provider} /><span>Continue with {signInLabels[provider]}</span></a>;
          })}
        </div>
        <p className="account-retention"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg><span>{`Stay signed in for up to ${sessionDurationDays} days on this browser. You can sign out at any time.`}</span></p>
      </> : <p className="account-error" role="status">Sign-in is unavailable right now. Please try again later or browse the registry.</p>}
    </section>
  );
}

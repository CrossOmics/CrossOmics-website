import { httpsUrl } from "@/lib/community/https-url";
import type { RegistryCredit } from "@/lib/community/registry-v2";

export default function RegistryCredits({ credits }: { credits: RegistryCredit[] }) {
  if (!credits.length) return <>Not recorded</>;
  return <>{credits.map((credit, index) => {
    const links = [
      { label: "GitHub", url: credit.github && httpsUrl("https://github.com/" + encodeURIComponent(credit.github)) },
      { label: "ORCID", url: credit.orcid && httpsUrl("https://orcid.org/" + encodeURIComponent(credit.orcid)) },
      { label: "Profile", url: httpsUrl(credit.url) }
    ];
    return <span key={index}>
      {index > 0 && "; "}{credit.name}
      {links.map(({ label, url }) => url && <span key={label}> · <a href={url} className="community-link">{label}</a></span>)}
    </span>;
  })}</>;
}

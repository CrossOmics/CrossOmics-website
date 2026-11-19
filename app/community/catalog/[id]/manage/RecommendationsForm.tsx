"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RegistryItemV2 } from "@/lib/community/registry-v2";
import { communityRequest } from "../../../client";

export default function RecommendationsForm({ item }: { item: RegistryItemV2 }) {
  const [ids, setIds] = useState(item.recommendedVersionIds ?? []);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{text:string;error:boolean}>();
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
    setPending(true); setMessage(undefined);
    try {
      await communityRequest(`catalog/${item.id}/recommendations`, "POST", {versionIds:ids,reason}, "v2");
      setMessage({text:"Recommendations saved.",error:false}); router.refresh();
    } catch (error) {setMessage({text:error instanceof Error?error.message:"Could not save recommendations.",error:true});}
    finally {setPending(false);}
  }
  return <form className="community-form" onSubmit={submit}>
    <fieldset disabled={pending}>
      <legend>Recommended versions</legend>
      <p>Select up to two published versions. They appear first on the Tool page. Uncheck all versions to clear recommendations.</p>
      <div className="community-version-choices">
        {item.versions.filter(version => !version.withdrawn).map(version => <label key={version.id}>
          <input type="checkbox" checked={ids.includes(version.id)} disabled={!ids.includes(version.id) && ids.length >= 2}
            onChange={event => setIds(event.target.checked ? [...ids, version.id] : ids.filter(id => id !== version.id))} />
          <span>{version.label}{ids.includes(version.id) ? ` · Recommendation ${ids.indexOf(version.id)+1}` : ""}</span>
        </label>)}
      </div>
      <label>Reason for recommendations<textarea name="reason" required rows={2} maxLength={1000} /></label>
    </fieldset>
    <button className="community-primary" disabled={pending}>Save recommendations</button>
    {message && <p role={message.error?"alert":"status"} className={message.error?"community-error":undefined}>{message.text}</p>}
  </form>;
}

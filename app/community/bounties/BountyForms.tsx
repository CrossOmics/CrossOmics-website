"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { bountyCategories, bountyStatuses, type BountyStatus } from "@/lib/community/types";
import { communityRequest } from "../client";

export function NewBountyForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const { id } = await communityRequest<{ id: string }>("bounties", "POST", Object.fromEntries(new FormData(event.currentTarget)));
      window.location.assign(`/community/bounties/${id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not post the bounty.");
      setPending(false);
    }
  }

  return (
    <form className="community-form community-bounty-form" method="post" onSubmit={submit}>
      <fieldset disabled={pending}>
        <legend>Bounty details</legend>
        <div className="community-form-grid">
          <label>Title<input name="title" maxLength={120} required /></label>
          <label>Category
            <select name="category" required defaultValue="">
              <option value="" disabled>Choose a category</option>
              {Object.entries(bountyCategories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="community-field-wide">What would help?
            <textarea name="description" rows={6} maxLength={4000} required placeholder="Describe the work, the expected result, and how someone can get started." />
          </label>
          <label>Project or issue URL <span>(optional)</span><input type="url" name="projectUrl" maxLength={2048} /></label>
          <label>Reward or recognition <span>(optional)</span><input name="reward" maxLength={160} /></label>
        </div>
      </fieldset>
      {error && <p className="community-error" role="alert">{error}</p>}
      <button className="community-primary" type="submit" disabled={pending}>{pending ? "Posting…" : "Post bounty"}</button>
    </form>
  );
}

export function BountyStatusForm({ id, status }: { id: string; status: BountyStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setPending(true);
    try {
      await communityRequest(`bounties/${id}`, "PATCH", { status: new FormData(event.currentTarget).get("status") });
      setMessage("Status updated.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update the status.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="community-bounty-status-form" method="post" onSubmit={submit}>
      <div className="community-bounty-status-controls">
        <label>Bounty status
          <select name="status" defaultValue={status} disabled={pending}>
            {Object.entries(bountyStatuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <button className="community-secondary" type="submit" disabled={pending}>{pending ? "Saving…" : "Update status"}</button>
      </div>
      {message && <p role="status">{message}</p>}
      {error && <p className="community-error" role="alert">{error}</p>}
    </form>
  );
}

export function BountyReplyForm({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setStatus("");
    setError("");
    try {
      await communityRequest(`bounties/${id}/replies`, "POST", { message: new FormData(form).get("message") });
      if (window.location.search) {
        window.location.assign(`/community/bounties/${id}#discussion`);
      } else {
        form.reset();
        setStatus("Reply posted.");
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not post your reply.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="community-form community-bounty-form" method="post" onSubmit={submit}>
      <label>Write a reply<textarea name="message" rows={4} maxLength={2000} required disabled={pending} placeholder="Ask a question or tell the team how you’d like to help." /></label>
      {status && <p role="status">{status}</p>}
      {error && <p className="community-error" role="alert">{error}</p>}
      <button className="community-primary" type="submit" disabled={pending}>{pending ? "Posting…" : "Post reply"}</button>
    </form>
  );
}

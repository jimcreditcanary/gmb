"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

/** Mailchimp signup, same fields (EMAIL + honeypot) and ids; posts to /api/newsletter which forwards to Mailchimp. */
export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setStatus("sending"); setMsg("");
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/newsletter", { method: "POST", body: fd }); const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Please try again.");
      setStatus("ok"); setMsg(j.message || "Thank you for subscribing!");
    } catch (err) { setStatus("error"); setMsg(err instanceof Error ? err.message : "Please try again."); }
  };
  return (
    <form onSubmit={onSubmit} method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" noValidate className="grid gap-2">
      <label htmlFor="mce-EMAIL" className="text-small text-ink-inverse-muted">Email Address <span aria-hidden="true">*</span><span className="sr-only-text">required</span></label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="email" name="EMAIL" id="mce-EMAIL" required autoComplete="email" className="h-12 min-w-0 grow rounded-field border border-ink-inverse/30 bg-surface px-4 text-body text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none focus-visible:outline-3 focus-visible:outline-ink-inverse focus-visible:outline-offset-2" />
        <Button type="submit" name="subscribe" id="mc-embedded-subscribe" disabled={status === "sending"} className="focus-visible:outline-ink-inverse">{status === "sending" ? "Subscribing…" : "Subscribe"}</Button>
      </div>
      <div aria-live="polite" className="text-small">
        {status === "error" && <p className="text-tone-resources" id="mce-error-response">{msg}</p>}
        {status === "ok" && <p id="mce-success-response">{msg}</p>}
      </div>
      <div aria-hidden="true" className="absolute -left-[5000px]"><input type="text" name="b_d9343033dc8a6cee1d438cafd_a34de2255e" tabIndex={-1} defaultValue="" /></div>
    </form>
  );
}

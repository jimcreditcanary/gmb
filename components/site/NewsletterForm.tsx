"use client";
import { useState, type FormEvent } from "react";

/** Mailchimp embedded form, same fields (EMAIL + honeypot) and markup ids; posts to /api/newsletter which forwards to Mailchimp. */
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
    <div id="mc_embed_shell"><div id="mc_embed_signup">
      <form onSubmit={onSubmit} method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" noValidate>
        <div id="mc_embed_signup_scroll">
          <div className="indicates-required"><span className="asterisk">*</span> indicates required</div>
          <div className="mc-field-group">
            <label htmlFor="mce-EMAIL">Email Address <span className="asterisk">*</span></label>
            <input type="email" name="EMAIL" className="required email" id="mce-EMAIL" required autoComplete="email" />
          </div>
          <div id="mce-responses" className="clear" aria-live="polite">
            {status === "error" && <div className="response" id="mce-error-response">{msg}</div>}
            {status === "ok" && <div className="response" id="mce-success-response">{msg}</div>}
          </div>
          <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}><input type="text" name="b_d9343033dc8a6cee1d438cafd_a34de2255e" tabIndex={-1} defaultValue="" /></div>
          <div className="clear"><input type="submit" name="subscribe" id="mc-embedded-subscribe" className="button" value={status === "sending" ? "Subscribing…" : "Subscribe"} disabled={status === "sending"} /></div>
        </div>
      </form>
    </div></div>
  );
}

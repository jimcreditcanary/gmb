"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";

export type Field = { name: string; type: string; required?: boolean; label?: string };
type Props = { formId?: string; fields: Field[]; submit?: string; successMessage?: string; children?: React.ReactNode };

/**
 * Contact Form 7 replacement. Same field names and labels; posts to /api/contact.
 * Spam control: honeypot + time-trap (+ Cloudflare Turnstile when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set). The old image captcha is not reproduced.
 */
export function ContactForm(props: Props) {
  const { formId, fields, submit = "Send", successMessage = "Thank you for your message. It has been sent.", children } = props;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const started = useRef<number>(0);
  useEffect(() => { started.current = Date.now(); }, []);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setStatus("sending"); setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("_form", formId || ""); fd.set("_elapsed", String(Date.now() - started.current)); fd.set("_page", window.location.pathname + window.location.search);
    try {
      const r = await fetch("/api/contact", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) { setStatus("error"); setError(err instanceof Error ? err.message : "Something went wrong."); }
  };
  const visible = fields.filter((f) => !/^_/.test(f.name) && f.type !== "submit" && f.type !== "hidden" && !/captcha/.test(f.name));
  return (
    <section className="contact-form"><div className="outline"><div className="wrap-content">
      <div className={`wpcf7 ${status}`} lang="en-GB" dir="ltr">
        {status === "sent" ? (
          <p className="wpcf7-response-output" role="status">{successMessage}</p>
        ) : (
          <form onSubmit={onSubmit} className="wpcf7-form" aria-label="Contact form" noValidate>
            {children}
            <p>
              {visible.map((f) => (
                <span key={f.name} className="wpcf7-field">
                  <label htmlFor={`f-${f.name}`}>{f.label || f.name}{f.required ? "*" : ""}</label><br />
                  <span className="wpcf7-form-control-wrap" data-name={f.name}>
                    {f.type === "textarea" ? (
                      <textarea id={`f-${f.name}`} name={f.name} className="wpcf7-form-control wpcf7-textarea" rows={8} required={f.required} aria-required={f.required} />
                    ) : (
                      <input id={`f-${f.name}`} name={f.name} type={f.type === "email" || /email/i.test(f.name) ? "email" : f.type === "tel" ? "tel" : "text"} className="wpcf7-form-control wpcf7-text" size={40} maxLength={400} required={f.required} aria-required={f.required} autoComplete={/first/i.test(f.name) ? "given-name" : /last/i.test(f.name) ? "family-name" : /email/i.test(f.name) ? "email" : /tel|phone/i.test(f.name) ? "tel" : undefined} />
                    )}
                  </span><br />
                </span>
              ))}
            </p>
            <div style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label htmlFor="website-url">Leave this field empty</label>
              <input id="website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <p><input type="submit" value={status === "sending" ? "Sending…" : submit} className="wpcf7-form-control wpcf7-submit" disabled={status === "sending"} /></p>
            {status === "error" && <p className="wpcf7-response-output" role="alert">{error}</p>}
          </form>
        )}
      </div>
    </div></div></section>
  );
}

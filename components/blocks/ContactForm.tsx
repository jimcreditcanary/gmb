"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

const elapsedSince = (t: number) => Date.now() - t;

export type Field = { name: string; type: string; required?: boolean; label?: string; placeholder?: string };
type Props = { formId?: string; fields: Field[]; submit?: string; successMessage?: string; children?: React.ReactNode };

const field = "block w-full rounded-field border border-border-strong bg-surface px-4 text-body text-ink placeholder:text-ink-subtle transition-colors duration-(--motion-duration) hover:border-ink-subtle focus:border-ink focus:outline-none focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-2 aria-[invalid=true]:border-error";

/**
 * Contact form (docs/design-system.md §Forms). Same field names as the live Contact Form 7 forms; posts to /api/contact.
 * Labels above, inline errors below, success in place. Spam control: honeypot + time-trap.
 */
export function ContactForm(props: Props) {
  const { formId, fields, submit = "Send", successMessage = "Thank you for your message. It has been sent.", children } = props;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const started = useRef<number>(0);
  useEffect(() => { started.current = Date.now(); }, []);
  const visible = fields.filter((f) => !/^_/.test(f.name) && f.type !== "submit" && f.type !== "hidden" && !/captcha/.test(f.name));
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const form = e.currentTarget; const fd = new FormData(form);
    const errs: Record<string, string> = {};
    for (const f of visible) {
      const v = String(fd.get(f.name) || "").trim(); const isEmail = f.type === "email" || /email/i.test(f.name);
      if (f.required && !v) errs[f.name] = "Please fill in this field.";
      else if (isEmail && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errs[f.name] = "Please enter a valid email address.";
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length) { (form.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus(); return; }
    setStatus("sending");
    fd.set("_form", formId || ""); fd.set("_elapsed", String(elapsedSince(started.current))); fd.set("_page", window.location.pathname + window.location.search);
    try {
      const r = await fetch("/api/contact", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) { setStatus("error"); setError(err instanceof Error ? err.message : "Something went wrong."); }
  };
  return (
    <Section tone="subtle" id="form">
      <div className="mx-auto max-w-[640px]">
        {children && <div className="prose mb-block [&>h2]:text-h2 [&>h3]:mt-2 [&>h3]:text-h4 [&>h3]:text-ink-muted">{children}</div>}
        {status === "sent" ? (
          <p className="rounded-card bg-surface p-6 font-display text-h4" role="status">{successMessage}</p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5" aria-label="Contact form" noValidate>
            {visible.map((f) => {
              const id = `f-${f.name}`; const err = fieldErrors[f.name];
              const type = f.type === "email" || /email/i.test(f.name) ? "email" : f.type === "tel" ? "tel" : "text";
              const auto = /first/i.test(f.name) ? "given-name" : /last/i.test(f.name) ? "family-name" : /name/i.test(f.name) ? "name" : type === "email" ? "email" : type === "tel" ? "tel" : undefined;
              return (
                <div key={f.name} className="grid gap-1.5">
                  <label htmlFor={id} className="font-display text-small">{f.label || f.name}{f.required ? " *" : ""}</label>
                  {f.type === "textarea"
                    ? <textarea id={id} name={f.name} rows={6} placeholder={f.placeholder} required={f.required} aria-required={f.required} aria-invalid={!!err || undefined} aria-describedby={err ? `${id}-error` : undefined} className={cn(field, "min-h-36 py-3")} />
                    : <input id={id} name={f.name} type={type} placeholder={f.placeholder} required={f.required} aria-required={f.required} aria-invalid={!!err || undefined} aria-describedby={err ? `${id}-error` : undefined} autoComplete={auto} maxLength={400} className={cn(field, "h-12")} />}
                  {err && <span id={`${id}-error`} className="text-small text-error" role="alert">{err}</span>}
                </div>
              );
            })}
            <div className="absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
              <label htmlFor="website-url">Leave this field empty</label>
              <input id="website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : submit}</Button>
              {status === "error" && <p className="text-small text-error" role="alert">{error}</p>}
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}

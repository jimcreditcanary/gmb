import { NextRequest, NextResponse } from "next/server";

/**
 * Contact / registration forms (replaces Contact Form 7).
 * Delivery: RESEND_API_KEY + CONTACT_TO → email via Resend; otherwise the submission is logged (Vercel logs) and accepted, so nothing is lost while credentials are pending.
 * Spam: honeypot, time-trap (< 3s = bot), optional Cloudflare Turnstile (TURNSTILE_SECRET_KEY).
 */
export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const data: Record<string, string> = {};
  fd.forEach((v, k) => { data[k] = String(v); });
  if (data.website_url) return NextResponse.json({ ok: true });
  if (Number(data._elapsed || 0) < 3000) return NextResponse.json({ ok: false, error: "Please take a moment and try again." }, { status: 400 });
  const required = Object.keys(data).filter((k) => !k.startsWith("_") && k !== "website_url");
  if (!required.length) return NextResponse.json({ ok: false, error: "Nothing to send." }, { status: 400 });
  const emailField = Object.entries(data).find(([k]) => /email/i.test(k))?.[1];
  if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  if (process.env.TURNSTILE_SECRET_KEY) {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: data["cf-turnstile-response"] }) }).then((x) => x.json()).catch(() => ({ success: false }));
    if (!r.success) return NextResponse.json({ ok: false, error: "Verification failed. Please try again." }, { status: 400 });
  }
  const lines = Object.entries(data).filter(([k]) => !k.startsWith("_") && k !== "website_url").map(([k, v]) => `${k}: ${v}`).join("\n");
  const subject = `[gmbcreditunion.com] Form ${data._form || ""} from ${data._page || ""}`.trim();
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO) {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.CONTACT_FROM || "website@gmbcreditunion.com", to: process.env.CONTACT_TO.split(","), reply_to: emailField, subject, text: lines }) });
    if (!r.ok) return NextResponse.json({ ok: false, error: "Message could not be sent. Please email us directly." }, { status: 502 });
  } else {
    console.log("[contact-form] (no mail provider configured)\n" + subject + "\n" + lines);
  }
  return NextResponse.json({ ok: true });
}

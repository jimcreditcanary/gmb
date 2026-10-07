import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/lib/site";

const email = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/**
 * Newsletter sign-up. Two modes:
 *  - MAILCHIMP_API_KEY + MAILCHIMP_AUDIENCE_ID set → Marketing API (double opt-in "pending").
 *  - otherwise → forwards to the public list-manage.com endpoint the WordPress form posted to (no credentials needed).
 */
export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const addr = String(fd.get("EMAIL") || "").trim();
  const honeypot = String(fd.get("b_d9343033dc8a6cee1d438cafd_a34de2255e") || "");
  if (honeypot) return NextResponse.json({ ok: true, message: "Thank you for subscribing!" });
  if (!email(addr)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  const key = process.env.MAILCHIMP_API_KEY, audience = process.env.MAILCHIMP_AUDIENCE_ID;
  try {
    if (key && audience) {
      const dc = key.split("-").pop();
      const r = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${audience}/members`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString("base64")}`, "Content-Type": "application/json" }, body: JSON.stringify({ email_address: addr, status: "pending", tags: ["website"] }) });
      const j = await r.json();
      if (r.ok || j.title === "Member Exists") return NextResponse.json({ ok: true, message: j.title === "Member Exists" ? "You're already subscribed." : "Almost finished… please check your inbox to confirm your subscription." });
      return NextResponse.json({ ok: false, error: j.detail || "Subscription failed." }, { status: 502 });
    }
    const action = SITE.footer.newsletter.action; // public embedded-form endpoint
    const body = new URLSearchParams({ EMAIL: addr, b_d9343033dc8a6cee1d438cafd_a34de2255e: "", subscribe: "Subscribe" });
    const r = await fetch(action, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "gmbcreditunion.com newsletter form" }, body, redirect: "manual" });
    if (r.status >= 200 && r.status < 400) return NextResponse.json({ ok: true, message: "Almost finished… please check your inbox to confirm your subscription." });
    return NextResponse.json({ ok: false, error: "Subscription failed. Please try again later." }, { status: 502 });
  } catch {
    return NextResponse.json({ ok: false, error: "Subscription failed. Please try again later." }, { status: 502 });
  }
}

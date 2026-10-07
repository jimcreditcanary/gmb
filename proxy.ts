import { NextResponse, type NextRequest } from "next/server";
import redirects from "./lib/redirects.json";

/**
 * Edge rules (run before routing):
 *  1. Legacy/renamed URLs from lib/redirects.json resolve in ONE hop whether or not the request has a trailing slash (WordPress replied 301 from either form).
 *  2. Uppercase paths → lowercase (Apache served /About-Us/ case-insensitively; Vercel does not).
 *  3. Missing trailing slash → add it (301, like WordPress), except for files.
 *  4. WordPress size-variant image URLs (/media/foo-600x400.png) → the original file (variants are not shipped).
 */
const table = new Map<string, { destination: string; permanent: boolean }>();
for (const r of redirects as { source: string; destination: string; permanent: boolean }[]) {
  if (r.source.includes(":")) continue; // pattern rules stay with next.config
  table.set(r.source, r); table.set(r.source + "/", r);
}
const isFile = (p: string) => /\.[a-z0-9]{2,8}$/i.test(p) || p.startsWith("/media/") || p.startsWith("/theme/");

export function proxy(req: NextRequest) {
  const url = req.nextUrl; const { pathname } = url;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return NextResponse.next();

  const go = (path: string, status: 301 | 302) => NextResponse.redirect(new URL(path, req.url), status); // plain URL: NextURL would normalise the trailing slash away
  const hit = table.get(pathname) || table.get(pathname.toLowerCase());
  if (hit) return go(hit.destination, hit.permanent ? 301 : 302);

  if (pathname.startsWith("/directors-area")) return go("/", 302);

  if (/[A-Z]/.test(pathname) && !pathname.startsWith("/media/") && !pathname.startsWith("/theme/")) {
    let p = pathname.toLowerCase(); if (!isFile(p) && !p.endsWith("/")) p += "/";
    return go(p + url.search, 301);
  }

  if (pathname !== "/" && !pathname.endsWith("/") && !isFile(pathname)) return go(pathname + "/" + url.search, 301);

  if (pathname.startsWith("/media/")) {
    const m = pathname.match(/^(.*?)(?:-\d{2,4}x\d{2,4}|-scaled|-rotated|-e\d{13}|-\d+x\d+@2x)+(\.[a-z0-9]+)$/i);
    if (m) { const to = url.clone(); to.pathname = m[1] + m[2]; return NextResponse.rewrite(to); }
  }
  // Any host other than the canonical one (vercel.app previews/production alias, custom preview domains) must never be indexed,
  // even when the build is in production mode. Canonical tags already point at www.gmbcreditunion.com.
  const host = req.headers.get("host") || "";
  if (!/^(www\.)?gmbcreditunion\.com$/.test(host) && !/^localhost(:\d+)?$/.test(host)) {
    const res = NextResponse.next(); res.headers.set("X-Robots-Tag", "noindex, nofollow"); return res;
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

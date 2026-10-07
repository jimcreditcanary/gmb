import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
/** Generated Open Graph fallback for pages without a featured image: brand navy, orange rule, page title in Menca. */
export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") || "GMB Credit Union";
  const font = await fetch(new URL("/theme/fonts/MencaBold.woff", req.nextUrl.origin)).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#102c45", color: "#fff", padding: 72, fontFamily: font ? "Menca" : "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}><div style={{ width: 16, height: 56, background: "#e36129", borderRadius: 4 }} /><div style={{ fontSize: 34, letterSpacing: 1 }}>GMB CREDIT UNION</div></div>
        <div style={{ fontSize: title.length > 50 ? 56 : 72, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 28, color: "#decef9" }}>www.gmbcreditunion.com</div>
      </div>
    ),
    { width: 1200, height: 630, fonts: font ? [{ name: "Menca", data: font, style: "normal", weight: 700 }] : undefined, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}

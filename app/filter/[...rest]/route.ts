/** `/filter/*` (file taxonomy archives) is on hold per decision 2026-10-07: 410 Gone. */
export function GET() { return new Response("Gone", { status: 410, headers: { "X-Robots-Tag": "noindex", "Content-Type": "text/plain" } }); }

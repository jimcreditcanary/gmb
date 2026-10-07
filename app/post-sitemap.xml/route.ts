import { urlset, postRows, xmlHeaders } from "@/lib/sitemaps";
export const dynamic = "force-static";
export function GET() { return new Response(urlset(postRows()), { headers: xmlHeaders }); }

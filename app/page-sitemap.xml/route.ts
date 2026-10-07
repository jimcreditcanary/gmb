import { urlset, pageRows, xmlHeaders } from "@/lib/sitemaps";
export const dynamic = "force-static";
export function GET() { return new Response(urlset(pageRows()), { headers: xmlHeaders }); }

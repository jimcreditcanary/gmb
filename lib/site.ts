import site from "@/content/_site/site.json";
import regulatory from "@/content/_site/regulatory.json";

export type NavItem = { label: string; href: string; target?: string; children?: NavItem[] };
export const SITE = {
  ...site,
  nav: site.nav as NavItem[],
  regulatory,
  isProduction: process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_SITE_ENV === "production",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
};
export const SITE_URL = "https://www.gmbcreditunion.com";
export const absolute = (p: string) => (p.startsWith("http") ? p : SITE_URL + p);

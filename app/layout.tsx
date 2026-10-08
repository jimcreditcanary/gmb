import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/lib/fontawesome";
import { mencaBold, mencaMedium } from "./fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CookieBanner } from "@/components/site/Consent";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.shortName, template: "%s" },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  robots: SITE.isProduction ? undefined : { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#102C45" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${mencaBold.variable} ${mencaMedium.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <div className="grow">{children}</div>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}

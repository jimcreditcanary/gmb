import localFont from "next/font/local";
import { Figtree } from "next/font/google";

/** Brand display face from the original theme (self-hosted). Used for H1/H2 and the display sizes only. */
export const mencaBold = localFont({
  src: [{ path: "../public/theme/fonts/MencaBold.woff2", weight: "400", style: "normal" }],
  variable: "--font-menca-bold",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

/** Kept for the brand's own copy marks; no longer the body face. */
export const mencaMedium = localFont({
  src: [{ path: "../public/theme/fonts/MencaMedium.woff2", weight: "400", style: "normal" }],
  variable: "--font-menca-medium",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

/** Text and UI face (docs/design-direction.md §Polish): real weights for body, labels, buttons, small headings. Self-hosted by next/font. */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
  preload: true,
});

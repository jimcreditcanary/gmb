import localFont from "next/font/local";

/** Brand faces shipped with the original theme (self-hosted, swap, preloaded). */
export const mencaBold = localFont({
  src: [{ path: "../public/theme/fonts/MencaBold.woff2", weight: "400", style: "normal" }],
  variable: "--font-menca-bold",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const mencaMedium = localFont({
  src: [{ path: "../public/theme/fonts/MencaMedium.woff2", weight: "400", style: "normal" }],
  variable: "--font-menca-medium",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

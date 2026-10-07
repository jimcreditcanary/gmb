import fs from "node:fs";
import path from "node:path";
import { Button } from "@/components/ui/button";

const APPLE = "/media/badge-app-store.svg", GOOGLE = "/media/badge-google-play.png";
const exists = (p: string) => fs.existsSync(path.join(process.cwd(), "public", p));

/**
 * App store links (design-enhancements T3.12). Renders the official App Store / Google Play badges when the artwork is in
 * public/media (badge-app-store.svg from developer.apple.com/app-store/marketing, badge-google-play.png from play.google.com/intl/en_gb/badges).
 * Until the files are there it falls back to the two text buttons, so nothing breaks.
 */
export function StoreBadges({ apple, google }: { apple: string; google: string }) {
  if (!exists(APPLE) || !exists(GOOGLE)) {
    return <><Button href={apple} target="_blank">Download from Apple Store</Button> <Button href={google} target="_blank">Download from Google Play</Button></>;
  }
  return (
    <p className="store-badges">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <a href={apple} target="_blank" rel="noopener"><img src={APPLE} alt="Download on the App Store" width={135} height={40} /></a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <a href={google} target="_blank" rel="noopener"><img src={GOOGLE} alt="Get it on Google Play" width={135} height={40} /></a>
    </p>
  );
}

import { SITE } from "@/lib/site";
import { TrustpilotLoader } from "./TrustpilotLoader";

/** TrustBox: static server-rendered markup (link to the review page) + widget script loaded lazily by a client island. */
export function Trustpilot({ template = SITE.trustpilot.templates[0], height = "28px" }: { template?: string; height?: string }) {
  const tp = SITE.trustpilot;
  return (
    <div className="trustpilot-widget w-full" data-locale={tp.locale || "en-GB"} data-template-id={template} data-businessunit-id={tp.businessUnit} data-style-height={height} data-style-width="100%" style={{ height, position: "relative" }}>
      <a href={tp.reviewUrl} target="_blank" rel="noopener" className="font-display text-small text-ink">Trustpilot</a>
      <TrustpilotLoader />
    </div>
  );
}

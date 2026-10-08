import type { ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { toTone, toneClass, isInverse } from "@/lib/tones";
import { Container } from "@/components/ui/section";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";
import { Lottie } from "./Lottie";

type Tile = { label: string; href: string; icon?: string };
type Props = { colour?: string; label?: string; trustpilot?: boolean; image?: string; imageAlt?: string; imageWrap?: string; lottie?: string; poster?: string; buttons?: Tile[]; variant?: "page" | "home" | "title"; date?: string; children?: ReactNode };

/**
 * Hero (docs/design-direction.md, Monzo model): a big rounded colour block inside the page margins.
 * Home: the whole block is orange, navy display type, the family photo in the corner, the two tiles as pill doorways.
 * Pages: the block takes the page's colour (loans green, savings light blue, about lilac, resources yellow) with the artwork right.
 * `variant="title"`: compact white. The Trustpilot strip sits in a thin line under the hero.
 */
export function PageHeader({ colour, label, trustpilot, image, imageAlt = "", lottie, poster, buttons, variant, date, children }: Props) {
  const kind = variant || (colour ? "page" : "title");
  const tone = kind === "home" ? "brand" : toTone(colour || "lilac");
  const dark = isInverse(tone);
  const hasArt = Boolean(lottie || image);
  const compact = kind === "title";
  return (
    <>
      <section className={cn("hero overflow-x-clip", kind === "home" && "hero-home", compact ? "py-section-tight" : "pt-4 pb-4 sm:pt-6")}>
        <Container>
          <div className={cn(!compact && cn("relative overflow-hidden rounded-panel px-6 pt-10 pb-10 sm:px-10 sm:pt-14 sm:pb-14 lg:px-16 lg:pt-20 lg:pb-20", toneClass[tone]))}>
            <div className={cn("grid items-center gap-x-12 gap-y-10", hasArt && !compact && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]")}>
              <div className={cn("hero-copy relative", compact && "max-w-measure")}>
                {label && <p className={cn("mb-3 font-ui text-h4 font-semibold", dark ? "text-ink-inverse-muted" : "text-ink")}>{label}</p>}
                <div className={cn("prose hero-prose [&>p]:text-lead [&>p]:max-w-[48ch]", kind === "home" ? "[&>h1]:text-display [&>h1]:text-ink [&>h1]:max-w-none [&>p]:mt-6" : "[&>h1]:max-w-[18ch]", dark ? "[&>p]:text-ink-inverse-muted" : "[&>p]:text-ink")}>{children}</div>
                {date && <p className={cn("mt-stack text-small", dark ? "text-ink-inverse-muted" : "text-ink")}>Date: {date}</p>}
                {buttons && buttons.length > 0 && (
                  <ul className="mt-8 flex flex-wrap gap-3">
                    {buttons.map((b, i) => (
                      <li key={b.href + b.label}>
                        <Link href={b.href} className={cn("group inline-flex h-14 items-center gap-3 rounded-control px-7 font-ui text-lg font-semibold no-underline transition-colors duration-(--motion-duration)", i === 0 ? "bg-ink text-ink-inverse hover:bg-navy-800 hover:text-ink-inverse" : "bg-surface text-ink hover:bg-ink hover:text-ink-inverse")}>
                          {b.label}<FontAwesomeIcon icon={faArrowRight} className="size-4 transition-transform duration-(--motion-duration) group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {hasArt && !compact && (
                kind === "home" ? (
                  <div className="hero-slab relative min-h-[320px] lg:min-h-[420px]">
                    {image && <Img src={image} alt={imageAlt} priority sizes="(max-width: 1024px) 90vw, 640px" className="absolute -bottom-10 -right-8 h-auto w-[115%] max-w-none object-contain object-right-bottom sm:-bottom-14 lg:-bottom-20 lg:-right-16 lg:w-[125%]" />}
                  </div>
                ) : (
                  <div className="hero-art relative mx-auto -mb-10 w-full max-w-[460px] sm:-mb-14 lg:-mb-20 lg:max-w-none">
                    <div className="stage aspect-[5/4] w-full rounded-none">
                      {lottie ? <div className="h-full w-full"><Lottie src={lottie} poster={poster} /></div> : image && <Img src={image} alt={imageAlt} priority sizes="(max-width: 1024px) 80vw, 460px" className="size-full object-contain object-bottom" />}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </Container>
      </section>
      {trustpilot && (
        <div className="trust-band py-2">
          <Container><div className="flex max-w-[480px] items-center"><Trustpilot /></div></Container>
        </div>
      )}
    </>
  );
}

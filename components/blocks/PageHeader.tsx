import type { ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { toTone, isInverse } from "@/lib/tones";
import { Container } from "@/components/ui/section";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";
import { Lottie } from "./Lottie";

type Tile = { label: string; href: string; icon?: string };
type Props = { colour?: string; label?: string; trustpilot?: boolean; image?: string; imageAlt?: string; imageWrap?: string; lottie?: string; poster?: string; buttons?: Tile[]; variant?: "page" | "home" | "title"; date?: string; children?: ReactNode };

/**
 * Hero (docs/design-direction.md). White page, copy left in 7 columns, artwork right.
 * `variant="home"`: the headline at display size and the photo breaking out of an orange slab, the site's one bold device;
 * the two tiles become doorways. `variant="title"`: compact, text only. `label` is a sentence-case word above the H1.
 * The Trustpilot strip sits in a thin line under the hero, left-aligned.
 */
export function PageHeader({ colour, label, trustpilot, image, imageAlt = "", lottie, poster, buttons, variant, date, children }: Props) {
  const kind = variant || (colour ? "page" : "title");
  const tone = toTone(colour);
  const dark = isInverse(tone) && kind !== "home";
  const hasArt = Boolean(lottie || image);
  const compact = kind === "title";
  return (
    <>
      <section className={cn("hero overflow-x-clip", kind === "home" && "hero-home", dark ? "bg-surface-inverse text-ink-inverse on-inverse" : "bg-surface text-ink", compact ? "py-section-tight" : "pt-(--hero-padding-y) pb-(--hero-padding-y)")}>
        <Container>
          <div className={cn("grid items-center gap-x-12 gap-y-10", hasArt && !compact && (kind === "home" ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"))}>
            <div className={cn("hero-copy", compact && "max-w-measure")}>
              {label && <p className={cn("mb-3 font-display text-h4", dark ? "text-ink-inverse-muted" : "text-brand-strong")}>{label}</p>}
              <div className={cn("prose hero-prose [&>p]:text-lead [&>p]:max-w-[52ch]", kind === "home" ? "[&>h1]:text-display [&>h1]:max-w-[14ch] [&>p]:mt-6" : "[&>h1]:max-w-[18ch]", dark ? "[&>p]:text-ink-inverse-muted" : "[&>p]:text-ink-muted")}>{children}</div>
              {date && <p className={cn("mt-stack text-small", dark ? "text-ink-inverse-muted" : "text-ink-muted")}>Date: {date}</p>}
              {buttons && buttons.length > 0 && (
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {buttons.map((b, i) => (
                    <li key={b.href + b.label}>
                      <Link href={b.href} className={cn("group flex h-full items-center justify-between gap-4 rounded-control p-5 no-underline transition-colors duration-(--motion-duration)", i === 0 ? "bg-ink text-ink-inverse hover:bg-brand-strong hover:text-ink-inverse" : "border-2 border-ink text-ink hover:bg-ink hover:text-ink-inverse")}>
                        <span className="font-display text-h4 leading-tight">{b.label}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="size-4 shrink-0 transition-transform duration-(--motion-duration) group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {hasArt && !compact && (
              kind === "home" ? (
                <div className="hero-slab relative mx-auto w-full max-w-[560px] overflow-visible lg:max-w-none">
                  <div className="aspect-[4/5] w-full rounded-panel bg-brand sm:aspect-square lg:aspect-[4/5]" aria-hidden="true" />
                  {image && <Img src={image} alt={imageAlt} priority sizes="(max-width: 1024px) 90vw, 560px" className="absolute -bottom-1 -right-[6%] h-auto w-[108%] max-w-none object-contain object-right-bottom drop-shadow-[0_24px_40px_rgba(16,44,69,0.25)]" />}
                </div>
              ) : (
                <div className="hero-art relative mx-auto w-full max-w-[460px] lg:max-w-none">
                  {lottie ? <div className="aspect-square w-full"><Lottie src={lottie} poster={poster} /></div> : image && <Img src={image} alt={imageAlt} priority sizes="(max-width: 1024px) 80vw, 460px" className="mx-auto h-auto w-full rounded-media object-contain" />}
                </div>
              )
            )}
          </div>
        </Container>
      </section>
      {trustpilot && (
        <div className="trust-band border-y border-border bg-surface py-2.5">
          <Container><div className="flex max-w-[480px] items-center"><Trustpilot /></div></Container>
        </div>
      )}
    </>
  );
}

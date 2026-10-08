import type { ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { toTone, toneClass, isInverse } from "@/lib/tones";
import { Container } from "@/components/ui/section";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";
import { Lottie } from "./Lottie";

type Tile = { label: string; href: string; icon?: string };
type Props = { colour?: string; label?: string; trustpilot?: boolean; image?: string; imageAlt?: string; imageWrap?: string; lottie?: string; poster?: string; buttons?: Tile[]; variant?: "page" | "home" | "title"; date?: string; children?: ReactNode };

/**
 * Hero (docs/design-system.md §Hero). Split layout: copy left in the measure, artwork right; tone from the page family.
 * `variant="title"` is the compact text-only hero (FAQ, legal). `buttons` are the home page's icon tiles.
 * The Trustpilot strip renders as a slim band under the hero, never inside it.
 */
export function PageHeader({ colour, label, trustpilot, image, imageAlt = "", lottie, poster, buttons, variant, date, children }: Props) {
  const kind = variant || (colour ? "page" : "title");
  const tone = toTone(colour || (kind === "title" ? "white" : "lilac"));
  const inverse = isInverse(tone);
  const hasArt = Boolean(lottie || image);
  const compact = kind === "title";
  return (
    <>
      <section className={cn("hero", toneClass[tone], compact ? "py-section-tight" : "py-(--hero-padding-y)")}>
        <Container>
          <div className={cn("grid items-center gap-block", hasArt && !compact && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]")}>
            <div className={cn("hero-copy max-w-measure", compact && "mx-auto text-center")}>
              {label && <p className={cn("mb-4 inline-flex items-center rounded-control px-3 py-1 font-display text-caption uppercase tracking-wide", inverse ? "bg-surface/15 text-ink-inverse" : "bg-surface text-ink")}>{label}</p>}
              <div className={cn("prose hero-prose [&>p]:text-lead", kind === "home" && "[&>h1]:text-display", inverse ? "[&>p]:text-ink-inverse-muted" : "[&>p]:text-ink-muted")}>{children}</div>
              {date && <p className={cn("mt-stack text-small", inverse ? "text-ink-inverse-muted" : "text-ink-muted")}>Date: {date}</p>}
              {buttons && buttons.length > 0 && (
                <ul className="mt-block grid gap-3 sm:grid-cols-2">
                  {buttons.map((b) => (
                    <li key={b.href + b.label}>
                      <Link href={b.href} className="group flex items-center gap-4 rounded-card bg-surface p-4 pr-5 text-ink no-underline shadow-card transition-[box-shadow,transform] duration-(--motion-duration) ease-standard hover:-translate-y-0.5 hover:shadow-card-hover hover:text-ink">
                        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-subtle">{b.icon && <Img src={b.icon} alt="" width={28} height={28} />}</span>
                        <span className="grow font-display text-h4 leading-snug">{b.label}</span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-strong text-ink-inverse transition-transform duration-(--motion-duration) group-hover:translate-x-0.5" aria-hidden="true"><FontAwesomeIcon icon={faChevronRight} className="size-3.5" /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {hasArt && !compact && (
              <div className="hero-art relative mx-auto w-full max-w-[520px] lg:max-w-none">
                {lottie ? <div className="aspect-square w-full"><Lottie src={lottie} poster={poster} /></div> : image && <Img src={image} alt={imageAlt} priority sizes="(max-width: 1024px) 80vw, 520px" className="mx-auto h-auto w-full rounded-media object-contain" />}
              </div>
            )}
          </div>
        </Container>
      </section>
      {trustpilot && (
        <div className="trust-band border-b border-border bg-surface py-3">
          <Container><div className="mx-auto flex max-w-[560px] justify-center"><Trustpilot /></div></Container>
        </div>
      )}
    </>
  );
}

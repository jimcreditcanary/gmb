import type { ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Img } from "./Img";
import { Trustpilot } from "./Trustpilot";
import { Lottie } from "./Lottie";

type Button = { label: string; href: string; icon?: string };
type Props = { colour?: string; label?: string; trustpilot?: boolean; image?: string; imageAlt?: string; imageWrap?: string; lottie?: string; poster?: string; buttons?: Button[]; variant?: "page" | "home" | "title"; date?: string; children?: ReactNode };

/** Page hero. Same DOM as the theme's `section.header-page` / `section.header` / `section.header-title`. */
export function PageHeader({ colour, label, trustpilot, image, imageAlt = "", imageWrap, lottie, poster, buttons, variant, date, children }: Props) {
  const kind = variant || (colour ? "page" : "title");
  const cls = kind === "home" ? `header ${colour}` : kind === "title" ? "header-title" : `header-page ${colour || ""}`.trim();
  return (
    <>
    <section className={cls}>
      <div className="outline">
        <div className="data-content">
          {label && <div className="label">{label}</div>}
          {children}
          {date && <div className="data-date">Date: {date}</div>}
          {buttons && buttons.length > 0 && (
            <div className="wrap-buttons">
              <ul className="list-buttons">
                {buttons.map((b) => (
                  <li key={b.href + b.label}>
                    <div className="wrap">
                      <Link href={b.href} className="full" aria-label={b.label}></Link>
                      <div className="row">
                        <div className="column column-icon"><div className="data-icon">{b.icon && <Img src={b.icon} alt="" />}</div></div>
                        <div className="column column-label">
                          <div className="data-label"><div className="text">{b.label}</div><span className="arrow"><FontAwesomeIcon icon={faChevronRight} /></span></div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {lottie && <div className="wrap-lottie"><div className="lpbLottiePlayer"><Lottie src={lottie} poster={poster} /></div></div>}
        {!lottie && image && <div className="data-image">{imageWrap ? <div className={imageWrap}><Img src={image} alt={imageAlt} priority sizes="(max-width: 768px) 100vw, 600px" /></div> : <Img src={image} alt={imageAlt} priority sizes="(max-width: 768px) 100vw, 600px" />}</div>}
      </div>
    </section>
    {trustpilot && <div className="trust-band"><div className="outline"><Trustpilot /></div></div>}
    </>
  );
}

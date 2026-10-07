import type { ReactNode } from "react";
import Link from "next/link";
import { Img } from "./Img";
import { VideoFacade } from "./VideoFacade";
import { EmbedPlaceholder } from "./EmbedPlaceholder";
import { SectionHeader } from "./SectionHeader";

const colourClass = (c?: string) => (c ? ` ${c}` : "");

// ---------- ListBlock ----------
export function ListBlock({ heading, align, children }: { heading?: string; align?: "center" | "right"; children: ReactNode }) {
  return (
    <section className="list-block"><div className="outline">
      {heading && <SectionHeader heading={heading} align={align} />}
      <div className="wrap-listblock"><ul className="list-listblock">{children}</ul></div>
    </div></section>
  );
}
/** Icon + content row, the list item shared by ListBlock (`ListItem`) and IconGrid (`IconItem`). Icons are decorative: the text beside them carries the meaning. */
export function IconRow({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <li><div className="row">
      <div className="column column-image"><div className="data-icon">{icon && <Img src={icon} alt="" />}</div></div>
      <div className="column column-content"><div className="data-content">{children}</div></div>
    </div></li>
  );
}
export { IconRow as ListItem, IconRow as IconItem };

// ---------- PanelSection ----------
export function PanelSection({ children }: { children: ReactNode }) {
  const kids = Array.isArray(children) ? children : [children];
  const footer = kids.find((k) => (k as { type?: unknown })?.type === PanelFooter);
  const panels = kids.filter((k) => k !== footer);
  return (
    <section className="panel-section"><div className="outline">
      <div className="row">{panels}</div>
      {footer}
    </div></section>
  );
}
export function Panel({ colour, title, children }: { colour?: string; title?: string; children: ReactNode }) {
  return (
    <div className="column"><div className={`panel${colourClass(colour)}`}>
      {title && <div className="data-title"><h3 dangerouslySetInnerHTML={{ __html: title }} /></div>}
      <div className="data-content">{children}</div>
    </div></div>
  );
}
export function PanelFooter({ children }: { children: ReactNode }) {
  return <footer className="data-footer">{children}</footer>;
}

// ---------- PopoutBlock ----------
export function PopoutBlock({ colour, image, imageAlt = "", imagePosition, children }: { colour?: string; image?: string; imageAlt?: string; imagePosition?: "left" | "right"; children: ReactNode }) {
  const img = image ? <div className="column column-image"><div className="data-image"><Img src={image} alt={imageAlt} /></div></div> : null;
  const bg = colour === "white" || colour === "cream" ? `bg-${colour}` : "bg-";
  const inner = colour && colour !== "white" && colour !== "cream" ? colour : "";
  return (
    <section className={`popout-block ${bg}`}><div className="outline">
      <div className={`wrap-popout-block${colourClass(inner)}`}><div className="row">
        {imagePosition === "left" && img}
        <div className="column column-content"><div className="data-content">{children}</div></div>
        {imagePosition !== "left" && img}
      </div></div>
    </div></section>
  );
}

// ---------- VideoSection ----------
export function VideoSection({ video, children }: { video: string; children: ReactNode }) {
  return (
    <section className="video-section"><div className="outline"><div className="row">
      <div className="column column-content"><div className="data-content">{children}</div></div>
      <div className="column column-video"><div className="data-video"><VideoFacade src={video} /></div></div>
    </div></div></section>
  );
}

// ---------- ContentRow ----------
export function ContentRow({ colour, centred, children }: { colour?: string; centred?: boolean; children: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const header = kids.filter((k) => typeof k === "object" && k !== null && (k as { type?: unknown }).type !== Col && (k as { type?: unknown }).type !== ColImage);
  const cols = kids.filter((k) => !header.includes(k));
  return (
    <section className="content-rows"><div className="outline">
      <div className={`wrap-row${colourClass(colour)}`}>
        {header.length > 0 && <header className="data-header">{header}</header>}
        <div className={`row${centred ? " margin-auto" : ""}`}>{cols}</div>
      </div>
    </div></section>
  );
}
export function Col({ variant, children }: { variant?: "icon"; children: ReactNode }) {
  return <div className={`column ${variant === "icon" ? "column-icon" : "column-con"}`}><div className="data-content">{children}</div></div>;
}
export function ColImage({ src, alt = "" }: { src: string; alt?: string }) {
  return <div className="column column-img"><div className="data-image"><Img src={src} alt={alt} /></div></div>;
}
export function IconList({ children }: { children: ReactNode }) {
  return <div className="wrap-icons"><ul className="list-icons">{children}</ul></div>;
}
export function IconListItem({ icon, children }: { icon?: string; children: ReactNode }) {
  return <li>{icon && <Img src={icon} alt="" />}{children}</li>;
}

// ---------- StatBlock ----------
export function StatBlock({ children }: { children: ReactNode }) {
  return <section className="label-block"><div className="outline"><div className="wrap-labelblock"><div className="row">{children}</div></div></div></section>;
}
export function Stat({ figure, label }: { figure: string; label: string }) {
  return <div className="column"><div className="data-figure">{figure}</div><div className="data-label">{label}</div></div>;
}

// ---------- IconGrid ----------
export function IconGrid({ colour, heading, align, columns, children, variant }: { colour?: string; heading?: string; align?: "center" | "right"; columns?: string | number; children: ReactNode; variant?: "values" }) {
  const list = <div className="wrap-iconblock"><ul className={`list-iconblock${columns ? ` split-${columns}` : ""}`}>{children}</ul></div>;
  if (heading || variant === "values") {
    return (
      <section className="block-icon-section"><div className="outline"><div className="wrap-block-icon-section">
        {heading && <SectionHeader heading={heading} align={align} />}
        {list}
      </div></div></section>
    );
  }
  return <section className={`icon-block bg-${colour || "cream"}`}><div className="outline">{list}</div></section>;
}

// ---------- ColourPanels ----------
export function ColourPanels({ children }: { children: ReactNode }) {
  return <section className="colour-panels"><div className="outline"><div className="wrap-panels"><ul className="list-panels">{children}</ul></div></div></section>;
}
export function ColourPanel({ colour, image, imageAlt = "", children }: { colour?: string; image?: string; imageAlt?: string; children: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  // the last paragraph holding a button becomes the .link block, as in the theme markup
  return (
    <li><div className="panel">
      {image && <div className="data-image"><Img src={image} alt={imageAlt} /></div>}
      <div className={`data-content${colourClass(colour)}`}><div className="content">{kids}</div></div>
    </div></li>
  );
}

// ---------- InfoBlock ----------
export function InfoBlock({ heading, align, children }: { heading?: string; align?: "center" | "right"; children: ReactNode }) {
  const kids = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const panels = kids.filter((k) => typeof k === "object" && k !== null && (k as { type?: unknown }).type === InfoPanel);
  const intro = kids.filter((k) => !panels.includes(k));
  return (
    <section className="info-block"><div className="outline"><div className="wrap">
      <SectionHeader heading={heading} align={align}>{intro}</SectionHeader>
      <div className="wrap-infoblock"><div className="row">{panels}</div></div>
    </div></div></section>
  );
}
export function InfoPanel({ year, children }: { year?: string; children: ReactNode }) {
  return <div className="column"><div className="panel">{year && <div className="data-year">{year}</div>}<div className="data-content">{children}</div></div></div>;
}

// ---------- Embed / tools ----------
export function Embed({ src, title, height }: { src: string; title?: string; height?: number }) {
  if (/youtube\.com|youtu\.be/.test(src)) return <div className="data-video embed-video"><VideoFacade src={src} title={title} /></div>;
  return <EmbedPlaceholder src={src} title={title} height={height} />;
}

export { Link };

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one button for the whole site (docs/components.md §Button).
 * Renders the theme's `.button` so the look is unchanged; variant/size/block are class modifiers.
 *  - variant: primary (orange) | secondary (white with orange text, the theme's `.button-alt`)
 *  - size:    sm | md (the theme default) | lg
 *  - block:   full width
 * Element: <Link> for internal paths, <a> for external/mailto/file links, <button> when there is no href.
 * Client-safe (no content imports). In MDX and server templates use `LinkButton` from lib/with-context.tsx, which adds the hidden target description to generic labels.
 */
export const buttonVariants = cva("button", {
  variants: {
    variant: { primary: "", secondary: "button-alt" },
    size: { sm: "button-sm", md: "", lg: "button-lg" },
    block: { true: "button-block" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonProps = VariantProps<typeof buttonVariants> & {
  href?: string;
  target?: "_blank" | "_self";
  rel?: string;
  download?: boolean | string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  id?: string;
  name?: string;
  className?: string;
  title?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  children: ReactNode;
};

const isInternal = (href: string) => href.startsWith("/") && !/\.[a-z0-9]{2,4}$/i.test(href);
const isExternal = (href: string) => /^https?:\/\//.test(href) && !href.includes("gmbcreditunion.com");

export function Button({ variant, size, block, href, target, rel, download, type, disabled, onClick, className, children, ...aria }: ButtonProps) {
  const cls = cn(buttonVariants({ variant, size, block }), className);
  if (href !== undefined) {
    const relAttr = rel || (target === "_blank" || isExternal(href) ? "noopener" : undefined);
    const a = onClick as MouseEventHandler<HTMLAnchorElement> | undefined;
    if (isInternal(href)) return <Link href={href} className={cls} target={target} rel={relAttr} onClick={a} {...aria}>{children}</Link>;
    return <a href={href} className={cls} target={target} rel={relAttr} download={download} onClick={a} {...aria}>{children}</a>;
  }
  return <button type={type || "button"} className={cls} disabled={disabled} onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined} {...aria}>{children}</button>;
}

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one button (docs/design-system.md §Button). Tokens: --button-* in design/tokens.json.
 *  variant  primary (brand-strong on white) · secondary (outlined ink) · ghost (text + arrow, no box)
 *  size     sm 40px · md 48px · lg 56px
 *  block    full width
 * Element: <Link> for internal paths, <a> for external / files / mailto, <button> when there is no href.
 * Client-safe: no content imports. MDX uses `LinkButton` (lib/with-context.tsx), which adds hidden target context to generic labels.
 */
export const buttonVariants = cva(
  "button inline-flex items-center justify-center gap-2 font-display text-base leading-none no-underline rounded-control border transition-[background-color,color,border-color,transform] duration-(--motion-duration) ease-standard select-none whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-3",
  {
    variants: {
      variant: {
        primary: "bg-brand-strong border-brand-strong text-ink-inverse hover:bg-brand-hover hover:border-brand-hover",
        secondary: "bg-surface border-ink text-ink hover:bg-ink hover:text-ink-inverse",
        ghost: "bg-transparent border-transparent text-link px-0 hover:text-link-hover",
        inverse: "bg-surface border-surface text-ink hover:bg-ink hover:border-ink hover:text-ink-inverse",
      },
      size: { sm: "h-10 px-5 text-small", md: "h-12 px-6", lg: "h-14 px-8 text-lg" },
      block: { true: "flex w-full" },
    },
    compoundVariants: [{ variant: "ghost", size: ["sm", "md", "lg"], class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

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

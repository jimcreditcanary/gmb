import type { ReactNode } from "react";
import { describeTarget, isGenericLinkText } from "@/lib/linkcontext";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Generic link text ("here", "Learn more", "Apply now") gets a visually hidden description of the target:
 * no visible change, descriptive for screen readers and search engines (decision 2026-10-07 §4.3).
 * Server-only (it reads the content index), so the client-safe `Button` stays free of it and `LinkButton` is what MDX and the server templates use.
 */
export function withContext(href: string, children: ReactNode): ReactNode {
  const text = typeof children === "string" ? children : Array.isArray(children) && children.every((c) => typeof c === "string") ? children.join("") : null;
  if (text === null || !isGenericLinkText(text)) return children;
  const ctx = describeTarget(href); if (!ctx) return children;
  return <>{children}<span className="sr-only-text">: {ctx}</span></>;
}

/** `Button` for server-rendered links: same props, plus the hidden target description on generic labels ("Learn more", "Apply now"). Mapped as `Button` in MDX. */
export function LinkButton({ children, ...props }: ButtonProps) {
  return <Button {...props}>{props.href ? withContext(props.href, children) : children}</Button>;
}

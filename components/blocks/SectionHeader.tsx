import type { ReactNode } from "react";

/**
 * `<header class="data-header">` with the section's h2: the one heading pattern every block shares (ListBlock, IconGrid, InfoBlock, BoxSlider).
 * `heading` may carry inline HTML from the source copy (`<u>`), hence innerHTML. `align` mirrors the inline text-align the WordPress editor set.
 */
export function SectionHeader({ heading, align, children }: { heading?: string; align?: "center" | "right"; children?: ReactNode }) {
  return (
    <header className="data-header">
      {heading && <h2 style={align ? { textAlign: align } : undefined} dangerouslySetInnerHTML={{ __html: heading }} />}
      {children}
    </header>
  );
}

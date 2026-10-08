/**
 * Section tones (docs/design-system.md §Colour). Content files still say `colour="lilac"` etc. from the old theme;
 * those names map onto the design system's tone tokens here, in one place. Add a tone by adding a token, not a hex.
 */
export type Tone = "surface" | "subtle" | "loans" | "savings" | "about" | "resources" | "deep" | "inverse" | "brand";

const LEGACY: Record<string, Tone> = {
  white: "surface", cream: "subtle", "": "surface",
  green: "loans", ltblue: "savings", blue: "savings", lilac: "about", yellow: "resources",
  purple: "deep", dkblue: "inverse", navy: "inverse", orange: "brand",
};

export const toTone = (colour?: string): Tone => LEGACY[(colour || "").trim()] ?? "surface";

/** Background + text classes for a tone. Inverse tones add `.on-inverse` so links and marks switch to white. */
export const toneClass: Record<Tone, string> = {
  surface: "bg-surface text-ink",
  subtle: "bg-surface-subtle text-ink",
  loans: "bg-tone-loans text-ink on-tint",
  savings: "bg-tone-savings text-ink on-tint",
  about: "bg-tone-about text-ink on-tint",
  resources: "bg-tone-resources text-ink on-tint",
  deep: "bg-tone-deep text-ink-inverse on-inverse",
  inverse: "bg-surface-inverse text-ink-inverse on-inverse",
  brand: "bg-surface-brand text-ink-inverse on-inverse",
};

export const isInverse = (t: Tone) => t === "deep" || t === "inverse" || t === "brand";
export const isTinted = (t: Tone) => t !== "surface";

/**
 * Section tones (docs/design-direction.md, Monzo model). The brand's own colours as big blocks: orange, navy and the four
 * tints. Content files carry the old theme's colour names; they map one-to-one here.
 */
export type Tone = "surface" | "subtle" | "lilac" | "blue" | "green" | "yellow" | "inverse" | "brand";

const LEGACY: Record<string, Tone> = {
  white: "surface", "": "surface", cream: "subtle",
  lilac: "lilac", ltblue: "blue", blue: "blue", green: "green", yellow: "yellow",
  purple: "inverse", dkblue: "inverse", navy: "inverse", orange: "brand",
};

export const toTone = (colour?: string): Tone => LEGACY[(colour || "").trim()] ?? "surface";

/** Background + text classes for a tone. Inverse tones add `.on-inverse`; the tints add `.on-tint` (navy links, orange underline). */
export const toneClass: Record<Tone, string> = {
  surface: "bg-surface text-ink",
  subtle: "bg-surface-subtle text-ink",
  lilac: "bg-lilac text-ink on-tint",
  blue: "bg-blue text-ink on-tint",
  green: "bg-green text-ink on-tint",
  yellow: "bg-yellow text-ink on-tint",
  inverse: "bg-surface-inverse text-ink-inverse on-inverse",
  brand: "bg-surface-brand text-ink on-tint",
};

/** The cycle used when a list of cards needs colour without the content saying which. */
export const cycle: Tone[] = ["lilac", "blue", "yellow", "green"];

export const isInverse = (t: Tone) => t === "inverse";
export const isTinted = (t: Tone) => t !== "surface";

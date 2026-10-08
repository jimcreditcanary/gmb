/**
 * Section tones (docs/design-direction.md). Five colours: content files still carry the old theme's colour names
 * (`colour="lilac"`, "green", "yellow" …); every pastel resolves to the single tint, purple/dark blue to navy, orange to brand.
 */
export type Tone = "surface" | "subtle" | "tint" | "inverse" | "brand";

const LEGACY: Record<string, Tone> = {
  white: "surface", "": "surface", cream: "subtle",
  lilac: "tint", ltblue: "tint", blue: "tint", green: "tint", yellow: "tint",
  purple: "inverse", dkblue: "inverse", navy: "inverse", orange: "brand",
};

export const toTone = (colour?: string): Tone => LEGACY[(colour || "").trim()] ?? "surface";

/** Background + text classes for a tone. Inverse tones add `.on-inverse` so links and marks switch to white; the tint adds `.on-tint` (navy links). */
export const toneClass: Record<Tone, string> = {
  surface: "bg-surface text-ink",
  subtle: "bg-surface-subtle text-ink",
  tint: "bg-tint text-ink on-tint",
  inverse: "bg-surface-inverse text-ink-inverse on-inverse",
  brand: "bg-surface-brand text-ink-inverse on-inverse",
};

export const isInverse = (t: Tone) => t === "inverse" || t === "brand";
export const isTinted = (t: Tone) => t !== "surface";

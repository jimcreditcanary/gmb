import dims from "./media-dims.json";
const table = dims as unknown as Record<string, [number, number]>;
/** Intrinsic size of a shipped image (from scripts/media-dims.mjs); undefined for unknown/remote. */
export function imageDims(src: string): { width: number; height: number } | undefined {
  const d = table[src.split("?")[0]];
  return d ? { width: d[0], height: d[1] } : undefined;
}

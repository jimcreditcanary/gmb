/**
 * Class joiner. Deliberately NOT tailwind-merge: the design system's custom utilities (text-small, text-ink-inverse, …)
 * are unknown to tailwind-merge, which treats them as one group and silently drops the earlier one.
 * Components never rely on later classes overriding earlier ones; they pass each class once.
 */
type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, unknown>;
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") out.push(String(v));
    else if (Array.isArray(v)) { const s = cn(...v); if (s) out.push(s); }
    else for (const [k, on] of Object.entries(v)) if (on) out.push(k);
  }
  return out.join(" ");
}

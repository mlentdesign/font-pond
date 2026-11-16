// Best-first pair selection, run at build time (scripts/build-pair-selection).
// 1. Hand-crafted pairs always stay.
// 2. Every font reaches its minimum (pairTarget) using its best-scoring partners.
// 3. Remaining room is filled with the best pairs left, with variety penalties.
// Output is a compact index list read by src/data/pairs.ts.
import type { Font } from "@/data/types";
import { pairQuality, pairTarget, isPairBodyFont } from "@/lib/pair-generator";

export const SELECTION_SETTINGS = { BODY_REUSE_PENALTY: 0.015, CONTRAST_REPEAT_PENALTY: 0.25, PARTNER_NEED_NUDGE: 0.1, WINDOW: 400 };

type Cand = { h: string; b: string; q: number; c: string };

/** Stable font order shared by the build script and the site: sorted ids. */
export function fontKeyOrder(fonts: Font[]): string[] { return fonts.map((f) => f.id).sort(); }
/** Cheap fingerprint so the site can tell if the font list changed since selection ran. */
export function fontKeyHash(ids: string[]): string {
  let h = 2166136261;
  for (const id of ids) for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + "-" + ids.length;
}
const W = 3; // base36 width per index (36^3 = 46,656 fonts max)
export function encodePairs(list: [string, string][], idx: Map<string, number>): string {
  return list.map(([h, b]) => idx.get(h)!.toString(36).padStart(W, "0") + idx.get(b)!.toString(36).padStart(W, "0")).join("");
}
export function decodePairs(s: string, ids: string[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i + 2 * W <= s.length; i += 2 * W) out.push([ids[parseInt(s.slice(i, i + W), 36)], ids[parseInt(s.slice(i + W, i + 2 * W), 36)]]);
  return out;
}

export function selectPairs(fonts: Font[], handPairs: [string, string][], budget: number) {
  const S = SELECTION_SETTINGS;
  const byId = new Map(fonts.map((f) => [f.id, f]));
  const headers = fonts.filter((f) => f.isHeaderSuitable);
  const bodies = fonts.filter(isPairBodyFont);
  const ck = (h: Font, b: Font) => `${h.serifSansCategory}>${b.serifSansCategory}`;
  const cands: Cand[] = [];
  for (const h of headers) for (const b of bodies) if (h.id !== b.id) cands.push({ h: h.id, b: b.id, q: pairQuality(h, b).base, c: ck(h, b) });
  // ties broken by ids so the result is identical on every run
  cands.sort((a, b) => b.q - a.q || (a.h < b.h ? -1 : a.h > b.h ? 1 : a.b < b.b ? -1 : a.b > b.b ? 1 : 0));

  const key = (h: string, b: string) => h + "|" + b;
  const taken = new Set<string>();
  const count = new Map<string, number>();
  const bodyUse = new Map<string, number>();
  const fontContrast = new Map<string, Map<string, number>>();
  const minimum: [string, string][] = [];
  const fill: [string, string][] = [];
  const add = (h: string, b: string, c: string, into: [string, string][] | null) => {
    taken.add(key(h, b)); if (into) into.push([h, b]);
    count.set(h, (count.get(h) || 0) + 1); count.set(b, (count.get(b) || 0) + 1);
    bodyUse.set(b, (bodyUse.get(b) || 0) + 1);
    for (const id of [h, b]) { if (!fontContrast.has(id)) fontContrast.set(id, new Map()); const m = fontContrast.get(id)!; m.set(c, (m.get(c) || 0) + 1); }
  };
  const adj = (p: Cand, forFont: string) =>
    p.q - S.BODY_REUSE_PENALTY * (bodyUse.get(p.b) || 0) - S.CONTRAST_REPEAT_PENALTY * (fontContrast.get(forFont)?.get(p.c) || 0);

  for (const [h, b] of handPairs) { const H = byId.get(h), B = byId.get(b); if (H && B && !taken.has(key(h, b))) add(h, b, ck(H, B), null); }

  const perFont = new Map<string, Cand[]>();
  for (const c of cands) for (const id of [c.h, c.b]) { let l = perFont.get(id); if (!l) perFont.set(id, (l = [])); l.push(c); }
  const deficit = (f: Font) => pairTarget(f) - (count.get(f.id) || 0);
  for (let progress = true; progress; ) {
    progress = false;
    const needy = fonts.filter((f) => perFont.has(f.id) && deficit(f) > 0).sort((a, b) => deficit(b) - deficit(a) || (a.id < b.id ? -1 : 1));
    for (const f of needy) {
      if (deficit(f) <= 0) continue;
      let best: Cand | null = null, bestS = -Infinity;
      for (const c of perFont.get(f.id)!) {
        if (taken.has(key(c.h, c.b))) continue;
        const other = byId.get(c.h === f.id ? c.b : c.h)!;
        const s = adj(c, f.id) + (deficit(other) > 0 ? S.PARTNER_NEED_NUDGE : 0);
        if (s > bestS) { bestS = s; best = c; }
      }
      if (best) { add(best.h, best.b, best.c, minimum); progress = true; }
    }
  }

  const total = () => handPairs.length + minimum.length + fill.length;
  let i = 0;
  while (total() < budget && i < cands.length) {
    let best: Cand | null = null, bestS = -Infinity;
    for (let j = i, seen = 0; j < cands.length && seen < S.WINDOW; j++) {
      const c = cands[j]; if (taken.has(key(c.h, c.b))) continue; seen++;
      const s = adj(c, c.h); if (s > bestS) { bestS = s; best = c; }
    }
    if (!best) break;
    add(best.h, best.b, best.c, fill);
    while (i < cands.length && taken.has(key(cands[i].h, cands[i].b))) i++;
  }

  const short = fonts.filter((f) => perFont.has(f.id) && deficit(f) > 0).map((f) => f.id);
  return { minimum, fill, short, candidates: cands.length };
}

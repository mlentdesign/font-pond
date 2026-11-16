// Pair scoring analysis. Read-only: changes nothing on the site.
// Run: npx vitest run -c scripts/analysis/vitest.config.ts
import { test } from "vitest";
import fs from "fs";
import { fonts } from "@/data/fonts";
import { fontPairs, ensureDynamicPairs } from "@/data/pairs";
import { pairQuality, PAIR_ALL_CAPS_BLOCKLIST, PAIR_ALL_CAPS_TAGS } from "@/lib/pair-generator";
import type { Font } from "@/data/types";

const target = (f: Font) => (f.source === "fontshare" ? 22 : 10); // per-origin minimums from generateCuratedPairs
const byId = new Map(fonts.map((f) => [f.id, f]));
const isBody = (f: Font) =>
  f.isBodySuitable && !(f.bodyLegibilityScore !== null && f.bodyLegibilityScore < 6) &&
  !PAIR_ALL_CAPS_BLOCKLIST.has(f.name.toLowerCase()) &&
  !["display", "handwritten", "script"].includes(f.classification) &&
  !f.tags.some((t) => PAIR_ALL_CAPS_TAGS.has(t.toLowerCase()));

type P = { h: string; b: string; q: number; kind: string; contrast: string };
const contrastKey = (h: Font, b: Font) => `${h.serifSansCategory}>${b.serifSansCategory}`;

function stats(set: P[], label: string) {
  const count = new Map<string, number>();
  const bodyUse = new Map<string, number>();
  for (const p of set) {
    count.set(p.h, (count.get(p.h) || 0) + 1);
    count.set(p.b, (count.get(p.b) || 0) + 1);
    bodyUse.set(p.b, (bodyUse.get(p.b) || 0) + 1);
  }
  const short = fonts.filter((f) => (count.get(f.id) || 0) < target(f));
  const qs = set.map((p) => p.q).sort((a, b) => a - b);
  const pct = (x: number) => +qs[Math.floor(x * (qs.length - 1))].toFixed(2);
  const topBody = [...bodyUse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, n]) => ({ font: byId.get(id)?.name, pairs: n, share: +(n / set.length * 100).toFixed(1) }));
  // per-font partner variety: distinct contrast types among each font's pairs
  const contrasts = new Map<string, Set<string>>();
  for (const p of set) for (const id of [p.h, p.b]) {
    if (!contrasts.has(id)) contrasts.set(id, new Set());
    contrasts.get(id)!.add(p.contrast);
  }
  const avgContrastTypes = [...contrasts.values()].reduce((s, v) => s + v.size, 0) / Math.max(1, contrasts.size);
  return {
    label, pairs: set.length,
    mean: +(qs.reduce((s, x) => s + x, 0) / qs.length).toFixed(3),
    p10: pct(0.1), median: pct(0.5), p90: pct(0.9), worst: pct(0),
    fontsBelowMinimum: short.length,
    fontsBelowMinimumBySource: short.reduce((m: Record<string, number>, f) => ((m[f.source] = (m[f.source] || 0) + 1), m), {}),
    distinctBodyFonts: bodyUse.size,
    topBodyFonts: topBody,
    avgContrastTypesPerFont: +avgContrastTypes.toFixed(2),
    count,
  };
}

test("pair analysis", () => {
  const t0 = performance.now();
  const base = fontPairs.slice();
  ensureDynamicPairs();
  const all = fontPairs.slice();
  const tGen = performance.now() - t0;

  const toP = (h: string, b: string, kind: string): P | null => {
    const H = byId.get(h), B = byId.get(b);
    if (!H || !B) return null;
    return { h, b, q: pairQuality(H, B).base, kind, contrast: contrastKey(H, B) };
  };
  const current = all.map((p) => toP(p.headerFontId, p.bodyFontId,
    p.id.startsWith("gen-") ? "dynamic" : p.id.startsWith("curated-") ? "curated" : "hand")).filter(Boolean) as P[];
  const hand = current.filter((p) => p.kind === "hand");

  // ── Score every allowed header × body candidate ──
  const headers = fonts.filter((f) => f.isHeaderSuitable);
  const bodies = fonts.filter(isBody);
  const t1 = performance.now();
  const cands: P[] = [];
  for (const h of headers) for (const b of bodies) {
    if (h.id === b.id) continue;
    cands.push({ h: h.id, b: b.id, q: pairQuality(h, b).base, kind: "new", contrast: contrastKey(h, b) });
  }
  cands.sort((a, b) => b.q - a.q);
  const tScore = performance.now() - t1;

  // Fonts that can't be paired at all (neither header nor usable body)
  const pairable = new Set([...headers, ...bodies].map((f) => f.id));
  const unpairable = fonts.filter((f) => !pairable.has(f.id)).map((f) => ({ id: f.id, name: f.name, source: f.source }));

  // ── Selection: keep hand-crafted, meet every minimum with the best partners, then fill ──
  const BUDGET = current.length; // same size as today, for a fair comparison
  const PENALTY = 0.015;         // per existing use of the same body font
  const CONTRAST_PENALTY = 0.25; // per repeat of the same contrast type within one font's pairs
  const chosen: P[] = [];
  const key = (p: P) => `${p.h}|${p.b}`;
  const taken = new Set<string>();
  const count = new Map<string, number>();
  const bodyUse = new Map<string, number>();
  const fontContrast = new Map<string, Map<string, number>>();
  const add = (p: P) => {
    chosen.push(p); taken.add(key(p));
    count.set(p.h, (count.get(p.h) || 0) + 1); count.set(p.b, (count.get(p.b) || 0) + 1);
    bodyUse.set(p.b, (bodyUse.get(p.b) || 0) + 1);
    for (const id of [p.h, p.b]) {
      if (!fontContrast.has(id)) fontContrast.set(id, new Map());
      const m = fontContrast.get(id)!; m.set(p.contrast, (m.get(p.contrast) || 0) + 1);
    }
  };
  const adj = (p: P, forFont?: string) => {
    let s = p.q - PENALTY * (bodyUse.get(p.b) || 0);
    if (forFont) s -= CONTRAST_PENALTY * (fontContrast.get(forFont)?.get(p.contrast) || 0);
    return s;
  };
  for (const p of hand) if (!taken.has(key(p))) add(p);

  // candidate lists per font
  const perFont = new Map<string, P[]>();
  for (const c of cands) for (const id of [c.h, c.b]) {
    if (!perFont.has(id)) perFont.set(id, []);
    perFont.get(id)!.push(c);
  }
  const deficit = (f: Font) => target(f) - (count.get(f.id) || 0);
  let progress = true;
  while (progress) {
    progress = false;
    const needy = fonts.filter((f) => pairable.has(f.id) && deficit(f) > 0)
      .sort((a, b) => deficit(b) - deficit(a));
    for (const f of needy) {
      if (deficit(f) <= 0) continue;
      let best: P | null = null, bestS = -Infinity;
      for (const c of perFont.get(f.id) || []) {
        if (taken.has(key(c))) continue;
        const other = c.h === f.id ? c.b : c.h;
        const of = byId.get(other)!;
        // small nudge toward partners who also still need pairs
        const s = adj(c, f.id) + (deficit(of) > 0 ? 0.1 : 0);
        if (s > bestS) { bestS = s; best = c; }
      }
      if (best) { add(best); progress = true; }
    }
  }
  const afterMinimums = chosen.length;

  // Fill the rest with the best remaining by adjusted score (lazy re-ranking)
  const pool = cands.filter((c) => !taken.has(key(c)));
  let i = 0;
  while (chosen.length < BUDGET && i < pool.length) {
    // look at a window, take the best after penalties
    const win = pool.slice(i, i + 400).filter((c) => !taken.has(key(c)));
    if (!win.length) { i += 400; continue; }
    let best = win[0], bestS = adj(best, best.h);
    for (const c of win) { const s = adj(c, c.h); if (s > bestS) { bestS = s; best = c; } }
    add(best);
    while (i < pool.length && taken.has(key(pool[i]))) i++;
  }

  const sCur = stats(current, "Current");
  const sNew = stats(chosen, "Proposed");
  const strip = ({ count, ...r }: ReturnType<typeof stats>) => r;

  // Fonts whose pair count would go down
  const shrinking = fonts.filter((f) => (sNew.count.get(f.id) || 0) < (sCur.count.get(f.id) || 0)).length;

  // Score distribution of all candidates, in 0.25 buckets
  const hist: Record<string, number> = {};
  for (const c of cands) { const k = (Math.floor(c.q * 4) / 4).toFixed(2); hist[k] = (hist[k] || 0) + 1; }
  const passCounts = [7, 7.5, 8, 8.25, 8.5, 8.75, 9].map((t) => ({ cutoff: t, candidates: cands.filter((c) => c.q >= t).length }));

  const out = {
    generatedAt: new Date().toISOString(),
    minimums: { fontshare: 22, everyOtherSource: 10 },
    fonts: fonts.length, headerFonts: headers.length, bodyFonts: bodies.length,
    candidatesScored: cands.length, unpairable,
    timingsMs: { currentGeneration: Math.round(tGen), scoringAllCandidates: Math.round(tScore) },
    current: strip(sCur), proposed: strip(sNew),
    proposedPairsUsedForMinimums: afterMinimums,
    fontsWithFewerPairsThanToday: shrinking,
    histogram: hist, passCounts,
    settings: { BUDGET, PENALTY, CONTRAST_PENALTY },
  };
  fs.writeFileSync("scripts/analysis/pair-analysis.json", JSON.stringify(out, null, 1));
  fs.writeFileSync("scripts/analysis/proposed-pairs.json", JSON.stringify(chosen.map(({ h, b, q, kind }) => ({ h, b, q: +q.toFixed(3), kind }))));
  console.log(JSON.stringify({ ...out, histogram: undefined }, null, 1));
});

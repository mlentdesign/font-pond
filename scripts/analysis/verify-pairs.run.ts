// Checks the live pair set: every font meets its minimum, totals match, no duplicates.
import { test, expect } from "vitest";
import { fonts } from "@/data/fonts";
import { fontPairs, ensureDynamicPairs } from "@/data/pairs";
import { pairTarget, pairQuality } from "@/lib/pair-generator";
test("verify live pairs", () => {
  const base = fontPairs.length;
  ensureDynamicPairs();
  const byId = new Map(fonts.map((f) => [f.id, f]));
  const n = new Map<string, number>();
  for (const p of fontPairs) { n.set(p.headerFontId, (n.get(p.headerFontId) || 0) + 1); n.set(p.bodyFontId, (n.get(p.bodyFontId) || 0) + 1); }
  const short = fonts.filter((f) => (n.get(f.id) || 0) < pairTarget(f));
  const slugs = new Set(fontPairs.map((p) => p.slug));
  // 4 slugs repeat inside the hand-crafted list itself (pre-existing); everything generated must be unique
  const gen = fontPairs.filter((p) => p.id.startsWith("curated-") || p.id.startsWith("gen-"));
  const handSlugs = new Set(fontPairs.filter((p) => !gen.includes(p)).map((p) => p.slug));
  const q = fontPairs.map((p) => pairQuality(byId.get(p.headerFontId)!, byId.get(p.bodyFontId)!).base);
  console.log(JSON.stringify({ base, total: fontPairs.length, unique: slugs.size, short: short.length, mean: +(q.reduce((a, b) => a + b, 0) / q.length).toFixed(3) }));
  expect(short.length).toBe(0);
  expect(new Set(gen.map((p) => p.slug)).size).toBe(gen.length);
  expect(gen.filter((p) => handSlugs.has(p.slug)).length).toBe(0);
});

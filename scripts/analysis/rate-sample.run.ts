// Picks the ~40 pairs for the rating page, spread evenly across the score range (seeded, repeatable).
// Run: npx vitest run -c scripts/analysis/vitest.config.ts scripts/analysis/rate-sample.run.ts
import { test } from "vitest";
import fs from "fs";
import { fonts } from "@/data/fonts";
import { fontPairs, ensureDynamicPairs } from "@/data/pairs";
import { pairQuality, isPairBodyFont } from "@/lib/pair-generator";
test("rate sample", () => {
  ensureDynamicPairs();
  const byId = new Map(fonts.map((f) => [f.id, f]));
  const inSet = new Set(fontPairs.map((p) => p.slug));
  const all = fontPairs.map((p) => ({ slug: p.slug, h: p.headerFontId, b: p.bodyFontId, q: pairQuality(byId.get(p.headerFontId)!, byId.get(p.bodyFontId)!).base, inSet: true, hand: !(p.id.startsWith("curated-") || p.id.startsWith("gen-")) }));
  let s = 20261116; const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  // the live set is mostly high scores, so add random header x body combos to fill the middle of the range
  const bodies = fonts.filter(isPairBodyFont);
  for (let i = 0; i < 40000; i++) {
    const h = fonts[Math.floor(rnd() * fonts.length)], b = bodies[Math.floor(rnd() * bodies.length)];
    if (h.id === b.id) continue;
    all.push({ slug: `${h.slug}-${b.slug}`, h: h.id, b: b.id, q: pairQuality(h, b).base, inSet: inSet.has(`${h.slug}-${b.slug}`), hand: false });
  }
  const hi = Math.max(...all.map((x) => x.q)), CUT = 6.5, BANDS = 8, PER = 4;
  const picked: typeof all = [];
  const take = (pool: typeof all, n: number) => {
    const used = new Set<string>();
    for (let k = 0; k < n && pool.length; k++) {
      for (let tries = 0; tries < 60; tries++) {
        const c = pool[Math.floor(rnd() * pool.length)];
        if (used.has(c.h + c.b) || picked.some((p) => p.slug === c.slug || p.h === c.h)) continue;
        used.add(c.h + c.b); picked.push(c); break;
      }
    }
  };
  take(all.filter((x) => x.q < CUT), 8); // the penalised pairs (score below 6.5): the model says these are bad
  for (let i = 0; i < BANDS; i++) {
    const a = CUT + ((hi - CUT) * i) / BANDS, b = CUT + ((hi - CUT) * (i + 1)) / BANDS;
    take(all.filter((x) => x.q >= a && (i === BANDS - 1 ? x.q <= b : x.q < b)), PER);
  }
  const lo = Math.min(...all.map((x) => x.q));
  // shuffle so the order does not reveal the score
  for (let i = picked.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [picked[i], picked[j]] = [picked[j], picked[i]]; }
  fs.writeFileSync("src/app/rate/sample.json", JSON.stringify({ range: [+lo.toFixed(2), +hi.toFixed(2)], pairs: picked.map((x) => ({ slug: x.slug, h: x.h, b: x.b, q: +x.q.toFixed(2), inSet: x.inSet, hand: x.hand })) }, null, 1));
  console.log(JSON.stringify({ n: picked.length, lo, hi, hand: picked.filter((x) => x.hand).length }));
});

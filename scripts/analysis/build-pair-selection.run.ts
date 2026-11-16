// Writes src/data/selected-pairs.json — the pair list the CMS uses.
// Run: npm run build:pairs   (re-run whenever fonts are added or removed)
import { test } from "vitest";
import fs from "fs";
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
import { selectPairs, fontKeyOrder, fontKeyHash, encodePairs, SELECTION_SETTINGS } from "@/lib/pair-selection";

const BUDGET = 38332; // today's total; raise only after the speed test

test("build pair selection", () => {
  const hand = fontPairs.filter((p) => !p.id.startsWith("curated-") && !p.id.startsWith("gen-") && !p.id.startsWith("sel-"))
    .map((p) => [p.headerFontId, p.bodyFontId] as [string, string]);
  const { minimum, fill, short, candidates } = selectPairs(fonts, hand, BUDGET);
  if (short.length) throw new Error(`${short.length} fonts below minimum: ${short.slice(0, 10).join(", ")}`);
  const ids = fontKeyOrder(fonts);
  const idx = new Map(ids.map((id, i) => [id, i]));
  const out = { fontKey: fontKeyHash(ids), budget: BUDGET, settings: SELECTION_SETTINGS, candidates, hand: hand.length,
    minimum: encodePairs(minimum, idx), fill: encodePairs(fill, idx) };
  fs.writeFileSync("src/data/selected-pairs.json", JSON.stringify(out));
  console.log(`selected-pairs: ${hand.length} hand + ${minimum.length} minimum + ${fill.length} fill = ${hand.length + minimum.length + fill.length}`);
});

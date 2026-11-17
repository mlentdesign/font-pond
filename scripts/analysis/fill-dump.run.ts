// Dumps every generated "gen-" fill pair with the same font fields as pair-dump.run.ts. Model-free.
import { test } from "vitest";
import fs from "fs";
import { fontPairs, ensureDynamicPairs } from "@/data/pairs";
import { fonts } from "@/data/fonts";
test("fill dump", () => {
  ensureDynamicPairs();
  const byId = new Map((fonts as any[]).map((f) => [f.id, f]));
  const slim = (f: any) => f && ({ id: f.id, name: f.name, cls: f.classification, sub: f.subcategory, cat: f.serifSansCategory,
    tags: f.tags, tone: f.toneDescriptors, use: f.useCases, hs: f.isHeaderSuitable, bs: f.isBodySuitable, leg: f.bodyLegibilityScore,
    xh: f.xHeightRatio, ap: f.apertureOpenness, sc: f.strokeContrast, ls: f.letterSpacing, mood: f.moodCategory, weights: f.weights, source: f.source });
  const out = (fontPairs as any[]).filter((p) => String(p.id).startsWith("gen-")).map((p) => ({ id: p.id, slug: p.slug, leg: p.bodyLegibilityScore, hier: p.hierarchyStrength, prac: p.practicalityScore,
    orig: p.originalityScore, tags: p.tags, use: p.useCases, h: slim(byId.get(p.headerFontId)), b: slim(byId.get(p.bodyFontId)) }));
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify(out));
});

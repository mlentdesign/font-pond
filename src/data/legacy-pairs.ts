// Pair pages that were live before the best-first pair selection (tag before-pair-scoring).
// They keep their URLs as static pages + sitemap entries, but are NOT CMS entries:
// not in search, explore or pair lists. Built from the live sitemap on 2026-11-15.
import slugs from "./legacy-pair-slugs.json";
import { fontPairs, getPairOrConstruct } from "./pairs";
import type { FontPair } from "./types";

/** Old pairs not already in the current static set, resolved through getPairOrConstruct. */
export function legacyPairs(): FontPair[] {
  const current = new Set(fontPairs.map((p) => p.slug));
  const out: FontPair[] = [];
  for (const s of slugs as string[]) {
    if (current.has(s)) continue;
    const p = getPairOrConstruct(s);
    if (p) out.push(p);
  }
  return out;
}

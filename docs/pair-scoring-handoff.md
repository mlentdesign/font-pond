# Font Pond · pair scoring handoff (2026-11-15)

Paste this into a Sonnet chat: "Read /Users/eddy/Developer/projects/font-pond/docs/pair-scoring-handoff.md and continue from Next steps."

## Goal (her words, condensed)
Keep every font's minimum pair count, but fill the CMS pair collection with higher-scoring, more varied pairs.
Minimums (from code, `pairTarget` in src/lib/pair-generator.ts): Fontshare 22, every other source 10.
Everything must stay restorable through git.

## Restore points
- Tag `before-pair-scoring` = live site state before any of this.
- All work is on branch `pair-scoring` (not merged, not deployed). Live site = `main` → GitHub Pages (push to main deploys).

## Done (branch pair-scoring)
- `pairQuality()` in src/lib/pair-generator.ts — unclamped score, no hash jitter.
- src/lib/pair-selection.ts — scores all ~2.16M header×body candidates, keeps hand-crafted pairs, meets every minimum with best partners, fills the rest best-first with variety penalties (body reuse, repeated contrast type per font).
- `npm run build:pairs` writes src/data/selected-pairs.json (compact base36 index list, ~224 KB). `PAIR_BUDGET` env overrides the total (default 38,332 = today's total).
- src/data/pairs.ts reads the selection; falls back to the old generators if the font list changed (fontKey hash mismatch).
- Verified: `npx vitest run -c scripts/analysis/vitest.config.ts scripts/analysis/verify-pairs.run.ts` → 0 fonts below minimum, 38,332 total, mean 8.45 (was 7.99). 73 normal tests pass. Full `next build` + prerender succeeds.
- 4 duplicate slugs exist inside the hand-crafted list itself (pre-existing, not ours).

## Speed test so far (this Mac, node, scripts/analysis/speed.run.ts → /tmp/fp-speed.jsonl)
| Pairs | build all pairs | first search | later searches | json |
|---|---|---|---|---|
| 38,332 | ~0.1 s | 0.3–0.6 s | ~0.02–0.05 s | 224 KB |
| 60,000 | ~0.18 s | ~0.4 s | ~0.02 s | 351 KB |
| 100,000 | ~0.28 s | 0.66–0.79 s | ~0.03–0.07 s | 586 KB (heap ~720 MB vs ~320 MB at 38k) |

100k selection finished after ~30 min (so it was slow, not stuck); 150k run died (killed with the background job) and was not measured; src/data/selected-pairs.json was restored to the 38,332 version. Original note: the fill loop in selectPairs rescans taken candidates (`while ... taken.has` + 400-window rescans), so it stalls at large budgets. A run started 2026-11-15 ~22:40 may still be going (vitest build-pair-selection); it is our own job. When it ends, the loop restores src/data/selected-pairs.json from /tmp/selected-pairs.backup.json. Check `git status` shows no change to that file.

## Open decision she made
Old pair URLs: 13,199 of the 13,501 currently prerendered/sitemapped pair URLs are not in the new set.
She said: keep static pages for the old pairs ONLY if it doesn't slow the site or hurt CMS limits.
Facts: static pages are separate HTML (~20 KB each), not loaded by the browser's pair list → no load-speed cost. Cost is site size: out/ = 506 MB now (pairs 380 MB); +13,199 pages ≈ +270 MB → ~780 MB of GitHub Pages' 1 GB cap.

## Next steps
1. Fix selectPairs fill loop: use a max-heap / lazy re-scoring (pop best, recompute adjusted score, push back if it dropped) instead of window rescans. Output must stay identical at budget 38,332 (diff selected-pairs.json).
2. Rerun speed test at 38,332 / 60,000 / 100,000 / 150,000 (`PAIR_BUDGET=N npm run build:pairs` then speed.run.ts twice each). ALWAYS restore src/data/selected-pairs.json at budget 38,332 afterwards.
3. Pick the budget (report numbers to her; she decides). Static-page count does NOT grow with budget — only the minimum set gets prerendered.
4. Keep old pair URLs: give prerender-seo-pages a list of legacy slugs (from the live sitemap at tag before-pair-scoring) rendered via getPairOrConstruct, kept out of CMS lists/search. Check out/ stays well under 1 GB.
5. Merge to main and push (= deploy). Verify fontpond.melware.art: a new pair page, an old pair URL (200), search works.

## To-dos parked by her
- Rating page: she grades ~40 pairs to calibrate the score; plus expert pairings (Google Fonts/Fontshare suggestions) as a second answer key. Her hand-crafted pairs are NOT a reliable answer key (made with Claude's help).
- Better scoring from real measurements (scripts/measured-*.json, feel embeddings).
- Per-pair text fields generated from actual scores.

## Two separate counts — do not mix them (clarified 2026-11-15)
1. **CMS pair entries** — the pair list every visitor's browser loads (search, explore). Limited by speed/memory.
   Today 38,332. Measured: 60,000 comfortable, 100,000 works but memory ~720 MB. Old pages are NOT part of this count.
2. **Static pair pages** — separate HTML files (~20 KB each) for SEO/sitemap. Limited by site size (GitHub Pages 1 GB).
   Only hand-crafted + minimum-phase pairs get static pages: 16,256 in the new set. Fill pairs never get static pages,
   so raising the CMS count (e.g. to 60k) adds ZERO static pages.
   Old live set had 13,501 static pair pages; 13,199 of them are not in the new set. Keeping them = 16,256 + 13,199
   ≈ 29,455 static pair pages, site ≈ 780 MB. Kept old pages are NOT CMS entries (not in search/explore lists).

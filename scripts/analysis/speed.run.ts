// Times the work the browser does for a given pair count. Writes one line per run to /tmp/fp-speed.jsonl.
import { test } from "vitest";
import fs from "fs";
test("speed", async () => {
  const mem0 = process.memoryUsage().heapUsed;
  const t0 = performance.now();
  const pairs = await import("@/data/pairs");
  const tImport = performance.now() - t0;
  const t1 = performance.now(); pairs.ensureDynamicPairs(); const tDyn = performance.now() - t1;
  const eng = await import("@/lib/engine");
  const q = (s: string) => { const t = performance.now(); eng.rankPairs(s, { limit: 24 }); return Math.round(performance.now() - t); };
  const first = q("warm editorial serif for a bakery");
  const again = [q("modern tech startup clean"), q("playful kids party"), q("luxury fashion elegant")];
  const t2 = performance.now(); eng.explorePairs(); const tExplore = performance.now() - t2;
  fs.appendFileSync("/tmp/fp-speed.jsonl", JSON.stringify({ budget: Number(process.env.PAIR_BUDGET), total: pairs.fontPairs.length,
    importMs: Math.round(tImport), buildAllPairsMs: Math.round(tDyn), firstSearchMs: first, laterSearchesMs: again, exploreMs: Math.round(tExplore),
    heapMB: Math.round((process.memoryUsage().heapUsed - mem0) / 1e6), jsonKB: Math.round(fs.statSync("src/data/selected-pairs.json").size / 1024) }) + "\n");
});

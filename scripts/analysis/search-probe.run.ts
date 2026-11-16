// Probes the real search engine for words that looked missing from the vocabulary.
// Output goes to a file because vitest hides console output here.
import { test } from "vitest";
import fs from "fs";
import { rankPairs, isUnmatchedWord, prepareMeaningMatch } from "@/lib/engine";
const WORDS = (process.env.PROBE_WORDS || "").split(",").filter(Boolean);
test("probe", async () => {
  const rows: any[] = [];
  for (const w of WORDS) {
    await prepareMeaningMatch(w);
    const r = rankPairs(w, { limit: 6 });
    rows.push({ word: w, unmatched: isUnmatchedWord(w), n: r.length, keys: r[0] ? Object.keys(r[0]).join(",") : "",
      top: r.map((x: any) => `${x.headerFont.name} / ${x.bodyFont.name} (${Math.round(x.relevanceScore)})`), reason: r[0]?.promptFitReason ?? "" });
  }
  fs.writeFileSync(process.env.PROBE_OUT!, JSON.stringify(rows, null, 1));
});

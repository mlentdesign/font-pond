// Model-free: across many searches, how many distinct "gen-" fill pairs ever reach the top 20 / top 100?
import { test } from "vitest";
import fs from "fs";
import { rankPairs, prepareMeaningMatch } from "@/lib/engine";
import { PROJECT_TYPES } from "@/data/project-types";
test("fill coverage", async () => {
  const tail = JSON.parse(fs.readFileSync("src/data/project-long-tail.json", "utf8")).projects as { label: string }[];
  const moods = ["warm","friendly","soft","bold","edgy","modern","calm","quiet","refined","playful","chunky","cheerful","sharp","precise","clean","weird","quirky","loud","cozy","handmade","honest","elegant","luxury","retro","vintage","futuristic","minimal","handwritten","serious","romantic","rugged","editorial","gentle","trustworthy","energetic","mysterious","heavy","delicate","technical","artsy","organic","industrial","youthful","classic","dramatic","whimsical","sleek","gritty"];
  const qs = [...new Set([...tail.map((e) => e.label), ...PROJECT_TYPES.flatMap((t) => t.words), ...moods, ...moods.flatMap((m, i) => moods.slice(i + 1, i + 4).map((n) => `${m} ${n}`))])].slice(0, 1200);
  const top20 = new Map<string, number>(), top100 = new Map<string, number>();
  for (const q of qs) {
    await prepareMeaningMatch(q);
    const r = rankPairs(q, { limit: 100 });
    r.forEach((x: any, i: number) => { if (!String(x.id).startsWith("gen-")) return; top100.set(x.id, (top100.get(x.id) ?? 0) + 1); if (i < 20) top20.set(x.id, (top20.get(x.id) ?? 0) + 1); });
  }
  const ids20 = [...top20.keys()], ids100 = [...top100.keys()];
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify({ queries: qs.length, distinctTop20: ids20.length, distinctTop100: ids100.length, ids20, ids100, hits20: Object.fromEntries(top20) }));
});

// Model-free: how often do generated "gen-" fill pairs surface in real search results?
import { test } from "vitest";
import fs from "fs";
import { rankPairs, prepareMeaningMatch } from "@/lib/engine";
const Q = ["warm friendly soft","bold edgy modern","calm quiet refined","playful chunky cheerful","sharp precise clean","weird quirky loud","cozy handmade honest","elegant luxury","retro vintage","futuristic tech","minimal clean","handwritten personal","serious corporate","fun kids","romantic wedding","rugged outdoorsy","friendly startup","editorial magazine","bold poster","gentle healthcare","resume","tech resume","cover letter","restaurant menu","wedding invitation","kids birthday poster","dashboard","annual report","portfolio","law firm website","blog","startup landing page","concert poster","bakery","yoga studio","coffee shop","podcast cover","book cover","movie title","wine label","fashion brand","real estate flyer","nonprofit newsletter","school newsletter","conference badge","app onboarding","gym","spooky halloween","christmas card","brutalist","art deco","grunge","calm","loud","heavy","delicate","quirky","trustworthy","energetic","mysterious"];
test("fill share", async () => {
  const rows: any[] = []; const tot = { top6: [0, 0], top20: [0, 0], top100: [0, 0] };
  for (const q of Q) {
    await prepareMeaningMatch(q);
    const r = rankPairs(q, { limit: 100 }); const g = (n: number) => r.slice(0, n).filter((x: any) => String(x.id).startsWith("gen-")).length;
    const row = { q, n: r.length, top6: g(6), top20: g(20), top100: g(100) }; rows.push(row);
    tot.top6[0] += row.top6; tot.top6[1] += Math.min(6, r.length); tot.top20[0] += row.top20; tot.top20[1] += Math.min(20, r.length); tot.top100[0] += row.top100; tot.top100[1] += Math.min(100, r.length);
  }
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify({ tot, rows }, null, 1));
});

import { test } from "vitest";
import fs from "fs";
import { ADJECTIVE_LIBRARY } from "@/data/adjective-library";
import { ADJECTIVE_EXPANSION, SYNONYM_MAP } from "@/data/adjective-expansion";
import { fonts } from "@/data/fonts";
test("vocab", async () => {
  const all = new Set<string>(); let groups = 0;
  const add = (rec: Record<string, string[]>) => { for (const [k, arr] of Object.entries(rec)) { groups++; all.add(k.toLowerCase()); arr.forEach((w) => all.add(w.toLowerCase())); } };
  add(ADJECTIVE_LIBRARY); add(ADJECTIVE_EXPANSION);
  const base = all.size;
  for (let n = 2; n <= 21; n++) { const m: any = await import(`@/data/adjective-batch${n}`); for (const v of Object.values(m)) if (v && typeof v === "object" && !Array.isArray(v)) add(v as any); }
  const syn = new Set<string>(); for (const [k, arr] of Object.entries(SYNONYM_MAP)) { syn.add(k); arr.forEach((w) => syn.add(w)); }
  const tagSet = new Set<string>(), useSet = new Set<string>(); let tagless = 0;
  for (const f of fonts as any[]) { (f.tags || []).forEach((t: string) => tagSet.add(t.toLowerCase())); (f.useCases || []).forEach((t: string) => useSet.add(t.toLowerCase())); if (!(f.tags || []).length) tagless++; }
  const per = (fonts as any[]).map((f) => (f.tags || []).length).sort((a, b) => a - b);
  fs.writeFileSync("/private/tmp/claude-502/-Users-eddy/47c711db-4081-4f17-b17d-d4acf5696412/scratchpad/vocab-words.json", JSON.stringify({ lib: [...all], tags: [...tagSet], uses: [...useSet], syn: [...syn] }));
  fs.writeFileSync("/private/tmp/claude-502/-Users-eddy/47c711db-4081-4f17-b17d-d4acf5696412/scratchpad/vocab.json", JSON.stringify({ groups, uniqueWordsLibraryPlusExpansion: base, uniqueWordsAllBatches: all.size, synonymWords: syn.size, fontTags: tagSet.size, fontUseCases: useSet.size, fonts: fonts.length, fontsWithNoTags: tagless, tagsPerFontMedian: per[Math.floor(per.length / 2)], tagsPerFontMax: per[per.length - 1] }, null, 1));
});

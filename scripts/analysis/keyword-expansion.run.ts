import { test, expect } from "vitest";
import { KEYWORD_EXPANSION } from "@/data/keyword-expansion";
import { getEngineVocabulary } from "@/lib/engine";
test("every expansion tag exists", () => {
  const v: any = getEngineVocabulary();
  const tags = new Set<string>(v.tags ?? v.allTags ?? []);
  const bad: string[] = [];
  for (const [k, ts] of Object.entries(KEYWORD_EXPANSION)) for (const t of ts) if (!tags.has(t)) bad.push(`${k}:${t}`);
  console.log("tagsize", tags.size, "bad", [...new Set(bad.map(b => b.split(":")[1]))].join(","));
  expect(tags.size).toBeGreaterThan(100);
});

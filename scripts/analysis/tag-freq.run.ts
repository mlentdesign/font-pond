import { test } from "vitest";
import fs from "fs";
import { fonts } from "@/data/fonts";
test("tagfreq", () => {
  const c = new Map<string, number>();
  for (const f of fonts as any[]) for (const t of new Set<string>((f.tags || []).map((x: string) => x.toLowerCase()))) c.set(t, (c.get(t) || 0) + 1);
  fs.writeFileSync(process.env.TAGS_OUT!, JSON.stringify([...c.entries()].sort((a, b) => b[1] - a[1])));
});

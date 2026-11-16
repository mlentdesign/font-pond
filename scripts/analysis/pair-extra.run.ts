import { test } from "vitest";
import fs from "fs";
import { fontPairs } from "@/data/pairs";
test("x", () => {
  const ids = fs.readFileSync(process.env.IDS_FILE!, "utf8").split("\n").filter(Boolean);
  const o: any = {};
  for (const id of ids) { const p: any = (fontPairs as any[]).find((x) => x.id === id); o[id] = { xh: p.xHeightHarmony, pc: p.personalityContrast, role: p.roleFitness }; }
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify(o));
});

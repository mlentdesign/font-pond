import { test } from "vitest";
import { fontPairs } from "@/data/pairs";
import { fontsById } from "@/data/fonts";
test("x", () => {
  const p: any = fontPairs[0];
  const h: any = fontsById.get(p.headerFontId);
  console.log("PAIRS", fontPairs.length, JSON.stringify({ ...p, rationale: String(p.rationale).slice(0, 200) }).slice(0, 900));
  console.log("FONT", JSON.stringify(h).slice(0, 1200));
});

// Builds one Batch API request per pair and reports the size. Writes JSONL to PAIR_TEXT_OUT. Spends nothing.
import { test } from "vitest";
import fs from "fs";
import { fontPairs } from "@/data/pairs";
import { fontsById } from "@/data/fonts";
const SYSTEM = "You write short, plain-English notes for a font-pairing website. Use only the facts given. Judge legibility, balance, and whether the two fonts sound like one coherent brand voice; looking different is fine. No hype, no emojis, sentence case, American spelling. Reply with JSON only: {\"rationale\":\"2 sentences on why the pair works and where it fits\",\"summary\":\"one sentence, under 20 words\"}.";
const brief = (f: any) => `${f.name} (${f.classification}${f.subcategory ? ", " + f.subcategory : ""}); feels ${[...(f.toneDescriptors ?? []), ...(f.tags ?? [])].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).slice(0, 8).join(", ")}`;
test("build", () => {
  const out = process.env.PAIR_TEXT_OUT!;
  const lines: string[] = [];
  let chars = 0;
  for (const p of fontPairs as any[]) {
    const h = fontsById.get(p.headerFontId) as any, b = fontsById.get(p.bodyFontId) as any;
    if (!h || !b) continue;
    const user = `Heading: ${brief(h)}\nBody: ${brief(b)}\nContrast: ${p.contrastType}. Body legibility ${p.bodyLegibilityScore}/10, hierarchy ${p.hierarchyStrength}/10.\nBest for: ${(p.useCases ?? []).slice(0, 5).join(", ")}.`;
    chars += SYSTEM.length + user.length;
    lines.push(JSON.stringify({ custom_id: p.id, params: { model: "claude-haiku-5-5", max_tokens: 300, thinking: { type: "disabled" }, system: SYSTEM, messages: [{ role: "user", content: user }] } }));
  }
  fs.writeFileSync(out, lines.join("\n") + "\n");
  console.log(`BUILT ${lines.length} requests, avg ${Math.round(chars / lines.length)} chars in; sample: ${lines[0].slice(0, 700)}`);
});

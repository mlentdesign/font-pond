// Assigns each pair its project types from the shared table (model-free) and writes the distribution.
import { test } from "vitest";
import fs from "fs";
import { assignAll, fitScore, buildWordWeight, PROJECT_TYPES } from "@/data/project-types";
test("assign", () => {
  const pairs = JSON.parse(fs.readFileSync(process.env.IN_FILE!, "utf8"));
  const out = assignAll(pairs, 3);
  const w = buildWordWeight(pairs), eligible: Record<string, number> = {};
  for (const t of PROJECT_TYPES) eligible[t.id] = pairs.filter((p: any) => fitScore(t, p, w) !== null).length;
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify({ out, eligible }));
});

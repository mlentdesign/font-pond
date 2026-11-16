// Model-free search check. For project queries: do results fit the project's rules, would a description name it,
// does the search find every valid pair. For adjective-only queries: what do the results and reason lines claim.
import { test } from "vitest";
import fs from "fs";
import { fitsProject } from "@/lib/project-intent";
import { rankPairs } from "@/lib/engine";
import { PROJECT_TYPES, fitScore, buildWordWeight } from "@/data/project-types";
const PROJECT_QUERIES: [string, string][] = [
  ["resume", "resume"], ["tech resume", "tech-resume"], ["technical", "tech-resume"], ["techy", "tech-resume"],
  ["cover letter", "resume"], ["restaurant menu", "food"], ["wedding invitation", "wedding"], ["kids birthday poster", "kids"],
  ["dashboard", "dashboard"], ["annual report", "report"], ["portfolio", "portfolio"], ["law firm website", "corporate"],
  ["blog", "articles"], ["startup landing page", "software"], ["concert poster", "poster"],
];
const ADJ_QUERIES = ["warm friendly soft", "bold edgy modern", "calm quiet refined", "playful chunky cheerful", "sharp precise clean", "weird quirky loud", "cozy handmade honest"];
test("search fit", () => {
  const pairs: any[] = JSON.parse(fs.readFileSync(process.env.IN_FILE!, "utf8"));
  const assign = JSON.parse(fs.readFileSync(process.env.ASSIGN_FILE!, "utf8")).out as Record<string, { id: string }[]>;
  const byId = new Map(pairs.map((p) => [p.id, p])), w = buildWordWeight(pairs);
  const type = (id: string) => PROJECT_TYPES.find((t) => t.id === id)!;
  const TOP = 20, DEEP = 100, report: any = { project: [], adjective: [] };
  for (const [q, tid] of PROJECT_QUERIES) {
    const t = type(tid); const res = rankPairs(q, { limit: DEEP }); const top = res.slice(0, TOP);
    const elig = (r: any) => { const p = byId.get(r.id); return p ? fitScore(t, p, w) !== null : fitsProject(tid, r.id); };
    const named = (r: any) => (assign[r.id] ?? []).some((x) => x.id === tid);
    const allEligible = pairs.filter((p) => fitScore(t, p, w) !== null).length;
    report.project.push({ q, type: tid, topFit: top.filter(elig).length, topNamed: top.filter(named).length,
      fitButNotNamed: top.filter((r) => elig(r) && !named(r)).length, namedButNotFit: top.filter((r) => named(r) && !elig(r)).length,
      distinctHeadings: new Set(top.map((r) => r.headerFont.id)).size, deepFit: res.filter(elig).length, allEligible,
      unfit: top.filter((r) => !elig(r)).slice(0, 3).map((r) => r.id), topIds: top.slice(0, 3).map((r) => r.id), reasons: top.slice(0, 3).map((r) => r.promptFitReason) });
  }
  const tail = JSON.parse(fs.readFileSync("src/data/project-long-tail.json", "utf8")).projects as { label: string }[];
  // Only real project phrases: long-tail labels and multi-word type words (mood words like "playful" are not projects).
  const projWords = new Set([...tail.map((e) => e.label.toLowerCase()), ...PROJECT_TYPES.flatMap((t) => t.words).filter((x) => x.includes(" "))]);
  for (const q of ADJ_QUERIES) {
    const top = rankPairs(q, { limit: TOP });
    report.adjective.push({ q, distinctHeadings: new Set(top.map((r) => r.headerFont.id)).size,
      reasonNamesProject: top.filter((r) => [...projWords].some((pw) => new RegExp("\\b" + pw + "\\b", "i").test(r.promptFitReason ?? ""))).length,
      reasons: top.slice(0, 3).map((r) => r.promptFitReason), heads: top.slice(0, 6).map((r) => r.headerFont.name) });
  }
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify(report, null, 1));
});

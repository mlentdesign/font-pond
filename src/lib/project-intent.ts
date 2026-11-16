// Reads what project a search is about and which pairs are valid for it. Model-free and live: it uses the shared
// project-type rules for every pair, not the three types a description happens to mention.
// Adjective-only searches never get a project: mood-like types and over-shared words are ignored.
import { PROJECT_TYPES, FAMILIES, fitScore, buildWordWeight, kindOf, isEngineering, type PairLite, type FontLite, type ProjectType } from "@/data/project-types";
import { SPECIFICS } from "@/data/project-specifics";
import { fontPairs } from "@/data/pairs";
import { fontsById } from "@/data/fonts";

// Types that describe a look, not a job. A search for "playful" is a mood, so these never become a project.
const MOOD_TYPES = new Set(["playful", "retro", "spooky", "luxury", "general", "logo"]);
const MAX_TYPES_PER_WORD = 3; // a word shared by more types than this is too general to name a project

export interface UnderstoodProject { id: string; label: string }

const toLiteFont = (f: any): FontLite => ({ id: f.id, cls: f.classification, sub: f.subcategory, mood: f.moodCategory, leg: f.bodyLegibilityScore,
  xh: f.xHeightRatio, ap: f.apertureOpenness, sc: f.strokeContrast, ls: f.letterSpacing, weights: f.weights, tags: f.tags, tone: f.toneDescriptors, use: f.useCases });

let lexicon: Map<string, Map<string, number>> | null = null;
function getLexicon() {
  if (lexicon) return lexicon;
  const m = new Map<string, Map<string, number>>();
  const add = (phrase: string, typeId: string, weight: number) => {
    const key = phrase.toLowerCase().trim(); if (!key) return;
    if (!m.has(key)) m.set(key, new Map());
    m.get(key)!.set(typeId, Math.max(m.get(key)!.get(typeId) ?? 0, weight));
  };
  for (const t of PROJECT_TYPES) { if (MOOD_TYPES.has(t.id)) continue; for (const w of t.words) add(w, t.id, 2); }
  for (const s of SPECIFICS) { if (MOOD_TYPES.has(s.project)) continue; add(s.label, s.project, 3); for (const w of s.words) add(w, s.project, 1); }
  for (const [k, v] of m) if (!k.includes(" ") && v.size > MAX_TYPES_PER_WORD) m.delete(k);
  return (lexicon = m);
}

const tokens = (q: string) => q.toLowerCase().replace(/[’']/g, "").split(/[^a-z0-9+#]+/).filter(Boolean);

/** Which projects the search names (at most two), strongest first. Adjective-only searches return none. */
export function understoodProjects(query: string): UnderstoodProject[] {
  const lex = getLexicon(), w = tokens(query), score = new Map<string, number>();
  for (let i = 0; i < w.length; i++) {
    for (let n = Math.min(4, w.length - i); n >= 1; n--) {
      const hit = lex.get(w.slice(i, i + n).join(" "));
      if (!hit) continue;
      for (const [id, wt] of hit) score.set(id, (score.get(id) ?? 0) + wt * n * n);
      i += n - 1; break; // longest phrase wins, no double counting
    }
  }
  const byId = new Map(PROJECT_TYPES.map((t) => [t.id, t]));
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  // A more specific project (tech resume) replaces the broad one it narrows (resume) when both matched.
  const drop = new Set(ranked.map(([id]) => byId.get(id)?.parent).filter(Boolean) as string[]);
  return ranked.filter(([id]) => !drop.has(id)).slice(0, 2).map(([id]) => ({ id, label: byId.get(id)!.label }));
}

let lite: PairLite[] | null = null, weight: ReturnType<typeof buildWordWeight> | null = null, liteCount = -1;
const eligibleCache = new Map<string, Map<number, number>>();
// Generated pairs are added while the app runs, so the list is rebuilt whenever the pair count changes.
function getLite() {
  if (lite && liteCount === fontPairs.length) return lite;
  lite = fontPairs.map((p: any) => { const h = fontsById.get(p.headerFontId), b = fontsById.get(p.bodyFontId);
    return { id: p.id, leg: p.bodyLegibilityScore, h: toLiteFont(h), b: toLiteFont(b) } as PairLite; });
  liteCount = fontPairs.length; eligibleCache.clear(); weight = buildWordWeight(lite); return lite;
}

/** Pair index (in fontPairs) -> fit score for every pair that passes the project's rules. */
export function eligiblePairs(typeId: string, includeDisplay = false): Map<number, number> {
  const L = getLite(), key = typeId + (includeDisplay ? "+d" : ""), hit = eligibleCache.get(key); if (hit) return hit;
  const t: ProjectType | undefined = PROJECT_TYPES.find((x) => x.id === typeId), out = new Map<number, number>();
  // Display headings stay out of everyday work (software, reports, shops) unless the person asks for them.
  const calm = !!t && !includeDisplay && !DISPLAY_OK_FAMILIES.has(t.family);
  if (t) for (let i = 0; i < L.length; i++) {
    if (calm && kindOf(L[i].h) === "display") continue;
    const s = fitScore(t, L[i], weight!); if (s !== null) out.set(i, s);
  }
  eligibleCache.set(key, out); return out;
}

const DISPLAY_OK_FAMILIES = new Set(["showcase", "loud", "occasions", "themed"]);
const TECH_WORDS = new Set(["technical", "techy", "tech", "engineering", "engineered"]);
const SCIFI_WORDS = new Set(["futuristic", "scifi", "sci-fi", "cyberpunk", "space", "retro-futuristic", "alien", "cyber", "robot"]);
/** "Technical" as a look (not a project): the engineering side, unless the search asks for sci-fi. */
export function engineeringMood(query: string): boolean {
  const w = tokens(query); return w.some((x) => TECH_WORDS.has(x)) && !w.some((x) => SCIFI_WORDS.has(x));
}
let engCache: Map<number, number> | null = null, engCount = -1;
export function engineeringPairs(): Map<number, number> {
  const L = getLite(); if (engCache && engCount === L.length) return engCache;
  const out = new Map<number, number>(); for (let i = 0; i < L.length; i++) if (isEngineering(L[i].h) && kindOf(L[i].h) !== "display" && (L[i].leg ?? 0) >= 7) out.set(i, 1);
  engCount = L.length; return (engCache = out);
}

/** Same rules, looked up by pair id (used by the fit test). */
export function fitsProject(typeId: string, pairId: string): boolean {
  const el = eligiblePairs(typeId); const i = fontPairs.findIndex((p: any) => p.id === pairId); return i >= 0 && el.has(i);
}

const lowerFirst = (s: string) => (s[1] && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s);
/** Sentence-case line about why a pair fits the project the search named. Built from the search, never from the description. */
export function projectReason(label: string, headingName: string, bodyName: string): string {
  return `Fits ${lowerFirst(label)}: ${headingName} headings, with ${bodyName} body text that stays easy to read.`;
}

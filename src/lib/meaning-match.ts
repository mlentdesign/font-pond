// Lazy loader and lookup for the precomputed meaning-neighbor table
// (src/lib/meaning-neighbors.json, built by scripts/build-meaning-neighbors.mjs).
// The table is a separate chunk that is only fetched the first time a search
// contains a word the keyword engine cannot match.
//
// Format: { t: string[] targets, w: { sourceWord: [targetIndex, score, ...] } }
// with score as an integer 0-100 (similarity x 100), best first.
import { MEANING_MATCH_ENABLED } from "./meaning-enabled";

type Table = { t: string[]; w: Record<string, number[]> };

let table: Table | null = null;
let loading: Promise<void> | null = null;

// Keep at most this many neighbors per unmatched word when expanding a query.
const MAX_NEIGHBORS = 3;

export function warmMeaningTable(): Promise<void> {
  if (!MEANING_MATCH_ENABLED || table) return Promise.resolve();
  if (!loading) {
    loading = import("./meaning-neighbors.json")
      .then((m) => { table = (m.default ?? m) as unknown as Table; })
      .catch(() => { loading = null; /* offline or blocked: search simply stays as before */ });
  }
  // Never let a slow network hold a search hostage.
  return Promise.race([loading, new Promise<void>((r) => setTimeout(r, 4000))]);
}

function candidates(word: string): string[] {
  const out = [word];
  if (word.endsWith("ies") && word.length > 4) out.push(word.slice(0, -3) + "y");
  if (word.endsWith("es") && word.length > 4) out.push(word.slice(0, -2));
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) out.push(word.slice(0, -1));
  if (word.endsWith("ing") && word.length > 5) out.push(word.slice(0, -3), word.slice(0, -3) + "e");
  if (word.endsWith("ed") && word.length > 4) out.push(word.slice(0, -2), word.slice(0, -1));
  return out;
}

// Engine words nearest in meaning to `word`, best first. Empty when the table
// is not loaded or the word is unknown.
export function meaningNeighbors(word: string): string[] {
  if (!MEANING_MATCH_ENABLED || !table) return [];
  for (const c of candidates(word)) {
    const row = table.w[c];
    if (!row) continue;
    const out: string[] = [];
    for (let i = 0; i < row.length && out.length < MAX_NEIGHBORS; i += 2) out.push(table.t[row[i]]);
    return out;
  }
  return [];
}

// Gives each pair concrete projects ("Federal resume", "Bakery signage") from the long-tail list.
// A pair keeps the broad types it fits (assignAll); inside each broad type it takes the specific project
// that has been used least so far, so every specific project shows up about equally. Same input, same output.
import tail from "./project-long-tail.json";
import { wordsOf, type PairLite } from "./project-types";

export interface Specific { id: string; label: string; project: string; words: string[] }
export const SPECIFICS: Specific[] = (tail as { projects: Specific[] }).projects;

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };

export interface Fit { broad: string; specific: string | null }

export function assignSpecifics(pairs: PairLite[], broad: Record<string, { id: string }[]>): Record<string, Fit[]> {
  const by: Record<string, Specific[]> = {};
  for (const s of SPECIFICS) (by[s.project] ??= []).push(s);
  const used: Record<string, number> = {};
  const out: Record<string, Fit[]> = {};
  const order = [...pairs].sort((a, b) => hash(a.id) - hash(b.id));
  for (const p of order) {
    const fw = new Set([...wordsOf(p.h), ...wordsOf(p.b)]);
    const taken = new Set<string>();
    out[p.id] = (broad[p.id] ?? []).map(({ id }) => {
      const cands = by[id];
      if (!cands?.length) return { broad: id, specific: null };
      let best: Specific | null = null, bestKey = Infinity;
      for (const c of cands) {
        if (taken.has(c.id)) continue;
        const hit = c.words.some((w) => fw.has(w)) ? 2 : 0;
        const key = (used[c.id] ?? 0) - hit + hash(p.id + "|" + c.id) * 0.5;
        if (key < bestKey) { bestKey = key; best = c; }
      }
      if (!best) return { broad: id, specific: null };
      taken.add(best.id); used[best.id] = (used[best.id] ?? 0) + 1;
      return { broad: id, specific: best.id };
    });
  }
  return out;
}

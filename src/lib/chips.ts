import { fonts } from "@/data/fonts";
import type { Font } from "@/data/types";

// Chips should tell fonts apart. So: drop role words that every header/body font shares,
// drop tags most fonts carry, collapse synonym clusters (tags that mark the same fonts),
// and rank what's left by how rare it is, preferring tags that are rare among the current results too.
const ROLE_WORDS = new Set([
  "display", "headline", "headline-ready", "heading", "headings", "body", "body-friendly", "body-text", "text",
  "ui", "title", "titles", "headings-only", "readable", "screen-friendly", "comfortable",
]);
const COMMON_SHARE = 0.12; // a tag on more than 12% of all fonts says little

let idx: { byTag: Map<string, Set<string>>; total: number } | null = null;
function index() {
  if (idx) return idx;
  const byTag = new Map<string, Set<string>>();
  for (const f of fonts) for (const t of f.tags) {
    let s = byTag.get(t); if (!s) byTag.set(t, (s = new Set()));
    s.add(f.id);
  }
  return (idx = { byTag, total: fonts.length });
}

function jaccard(a: Set<string>, b: Set<string>) {
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

const peerCache = new WeakMap<object, Map<string, number>>();
function peerCounts(peers: Font[] | undefined): Map<string, number> | null {
  if (!peers || peers.length < 4) return null;
  let m = peerCache.get(peers);
  if (!m) {
    m = new Map();
    const seen = new Set<string>();
    for (const f of peers) { if (seen.has(f.id)) continue; seen.add(f.id); for (const t of new Set(f.tags)) m.set(t, (m.get(t) || 0) + 1); }
    peerCache.set(peers, m);
  }
  return m;
}

/** Distinctive tags for one font, best first. `peers` = the other fonts in the same role among current results. */
export function distinctiveTags(font: Font, peers?: Font[], max = 12): { chips: string[]; total: number } {
  const { byTag, total } = index();
  const unique = [...new Set(font.tags)];
  const pc = peerCounts(peers);
  const peerN = peers ? new Set(peers.map((p) => p.id)).size : 0;
  const scored = unique
    .filter((t) => !ROLE_WORDS.has(t))
    .map((t) => ({ t, set: byTag.get(t) || new Set<string>() }))
    .map(({ t, set }) => ({
      t, set,
      score: Math.log(total / Math.max(1, set.size)) + (pc ? Math.log((peerN + 1) / ((pc.get(t) || 1) + 0.5)) : 0),
    }))
    .sort((a, b) => b.score - a.score);
  const picked: { t: string; set: Set<string> }[] = [];
  for (const c of scored) {
    if (picked.some((p) => jaccard(p.set, c.set) > 0.5)) continue; // same idea as one already shown
    picked.push(c);
    if (picked.length >= max) break;
  }
  // Tags on most fonts only fill in when a font has almost nothing rarer to show.
  const rare = picked.filter((p) => p.set.size / total <= COMMON_SHARE);
  if (rare.length < 3) { // top up with common tags, still skipping near-identical ones
    for (const c of scored) {
      if (rare.length >= 3) break;
      if (!rare.includes(c) && !rare.some((p) => jaccard(p.set, c.set) > 0.85)) rare.push(c);
    }
  }
  const out = rare.length >= 3 ? rare : [...rare, ...picked.filter((p) => !rare.includes(p))].slice(0, 3);
  return { chips: out.map((p) => p.t), total: unique.length };
}

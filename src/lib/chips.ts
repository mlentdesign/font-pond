import { fonts } from "@/data/fonts";
import type { Font } from "@/data/types";

// Serif / sans-serif are the broad families, already visible in the type itself, so they never make a chip.
// Chips should tell fonts apart. So: drop role words that every header/body font shares,
// drop tags most fonts carry, collapse synonym clusters (tags that mark the same fonts),
// and rank what's left by how rare it is, preferring tags that are rare among the current results too.
const ROLE_WORDS = new Set([
  "display", "headline", "headline-ready", "heading", "headings", "body", "body-friendly", "body-text", "text",
  "serif", "sans-serif", "sans", "sans serif", "slab-serif", "ui", "title", "titles", "headings-only", "readable", "screen-friendly", "comfortable",
]);
const FILL_SHARE = 0.15;
const LAST_RESORT_SHARE = 0.2; // only when a font would otherwise show fewer than 2 chips
const ANATOMY = new Set(["high stroke contrast", "low stroke contrast", "monoline strokes", "open apertures", "closed apertures", "tall x-height", "low x-height", "tight spacing", "generous spacing"]);
const ANATOMY_FILL_SHARE = 0.3;
const COMMON_SHARE = 0.05; // a label on more than 5% of all fonts says little

// Everything we know about a font that could set it apart: the written tags, its distinctive traits and
// design subcategory, tone words, use cases and measured anatomy. Each label is ranked by rarity across all fonts.
const GENERIC_USE = new Set(["headlines", "body text", "display", "headings", "paragraphs"]);
export function labelsOf(f: Font): string[] {
  const out: string[] = [];
  out.push(...(f.distinctiveTraits || []), ...(f.tags || []), ...(f.toneDescriptors || []));
  if (f.subcategory) out.push(f.subcategory);
  out.push(...(f.useCases || []).filter((u) => !GENERIC_USE.has(u.toLowerCase())));
  if (f.variableFont) out.push("variable font");
  if (f.weights && f.weights.length >= 7) out.push(`${f.weights.length} weights`);
  // Measured anatomy: real for every font, so it fills in when the written tags are all stock wording.
  if (f.strokeContrast === "high") out.push("high stroke contrast");
  if (f.strokeContrast === "low") out.push("low stroke contrast");
  if (f.strokeContrast === "none") out.push("monoline strokes");
  if (f.apertureOpenness === "open") out.push("open apertures");
  if (f.apertureOpenness === "closed") out.push("closed apertures");
  if (f.xHeightRatio === "high") out.push("tall x-height");
  if (f.xHeightRatio === "low") out.push("low x-height");
  if (f.letterSpacing === "tight") out.push("tight spacing");
  if (f.letterSpacing === "generous") out.push("generous spacing");
  return [...new Set(out.map((l) => l.trim().toLowerCase()).filter(Boolean))];
}

let idx: { byTag: Map<string, Set<string>>; total: number } | null = null;
function index() {
  if (idx) return idx;
  const byTag = new Map<string, Set<string>>();
  for (const f of fonts) for (const t of labelsOf(f)) {
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
    for (const f of peers) { if (seen.has(f.id)) continue; seen.add(f.id); for (const t of labelsOf(f)) m.set(t, (m.get(t) || 0) + 1); }
    peerCache.set(peers, m);
  }
  return m;
}

/** Distinctive tags for one font, best first. `peers` = the other fonts in the same role among current results. */
export function distinctiveTags(font: Font, peers?: Font[], max = 12): { chips: string[]; total: number } {
  const { byTag, total } = index();
  const unique = labelsOf(font);
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
  // Labels on more than 5% of fonts only fill in when a font has few rarer ones; anything on more than 15% never shows.
  const rare = picked.filter((p) => p.set.size / total <= COMMON_SHARE);
  if (rare.length < 3) {
    for (const c of scored) {
      if (rare.length >= 3) break;
      if (c.set.size / total > (ANATOMY.has(c.t) ? ANATOMY_FILL_SHARE : FILL_SHARE) || rare.includes(c)) continue;
      if (!rare.some((p) => jaccard(p.set, c.set) > 0.85)) rare.push(c);
    }
  }
  if (rare.length < 2) {
    for (const c of scored) {
      if (rare.length >= 2) break;
      if (c.set.size / total > LAST_RESORT_SHARE || rare.includes(c)) continue;
      if (!rare.some((p) => jaccard(p.set, c.set) > 0.85)) rare.push(c);
    }
  }
  const out = rare;
  return { chips: out.map((p) => p.t), total: unique.length };
}

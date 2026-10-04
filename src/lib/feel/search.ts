import type { Font, ScoredPair } from "@/data/types";
import { getPairOrConstruct, pairsBySlug } from "@/data/pairs";
import { fonts } from "@/data/fonts";
import { fontFeelText } from "./text";

// Search by feel: everything here runs in the visitor's browser. The only network
// traffic is a one-time download of the open model (cached by the browser afterwards);
// the visitor's query never leaves the page.

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const MODEL = "Xenova/all-MiniLM-L6-v2";
// transformers.js is loaded from a CDN on first use instead of being bundled, so it
// adds nothing to page load and never touches the static build.
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.min.js";

export type FeelProgress = { phase: "vectors" | "model"; loaded: number; total: number };

interface Meta { model: string; dim: number; scale: number; count: number; slugs: string[] }
interface FeelIndex { dim: number; vectors: Int8Array; fonts: Font[] }
type Embedder = (text: string) => Promise<Float32Array>;

let indexPromise: Promise<FeelIndex> | null = null;
let embedderPromise: Promise<Embedder> | null = null;

export function loadIndex(): Promise<FeelIndex> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const [metaRes, binRes] = await Promise.all([
        fetch(`${BASE_PATH}/feel/feel-meta.json`),
        fetch(`${BASE_PATH}/feel/feel-vectors.bin`),
      ]);
      if (!metaRes.ok || !binRes.ok) throw new Error("feel index missing");
      const meta = (await metaRes.json()) as Meta;
      const vectors = new Int8Array(await binRes.arrayBuffer());
      const bySlug = new Map(fonts.map((f) => [f.slug, f]));
      // Keep only rows whose font still exists, in the order the vectors were written
      const rows: number[] = [];
      const list: Font[] = [];
      meta.slugs.forEach((s, i) => { const f = bySlug.get(s); if (f) { rows.push(i); list.push(f); } });
      const packed = new Int8Array(list.length * meta.dim);
      rows.forEach((src, dst) => packed.set(vectors.subarray(src * meta.dim, (src + 1) * meta.dim), dst * meta.dim));
      indexPromise = Promise.resolve({ dim: meta.dim, vectors: packed, fonts: list });
      return { dim: meta.dim, vectors: packed, fonts: list };
    })().catch((e) => { indexPromise = null; throw e; });
  }
  return indexPromise;
}

export function loadEmbedder(onProgress?: (p: FeelProgress) => void): Promise<Embedder> {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const lib = await import(/* webpackIgnore: true */ /* @vite-ignore */ `${TRANSFORMERS_URL}`);
      lib.env.allowLocalModels = false;
      const files = new Map<string, { loaded: number; total: number }>();
      const extractor = await lib.pipeline("feature-extraction", MODEL, {
        dtype: "q8",
        device: "wasm",
        progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (p.status === "progress" && p.file && p.total) {
            files.set(p.file, { loaded: p.loaded ?? 0, total: p.total });
            let loaded = 0, total = 0;
            files.forEach((v) => { loaded += v.loaded; total += v.total; });
            onProgress?.({ phase: "model", loaded, total });
          }
        },
      });
      return async (text: string) => {
        const out = await extractor(text, { pooling: "mean", normalize: true });
        return out.data as Float32Array;
      };
    })().catch((e) => { embedderPromise = null; throw e; });
  }
  return embedderPromise;
}

export interface ScoredFont { font: Font; score: number }

// The model is weak on bare category words ("sans", "serif", "mono"), so a small,
// transparent nudge keeps results in the category the visitor named.
const CATEGORY_WORDS: Array<[RegExp, Font["serifSansCategory"][]]> = [
  [/\b(sans|sans-serif|grotesk|grotesque|humanist sans|geometric sans)\b/i, ["sans-serif"]],
  [/\b(serif|old-style|didone|transitional)\b/i, ["serif", "slab-serif"]],
  [/\b(slab)\b/i, ["slab-serif"]],
  [/\b(mono|monospace|monospaced|code|coding|terminal)\b/i, ["monospace"]],
  [/\b(script|calligraphy|calligraphic|cursive|handwriting|handwritten)\b/i, ["script"]],
  [/\b(display|headline|poster)\b/i, ["display"]],
];

function categoryNudge(query: string, f: Font): number {
  let want: Font["serifSansCategory"][] | null = null;
  for (const [re, cats] of CATEGORY_WORDS) {
    if (re.test(query)) {
      // "serif" must not fire for "sans-serif" / "sans serif"
      if (cats[0] === "serif" && /\bsans[\s-]?serif\b/i.test(query) && !/(?<!sans[\s-])\bserif\b/i.test(query)) continue;
      want = cats; break;
    }
  }
  if (!want) return 0;
  const cat = f.serifSansCategory;
  if (want.includes(cat)) return 0.06;
  if (want[0] === "monospace" || want[0] === "script") return -0.06;
  return -0.02;
}

export async function rankFontsSemantic(query: string, embed: Embedder, limit = 60): Promise<ScoredFont[]> {
  const { dim, vectors, fonts: list } = await loadIndex();
  const q = await embed(query);
  const scored: ScoredFont[] = [];
  for (let i = 0; i < list.length; i++) {
    let dot = 0;
    const off = i * dim;
    for (let k = 0; k < dim; k++) dot += vectors[off + k] * q[k];
    // stored vectors are unit length * 127
    const sim = dot / 127;
    scored.push({ font: list[i], score: sim + categoryNudge(query, list[i]) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// ── Keyword fallback over the same text ──

const STOP = new Set(["a", "an", "the", "for", "and", "or", "of", "to", "with", "in", "on", "my", "that", "is", "it", "font", "fonts", "typeface", "type", "brand", "something", "looks", "like", "feel", "feels"]);
let keywordIndex: Array<{ font: Font; tokens: Set<string>; name: string }> | null = null;
let docFreq: Map<string, number> | null = null;

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/).filter((t) => t.length > 1 && !STOP.has(t));
}
function stem(t: string): string {
  return t.replace(/(ing|ness|ly|ies|es|s)$/, (m) => (m === "ies" ? "y" : "")) || t;
}

export function rankFontsKeyword(query: string, limit = 60): ScoredFont[] {
  if (!keywordIndex || !docFreq) {
    const df = new Map<string, number>();
    keywordIndex = fonts.map((font) => {
      const tokens = new Set(tokenize(fontFeelText(font)).map(stem));
      tokens.forEach((t) => df.set(t, (df.get(t) ?? 0) + 1));
      return { font, tokens, name: font.name.toLowerCase() };
    });
    docFreq = df;
  }
  const qTokens = [...new Set(tokenize(query).map(stem))];
  const n = keywordIndex.length;
  const scored: ScoredFont[] = [];
  for (const row of keywordIndex) {
    let s = 0;
    for (const t of qTokens) {
      if (row.tokens.has(t)) s += Math.log(1 + n / (1 + (docFreq.get(t) ?? 0)));
      if (row.name.includes(t)) s += 2;
    }
    if (s > 0) scored.push({ font: row.font, score: s / (qTokens.length || 1) + categoryNudge(query, row.font) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// ── Pairs ──
// Combine the best header and body candidates by feel, then keep combinations that
// resolve to a real /pair/{slug} page. Curated pairs get a small bonus over
// on-the-fly ones because their rationale was written by hand.

export function pairsFromRanking(all: ScoredFont[], limit = 12): ScoredPair[] {
  const headers = all.filter((s) => s.font.isHeaderSuitable).slice(0, 14);
  const bodies = all.filter((s) => s.font.isBodySuitable && (s.font.bodyLegibilityScore ?? 0) >= 6).slice(0, 14);
  const combos: Array<{ pair: ScoredPair; score: number }> = [];
  for (const h of headers) {
    for (const b of bodies) {
      if (h.font.id === b.font.id) continue;
      const slug = `${h.font.slug}-${b.font.slug}`;
      const curated = pairsBySlug.get(slug);
      const base = curated ?? getPairOrConstruct(slug);
      if (!base) continue;
      const score = 0.55 * h.score + 0.3 * b.score + (curated ? 0.04 + curated.overallScore / 2500 : 0);
      combos.push({
        score,
        pair: { ...base, relevanceScore: score, promptFitReason: base.shortExplanation, headerFont: h.font, bodyFont: b.font },
      });
    }
  }
  combos.sort((a, b) => b.score - a.score);
  const out: ScoredPair[] = [];
  const hUse = new Map<string, number>();
  const bUse = new Map<string, number>();
  for (const c of combos) {
    const hk = c.pair.headerFont.id, bk = c.pair.bodyFont.id;
    if ((hUse.get(hk) ?? 0) >= 2 || (bUse.get(bk) ?? 0) >= 2) continue;
    hUse.set(hk, (hUse.get(hk) ?? 0) + 1);
    bUse.set(bk, (bUse.get(bk) ?? 0) + 1);
    out.push(c.pair);
    if (out.length >= limit) break;
  }
  return out;
}

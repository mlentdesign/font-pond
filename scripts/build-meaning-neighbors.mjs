// Build-time step for meaning-based matching inside the existing search.
//
//   TARGETS  every word the keyword engine can match (keywords, tags, synonym keys)
//   SOURCES  ~40k common English words (scripts/data/meaning-source-words.txt, a
//            frequency-ranked list) minus anything the engine already knows
//
// Both sides are embedded with the local Ollama `all-minilm` model, then each
// source word keeps its nearest few targets. The result is one compact JSON
// table shipped as a lazily-loaded chunk: visitors download no model.
//
//   node scripts/build-meaning-neighbors.mjs            (needs `ollama serve` + all-minilm)
//   --threshold=0.55   minimum raw cosine similarity to keep a neighbor
//   --k=4              neighbors kept per source word
//   --report           also write scripts/data/meaning-report.txt (spot checks)
//
// Embeddings are cached by text hash in scripts/.meaning-cache/ (gitignored),
// so re-runs only embed new text.
import { createServer } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = resolve(root, "scripts/.meaning-cache");
const MODEL = "all-minilm";
const DIM = 384;
const arg = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? Number(a.split("=")[1]) : d; };
const THRESHOLD = arg("threshold", 0.55);
const K = arg("k", 4);
const OLLAMA = process.env.OLLAMA_URL || "http://localhost:11434";

mkdirSync(cacheDir, { recursive: true });

// ── load engine vocabulary ──
const vite = await createServer({
  root, configFile: false, logLevel: "error", appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { "@": resolve(root, "src") } },
  optimizeDeps: { noDiscovery: true },
});
const engine = await vite.ssrLoadModule("/src/lib/engine.ts");
const vocab = engine.getEngineVocabulary();

const okTarget = (t) => t.length >= 3 && t.length <= 28 && /^[a-z0-9][a-z0-9 '\-]*$/.test(t) && t.split(/[\s]+/).length <= 3;
const keywordSet = new Set(vocab.keywords.map((t) => t.toLowerCase()));
const targets = [...new Set([...vocab.keywords, ...vocab.synonymKeys, ...vocab.tags].map((t) => t.toLowerCase().trim()))].filter(okTarget).sort();

const raw = readFileSync(resolve(root, "scripts/data/meaning-source-words.txt"), "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
const targetSet = new Set(targets);
const sources = raw.filter((w) => !targetSet.has(w) && engine.isUnmatchedWord(w));
await vite.close();
console.log(`[meaning] targets ${targets.length} (${keywordSet.size} keywords), source list ${raw.length}, sources kept ${sources.length}`);

// ── embeddings with an on-disk cache keyed by text hash ──
const idxPath = resolve(cacheDir, "index.txt");
const binPath = resolve(cacheDir, "vectors.f32");
const cache = new Map(); // hash -> Float32Array
if (existsSync(idxPath) && existsSync(binPath)) {
  const hashes = readFileSync(idxPath, "utf8").split("\n").filter(Boolean);
  const buf = readFileSync(binPath);
  const all = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  hashes.slice(0, Math.floor(all.length / DIM)).forEach((h, i) => cache.set(h, all.subarray(i * DIM, (i + 1) * DIM)));
}
const hashOf = (t) => createHash("sha1").update(MODEL + "\n" + t).digest("hex").slice(0, 20);

async function embedAll(texts) {
  const need = [...new Set(texts)].filter((t) => !cache.has(hashOf(t)));
  console.log(`[meaning] embedding ${need.length} new texts (${texts.length - need.length} cached)`);
  const BATCH = 256;
  for (let i = 0; i < need.length; i += BATCH) {
    const batch = need.slice(i, i + BATCH);
    const res = await fetch(`${OLLAMA}/api/embed`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: batch }),
    });
    if (!res.ok) throw new Error(`ollama ${res.status}: ${await res.text()}`);
    const { embeddings } = await res.json();
    const f = new Float32Array(batch.length * DIM);
    const hs = [];
    batch.forEach((t, j) => {
      let n = 0; for (let k = 0; k < DIM; k++) n += embeddings[j][k] ** 2;
      n = Math.sqrt(n) || 1;
      for (let k = 0; k < DIM; k++) f[j * DIM + k] = embeddings[j][k] / n;
      const h = hashOf(t); hs.push(h); cache.set(h, f.subarray(j * DIM, (j + 1) * DIM));
    });
    appendFileSync(binPath, Buffer.from(f.buffer));
    appendFileSync(idxPath, hs.join("\n") + "\n");
    if ((i / BATCH) % 10 === 0) console.log(`[meaning]   ${Math.min(i + BATCH, need.length)}/${need.length}`);
  }
}
await embedAll([...targets, ...sources]);
const mat = (list) => { const m = new Float32Array(list.length * DIM); list.forEach((t, i) => m.set(cache.get(hashOf(t)), i * DIM)); return m; };
const T = mat(targets), S = mat(sources);
const nT = targets.length, nS = sources.length;

// ── similarity: raw cosine, with hubness correction (CSLS) for ranking ──
// Single-word embeddings have "hub" targets that are near everything; CSLS
// subtracts each side's average similarity to its nearest neighbors.
const dot = (a, ai, b, bi) => { let s = 0; for (let k = 0; k < DIM; k++) s += a[ai * DIM + k] * b[bi * DIM + k]; return s; };
const topMean = (arr, n) => { const c = Float32Array.from(arr).sort(); let s = 0; for (let i = 0; i < n; i++) s += c[c.length - 1 - i]; return s / n; };
const RK = 10;
console.log("[meaning] hubness pass ...");
const rT = new Float32Array(nT);
{ // target-side: mean of its top-RK similarities over a sample of sources
  const step = Math.max(1, Math.floor(nS / 6000));
  const sample = []; for (let i = 0; i < nS; i += step) sample.push(i);
  for (let t = 0; t < nT; t++) { const sims = new Float32Array(sample.length); sample.forEach((s, j) => (sims[j] = dot(T, t, S, s))); rT[t] = topMean(sims, RK); }
}
console.log("[meaning] ranking neighbors ...");
const rows = {};
const report = [];
for (let s = 0; s < nS; s++) {
  const sims = new Float32Array(nT);
  for (let t = 0; t < nT; t++) sims[t] = dot(S, s, T, t);
  const rS = topMean(sims, RK);
  const cand = [];
  for (let t = 0; t < nT; t++) if (sims[t] >= THRESHOLD) cand.push([t, sims[t], 2 * sims[t] - rS - rT[t] + (keywordSet.has(targets[t]) ? 0.03 : 0)]);
  if (!cand.length) continue;
  cand.sort((a, b) => b[2] - a[2]);
  // keep only candidates whose CSLS score is positive-ish and near the best
  const top = cand.filter((c, i) => i < K && c[2] > 0 && c[2] >= cand[0][2] - 0.18);
  if (!top.length) continue;
  rows[sources[s]] = top.flatMap((c) => [c[0], Math.round(c[1] * 100)]);
  if (process.argv.includes("--report")) report.push(`${sources[s]} -> ${top.map((c) => `${targets[c[0]]}:${c[1].toFixed(2)}`).join(", ")}`);
}
const out = { t: targets, w: rows };
const outPath = resolve(root, "src/lib/meaning-neighbors.json");
writeFileSync(outPath, JSON.stringify(out));
if (process.argv.includes("--report")) writeFileSync(resolve(root, "scripts/.meaning-cache/report.txt"), report.join("\n"));
console.log(`[meaning] wrote ${outPath}: ${Object.keys(rows).length} source words with neighbors (threshold ${THRESHOLD}, k ${K})`);

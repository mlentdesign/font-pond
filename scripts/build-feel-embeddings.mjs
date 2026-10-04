// Build-time step for "search by feel".
// Embeds one text per font with Xenova/all-MiniLM-L6-v2 (same model the browser loads),
// int8-quantizes the vectors and writes them under public/feel/.
// Skips work when the input texts have not changed, so CI never needs the model
// unless fonts changed and the committed files are stale.
import { createServer } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/feel");
const MODEL = "Xenova/all-MiniLM-L6-v2";
const force = process.argv.includes("--force");

const vite = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { "@": resolve(root, "src") } },
  optimizeDeps: { noDiscovery: true },
});

try {
  const { fonts } = await vite.ssrLoadModule("/src/data/fonts.ts");
  const { fontFeelText, simpleDigest } = await vite.ssrLoadModule("/src/lib/feel/text.ts");

  const slugs = fonts.map((f) => f.slug);
  const texts = fonts.map((f) => fontFeelText(f));
  const digest = simpleDigest(MODEL + "\n" + slugs.join("|") + "\n" + texts.join("\n"));

  const metaPath = resolve(outDir, "feel-meta.json");
  if (!force && existsSync(metaPath)) {
    const old = JSON.parse(readFileSync(metaPath, "utf8"));
    if (old.digest === digest && existsSync(resolve(outDir, "feel-vectors.bin"))) {
      console.log(`[feel] embeddings up to date (${slugs.length} fonts), skipping`);
      process.exit(0);
    }
  }

  console.log(`[feel] embedding ${slugs.length} fonts with ${MODEL} ...`);
  const { pipeline } = await import("@huggingface/transformers");
  const extractor = await pipeline("feature-extraction", MODEL, { dtype: "q8" });

  const DIM = 384;
  const data = new Int8Array(slugs.length * DIM);
  const BATCH = 32;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const out = await extractor(batch, { pooling: "mean", normalize: true });
    const arr = out.data; // Float32Array, batch*DIM, unit length
    for (let j = 0; j < batch.length; j++) {
      for (let k = 0; k < DIM; k++) {
        // unit vector components are in [-1,1]; scale so int8 covers the usable range
        data[(i + j) * DIM + k] = Math.max(-127, Math.min(127, Math.round(arr[j * DIM + k] * 127)));
      }
    }
    if ((i / BATCH) % 10 === 0) console.log(`[feel] ${i + batch.length}/${texts.length}`);
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "feel-vectors.bin"), Buffer.from(data.buffer));
  writeFileSync(metaPath, JSON.stringify({ model: MODEL, dim: DIM, scale: 127, count: slugs.length, digest, slugs }));
  console.log(`[feel] wrote ${(data.byteLength / 1024).toFixed(0)} KB of vectors`);
} finally {
  await vite.close();
}

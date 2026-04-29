"use client";

import { useRef, useState } from "react";
import { RENDER_METRICS } from "@/data/gf-render-metrics";
import { fontsBySlug } from "@/data/fonts";
import { loadFont } from "@/lib/fonts";

const HEADLINE    = "The quick brown fox jumps over the lazy dog";
const SPEC_STRING = "Aa Bb Cc Dd Ee Ff";
const FONT_SIZE   = 100;

// Tolerance: if measured extent AND ascent both fall within this many canvas-px
// of a known system fallback, the font didn't load. Requiring BOTH to match means
// a real font would have to be a near-perfect clone of a system font to be missed.
const FALLBACK_TOLERANCE_PX = 4;

// System fonts to use as fallback baselines.
const SYSTEM_FONTS = ["system-ui", "sans-serif", "serif", "monospace"];

// Weights to try when 600 fails — record whichever is measurably different from all fallbacks.
const WEIGHTS_TO_TRY = [600, 400, 700];

type Status = "idle" | "loading-css" | "running" | "done" | "saving" | "saved" | "error";
type Baseline = { extent: number; ascent: number };
type Metrics = { ascent: number; specExtent: number };

function getBasePath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.replace(/\/measure-fonts(\/.*)?$/, "");
}

async function buildSlugToFamily(basePath: string): Promise<Record<string, string>> {
  const link = document.querySelector('link[href*="fonts.css"]') as HTMLLinkElement | null;
  const url = link?.href ?? `${window.location.origin}${basePath}/fonts/fonts.css`;
  const css = await (await fetch(url)).text();
  const map: Record<string, string> = {};
  for (const block of css.split("@font-face")) {
    const fam = block.match(/font-family:\s*"([^"]+)"/);
    const src = block.match(/url\("\.\/([^"]+)\.woff2"\)/);
    if (fam && src) map[src[1]] = fam[1];
  }
  return map;
}

// Check whether a canvas measurement matches any known system fallback.
// Requires BOTH extent AND ascent to match — a real font virtually never matches
// a system font on both dimensions simultaneously.
function isFallback(ext: number, asc: number, baselines: Baseline[]): boolean {
  return baselines.some(b =>
    Math.abs(ext - b.extent) < FALLBACK_TOLERANCE_PX &&
    Math.abs(asc - b.ascent) < FALLBACK_TOLERANCE_PX
  );
}

async function measureFont(
  slug: string,
  ctx: CanvasRenderingContext2D,
  basePath: string,
  slugToFamily: Record<string, string>,
  baselines: Baseline[],
): Promise<Metrics | null> {
  // Try to measure at each weight. Returns the first result that differs from all system fallbacks.
  const tryMeasure = (cssFontBase: string): Metrics | null => {
    for (const w of WEIGHTS_TO_TRY) {
      ctx.font = `${w} ${FONT_SIZE}px ${cssFontBase}`;
      const ext = ctx.measureText(SPEC_STRING).actualBoundingBoxRight;
      const asc = ctx.measureText(HEADLINE).actualBoundingBoxAscent;
      if (ext <= 0 || asc <= 0) continue;
      if (!isFallback(ext, asc, baselines)) {
        // Got a real measurement — normalise: record extent at 600 weight.
        // If we're not at 600, re-measure at 600 to record the correct weight-600 extent.
        let finalExt = ext;
        if (w !== 600) {
          ctx.font = `600 ${FONT_SIZE}px ${cssFontBase}`;
          const ext600 = ctx.measureText(SPEC_STRING).actualBoundingBoxRight;
          // Only use the 600-weight value if it also differs from fallbacks.
          // (If 600 is synthesised faux-bold it should differ; if not, keep what we measured.)
          if (ext600 > 0 && !isFallback(ext600, asc, baselines)) finalExt = ext600;
        }
        return {
          ascent:     Math.round((asc      / FONT_SIZE) * 1000) / 1000,
          specExtent: Math.round((finalExt / FONT_SIZE) * 1000) / 1000,
        };
      }
    }
    return null;
  };

  // Poll at 50ms intervals until the canvas renders the font (not any fallback), or timeout.
  const pollUntilLoaded = async (cssFontBase: string, timeoutMs: number): Promise<Metrics | null> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const result = tryMeasure(cssFontBase);
      if (result !== null) return result;
      await new Promise(r => setTimeout(r, 50));
    }
    return null;
  };

  // Strategy 1: load .woff2 directly via FontFace API (self-hosted fonts)
  try {
    const alias = `__measure__${slug}`;
    const face = new FontFace(alias, `url(${basePath}/fonts/${slug}.woff2)`);
    await face.load();
    document.fonts.add(face);
    await document.fonts.ready;
    const result = await pollUntilLoaded(`"${alias}"`, 2000);
    document.fonts.delete(face);
    if (result !== null) return result;
  } catch {}

  // Strategy 2: the font's @font-face is already declared in fonts.css
  const cssFamily = slugToFamily[slug];
  if (cssFamily) {
    try {
      await document.fonts.load(`600 ${FONT_SIZE}px "${cssFamily}"`);
      const result = await pollUntilLoaded(`"${cssFamily}"`, 2000);
      if (result !== null) return result;
    } catch {}
  }

  // Strategy 3: CDN font — loadFont() injects the <link>, then we poll until it renders.
  // CDN fonts get up to 10s; the dual-metric check means we won't record a fallback.
  const font = fontsBySlug.get(slug);
  if (font && !cssFamily) {
    try {
      loadFont(font);
      const result = await pollUntilLoaded(`"${font.name}"`, 10000);
      if (result !== null) return result;
    } catch {}
  }

  return null;
}

export default function MeasureFontsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus]     = useState<Status>("idle");
  const [done, setDone]         = useState(0);
  const [captured, setCaptured] = useState(0);
  const [results, setResults]   = useState<Record<string, Metrics>>({});
  const [errorMsg, setErrorMsg] = useState("");

  const slugs = Object.keys(RENDER_METRICS);

  async function start() {
    setStatus("loading-css");
    const basePath     = getBasePath();
    const slugToFamily = await buildSlugToFamily(basePath);
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    // Measure all system fallbacks once — extent + ascent pair for each.
    // A font must match BOTH metrics of at least one baseline to be rejected.
    const baselines: Baseline[] = SYSTEM_FONTS.map(f => {
      ctx.font = `600 ${FONT_SIZE}px ${f}`;
      return {
        extent: ctx.measureText(SPEC_STRING).actualBoundingBoxRight,
        ascent: ctx.measureText(HEADLINE).actualBoundingBoxAscent,
      };
    });

    const out: Record<string, Metrics> = {};
    let i = 0;

    setStatus("running");

    for (const slug of slugs) {
      const result = await measureFont(slug, ctx, basePath, slugToFamily, baselines);
      if (result !== null) out[slug] = result;
      i++;
      if (i % 5 === 0) { setDone(i); setCaptured(Object.keys(out).length); }
      if (i % 20 === 0) await new Promise(r => setTimeout(r, 0));
    }

    setDone(slugs.length);
    setCaptured(Object.keys(out).length);
    setResults(out);
    setStatus("done");
  }

  async function save() {
    setStatus("saving");
    const basePath = getBasePath();
    try {
      const res = await fetch(`${window.location.origin}${basePath}/api/save-browser-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results),
      });
      if (res.ok) {
        setStatus("saved");
      } else {
        setErrorMsg(`Server returned ${res.status} — make sure you're on localhost`);
        setStatus("error");
      }
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  const missed = done - captured;

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", maxWidth: "640px", margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Font Browser Metrics</h1>
      <p style={{ color: "#666", marginBottom: "8px" }}>
        Loads each font and measures actual browser-rendered ink via Canvas.
        Uses extent + cap-height together to detect fallbacks — a real font must differ
        from system-ui on at least one dimension. Tries weights 600 → 400 → 700.
      </p>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
        Run at <strong>localhost:3737</strong> only. CDN fonts get up to 10s each —
        expect <strong>20–40 minutes</strong> total.
      </p>

      <canvas ref={canvasRef} width={2000} height={200}
        style={{ position: "fixed", top: "-9999px", left: "-9999px" }} />

      {status === "idle" && (
        <button onClick={start}
          style={{ padding: "12px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>
          Start ({slugs.length} fonts)
        </button>
      )}

      {(status === "loading-css" || status === "running") && (
        <div>
          <p style={{ marginBottom: "4px" }}>
            {status === "loading-css"
              ? "Loading font index…"
              : `Measuring… ${done} / ${slugs.length}`}
          </p>
          {status === "running" && (
            <p style={{ marginBottom: "8px", color: "#090", fontSize: "14px" }}>
              Captured: {captured} &nbsp;·&nbsp; Missed so far: {missed}
            </p>
          )}
          <progress value={done} max={slugs.length} style={{ width: "100%", height: "8px" }} />
        </div>
      )}

      {status === "done" && (
        <div>
          <p style={{ color: "#090", marginBottom: "4px" }}>
            ✓ Captured {Object.keys(results).length} of {slugs.length} fonts
          </p>
          {missed > 0 && (
            <p style={{ color: "#c60", fontSize: "14px", marginBottom: "16px" }}>
              {missed} fonts returned null — no local file and CDN timed out, or
              truly indistinguishable from all system fallbacks.
            </p>
          )}
          {missed === 0 && (
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
              All fonts captured.
            </p>
          )}
          <button onClick={save}
            style={{ padding: "12px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>
            Save results
          </button>
        </div>
      )}

      {status === "saving" && <p>Saving…</p>}

      {status === "saved" && (
        <div>
          <p style={{ color: "#090", marginBottom: "16px" }}>
            ✓ Saved {Object.keys(results).length} entries.
          </p>
          <p>Come back to the chat — I'll run the rebuild from there.</p>
        </div>
      )}

      {status === "error" && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
    </div>
  );
}

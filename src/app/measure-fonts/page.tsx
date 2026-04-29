"use client";

import { useRef, useState } from "react";
import { RENDER_METRICS } from "@/data/gf-render-metrics";
import { fontsBySlug } from "@/data/fonts";
import { loadFont } from "@/lib/fonts";

const HEADLINE    = "The quick brown fox jumps over the lazy dog";
const SPEC_STRING = "Aa Bb Cc Dd Ee Ff";
const FONT_SIZE   = 100;

// If the measured extent is within this many canvas-px of system-ui, the font
// didn't load in time and the canvas fell back to the system font. Discard it.
const FALLBACK_TOLERANCE_PX = 5;

type Status = "idle" | "loading-css" | "running" | "done" | "saving" | "saved" | "error";

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

type Metrics = { ascent: number; specExtent: number };

async function measureFont(
  slug: string,
  ctx: CanvasRenderingContext2D,
  basePath: string,
  slugToFamily: Record<string, string>,
  sysExtent: number,
): Promise<Metrics | null> {
  // Measure using the given CSS family string. Returns null if:
  // - extent is zero (font not active in canvas yet)
  // - extent is within FALLBACK_TOLERANCE_PX of system-ui (canvas used the fallback font)
  const tryMeasure = (cssFont: string): Metrics | null => {
    ctx.font = cssFont;
    const ext = ctx.measureText(SPEC_STRING).actualBoundingBoxRight;
    if (ext <= 0) return null;
    if (Math.abs(ext - sysExtent) < FALLBACK_TOLERANCE_PX) return null;
    const ascent = ctx.measureText(HEADLINE).actualBoundingBoxAscent;
    if (ascent <= 0) return null;
    return {
      ascent:     Math.round((ascent / FONT_SIZE) * 1000) / 1000,
      specExtent: Math.round((ext    / FONT_SIZE) * 1000) / 1000,
    };
  };

  // Poll at 50ms intervals until the canvas renders the font (not the fallback), or timeout.
  const pollUntilLoaded = async (cssFont: string, timeoutMs: number): Promise<Metrics | null> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const result = tryMeasure(cssFont);
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
    const result = await pollUntilLoaded(`600 ${FONT_SIZE}px "${alias}"`, 2000);
    document.fonts.delete(face);
    if (result !== null) return result;
  } catch {}

  // Strategy 2: the font's @font-face is already declared in fonts.css
  const cssFamily = slugToFamily[slug];
  if (cssFamily) {
    try {
      await document.fonts.load(`600 ${FONT_SIZE}px "${cssFamily}"`);
      const result = await pollUntilLoaded(`600 ${FONT_SIZE}px "${cssFamily}"`, 2000);
      if (result !== null) return result;
    } catch {}
  }

  // Strategy 3: CDN font (Google Fonts / Fontshare) — needs time to download.
  // loadFont() injects the CDN <link>; we then poll the canvas until the font renders.
  // CDN fonts get up to 10s — enough for slow connections without hanging indefinitely.
  const font = fontsBySlug.get(slug);
  if (font && !cssFamily) {
    try {
      loadFont(font);
      const result = await pollUntilLoaded(`600 ${FONT_SIZE}px "${font.name}"`, 10000);
      if (result !== null) return result;
    } catch {}
  }

  return null;
}

export default function MeasureFontsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus]       = useState<Status>("idle");
  const [done, setDone]           = useState(0);
  const [captured, setCaptured]   = useState(0);
  const [results, setResults]     = useState<Record<string, Metrics>>({});
  const [errorMsg, setErrorMsg]   = useState("");

  const slugs = Object.keys(RENDER_METRICS);

  async function start() {
    setStatus("loading-css");
    const basePath    = getBasePath();
    const slugToFamily = await buildSlugToFamily(basePath);
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    // Measure system-ui once as fallback baseline. Any font measurement within
    // FALLBACK_TOLERANCE_PX of this value used the system fallback, not the real font.
    ctx.font = `600 ${FONT_SIZE}px system-ui`;
    const sysExtent = ctx.measureText(SPEC_STRING).actualBoundingBoxRight;

    const out: Record<string, Metrics> = {};
    let i = 0;

    setStatus("running");

    for (const slug of slugs) {
      const result = await measureFont(slug, ctx, basePath, slugToFamily, sysExtent);
      if (result !== null) out[slug] = result;
      i++;
      if (i % 5 === 0) { setDone(i); setCaptured(Object.keys(out).length); }
      // Yield to browser every 20 fonts to keep the UI responsive
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

  const missed = slugs.length - captured;

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", maxWidth: "640px", margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Font Browser Metrics</h1>
      <p style={{ color: "#666", marginBottom: "8px" }}>
        Loads each font and measures actual browser-rendered ink via Canvas at weight 600.
        Polls at 50ms intervals until the canvas result diverges from system-ui — guaranteeing
        the real font is rendering before we record anything.
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
              Captured: {captured} &nbsp;·&nbsp; Missed so far: {done - captured}
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
              {missed} fonts returned null — either they have no local or CDN file,
              or they couldn't diverge from system-ui within the timeout.
            </p>
          )}
          {missed === 0 && (
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
              All fonts captured successfully.
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

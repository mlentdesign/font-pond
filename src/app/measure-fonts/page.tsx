"use client";

import { useRef, useState } from "react";
import { RENDER_METRICS } from "@/data/gf-render-metrics";
import { fontsBySlug } from "@/data/fonts";
import { loadFont, waitForFonts } from "@/lib/fonts";

const HEADLINE   = "The quick brown fox jumps over the lazy dog";
const SPEC_STRING = "Aa Bb Cc Dd Ee Ff";
const FONT_SIZE  = 100;

type Status = "idle" | "loading-css" | "running" | "done" | "saving" | "saved" | "error";

// Derive basePath from current URL — works in both dev and production.
function getBasePath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.replace(/\/measure-fonts(\/.*)?$/, "");
}

// Parse fonts.css to build slug → CSS family name map for self-hosted fonts.
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
  slugToFamily: Record<string, string>
): Promise<Metrics | null> {
  const measure = (family: string): Metrics | null => {
    ctx.font = `${FONT_SIZE}px "${family}"`;
    const mAscent = ctx.measureText(HEADLINE);
    const mSpec   = ctx.measureText(SPEC_STRING);
    if (mAscent.actualBoundingBoxAscent <= 0 || mSpec.actualBoundingBoxRight <= 0) return null;
    return {
      ascent:     Math.round((mAscent.actualBoundingBoxAscent / FONT_SIZE) * 1000) / 1000,
      specExtent: Math.round((mSpec.actualBoundingBoxRight    / FONT_SIZE) * 1000) / 1000,
    };
  };

  // Strategy 1: load .woff2 directly via FontFace API
  try {
    const alias = `__measure__${slug}`;
    const face = new FontFace(alias, `url(${basePath}/fonts/${slug}.woff2)`);
    await face.load();
    document.fonts.add(face);
    await new Promise(r => setTimeout(r, 10));
    const result = measure(alias);
    document.fonts.delete(face);
    if (result !== null) return result;
  } catch {}

  // Strategy 2: the font's @font-face is already declared in fonts.css (in the page head).
  // Use document.fonts.load() with the real family name — bypasses FontFace constructor.
  const cssFamily = slugToFamily[slug];
  if (cssFamily) {
    try {
      await document.fonts.load(`${FONT_SIZE}px "${cssFamily}"`);
      const result = measure(cssFamily);
      if (result !== null) return result;
    } catch {}
  }

  // Strategy 3: font has no local file — load via CDN using the existing loadFont() logic,
  // which dynamically constructs the CDN URL from the font name at runtime.
  const font = fontsBySlug.get(slug);
  if (font && !cssFamily) {
    try {
      loadFont(font);
      await waitForFonts([font.name]);
      const result = measure(font.name);
      if (result !== null) return result;
    } catch {}
  }

  return null;
}

export default function MeasureFontsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [done, setDone] = useState(0);
  const [results, setResults] = useState<Record<string, Metrics>>({});
  const [errorMsg, setErrorMsg] = useState("");

  const slugs = Object.keys(RENDER_METRICS);

  async function start() {
    setStatus("loading-css");
    const basePath = getBasePath();
    const slugToFamily = await buildSlugToFamily(basePath);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const out: Record<string, Metrics> = {};
    let i = 0;

    setStatus("running");

    for (const slug of slugs) {
      const result = await measureFont(slug, ctx, basePath, slugToFamily);
      if (result !== null) out[slug] = result;
      i++;
      if (i % 5 === 0) setDone(i);
      if (i % 50 === 0) await new Promise(r => setTimeout(r, 0));
    }

    setDone(slugs.length);
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

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", maxWidth: "640px", margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Font Browser Metrics</h1>
      <p style={{ color: "#666", marginBottom: "8px" }}>
        Loads each font and measures actual browser-rendered ink position via Canvas.
        Tries local file first, then CSS font-face fallback, then CDN.
      </p>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
        Run at <strong>localhost:3737</strong> only. Takes ~5–10 minutes.
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
          <p style={{ marginBottom: "8px" }}>
            {status === "loading-css" ? "Loading font index…" : `Measuring… ${done} / ${slugs.length}`}
          </p>
          <progress value={done} max={slugs.length} style={{ width: "100%", height: "8px" }} />
        </div>
      )}

      {status === "done" && (
        <div>
          <p style={{ color: "#090", marginBottom: "16px" }}>
            ✓ Measured {Object.keys(results).length} of {slugs.length} fonts
          </p>
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

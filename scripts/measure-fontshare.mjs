#!/usr/bin/env node
/**
 * Measure Fontshare fonts from local ~/Library/Fonts and Google Fonts cache.
 * Outputs JSON that can be used to update all-fontshare-fonts.ts.
 */

import opentype from "opentype.js";
import fs from "fs";
import path from "path";

const USER_FONTS = path.join(process.env.HOME, "Library/Fonts");
const GF_CACHE = path.join(process.cwd(), ".font-cache");

const FS_CACHE = path.join(process.cwd(), ".font-cache", "fontshare");
if (!fs.existsSync(FS_CACHE)) fs.mkdirSync(FS_CACHE, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function findFontFile(slug) {
  // Try local files
  const variations = [
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("") + "-Regular.otf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("") + "-Regular.ttf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("-") + "-Regular.otf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("-") + "-Regular.ttf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("") + ".otf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("") + ".ttf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("") + "-Variable.ttf",
    slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("-") + "-Variable.ttf",
  ];

  for (const v of variations) {
    const fp = path.join(USER_FONTS, v);
    if (fs.existsSync(fp)) return fp;
  }

  // Check GF cache
  const gfPath = path.join(GF_CACHE, slug + ".ttf");
  if (fs.existsSync(gfPath)) return gfPath;

  // Check Fontshare cache
  const fsPath = path.join(FS_CACHE, slug + ".ttf");
  if (fs.existsSync(fsPath)) return fsPath;

  return null;
}

async function downloadFromFontshare(slug) {
  const cached = path.join(FS_CACHE, slug + ".ttf");
  if (fs.existsSync(cached)) return cached;

  try {
    const cssUrl = `https://api.fontshare.com/v2/css?f[]=${slug}@400&display=swap`;
    const res = await fetch(cssUrl);
    if (!res.ok) return null;
    const css = await res.text();

    const ttfMatch = css.match(/url\('([^']+\.ttf)'\)/i);
    if (!ttfMatch) return null;

    const fontUrl = "https:" + ttfMatch[1];
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) return null;

    const buf = Buffer.from(await fontRes.arrayBuffer());
    if (buf.length < 100) return null;

    fs.writeFileSync(cached, buf);
    return cached;
  } catch {
    return null;
  }
}

// Measurement functions (same as measure-fonts.mjs)
function measureXHeightRatio(font) {
  const os2 = font.tables?.os2;
  if (os2?.sxHeight && os2?.sCapHeight && os2.sCapHeight > 0) {
    const ratio = os2.sxHeight / os2.sCapHeight;
    if (ratio < 0.62) return "low";
    if (ratio > 0.74) return "high";
    return "moderate";
  }
  try {
    const xG = font.charToGlyph("x"), hG = font.charToGlyph("H");
    if (xG && hG) {
      const xB = xG.getBoundingBox(), hB = hG.getBoundingBox();
      if (hB.y2 > 0) { const r = xB.y2 / hB.y2; return r < 0.62 ? "low" : r > 0.74 ? "high" : "moderate"; }
    }
  } catch {}
  return null;
}

function measureStrokeContrast(font) {
  try {
    const oGlyph = font.charToGlyph("o") || font.charToGlyph("O");
    if (!oGlyph?.path || oGlyph.path.commands.length < 4) return null;
    const cmds = oGlyph.path.commands;
    if (cmds.filter(c => c.type === "M").length < 2) return "none";
    const contourPoints = [];
    let cur = [];
    for (const cmd of cmds) {
      if (cmd.type === "M") { if (cur.length) contourPoints.push(cur); cur = [{x:cmd.x,y:cmd.y}]; }
      else if (cmd.x !== undefined) {
        cur.push({x:cmd.x,y:cmd.y});
        if (cmd.x1 !== undefined) cur.push({x:cmd.x1,y:cmd.y1});
        if (cmd.x2 !== undefined) cur.push({x:cmd.x2,y:cmd.y2});
      }
    }
    if (cur.length) contourPoints.push(cur);
    if (contourPoints.length < 2) return "low";
    const bounds = contourPoints.map(pts => {
      const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
      return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};
    }).sort((a,b) => (b.maxX-b.minX)*(b.maxY-b.minY) - (a.maxX-a.minX)*(a.maxY-a.minY));
    const o = bounds[0], i = bounds[1];
    const hStrokes = [o.maxY-i.maxY, i.minY-o.minY].filter(v=>v>0);
    const vStrokes = [i.minX-o.minX, o.maxX-i.maxX].filter(v=>v>0);
    if (!hStrokes.length || !vStrokes.length) return "low";
    const avgH = hStrokes.reduce((a,b)=>a+b,0)/hStrokes.length;
    const avgV = vStrokes.reduce((a,b)=>a+b,0)/vStrokes.length;
    const ratio = Math.min(avgH,avgV) / Math.max(avgH,avgV);
    if (ratio > 0.85) return "none";
    if (ratio > 0.65) return "low";
    if (ratio > 0.35) return "moderate";
    return "high";
  } catch { return null; }
}

function measureLetterSpacing(font) {
  try {
    const upm = font.unitsPerEm;
    if (!upm) return null;
    let total = 0, count = 0;
    for (const ch of "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, 26)) {
      const g = font.charToGlyph(ch);
      if (g?.advanceWidth > 0) { total += g.advanceWidth; count++; }
    }
    if (count < 10) {
      for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        const g = font.charToGlyph(ch);
        if (g?.advanceWidth > 0) { total += g.advanceWidth; count++; }
      }
    }
    if (!count) return null;
    const ratio = (total / count) / upm;
    return ratio < 0.46 ? "tight" : ratio > 0.58 ? "generous" : "normal";
  } catch { return null; }
}

function getPathXIntersections(glyph, y) {
  const cmds = glyph.path.commands;
  const ints = [];
  let cx = 0, cy = 0;
  for (const cmd of cmds) {
    if (cmd.type === "M") { cx = cmd.x; cy = cmd.y; }
    else if (cmd.type === "L") {
      if (y >= Math.min(cy,cmd.y) && y < Math.max(cy,cmd.y)) {
        const t = (y-cy)/(cmd.y-cy);
        ints.push(cx + t*(cmd.x-cx));
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "C") {
      const x0=cx,y0=cy;
      for (let t=0;t<1;t+=0.01) {
        const t1=t+0.01;
        const ya=(1-t)**3*y0+3*(1-t)**2*t*cmd.y1+3*(1-t)*t**2*cmd.y2+t**3*cmd.y;
        const yb=(1-t1)**3*y0+3*(1-t1)**2*t1*cmd.y1+3*(1-t1)*t1**2*cmd.y2+t1**3*cmd.y;
        if (y>=Math.min(ya,yb)&&y<Math.max(ya,yb)) {
          const s=(y-ya)/(yb-ya), tm=t+s*0.01;
          ints.push((1-tm)**3*x0+3*(1-tm)**2*tm*cmd.x1+3*(1-tm)*tm**2*cmd.x2+tm**3*cmd.x);
        }
      }
      cx=cmd.x;cy=cmd.y;
    } else if (cmd.type === "Q") {
      const x0=cx,y0=cy;
      for (let t=0;t<1;t+=0.01) {
        const t1=t+0.01;
        const ya=(1-t)**2*y0+2*(1-t)*t*cmd.y1+t**2*cmd.y;
        const yb=(1-t1)**2*y0+2*(1-t1)*t1*cmd.y1+t1**2*cmd.y;
        if (y>=Math.min(ya,yb)&&y<Math.max(ya,yb)) {
          const s=(y-ya)/(yb-ya), tm=t+s*0.01;
          ints.push((1-tm)**2*x0+2*(1-tm)*tm*cmd.x1+tm**2*cmd.x);
        }
      }
      cx=cmd.x;cy=cmd.y;
    }
  }
  return ints.sort((a,b)=>a-b);
}

function measureApertureOpenness(font) {
  try {
    const cG = font.charToGlyph("c");
    if (!cG?.path || cG.path.commands.length < 4) return null;
    const bb = cG.getBoundingBox();
    const h=bb.y2-bb.y1, w=bb.x2-bb.x1;
    if (!h||!w) return null;
    const ints = getPathXIntersections(cG, (bb.y1+bb.y2)/2);
    if (!ints.length) return null;
    const midGap = (bb.x2 - Math.max(...ints)) / w;
    return midGap > 0.76 ? "open" : midGap < 0.65 ? "closed" : "moderate";
  } catch { return null; }
}

function deriveMoodCategory(classification, xH, sc) {
  const cls = (classification||"").toLowerCase();
  if (cls === "handwritten" || cls === "script") return sc === "high" || sc === "moderate" ? "elegant" : "warm";
  if (cls === "monospace") return "technical";
  if (cls === "display") return sc === "high" ? "elegant" : "bold";
  if (cls === "serif" || cls === "slab-serif") return sc === "high" ? "elegant" : sc === "moderate" ? "traditional" : "neutral";
  return "modern";
}

// Extract Fontshare font list
function extractFontshareList() {
  const content = fs.readFileSync(path.join(process.cwd(), "src/data/all-fontshare-fonts.ts"), "utf-8");
  const regex = /FONT_ANATOMY[^}]*\{([^}]+)\}/s;
  // Extract slug list from anatomy map
  const slugRegex = /"([a-z0-9-]+)":\s*\[/g;
  const slugs = [];
  let m;
  while ((m = slugRegex.exec(content)) !== null) slugs.push(m[1]);

  // Extract classification from fs() calls
  const fsRegex = /fs\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
  const defs = {};
  while ((m = fsRegex.exec(content)) !== null) {
    defs[m[2]] = m[3]; // slug → classification
  }

  return { slugs, defs };
}

async function main() {
  const { slugs, defs } = extractFontshareList();
  console.log(`Found ${slugs.length} Fontshare fonts in anatomy map`);

  const results = {};
  let measured = 0, notFound = 0;

  for (const slug of slugs) {
    let filePath = findFontFile(slug);
    const cls = defs[slug] || "sans-serif";

    // If not found locally, try downloading from Fontshare CDN
    if (!filePath) {
      filePath = await downloadFromFontshare(slug);
      if (filePath) {
        // Verify the local lookup now works
      } else {
        notFound++;
        results[slug] = { notFound: true };
        await sleep(100);
        continue;
      }
    }

    try {
      const fontData = fs.readFileSync(filePath);
      const font = opentype.parse(fontData.buffer);
      const xH = measureXHeightRatio(font);
      const sc = measureStrokeContrast(font);
      const sp = measureLetterSpacing(font);
      const ap = measureApertureOpenness(font);
      const mood = deriveMoodCategory(cls, xH, sc);

      results[slug] = {
        xHeightRatio: xH || "moderate",
        apertureOpenness: ap || "moderate",
        strokeContrast: sc || "low",
        letterSpacing: sp || "normal",
        moodCategory: mood || "neutral",
        source: filePath.includes("Library/Fonts") ? "local" : "gf-cache",
      };
      measured++;
    } catch (e) {
      results[slug] = { error: e.message };
      notFound++;
    }
  }

  const outputPath = path.join(process.cwd(), "scripts/measured-fontshare.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Measured: ${measured}, Not found: ${notFound}`);

  // Show not-found slugs
  const missing = Object.entries(results).filter(([,r]) => r.notFound || r.error).map(([s]) => s);
  if (missing.length) console.log("Missing:", missing.join(", "));
}

main().catch(console.error);

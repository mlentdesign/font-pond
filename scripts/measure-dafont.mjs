#!/usr/bin/env node
/**
 * DaFont Anatomy Measurement Script
 * Downloads DaFont fonts as ZIPs, extracts TTF/OTF, and measures anatomy.
 */

import opentype from "opentype.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CACHE_DIR = path.join(process.cwd(), ".font-cache", "dafont");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadDaFont(slug) {
  // Check if we already have a font file cached
  const existing = fs.readdirSync(CACHE_DIR).find(f =>
    f.startsWith(slug + ".") && (f.endsWith(".ttf") || f.endsWith(".otf"))
  );
  if (existing) return path.join(CACHE_DIR, existing);

  // Download name for DaFont — they use different slug formats
  // Try the slug directly, then with underscores, then without hyphens
  const variants = [
    slug,
    slug.replace(/-/g, "_"),
    slug.replace(/-/g, ""),
    slug.replace(/-/g, "+"),
  ];

  for (const name of variants) {
    try {
      const url = `https://dl.dafont.com/dl/?f=${name}`;
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) continue;

      const buf = Buffer.from(await res.arrayBuffer());
      // Check if it's a valid ZIP (PK header)
      if (buf[0] !== 0x50 || buf[1] !== 0x4B) continue;
      if (buf.length < 100) continue;

      // Save ZIP
      const zipPath = path.join(CACHE_DIR, `${slug}.zip`);
      fs.writeFileSync(zipPath, buf);

      // Extract using unzip
      const extractDir = path.join(CACHE_DIR, `${slug}_extract`);
      if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true });
      fs.mkdirSync(extractDir, { recursive: true });

      try {
        execSync(`unzip -o -j "${zipPath}" -d "${extractDir}" 2>/dev/null`, { stdio: "pipe" });
      } catch {
        continue;
      }

      // Find a TTF or OTF file — prefer Regular weight
      const files = fs.readdirSync(extractDir);
      const fontFiles = files.filter(f =>
        (f.toLowerCase().endsWith(".ttf") || f.toLowerCase().endsWith(".otf")) &&
        !f.startsWith("._")
      );

      if (fontFiles.length === 0) continue;

      // Prefer Regular weight
      const regular = fontFiles.find(f =>
        /regular/i.test(f) || /\-r\./i.test(f)
      ) || fontFiles.find(f =>
        !/bold|italic|light|thin|black|heavy|medium|semi/i.test(f)
      ) || fontFiles[0];

      const ext = regular.toLowerCase().endsWith(".otf") ? ".otf" : ".ttf";
      const destPath = path.join(CACHE_DIR, `${slug}${ext}`);
      fs.copyFileSync(path.join(extractDir, regular), destPath);

      // Cleanup
      fs.rmSync(extractDir, { recursive: true });
      fs.unlinkSync(zipPath);

      return destPath;
    } catch {}
  }
  return null;
}

// Import measurement functions from the main script
function measureXHeightRatio(font) {
  const os2 = font.tables?.os2;
  if (os2?.sxHeight && os2?.sCapHeight && os2.sCapHeight > 0) {
    const ratio = os2.sxHeight / os2.sCapHeight;
    if (ratio < 0.62) return "low";
    if (ratio > 0.74) return "high";
    return "moderate";
  }
  try {
    const xGlyph = font.charToGlyph("x");
    const hGlyph = font.charToGlyph("H");
    if (xGlyph && hGlyph) {
      const xBbox = xGlyph.getBoundingBox();
      const hBbox = hGlyph.getBoundingBox();
      if (hBbox.y2 > 0) {
        const ratio = xBbox.y2 / hBbox.y2;
        if (ratio < 0.62) return "low";
        if (ratio > 0.74) return "high";
        return "moderate";
      }
    }
  } catch {}
  return null;
}

function measureStrokeContrast(font) {
  try {
    const oGlyph = font.charToGlyph("o") || font.charToGlyph("O");
    if (!oGlyph || !oGlyph.path || oGlyph.path.commands.length < 4) return null;

    const commands = oGlyph.path.commands;
    const contours = commands.filter(c => c.type === "M").length;
    if (contours < 2) return "none";

    const contourPoints = [];
    let current = [];
    for (const cmd of commands) {
      if (cmd.type === "M") {
        if (current.length > 0) contourPoints.push(current);
        current = [{ x: cmd.x, y: cmd.y }];
      } else if (cmd.type === "L" || cmd.type === "Q" || cmd.type === "C") {
        current.push({ x: cmd.x, y: cmd.y });
        if (cmd.type === "Q") current.push({ x: cmd.x1, y: cmd.y1 });
        if (cmd.type === "C") {
          current.push({ x: cmd.x1, y: cmd.y1 });
          current.push({ x: cmd.x2, y: cmd.y2 });
        }
      }
    }
    if (current.length > 0) contourPoints.push(current);
    if (contourPoints.length < 2) return "low";

    const contourBounds = contourPoints.map(pts => {
      const xs = pts.map(p => p.x);
      const ys = pts.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    });
    contourBounds.sort((a, b) => {
      const areaA = (a.maxX - a.minX) * (a.maxY - a.minY);
      const areaB = (b.maxX - b.minX) * (b.maxY - b.minY);
      return areaB - areaA;
    });

    const outer = contourBounds[0];
    const inner = contourBounds[1];

    const topStroke = outer.maxY - inner.maxY;
    const bottomStroke = inner.minY - outer.minY;
    const leftStroke = inner.minX - outer.minX;
    const rightStroke = outer.maxX - inner.maxX;

    const h = [topStroke, bottomStroke].filter(v => v > 0);
    const v = [leftStroke, rightStroke].filter(v => v > 0);
    if (h.length === 0 || v.length === 0) return "low";

    const avgH = h.reduce((a, b) => a + b, 0) / h.length;
    const avgV = v.reduce((a, b) => a + b, 0) / v.length;
    const thin = Math.min(avgH, avgV);
    const thick = Math.max(avgH, avgV);
    if (thick === 0) return "none";
    const ratio = thin / thick;

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

    let totalAdvance = 0, count = 0;
    for (const ch of "abcdefghijklmnopqrstuvwxyz") {
      const glyph = font.charToGlyph(ch);
      if (glyph && glyph.advanceWidth > 0) { totalAdvance += glyph.advanceWidth; count++; }
    }
    if (count < 10) {
      for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        const glyph = font.charToGlyph(ch);
        if (glyph && glyph.advanceWidth > 0) { totalAdvance += glyph.advanceWidth; count++; }
      }
    }
    if (count === 0) return null;

    const ratio = (totalAdvance / count) / upm;
    if (ratio < 0.46) return "tight";
    if (ratio > 0.58) return "generous";
    return "normal";
  } catch { return null; }
}

function getPathXIntersections(glyph, y) {
  const cmds = glyph.path.commands;
  const intersections = [];
  let cx = 0, cy = 0;
  for (const cmd of cmds) {
    if (cmd.type === "M") { cx = cmd.x; cy = cmd.y; }
    else if (cmd.type === "L") {
      if (y >= Math.min(cy, cmd.y) && y < Math.max(cy, cmd.y)) {
        const t = (y - cy) / (cmd.y - cy);
        intersections.push(cx + t * (cmd.x - cx));
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "Q") {
      const x0 = cx, y0 = cy;
      for (let t = 0; t < 1; t += 0.01) {
        const t1 = t + 0.01;
        const ya = (1-t)**2*y0 + 2*(1-t)*t*cmd.y1 + t**2*cmd.y;
        const yb = (1-t1)**2*y0 + 2*(1-t1)*t1*cmd.y1 + t1**2*cmd.y;
        if (y >= Math.min(ya, yb) && y < Math.max(ya, yb)) {
          const s = (y - ya) / (yb - ya);
          const tm = t + s * 0.01;
          intersections.push((1-tm)**2*x0 + 2*(1-tm)*tm*cmd.x1 + tm**2*cmd.x);
        }
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "C") {
      const x0 = cx, y0 = cy;
      for (let t = 0; t < 1; t += 0.01) {
        const t1 = t + 0.01;
        const ya = (1-t)**3*y0 + 3*(1-t)**2*t*cmd.y1 + 3*(1-t)*t**2*cmd.y2 + t**3*cmd.y;
        const yb = (1-t1)**3*y0 + 3*(1-t1)**2*t1*cmd.y1 + 3*(1-t1)*t1**2*cmd.y2 + t1**3*cmd.y;
        if (y >= Math.min(ya, yb) && y < Math.max(ya, yb)) {
          const s = (y - ya) / (yb - ya);
          const tm = t + s * 0.01;
          intersections.push((1-tm)**3*x0 + 3*(1-tm)**2*tm*cmd.x1 + 3*(1-tm)*tm**2*cmd.x2 + tm**3*cmd.x);
        }
      }
      cx = cmd.x; cy = cmd.y;
    }
  }
  return intersections.sort((a, b) => a - b);
}

function measureApertureOpenness(font) {
  try {
    const cGlyph = font.charToGlyph("c");
    if (!cGlyph || !cGlyph.path || cGlyph.path.commands.length < 4) return null;
    const bbox = cGlyph.getBoundingBox();
    const h = bbox.y2 - bbox.y1;
    const w = bbox.x2 - bbox.x1;
    if (h === 0 || w === 0) return null;
    const midY = (bbox.y1 + bbox.y2) / 2;
    const ints = getPathXIntersections(cGlyph, midY);
    if (ints.length === 0) return null;
    const rightmostInk = Math.max(...ints);
    const midGap = (bbox.x2 - rightmostInk) / w;
    if (midGap > 0.76) return "open";
    if (midGap < 0.65) return "closed";
    return "moderate";
  } catch { return null; }
}

function deriveMoodCategory(font, classification, xHeight, strokeContrast, aperture) {
  if (!classification) return "neutral";
  const cls = classification.toLowerCase();
  if (cls === "handwritten" || cls === "script") {
    if (strokeContrast === "high" || strokeContrast === "moderate") return "elegant";
    return "warm";
  }
  if (cls === "monospace") return "technical";
  if (cls === "display") {
    if (strokeContrast === "high") return "elegant";
    return "bold";
  }
  if (cls === "serif" || cls === "slab-serif") {
    if (strokeContrast === "high") return "elegant";
    if (strokeContrast === "moderate") return "traditional";
    return "neutral";
  }
  if (cls === "sans-serif") return "modern";
  return "neutral";
}

// ── Extract DaFont slugs from the source ──

function extractDaFontSlugs() {
  const content = fs.readFileSync(path.join(process.cwd(), "src/data/dafont-fonts.ts"), "utf-8");
  // Match all anatomy map entries
  const regex = /"([a-z0-9-]+)":\s*\[/g;
  const slugs = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  // Also get classification from the dafont() calls
  const fontDefs = {};
  const defRegex = /dafont\(\s*"([^"]+)",\s*"([^"]+)"/g;
  while ((match = defRegex.exec(content)) !== null) {
    const name = match[1];
    const cls = match[2];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    fontDefs[slug] = cls;
  }

  return { slugs, fontDefs };
}

async function main() {
  const { slugs, fontDefs } = extractDaFontSlugs();
  console.log(`Found ${slugs.length} DaFont fonts to measure`);

  const results = {};
  let measured = 0, failed = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const classification = fontDefs[slug] || "display";

    const filePath = await downloadDaFont(slug);
    if (filePath) {
      try {
        const fontData = fs.readFileSync(filePath);
        const font = opentype.parse(fontData.buffer);
        const xH = measureXHeightRatio(font);
        const sc = measureStrokeContrast(font);
        const sp = measureLetterSpacing(font);
        const ap = measureApertureOpenness(font);
        const mood = deriveMoodCategory(font, classification, xH, sc, ap);

        results[slug] = {
          xHeightRatio: xH || "moderate",
          apertureOpenness: ap || "moderate",
          strokeContrast: sc || "low",
          letterSpacing: sp || "normal",
          moodCategory: mood || "neutral",
          measured: true,
        };
        measured++;
      } catch (e) {
        results[slug] = { failed: true, error: e.message };
        failed++;
      }
    } else {
      results[slug] = { failed: true, error: "download failed" };
      failed++;
    }

    if ((i + 1) % 20 === 0 || i === slugs.length - 1) {
      console.log(`Progress: ${i + 1}/${slugs.length} (${measured} measured, ${failed} failed)`);
    }

    // Rate limit
    await sleep(100);
  }

  const outputPath = path.join(process.cwd(), "scripts/measured-dafont.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outputPath}`);
  console.log(`Measured: ${measured}, Failed: ${failed}`);
}

main().catch(console.error);

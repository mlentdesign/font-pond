#!/usr/bin/env node
/**
 * Font Render Metrics Measurement Script — covers Google Fonts, DaFont, and FontShare
 *
 * Reads cached font files and measures rendering-relevant properties:
 * - specAdvance:   total advance of "Aa Bb Cc Dd Ee Ff" / UPM  (specimen string)
 * - upperAdvance:  total advance of A–Z / UPM
 * - lowerAdvance:  total advance of a–z / UPM
 * - numsAdvance:   total advance of 0–9 / UPM
 * - ascentRatio:   max ink y2 across "AaBbCcDdEeFf" / UPM  (tallest ascenders)
 * - descentRatio:  max ink depth below baseline across "gpqyjQ" / UPM
 *
 * bigSize = Math.floor(sectionWidth / specAdvance)  — no canvas or font-load wait needed
 *
 * Output: scripts/measured-render-metrics.json
 * Then run: node scripts/build-render-metrics.mjs  →  src/data/gf-render-metrics.ts
 */

import opentype from "opentype.js";
import fs from "fs";
import path from "path";

const GF_CACHE    = path.join(process.cwd(), ".font-cache");
const DF_CACHE    = path.join(process.cwd(), ".font-cache", "dafont");
const FS_CACHE    = path.join(process.cwd(), ".font-cache", "fontshare");
const SPEC_STRING = "Aa Bb Cc Dd Ee Ff";

// ── Font file finders ──

function findGoogleFontFile(slug) {
  const p = path.join(GF_CACHE, `${slug}.ttf`);
  return fs.existsSync(p) ? p : null;
}

function findDaFontFile(slug) {
  if (!fs.existsSync(DF_CACHE)) return null;
  // Try exact slug with hyphens and underscores
  for (const ext of [".ttf", ".otf"]) {
    const direct = path.join(DF_CACHE, slug + ext);
    if (fs.existsSync(direct)) return direct;
    const underscored = path.join(DF_CACHE, slug.replace(/-/g, "_") + ext);
    if (fs.existsSync(underscored)) return underscored;
  }
  // Normalize and scan directory
  const slugNorm = slug.replace(/[-_]/g, "").toLowerCase();
  const files = fs.readdirSync(DF_CACHE);
  const match = files.find(f => {
    if (!f.match(/\.(ttf|otf)$/i)) return false;
    const base = f.replace(/\.(ttf|otf)$/i, "").replace(/[-_ ]/g, "").toLowerCase();
    return base === slugNorm;
  });
  return match ? path.join(DF_CACHE, match) : null;
}

function findFontShareFile(slug) {
  const p = path.join(FS_CACHE, `${slug}.ttf`);
  return fs.existsSync(p) ? p : null;
}

// ── Measurement ──

function measureRenderMetrics(font) {
  const upm = font.unitsPerEm;
  if (!upm) return null;

  function totalAdvance(str, fallbackRatio = 0.5) {
    let total = 0;
    for (const ch of str) {
      try {
        const g = font.charToGlyph(ch);
        total += g && g.advanceWidth > 0 ? g.advanceWidth : upm * fallbackRatio;
      } catch {
        total += upm * fallbackRatio;
      }
    }
    return total;
  }

  const specTotal  = totalAdvance(SPEC_STRING, 0.5);
  const upperTotal = totalAdvance("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 0.6);
  const lowerTotal = totalAdvance("abcdefghijklmnopqrstuvwxyz", 0.5);
  const numsTotal  = totalAdvance("0123456789", 0.55);

  // OS/2 declared clip bounds — what the browser uses for line-box layout
  const os2 = font.tables?.os2;
  const os2Asc  = (os2?.usWinAscent  || os2?.sTypoAscender  || upm * 0.8);
  const os2Desc = (os2?.usWinDescent || Math.abs(os2?.sTypoDescender || upm * 0.2));

  let maxY2 = 0;
  for (const ch of "AaBbCcDdEeFfTt") {
    try {
      const g = font.charToGlyph(ch);
      if (g) { const bb = g.getBoundingBox(); if (bb && bb.y2 > maxY2) maxY2 = bb.y2; }
    } catch {}
  }

  let minY1 = 0;
  for (const ch of "gpqyjQy") {
    try {
      const g = font.charToGlyph(ch);
      if (g) { const bb = g.getBoundingBox(); if (bb && bb.y1 < minY1) minY1 = bb.y1; }
    } catch {}
  }

  // Ink overflow beyond what the browser's OS/2 line box already accounts for.
  // These are the values we actually need for extra padding — NOT ascentRatio alone.
  const inkOverTop    = Math.max(0, maxY2 - os2Asc);
  const inkOverBottom = Math.max(0, Math.abs(minY1) - os2Desc);

  // Left side bearing: how far ink extends LEFT of the glyph origin.
  // Script fonts often have negative LSB (calligraphic lead-in strokes).
  let minX1 = 0;
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
    try {
      const g = font.charToGlyph(ch);
      if (g) { const bb = g.getBoundingBox(); if (bb && bb.x1 < minX1) minX1 = bb.x1; }
    } catch {}
  }
  const leftOverflow = Math.max(0, -minX1);

  const r = (n) => Math.round(n * 1000) / 1000;
  return {
    specAdvance:      r(specTotal  / upm),
    upperAdvance:     r(upperTotal / upm),
    lowerAdvance:     r(lowerTotal / upm),
    numsAdvance:      r(numsTotal  / upm),
    ascentRatio:      r(maxY2 > 0  ? maxY2  / upm : 0.72),
    descentRatio:     r(minY1 < 0  ? Math.abs(minY1) / upm : 0.22),
    inkOverTop:       r(inkOverTop    / upm),
    inkOverBottom:    r(inkOverBottom / upm),
    leftOverflow:     r(leftOverflow  / upm),
    os2AscentRatio:   r(os2Asc  / upm),
    os2DescentRatio:  r(os2Desc / upm),
  };
}

function measureFile(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const font = opentype.parse(data.buffer);
    return measureRenderMetrics(font);
  } catch {
    return null;
  }
}

// ── Font list extractors ──

function extractGoogleFonts() {
  const content = fs.readFileSync(path.join(process.cwd(), "src/data/all-google-fonts.ts"), "utf-8");
  const regex = /gf\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
  const fonts = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    fonts.push({ slug: match[1].toLowerCase().replace(/\s+/g, "-"), source: "google" });
  }
  return fonts;
}

function extractDaFontSlugs() {
  const content = fs.readFileSync(path.join(process.cwd(), "src/data/dafont-fonts.ts"), "utf-8");
  const regex = /"([a-z0-9][a-z0-9-]+)":\s*\[/g;
  const slugs = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs.map(slug => ({ slug, source: "dafont" }));
}

function extractFontShareSlugs() {
  const content = fs.readFileSync(path.join(process.cwd(), "src/data/all-fontshare-fonts.ts"), "utf-8");
  // fs("Name", "slug", ...)
  const regex = /fs\(\s*"[^"]+",\s*"([^"]+)"/g;
  const slugs = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs.map(slug => ({ slug, source: "fontshare" }));
}

// ── Run ──

async function main() {
  const gf = extractGoogleFonts();
  const df = extractDaFontSlugs();
  const fsh = extractFontShareSlugs();
  const all = [...gf, ...df, ...fsh];

  console.log(`Fonts to measure: ${gf.length} Google, ${df.length} DaFont, ${fsh.length} FontShare = ${all.length} total`);

  // Load existing results to preserve any previously measured entries
  const outputPath = path.join(process.cwd(), "scripts/measured-render-metrics.json");
  const results = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf-8")) : {};

  let measured = 0, skipped = 0, failed = 0;

  for (const { slug, source } of all) {
    let filePath = null;
    if (source === "google")    filePath = findGoogleFontFile(slug);
    else if (source === "dafont")    filePath = findDaFontFile(slug);
    else if (source === "fontshare") filePath = findFontShareFile(slug);

    if (!filePath) { failed++; continue; }

    const metrics = measureFile(filePath);
    if (metrics) {
      results[slug] = metrics;
      measured++;
    } else {
      failed++;
    }

    if ((measured + failed) % 200 === 0) {
      console.log(`  ${measured + failed}/${all.length}...`);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDone: ${measured} measured, ${failed} no file/parse error, ${skipped} skipped`);
  console.log(`Written to ${outputPath}`);
  console.log(`\nNext: node scripts/build-render-metrics.mjs`);
}

main().catch(console.error);

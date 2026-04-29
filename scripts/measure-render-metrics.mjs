#!/usr/bin/env node
/**
 * Font Render Metrics Measurement Script
 *
 * Reads cached font files and measures rendering-relevant properties:
 * - specAdvance:  total advance of "Aa Bb Cc Dd Ee Ff" / UPM  (specimen string)
 * - upperAdvance: total advance of A–Z / UPM
 * - lowerAdvance: total advance of a–z / UPM
 * - numsAdvance:  total advance of 0–9 / UPM
 * - ascentRatio:  max ink y2 across "AaBbCcDdEeFf" / UPM
 *
 * bigSize = Math.floor(sectionWidth / specAdvance)  — no canvas or font-load wait needed
 *
 * Output: scripts/measured-render-metrics.json
 * Then run: node scripts/build-render-metrics.mjs  →  src/data/gf-render-metrics.ts
 */

import opentype from "opentype.js";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".font-cache");
const SPEC_STRING = "Aa Bb Cc Dd Ee Ff";

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

  const specTotal = totalAdvance(SPEC_STRING, 0.5);
  const upperTotal = totalAdvance("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 0.6);
  const lowerTotal = totalAdvance("abcdefghijklmnopqrstuvwxyz", 0.5);
  const numsTotal = totalAdvance("0123456789", 0.55);

  let maxY2 = 0;
  for (const ch of "AaBbCcDdEeFf") {
    try {
      const g = font.charToGlyph(ch);
      if (g) {
        const bb = g.getBoundingBox();
        if (bb && bb.y2 > maxY2) maxY2 = bb.y2;
      }
    } catch {}
  }

  // Descent: depth below baseline for chars with descenders
  let minY1 = 0;
  for (const ch of "gpqyjQ") {
    try {
      const g = font.charToGlyph(ch);
      if (g) {
        const bb = g.getBoundingBox();
        if (bb && bb.y1 < minY1) minY1 = bb.y1;
      }
    } catch {}
  }

  const r = (n) => Math.round(n * 1000) / 1000;
  return {
    specAdvance: r(specTotal / upm),
    upperAdvance: r(upperTotal / upm),
    lowerAdvance: r(lowerTotal / upm),
    numsAdvance: r(numsTotal / upm),
    ascentRatio: r(maxY2 > 0 ? maxY2 / upm : 0.72),
    descentRatio: r(minY1 < 0 ? Math.abs(minY1) / upm : 0.22),
  };
}

function extractFontList() {
  const filePath = path.join(process.cwd(), "src/data/all-google-fonts.ts");
  const content = fs.readFileSync(filePath, "utf-8");
  const regex = /gf\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
  const fonts = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    fonts.push({
      name: match[1],
      googleFamily: match[2],
      classification: match[3],
      slug: match[1].toLowerCase().replace(/\s+/g, "-"),
    });
  }
  return fonts;
}

async function main() {
  const fonts = extractFontList();
  console.log(`Found ${fonts.length} fonts — measuring from cache...`);

  const results = {};
  let measured = 0;
  let failed = 0;

  for (const font of fonts) {
    const cached = path.join(CACHE_DIR, `${font.slug}.ttf`);
    if (!fs.existsSync(cached)) {
      failed++;
      continue;
    }

    try {
      const data = fs.readFileSync(cached);
      const parsed = opentype.parse(data.buffer);
      const metrics = measureRenderMetrics(parsed);
      if (metrics) {
        results[font.slug] = metrics;
        measured++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    if ((measured + failed) % 200 === 0) {
      console.log(`  ${measured + failed}/${fonts.length}...`);
    }
  }

  const outputPath = path.join(process.cwd(), "scripts/measured-render-metrics.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDone: ${measured} measured, ${failed} failed`);
  console.log(`Written to ${outputPath}`);
  console.log(`\nNext: node scripts/build-render-metrics.mjs`);
}

main().catch(console.error);

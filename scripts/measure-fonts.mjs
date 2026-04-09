#!/usr/bin/env node
/**
 * Font Anatomy Measurement Script
 *
 * Downloads Google Font files and measures real typographic properties:
 * - xHeightRatio: from OS/2 sxHeight / sCapHeight, or by measuring 'x' vs 'H' bounding boxes
 * - strokeContrast: ratio of thinnest to thickest stems in 'o', 'O', 'H'
 * - letterSpacing: average advance width relative to UPM
 * - apertureOpenness: estimated from the openness of 'c', 'e', 'a' counters
 * - moodCategory: derived from classification + measured properties (can't be measured directly)
 */

import opentype from "opentype.js";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".font-cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ── Helpers ──

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function downloadFont(familyName) {
  const slug = familyName.toLowerCase().replace(/\s+/g, "-");
  const cached = path.join(CACHE_DIR, `${slug}.ttf`);
  if (fs.existsSync(cached)) {
    return cached;
  }

  // Google Fonts CSS API — no user-agent header returns TTF format
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyName)}`;
  try {
    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) return null;
    const css = await cssRes.text();

    // Extract the first TTF URL from the CSS
    const urlMatch = css.match(/url\(([^)]+\.ttf)\)/i);
    if (!urlMatch) return null;

    const fontUrl = urlMatch[1];
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) return null;

    const buffer = Buffer.from(await fontRes.arrayBuffer());
    fs.writeFileSync(cached, buffer);
    return cached;
  } catch (e) {
    return null;
  }
}

function measureXHeightRatio(font) {
  // Method 1: OS/2 table metrics
  const os2 = font.tables?.os2;
  if (os2?.sxHeight && os2?.sCapHeight && os2.sCapHeight > 0) {
    const ratio = os2.sxHeight / os2.sCapHeight;
    if (ratio < 0.62) return "low";
    if (ratio > 0.74) return "high";
    return "moderate";
  }

  // Method 2: Measure actual glyphs
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
  // Measure stroke width variation by looking at horizontal vs vertical stems
  // We analyze the 'o' glyph — the ratio of thinnest to thickest part
  try {
    const oGlyph = font.charToGlyph("o") || font.charToGlyph("O");
    if (!oGlyph || !oGlyph.path || !oGlyph.path.commands || oGlyph.path.commands.length < 4) {
      return estimateStrokeContrastFromCategory(font);
    }

    // Sample the outline at multiple points to find min/max widths
    // We'll use a simpler approach: measure the bounding box proportions
    // and look at the path complexity
    const bbox = oGlyph.getBoundingBox();
    const width = bbox.x2 - bbox.x1;
    const height = bbox.y2 - bbox.y1;

    if (width === 0 || height === 0) return null;

    // For 'o', get the advance width and the internal counter
    // We'll walk the path to find horizontal and vertical extremes
    const commands = oGlyph.path.commands;

    // Count contours (moveTo commands) — 'o' should have 2 (outer + inner)
    const contours = commands.filter(c => c.type === "M").length;

    if (contours < 2) {
      // Likely a monoline font or very simple construction
      return "none";
    }

    // Separate outer and inner contour points
    const contourPoints = [];
    let current = [];
    for (const cmd of commands) {
      if (cmd.type === "M") {
        if (current.length > 0) contourPoints.push(current);
        current = [{ x: cmd.x, y: cmd.y }];
      } else if (cmd.type === "L" || cmd.type === "Q" || cmd.type === "C") {
        current.push({ x: cmd.x, y: cmd.y });
        // Add control points for curves
        if (cmd.type === "Q") current.push({ x: cmd.x1, y: cmd.y1 });
        if (cmd.type === "C") {
          current.push({ x: cmd.x1, y: cmd.y1 });
          current.push({ x: cmd.x2, y: cmd.y2 });
        }
      }
    }
    if (current.length > 0) contourPoints.push(current);

    if (contourPoints.length < 2) return "low";

    // Sort contours by bounding area — larger is outer
    const contourBounds = contourPoints.map(pts => {
      const xs = pts.map(p => p.x);
      const ys = pts.map(p => p.y);
      return {
        pts,
        minX: Math.min(...xs), maxX: Math.max(...xs),
        minY: Math.min(...ys), maxY: Math.max(...ys),
      };
    });
    contourBounds.sort((a, b) => {
      const areaA = (a.maxX - a.minX) * (a.maxY - a.minY);
      const areaB = (b.maxX - b.minX) * (b.maxY - b.minY);
      return areaB - areaA;
    });

    const outer = contourBounds[0];
    const inner = contourBounds[1];

    // Measure horizontal stroke (top of 'o'): distance between top of outer and top of inner
    const topStroke = outer.maxY - inner.maxY;
    const bottomStroke = inner.minY - outer.minY;
    // Measure vertical stroke (sides of 'o')
    const leftStroke = inner.minX - outer.minX;
    const rightStroke = outer.maxX - inner.maxX;

    const horizontals = [topStroke, bottomStroke].filter(v => v > 0);
    const verticals = [leftStroke, rightStroke].filter(v => v > 0);

    if (horizontals.length === 0 || verticals.length === 0) return "low";

    const avgH = horizontals.reduce((a, b) => a + b, 0) / horizontals.length;
    const avgV = verticals.reduce((a, b) => a + b, 0) / verticals.length;

    const thin = Math.min(avgH, avgV);
    const thick = Math.max(avgH, avgV);

    if (thick === 0) return "none";
    const ratio = thin / thick;

    // ratio close to 1 = no contrast, ratio close to 0 = extreme contrast
    // Calibrated: Inter=0.88→none, Roboto=0.82→low, Merriweather=0.49→mod, Lora=0.38→mod, Playfair=0.21→high
    if (ratio > 0.85) return "none";
    if (ratio > 0.65) return "low";
    if (ratio > 0.35) return "moderate";
    return "high";
  } catch {
    return null;
  }
}

function estimateStrokeContrastFromCategory(font) {
  return null; // Don't guess — return null so we know it wasn't measured
}

function measureLetterSpacing(font) {
  // Measure average advance width of lowercase letters relative to UPM
  try {
    const upm = font.unitsPerEm;
    if (!upm) return null;

    const testChars = "abcdefghijklmnopqrstuvwxyz";
    let totalAdvance = 0;
    let count = 0;

    for (const ch of testChars) {
      const glyph = font.charToGlyph(ch);
      if (glyph && glyph.advanceWidth > 0) {
        totalAdvance += glyph.advanceWidth;
        count++;
      }
    }

    if (count < 10) {
      // Try uppercase for display/all-caps fonts
      const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (const ch of upperChars) {
        const glyph = font.charToGlyph(ch);
        if (glyph && glyph.advanceWidth > 0) {
          totalAdvance += glyph.advanceWidth;
          count++;
        }
      }
    }

    if (count === 0) return null;

    const avgAdvance = totalAdvance / count;
    const ratio = avgAdvance / upm;

    // Typical values: tight ~0.42-0.48, normal ~0.48-0.58, generous ~0.58+
    if (ratio < 0.46) return "tight";
    if (ratio > 0.58) return "generous";
    return "normal";
  } catch {
    return null;
  }
}

function getPathXIntersections(glyph, y) {
  // Get all x-intercepts of the outline at a given y value
  const cmds = glyph.path.commands;
  const intersections = [];
  let cx = 0, cy = 0;

  for (const cmd of cmds) {
    if (cmd.type === "M") {
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "L") {
      const y1 = cy, y2 = cmd.y;
      if (y >= Math.min(y1, y2) && y < Math.max(y1, y2)) {
        const t = (y - y1) / (y2 - y1);
        intersections.push(cx + t * (cmd.x - cx));
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "Q") {
      const x0 = cx, y0 = cy;
      for (let t = 0; t < 1; t += 0.01) {
        const t1 = t + 0.01;
        const ya = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cmd.y1 + t * t * cmd.y;
        const yb = (1 - t1) * (1 - t1) * y0 + 2 * (1 - t1) * t1 * cmd.y1 + t1 * t1 * cmd.y;
        if (y >= Math.min(ya, yb) && y < Math.max(ya, yb)) {
          const s = (y - ya) / (yb - ya);
          const tm = t + s * 0.01;
          intersections.push((1 - tm) * (1 - tm) * x0 + 2 * (1 - tm) * tm * cmd.x1 + tm * tm * cmd.x);
        }
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "C") {
      const x0 = cx, y0 = cy;
      for (let t = 0; t < 1; t += 0.01) {
        const t1 = t + 0.01;
        const ya = (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * cmd.y1 + 3 * (1 - t) * t ** 2 * cmd.y2 + t ** 3 * cmd.y;
        const yb = (1 - t1) ** 3 * y0 + 3 * (1 - t1) ** 2 * t1 * cmd.y1 + 3 * (1 - t1) * t1 ** 2 * cmd.y2 + t1 ** 3 * cmd.y;
        if (y >= Math.min(ya, yb) && y < Math.max(ya, yb)) {
          const s = (y - ya) / (yb - ya);
          const tm = t + s * 0.01;
          intersections.push((1 - tm) ** 3 * x0 + 3 * (1 - tm) ** 2 * tm * cmd.x1 + 3 * (1 - tm) * tm ** 2 * cmd.x2 + tm ** 3 * cmd.x);
        }
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === "Z") {
      // ignore
    }
  }
  return intersections.sort((a, b) => a - b);
}

function measureApertureOpenness(font) {
  // Measure aperture by scanning the 'c' glyph at its vertical midpoint.
  // In 'c', the opening is on the right side. At the midpoint, if there's a large
  // gap between the rightmost ink and the glyph's right edge, the aperture is open.
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

    // The rightmost intersection at the midpoint is where the left wall of the 'c' ends.
    // Everything to the right of that is the open aperture.
    const rightmostInk = Math.max(...ints);
    const midGap = (bbox.x2 - rightmostInk) / w;

    // midGap values from calibration:
    // Open (Inter=0.81, Open Sans=0.79, Montserrat=0.85, Poppins=0.82)
    // Closed (Oswald=0.67, Abril Fatface=0.57)
    // Moderate (Playfair=0.76)
    if (midGap > 0.76) return "open";
    if (midGap < 0.65) return "closed";
    return "moderate";
  } catch {
    return null;
  }
}

function deriveMoodCategory(font, classification, xHeight, strokeContrast, aperture) {
  // Mood is subjective but we can make reasonable inferences from measurable properties
  // combined with the font's classification

  if (!classification) return "neutral";

  const cls = classification.toLowerCase();

  if (cls === "handwritten" || cls === "script") {
    if (strokeContrast === "high" || strokeContrast === "moderate") return "elegant";
    return "warm";
  }

  if (cls === "monospace") return "technical";

  if (cls === "display") {
    if (strokeContrast === "high") return "elegant";
    if (xHeight === "high" && aperture === "closed") return "bold";
    return "bold";
  }

  if (cls === "serif" || cls === "slab-serif") {
    if (strokeContrast === "high") return "elegant";
    if (strokeContrast === "moderate") return "traditional";
    if (strokeContrast === "low" || strokeContrast === "none") return "neutral";
    return "traditional";
  }

  if (cls === "sans-serif") {
    // Default sans-serif mood
    return "modern";
  }

  return "neutral";
}

// ── Main measurement function ──

async function measureFont(familyName, classification) {
  const filePath = await downloadFont(familyName);
  if (!filePath) return null;

  try {
    const fontData = fs.readFileSync(filePath);
    const font = opentype.parse(fontData.buffer);

    const xHeight = measureXHeightRatio(font);
    const stroke = measureStrokeContrast(font);
    const spacing = measureLetterSpacing(font);
    const aperture = measureApertureOpenness(font);
    const mood = deriveMoodCategory(font, classification, xHeight, stroke, aperture);

    return {
      xHeightRatio: xHeight || "moderate",
      apertureOpenness: aperture || "moderate",
      strokeContrast: stroke || "low",
      letterSpacing: spacing || "normal",
      moodCategory: mood || "neutral",
      measured: {
        xHeight: xHeight !== null,
        stroke: stroke !== null,
        spacing: spacing !== null,
        aperture: aperture !== null,
      }
    };
  } catch (e) {
    if (process.env.DEBUG) console.error(`  Parse error for ${familyName}: ${e.message}`);
    return null;
  }
}

// ── Extract font list from all-google-fonts.ts ──

function extractFontList() {
  const filePath = path.join(process.cwd(), "src/data/all-google-fonts.ts");
  const content = fs.readFileSync(filePath, "utf-8");

  // Match: gf("Name", "Google Family", "classification", ...)
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

// ── Run ──

async function main() {
  const fonts = extractFontList();
  console.log(`Found ${fonts.length} Google Fonts to measure`);

  const results = {};
  let measured = 0;
  let failed = 0;
  let batchCount = 0;

  // Process in small batches of 10 with delays to avoid rate limiting
  const BATCH_SIZE = 10;

  for (let i = 0; i < fonts.length; i += BATCH_SIZE) {
    const batch = fonts.slice(i, i + BATCH_SIZE);
    batchCount++;

    // Check which ones need downloading (not cached yet)
    const needsDownload = batch.filter(f => {
      const cached = path.join(CACHE_DIR, `${f.slug}.ttf`);
      return !fs.existsSync(cached);
    });

    // Download missing ones sequentially to avoid rate limiting
    for (const font of needsDownload) {
      await downloadFont(font.googleFamily);
      await sleep(50); // Small delay between downloads
    }

    // Now measure all in the batch (from cache — fast)
    for (const font of batch) {
      const result = await measureFont(font.googleFamily, font.classification);
      if (result) {
        results[font.slug] = result;
        measured++;
      } else {
        failed++;
        results[font.slug] = {
          xHeightRatio: "moderate",
          apertureOpenness: "moderate",
          strokeContrast: font.classification === "serif" ? "moderate" : "low",
          letterSpacing: "normal",
          moodCategory: deriveMoodCategory(null, font.classification, null, null, null),
          measured: { xHeight: false, stroke: false, spacing: false, aperture: false },
          fallback: true,
        };
      }
    }

    const total = measured + failed;
    if (batchCount % 20 === 0 || total === fonts.length) {
      console.log(`Progress: ${total}/${fonts.length} (${measured} measured, ${failed} failed)`);
    }
  }

  // Write results to JSON for inspection
  const outputPath = path.join(process.cwd(), "scripts/measured-anatomy.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outputPath}`);
  console.log(`Measured: ${measured}, Failed: ${failed}, Total: ${fonts.length}`);

  // Stats on what was actually measured
  let xCount = 0, sCount = 0, spCount = 0, aCount = 0;
  for (const r of Object.values(results)) {
    if (r.measured.xHeight) xCount++;
    if (r.measured.stroke) sCount++;
    if (r.measured.spacing) spCount++;
    if (r.measured.aperture) aCount++;
  }
  console.log(`\nMeasurement coverage:`);
  console.log(`  x-height: ${xCount}/${fonts.length}`);
  console.log(`  stroke contrast: ${sCount}/${fonts.length}`);
  console.log(`  letter spacing: ${spCount}/${fonts.length}`);
  console.log(`  aperture: ${aCount}/${fonts.length}`);
}

main().catch(console.error);

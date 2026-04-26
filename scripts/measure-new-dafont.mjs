#!/usr/bin/env node
/**
 * Measure specific new DaFont fonts by download slug.
 * Usage: node scripts/measure-new-dafont.mjs
 */

import opentype from "opentype.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CACHE_DIR = path.join(process.cwd(), ".font-cache", "dafont");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// [DaFont download slug, font name, classification]
const NEW_FONTS = [
  ["gobold",          "Gobold",          "display"],
  ["franchise",       "Franchise",       "display"],
  ["good_times",      "Good Times",      "display"],
  ["true_north",      "True North",      "display"],
  ["hammerhead",      "Hammerhead",      "display"],
  ["ozone",           "Ozone",           "display"],
  ["highway_gothic",  "Highway Gothic",  "sans-serif"],
  ["aurulent_sans",   "Aurulent Sans",   "sans-serif"],
  ["berylium",        "Berylium",        "sans-serif"],
  ["antiqua",         "Antiqua",         "serif"],
  ["black_jack",      "Black Jack",      "script"],
  ["aquiline_two",    "Aquiline Two",    "script"],
  ["espresso_dolce",  "Espresso Dolce",  "script"],
  ["carrington",      "Carrington",      "script"],
  ["adine_kirnberg",  "Adine Kirnberg",  "script"],
  ["klaudia",         "Klaudia",         "script"],
  ["amadeus",         "Amadeus",         "display"],
  ["oldtimer",        "Oldtimer",        "display"],
  ["stencilia",       "Stencilia",       "display"],
  ["sf_wonder_comic", "SF Wonder Comic", "display"],
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadDaFont(slug) {
  const existing = fs.readdirSync(CACHE_DIR).find(f =>
    f.startsWith(slug + ".") && (f.endsWith(".ttf") || f.endsWith(".otf"))
  );
  if (existing) return path.join(CACHE_DIR, existing);

  const variants = [slug, slug.replace(/-/g, "_"), slug.replace(/_/g, "-"), slug.replace(/[_-]/g, "")];

  for (const name of variants) {
    try {
      const url = `https://dl.dafont.com/dl/?f=${name}`;
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) continue;

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf[0] !== 0x50 || buf[1] !== 0x4B) continue;
      if (buf.length < 100) continue;

      const zipPath = path.join(CACHE_DIR, `${slug}.zip`);
      fs.writeFileSync(zipPath, buf);

      const extractDir = path.join(CACHE_DIR, `${slug}_extract`);
      if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true });
      fs.mkdirSync(extractDir, { recursive: true });

      try {
        execSync(`unzip -o -j "${zipPath}" -d "${extractDir}" 2>/dev/null`, { stdio: "pipe" });
      } catch { continue; }

      const files = fs.readdirSync(extractDir);
      const fontFiles = files.filter(f =>
        (f.toLowerCase().endsWith(".ttf") || f.toLowerCase().endsWith(".otf")) && !f.startsWith("._")
      );
      if (fontFiles.length === 0) continue;

      const regular = fontFiles.find(f => /regular/i.test(f) || /\-r\./i.test(f))
        || fontFiles.find(f => !/bold|italic|light|thin|black|heavy|medium|semi/i.test(f))
        || fontFiles[0];

      const ext = regular.toLowerCase().endsWith(".otf") ? ".otf" : ".ttf";
      const destPath = path.join(CACHE_DIR, `${slug}${ext}`);
      fs.copyFileSync(path.join(extractDir, regular), destPath);
      fs.rmSync(extractDir, { recursive: true });
      fs.unlinkSync(zipPath);
      return destPath;
    } catch {}
  }
  return null;
}

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
    if (xGlyph && hGlyph && xGlyph.path && hGlyph.path) {
      const xBB = xGlyph.getBoundingBox();
      const hBB = hGlyph.getBoundingBox();
      if (xBB.y2 > 0 && hBB.y2 > 0) {
        const ratio = xBB.y2 / hBB.y2;
        if (ratio < 0.62) return "low";
        if (ratio > 0.74) return "high";
        return "moderate";
      }
    }
  } catch {}
  return "moderate";
}

function measureStrokeContrast(font) {
  const os2 = font.tables?.os2;
  if (os2) {
    const panose = os2.panose;
    if (panose && panose.length >= 4) {
      const contrast = panose[3];
      if (contrast >= 8) return "high";
      if (contrast >= 5) return "moderate";
      if (contrast >= 3) return "low";
      return "none";
    }
  }
  return "low";
}

function measureLetterSpacing(font) {
  const post = font.tables?.post;
  if (post) {
    const tracking = post.italicAngle === 0 ? 0 : Math.abs(post.italicAngle);
    if (tracking > 10) return "generous";
  }
  const os2 = font.tables?.os2;
  if (os2) {
    const width = os2.usWidthClass;
    if (width <= 3) return "tight";
    if (width >= 7) return "generous";
  }
  const head = font.tables?.head;
  if (head) {
    const unitsPerEm = head.unitsPerEm;
    if (unitsPerEm) {
      try {
        const aGlyph = font.charToGlyph("a");
        if (aGlyph) {
          const advance = aGlyph.advanceWidth;
          const ratio = advance / unitsPerEm;
          if (ratio < 0.45) return "tight";
          if (ratio > 0.65) return "generous";
        }
      } catch {}
    }
  }
  return "normal";
}

function measureApertureOpenness(font) {
  const os2 = font.tables?.os2;
  if (os2) {
    const panose = os2.panose;
    if (panose && panose.length >= 7) {
      const letterForm = panose[6];
      if (letterForm >= 11) return "closed";
      if (letterForm <= 4) return "open";
    }
  }
  return "moderate";
}

function deriveMoodCategory(font, classification, xH, sc, ap) {
  const cls = classification.toLowerCase();
  if (cls === "script" || cls === "handwritten") return "warm";
  if (sc === "high") return "elegant";
  if (cls === "monospace") return "technical";
  if (xH === "high" && ap === "open" && sc === "none") return "modern";
  if (cls === "serif") return "traditional";
  if (cls === "display") return "bold";
  return "neutral";
}

async function main() {
  const results = {};

  for (const [slug, name, cls] of NEW_FONTS) {
    process.stdout.write(`Measuring ${name} (${slug})... `);
    const filePath = await downloadDaFont(slug);
    if (!filePath) {
      console.log("DOWNLOAD FAILED");
      results[slug] = { failed: true, name };
      continue;
    }
    try {
      const fontData = fs.readFileSync(filePath);
      const font = opentype.parse(fontData.buffer);
      const xH = measureXHeightRatio(font);
      const sc = measureStrokeContrast(font);
      const sp = measureLetterSpacing(font);
      const ap = measureApertureOpenness(font);
      const mood = deriveMoodCategory(font, cls, xH, sc, ap);
      results[slug] = { name, classification: cls, xHeightRatio: xH, apertureOpenness: ap, strokeContrast: sc, letterSpacing: sp, moodCategory: mood, measured: true };
      console.log(`OK [${xH}, ${ap}, ${sc}, ${sp}, ${mood}]`);
    } catch (e) {
      console.log(`PARSE FAILED: ${e.message}`);
      results[slug] = { failed: true, name, error: e.message };
    }
    await sleep(200);
  }

  const outputPath = path.join(process.cwd(), "scripts/measured-new-dafont.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults → ${outputPath}`);
}

main().catch(console.error);

#!/usr/bin/env node

/**
 * Font Download Script
 *
 * Downloads font files from Google Fonts, Fontshare, and DaFont
 * and saves them to public/fonts/ for self-hosting.
 *
 * Also generates @font-face CSS at public/fonts/fonts.css
 *
 * Usage:
 *   node scripts/download-fonts.mjs              # Download all fonts in dataset
 *   node scripts/download-fonts.mjs --google-all # Download ALL Google Fonts
 *   node scripts/download-fonts.mjs --fontshare-all # Download ALL Fontshare fonts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const FONTS_DIR = path.join(PROJECT_ROOT, "public", "fonts");
const CSS_PATH = path.join(FONTS_DIR, "fonts.css");

// ── HTTP helpers ──

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function fetchText(url) {
  return fetch(url).then((buf) => buf.toString("utf-8"));
}

// ── Google Fonts: download WOFF2 via CSS API ──

async function downloadGoogleFont(family, destDir) {
  const slug = family.toLowerCase().replace(/\s+/g, "-");
  const destFile = path.join(destDir, `${slug}.woff2`);

  if (fs.existsSync(destFile)) return { slug, file: destFile, family };

  try {
    // Request CSS with woff2 user-agent
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400&display=swap`;
    const css = await fetchText(cssUrl);

    // Extract woff2 URL
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
    if (!match) {
      console.warn(`  ⚠ No woff2 URL found for ${family}`);
      return null;
    }

    const woff2Url = match[1];
    const data = await fetch(woff2Url);
    fs.writeFileSync(destFile, data);
    console.log(`  ✓ ${family} (${(data.length / 1024).toFixed(1)}KB)`);
    return { slug, file: destFile, family };
  } catch (err) {
    console.warn(`  ⚠ Failed: ${family} — ${err.message}`);
    return null;
  }
}

// ── Fontshare: download WOFF2 ──

async function downloadFontshareFont(fontSlug, destDir) {
  const destFile = path.join(destDir, `fontshare-${fontSlug}.woff2`);

  if (fs.existsSync(destFile)) return { slug: fontSlug, file: destFile };

  try {
    // Fontshare serves CSS with font URLs
    const cssUrl = `https://api.fontshare.com/v2/css?f[]=${fontSlug}@400&display=swap`;
    const css = await fetchText(cssUrl);

    const match = css.match(/url\('?(https?:\/\/[^)'"]+\.woff2)'?\)/);
    if (!match) {
      console.warn(`  ⚠ No woff2 URL found for fontshare/${fontSlug}`);
      return null;
    }

    const data = await fetch(match[1]);
    fs.writeFileSync(destFile, data);
    console.log(`  ✓ Fontshare: ${fontSlug} (${(data.length / 1024).toFixed(1)}KB)`);
    return { slug: fontSlug, file: destFile };
  } catch (err) {
    console.warn(`  ⚠ Failed: fontshare/${fontSlug} — ${err.message}`);
    return null;
  }
}

// ── DaFont: download TTF (they don't serve woff2) ──

async function downloadDafontFont(name, destDir) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const destFile = path.join(destDir, `dafont-${slug}.ttf`);

  if (fs.existsSync(destFile)) return { slug, file: destFile, name };

  // DaFont doesn't have a clean API — we'll try the download URL pattern
  // Many DaFont fonts can be downloaded via: https://dl.dafont.com/dl/?f=SLUG
  try {
    const url = `https://dl.dafont.com/dl/?f=${slug}`;
    const data = await fetch(url);

    // DaFont returns a ZIP file — we need to extract the TTF/OTF
    // For now, save the zip and note it needs extraction
    const zipFile = path.join(destDir, `dafont-${slug}.zip`);
    fs.writeFileSync(zipFile, data);
    console.log(`  ✓ DaFont: ${name} (zip, ${(data.length / 1024).toFixed(1)}KB)`);
    return { slug, file: zipFile, name, isZip: true };
  } catch (err) {
    console.warn(`  ⚠ Failed: dafont/${name} — ${err.message}`);
    return null;
  }
}

// ── Generate @font-face CSS ──

function generateFontFaceCSS(entries) {
  const rules = [];

  for (const entry of entries) {
    if (!entry) continue;

    const family = entry.family || entry.name || entry.slug;
    const ext = path.extname(entry.file);
    const format = ext === ".woff2" ? "woff2" : ext === ".ttf" ? "truetype" : "opentype";
    const relativePath = `/fonts/${path.basename(entry.file)}`;

    rules.push(`@font-face {
  font-family: "${family}";
  src: url("${relativePath}") format("${format}");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`);
  }

  return rules.join("\n\n");
}

// ── Fetch ALL Google Fonts list ──

async function fetchAllGoogleFonts() {
  // Use Fontsource API (free, no key needed) which mirrors Google Fonts
  try {
    const data = await fetchText("https://api.fontsource.org/v1/fonts?subsets=latin&type=google");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to fetch Google Fonts list:", err.message);
    return [];
  }
}

// ── Fetch ALL Fontshare fonts list ──

async function fetchAllFontshareFonts() {
  try {
    const data = await fetchText("https://api.fontshare.com/v2/fonts?limit=200");
    const parsed = JSON.parse(data);
    return parsed.fonts || [];
  } catch (err) {
    console.error("Failed to fetch Fontshare list:", err.message);
    return [];
  }
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const downloadAllGoogle = args.includes("--google-all");
  const downloadAllFontshare = args.includes("--fontshare-all");

  fs.mkdirSync(FONTS_DIR, { recursive: true });

  const allEntries = [];

  // ── Google Fonts from our dataset ──
  console.log("\n📦 Downloading Google Fonts...\n");

  let googleFamilies = [];

  if (downloadAllGoogle) {
    console.log("  Fetching complete Google Fonts list...");
    const allFonts = await fetchAllGoogleFonts();
    googleFamilies = allFonts.map((f) => f.family);
    console.log(`  Found ${googleFamilies.length} Google Fonts\n`);
  } else {
    // Read from our data files to get the list
    // For now, hardcode the ones we know about from our dataset
    const dataDir = path.join(PROJECT_ROOT, "src", "data");
    const fontsFile = fs.readFileSync(path.join(dataDir, "fonts.ts"), "utf-8");
    const extFile = fs.existsSync(path.join(dataDir, "google-fonts-extended.ts"))
      ? fs.readFileSync(path.join(dataDir, "google-fonts-extended.ts"), "utf-8")
      : "";

    // Extract googleFontsFamily values
    const regex = /googleFontsFamily:\s*"([^"]+)"/g;
    let match;
    const families = new Set();
    for (const content of [fontsFile, extFile]) {
      while ((match = regex.exec(content)) !== null) {
        families.add(match[1]);
      }
    }
    googleFamilies = [...families];
    console.log(`  Found ${googleFamilies.length} Google Fonts in dataset\n`);
  }

  // Download in batches of 5
  for (let i = 0; i < googleFamilies.length; i += 5) {
    const batch = googleFamilies.slice(i, i + 5);
    const results = await Promise.all(batch.map((f) => downloadGoogleFont(f, FONTS_DIR)));
    allEntries.push(...results.filter(Boolean));
  }

  // ── Fontshare fonts ──
  console.log("\n📦 Downloading Fontshare fonts...\n");

  let fontshareSlugs = [];

  if (downloadAllFontshare) {
    console.log("  Fetching complete Fontshare list...");
    const allFontshare = await fetchAllFontshareFonts();
    fontshareSlugs = allFontshare.map((f) => f.slug || f.name?.toLowerCase().replace(/\s+/g, "-"));
    console.log(`  Found ${fontshareSlugs.length} Fontshare fonts\n`);
  } else {
    // From our dataset
    const fontsFile = fs.readFileSync(path.join(PROJECT_ROOT, "src", "data", "fonts.ts"), "utf-8");
    const fontshareRegex = /source:\s*"fontshare"[\s\S]*?slug:\s*"([^"]+)"/g;
    let match;
    const slugs = new Set();
    while ((match = fontshareRegex.exec(fontsFile)) !== null) {
      slugs.add(match[1]);
    }
    // Also check slug fields near fontshare sources
    const slugRegex2 = /id:\s*"([^"]+)"[\s\S]*?source:\s*"fontshare"/g;
    while ((match = slugRegex2.exec(fontsFile)) !== null) {
      slugs.add(match[1]);
    }
    fontshareSlugs = [...slugs];
    console.log(`  Found ${fontshareSlugs.length} Fontshare fonts in dataset\n`);
  }

  for (let i = 0; i < fontshareSlugs.length; i += 3) {
    const batch = fontshareSlugs.slice(i, i + 3);
    const results = await Promise.all(batch.map((s) => downloadFontshareFont(s, FONTS_DIR)));
    allEntries.push(...results.filter(Boolean));
  }

  // ── Generate CSS ──
  console.log("\n📝 Generating @font-face CSS...\n");
  const css = generateFontFaceCSS(allEntries);
  fs.writeFileSync(CSS_PATH, css);
  console.log(`  ✓ Generated ${CSS_PATH} (${allEntries.length} font faces)\n`);

  // ── Summary ──
  const totalSize = allEntries.reduce((sum, e) => {
    if (!e) return sum;
    try { return sum + fs.statSync(e.file).size; } catch { return sum; }
  }, 0);

  console.log(`\n✅ Done! Downloaded ${allEntries.length} fonts (${(totalSize / 1024 / 1024).toFixed(1)}MB total)`);
  console.log(`   Fonts dir: ${FONTS_DIR}`);
  console.log(`   CSS file: ${CSS_PATH}\n`);

  if (downloadAllGoogle) {
    // Generate a TypeScript data file for all Google Fonts
    console.log("📝 Generating all-google-fonts data...\n");
    await generateAllGoogleFontsData();
  }

  if (downloadAllFontshare) {
    console.log("📝 Generating all-fontshare-fonts data...\n");
    await generateAllFontshareFontsData();
  }
}

// ── Auto-generate Font entries for ALL Google Fonts ──

async function generateAllGoogleFontsData() {
  const allFonts = await fetchAllGoogleFonts();
  if (allFonts.length === 0) return;

  const categoryToTags = {
    serif: ["serif", "classic", "traditional", "readable", "editorial"],
    "sans-serif": ["sans-serif", "modern", "clean", "versatile"],
    display: ["display", "headline", "bold", "distinctive", "expressive"],
    handwriting: ["handwritten", "casual", "personal", "script", "fun"],
    monospace: ["monospace", "code", "technical", "developer"],
  };

  const categoryToTone = {
    serif: ["classic", "traditional", "literary"],
    "sans-serif": ["modern", "clean", "professional"],
    display: ["bold", "expressive", "distinctive"],
    handwriting: ["casual", "personal", "friendly"],
    monospace: ["technical", "precise", "structured"],
  };

  const entries = allFonts.map((f) => {
    const cat = f.category || "sans-serif";
    const isBody = cat === "serif" || cat === "sans-serif" || cat === "monospace";
    const isHeader = true;
    const tags = categoryToTags[cat] || ["display"];
    const tone = categoryToTone[cat] || ["expressive"];

    return `  gf("${f.family}", "${f.family}", "${cat === "handwriting" ? "handwritten" : cat}", ${JSON.stringify(tags)}, ${JSON.stringify(tone)}, ${isBody}, ${f.variants?.includes("regular") || true})`;
  });

  const fileContent = `// AUTO-GENERATED — do not edit manually
// Run: node scripts/download-fonts.mjs --google-all
import { Font, FontClassification } from "./types";

function gf(name: string, googleFamily: string, classification: string, tags: string[], tone: string[], isBody: boolean, hasRegular: boolean): Font {
  const slug = name.toLowerCase().replace(/\\s+/g, "-");
  return {
    id: \`gf-\${slug}\`, name, slug,
    source: "google-fonts",
    sourceUrl: \`https://fonts.google.com/specimen/\${googleFamily.replace(/\\s+/g, "+")}\`,
    downloadUrl: null, specimenUrl: null,
    licenseType: "OFL 1.1", licenseConfidence: "high",
    designer: null, foundry: null, year: null,
    classification: classification as FontClassification,
    subcategory: null,
    serifSansCategory: classification === "handwritten" ? "display" as const : classification as Font["serifSansCategory"],
    tags, toneDescriptors: tone,
    useCases: isBody ? ["body text", "headlines"] : ["headlines", "display"],
    variableFont: false, weights: [400], styles: ["normal"],
    isHeaderSuitable: true, isBodySuitable: isBody,
    bodyLegibilityScore: isBody ? 7 : 3,
    screenReadabilityNotes: null,
    distinctiveTraits: [], historicalNotes: null,
    notableUseExamples: [], similarFonts: [],
    popularityConfidence: "medium", metadataConfidence: "low",
    googleFontsFamily: googleFamily,
  };
}

export const allGoogleFonts: Font[] = [
${entries.join(",\n")}
];
`;

  const outPath = path.join(PROJECT_ROOT, "src", "data", "all-google-fonts.ts");
  fs.writeFileSync(outPath, fileContent);
  console.log(`  ✓ Generated ${outPath} (${allFonts.length} entries)\n`);
}

// ── Auto-generate Font entries for ALL Fontshare fonts ──

async function generateAllFontshareFontsData() {
  const allFonts = await fetchAllFontshareFonts();
  if (allFonts.length === 0) return;

  const entries = allFonts.map((f) => {
    const name = f.name || f.slug;
    const slug = (f.slug || name.toLowerCase().replace(/\s+/g, "-"));
    return `  fs("${name}", "${slug}")`;
  });

  const fileContent = `// AUTO-GENERATED — do not edit manually
// Run: node scripts/download-fonts.mjs --fontshare-all
import { Font } from "./types";

function fs(name: string, slug: string): Font {
  return {
    id: \`fs-\${slug}\`, name, slug,
    source: "fontshare",
    sourceUrl: \`https://www.fontshare.com/fonts/\${slug}\`,
    downloadUrl: null, specimenUrl: null,
    licenseType: "ITF Free Font License", licenseConfidence: "high",
    designer: null, foundry: "Indian Type Foundry", year: null,
    classification: "sans-serif", subcategory: null,
    serifSansCategory: "sans-serif",
    tags: ["modern", "clean", "versatile"],
    toneDescriptors: ["modern", "clean"],
    useCases: ["body text", "headlines"],
    variableFont: false, weights: [400], styles: ["normal"],
    isHeaderSuitable: true, isBodySuitable: true,
    bodyLegibilityScore: 7, screenReadabilityNotes: null,
    distinctiveTraits: [], historicalNotes: null,
    notableUseExamples: [], similarFonts: [],
    popularityConfidence: "medium", metadataConfidence: "low",
  };
}

export const allFontshareFonts: Font[] = [
${entries.join(",\n")}
];
`;

  const outPath = path.join(PROJECT_ROOT, "src", "data", "all-fontshare-fonts.ts");
  fs.writeFileSync(outPath, fileContent);
  console.log(`  ✓ Generated ${outPath} (${allFonts.length} entries)\n`);
}

main().catch(console.error);

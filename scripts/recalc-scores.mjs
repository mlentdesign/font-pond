#!/usr/bin/env node
/**
 * Recalculate bodyLegibilityScore for all fonts based on measured anatomy.
 *
 * Formula (research-backed):
 * - Base by classification: sans-serif/serif body = 6, slab = 6, monospace = 5, display = 3, script/handwritten = 2
 * - +1 for high x-height (tall lowercase = more legible at small sizes)
 * - +1 for open apertures (easier letter distinction)
 * - +1 for generous spacing (better body readability)
 * - +0.5 for moderate x-height (baseline acceptable)
 * - -1 for high stroke contrast (reduces body legibility)
 * - -1 for tight spacing (harder to read in body)
 * - -1 for low x-height (poor small-size legibility)
 * - -1 for closed apertures (harder letter distinction)
 * - Clamp to 1-10
 *
 * Also flags fonts where isBodySuitable should change.
 */

import fs from "fs";

const gfData = JSON.parse(fs.readFileSync("scripts/measured-anatomy.json", "utf-8"));
const dfData = JSON.parse(fs.readFileSync("scripts/measured-dafont.json", "utf-8"));

function calcLegibility(classification, xH, aperture, strokeContrast, spacing) {
  // Base score by classification
  let score;
  const cls = (classification || "").toLowerCase();
  if (cls === "script" || cls === "handwritten") score = 2;
  else if (cls === "display") score = 3;
  else if (cls === "monospace") score = 5;
  else if (cls === "slab-serif") score = 6;
  else score = 6; // serif, sans-serif

  // x-height bonus/penalty
  if (xH === "high") score += 1.5;
  else if (xH === "moderate") score += 0.5;
  else if (xH === "low") score -= 1;

  // Aperture bonus/penalty
  if (aperture === "open") score += 1;
  else if (aperture === "closed") score -= 1;

  // Stroke contrast penalty
  if (strokeContrast === "high") score -= 1;
  else if (strokeContrast === "none") score += 0.5;

  // Spacing bonus/penalty
  if (spacing === "generous") score += 0.5;
  else if (spacing === "tight") score -= 1;

  return Math.round(Math.max(1, Math.min(10, score)));
}

// ── Process Google Fonts ──
const gfContent = fs.readFileSync("src/data/all-google-fonts.ts", "utf-8");

// Extract each gf() call's parameters
const gfRegex = /gf\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*\[[^\]]*\],\s*\[[^\]]*\],\s*(true|false),\s*(true|false)(?:,\s*"[^"]*")?(?:,\s*"[^"]*")?(?:,\s*(\d+))?\)/g;

let changes = { upgraded: 0, downgraded: 0, unchanged: 0, total: 0 };
let newGfContent = gfContent;

let match;
while ((match = gfRegex.exec(gfContent)) !== null) {
  const name = match[1];
  const classification = match[3];
  const isBody = match[4] === "true";
  const oldOverride = match[6] ? parseInt(match[6]) : null;
  const oldScore = oldOverride ?? (isBody ? 7 : 3);
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const anatomy = gfData[slug];
  if (!anatomy || anatomy.fallback) continue;

  const newScore = calcLegibility(classification, anatomy.xHeightRatio, anatomy.apertureOpenness, anatomy.strokeContrast, anatomy.letterSpacing);

  changes.total++;
  if (newScore === oldScore) {
    changes.unchanged++;
  } else if (newScore > oldScore) {
    changes.upgraded++;
  } else {
    changes.downgraded++;
  }
}

console.log("Google Fonts score analysis:");
console.log(`  Total: ${changes.total}`);
console.log(`  Unchanged: ${changes.unchanged}`);
console.log(`  Would upgrade: ${changes.upgraded}`);
console.log(`  Would downgrade: ${changes.downgraded}`);

// Show distribution of new scores
const scoreDist = {};
const gfRegex2 = /gf\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",/g;
while ((match = gfRegex2.exec(gfContent)) !== null) {
  const name = match[1];
  const cls = match[3];
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const anatomy = gfData[slug];
  if (!anatomy || anatomy.fallback) continue;

  const score = calcLegibility(cls, anatomy.xHeightRatio, anatomy.apertureOpenness, anatomy.strokeContrast, anatomy.letterSpacing);
  scoreDist[score] = (scoreDist[score] || 0) + 1;
}
console.log("\nNew score distribution:");
for (const [score, count] of Object.entries(scoreDist).sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log(`  ${score}/10: ${count} fonts`);
}

// ── Spot check well-known fonts ──
console.log("\nSpot check (name: old → new):");
const spotCheck = [
  { name: "Inter", cls: "sans-serif", isBody: true },
  { name: "Roboto", cls: "sans-serif", isBody: true },
  { name: "Playfair Display", cls: "display", isBody: false },
  { name: "Oswald", cls: "sans-serif", isBody: true },
  { name: "Dancing Script", cls: "handwritten", isBody: false },
  { name: "Fira Code", cls: "monospace", isBody: true },
  { name: "Merriweather", cls: "serif", isBody: true },
  { name: "Abril Fatface", cls: "display", isBody: false },
  { name: "Lora", cls: "serif", isBody: true },
  { name: "Montserrat", cls: "sans-serif", isBody: true },
];

for (const { name, cls, isBody } of spotCheck) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const a = gfData[slug];
  if (!a) continue;
  const oldScore = isBody ? 7 : 3;
  const newScore = calcLegibility(cls, a.xHeightRatio, a.apertureOpenness, a.strokeContrast, a.letterSpacing);
  console.log(`  ${name}: ${oldScore} → ${newScore} (xH=${a.xHeightRatio}, ap=${a.apertureOpenness}, sc=${a.strokeContrast}, sp=${a.letterSpacing})`);
}

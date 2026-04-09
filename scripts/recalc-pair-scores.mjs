#!/usr/bin/env node
/**
 * Recalculate pair bodyLegibilityScore and overallScore based on updated font data.
 *
 * For each handcrafted pair:
 * - bodyLegibilityScore → use the body font's new anatomy-based legibility
 * - overallScore → recalculate from the weighted formula
 */

import fs from "fs";

// Read the built font data to get the updated legibility scores
// We need to import the actual TypeScript modules — but we can't directly.
// Instead, let's replicate the calcLegibility formula and use the anatomy maps.

const gfAnatomy = {};
const gfContent = fs.readFileSync("src/data/gf-anatomy-map.ts", "utf-8");
const gfRegex = /"([a-z0-9-]+)":\s*\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g;
let m;
while ((m = gfRegex.exec(gfContent)) !== null) {
  gfAnatomy[m[1]] = { xH: m[2], ap: m[3], sc: m[4], sp: m[5], mood: m[6] };
}

// Also read Fontshare anatomy
const fsContent = fs.readFileSync("src/data/all-fontshare-fonts.ts", "utf-8");
const fsAnatomy = {};
const fsAnatomyRegex = /"([a-z0-9-]+)":\s*\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g;
while ((m = fsAnatomyRegex.exec(fsContent)) !== null) {
  fsAnatomy[m[1]] = { xH: m[2], ap: m[3], sc: m[4], sp: m[5], mood: m[6] };
}

// DaFont anatomy
const dfContent = fs.readFileSync("src/data/dafont-fonts.ts", "utf-8");
const dfAnatomy = {};
const dfAnatomyRegex = /"([a-z0-9-]+)":\s*\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g;
while ((m = dfAnatomyRegex.exec(dfContent)) !== null) {
  dfAnatomy[m[1]] = { xH: m[2], ap: m[3], sc: m[4], sp: m[5], mood: m[6] };
}

// Build font classification map from all-google-fonts.ts
const gfClassMap = {};
const gfClassRegex = /gf\("([^"]+)",\s*"[^"]+",\s*"([^"]+)"/g;
const gfFontsContent = fs.readFileSync("src/data/all-google-fonts.ts", "utf-8");
while ((m = gfClassRegex.exec(gfFontsContent)) !== null) {
  const slug = m[1].toLowerCase().replace(/\s+/g, "-");
  gfClassMap[slug] = m[2];
}

// Fontshare classification
const fsClassMap = {};
const fsClassRegex = /fs\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
while ((m = fsClassRegex.exec(fsContent)) !== null) {
  fsClassMap[m[2]] = m[3]; // slug → classification
}

function calcLegibility(cls, xH, ap, sc, sp) {
  const c = (cls || "").toLowerCase();
  let s = c === "script" || c === "handwritten" ? 2 : c === "display" ? 3 : c === "monospace" ? 5 : 6;
  if (xH === "high") s += 1.5; else if (xH === "moderate") s += 0.5; else if (xH === "low") s -= 1;
  if (ap === "open") s += 1; else if (ap === "closed") s -= 1;
  if (sc === "high") s -= 1; else if (sc === "none") s += 0.5;
  if (sp === "generous") s += 0.5; else if (sp === "tight") s -= 1;
  return Math.round(Math.max(1, Math.min(10, s)));
}

function getFontData(fontId) {
  // Parse font ID to get source and slug
  let slug, source;
  if (fontId.startsWith("gf-")) {
    slug = fontId.slice(3);
    source = "gf";
  } else if (fontId.startsWith("fs-")) {
    slug = fontId.slice(3);
    source = "fs";
  } else if (fontId.startsWith("dafont-")) {
    slug = fontId.slice(7);
    source = "df";
  } else {
    // Try all sources
    slug = fontId;
    source = gfAnatomy[slug] ? "gf" : fsAnatomy[slug] ? "fs" : dfAnatomy[slug] ? "df" : null;
  }

  const anatomy = source === "gf" ? gfAnatomy[slug] : source === "fs" ? fsAnatomy[slug] : source === "df" ? dfAnatomy[slug] : null;
  const cls = source === "gf" ? gfClassMap[slug] : source === "fs" ? fsClassMap[slug] : "display";

  return { slug, anatomy, cls };
}

// Read pairs.ts and update scores
const pairsContent = fs.readFileSync("src/data/pairs.ts", "utf-8");
const lines = pairsContent.split("\n");
const newLines = [];

let currentPair = {};
let pairStartLine = -1;
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Track bodyFontId
  const bodyMatch = line.match(/bodyFontId:\s*"([^"]+)"/);
  if (bodyMatch) currentPair.bodyFontId = bodyMatch[1];

  const headerMatch = line.match(/headerFontId:\s*"([^"]+)"/);
  if (headerMatch) currentPair.headerFontId = headerMatch[1];

  // Track hierarchy, practicality, originality (keep as-is, they're subjective)
  const hierMatch = line.match(/hierarchyStrength:\s*(\d+)/);
  if (hierMatch) currentPair.hierarchy = parseInt(hierMatch[1]);

  const pracMatch = line.match(/practicalityScore:\s*(\d+)/);
  if (pracMatch) currentPair.practicality = parseInt(pracMatch[1]);

  const origMatch = line.match(/originalityScore:\s*(\d+)/);
  if (origMatch) currentPair.originality = parseInt(origMatch[1]);

  // Update bodyLegibilityScore
  const legMatch = line.match(/^(\s*bodyLegibilityScore:\s*)(\d+)(,?.*)$/);
  if (legMatch && currentPair.bodyFontId) {
    const bodyData = getFontData(currentPair.bodyFontId);
    if (bodyData.anatomy) {
      const newLeg = calcLegibility(bodyData.cls, bodyData.anatomy.xH, bodyData.anatomy.ap, bodyData.anatomy.sc, bodyData.anatomy.sp);
      const oldLeg = parseInt(legMatch[2]);
      if (newLeg !== oldLeg) {
        newLines.push(legMatch[1] + newLeg + legMatch[3]);
        currentPair.legibility = newLeg;
        changes++;
        continue;
      }
      currentPair.legibility = oldLeg;
    }
  }

  // Update overallScore using the weighted formula
  const overallMatch = line.match(/^(\s*overallScore:\s*)(\d+)(,?.*)$/);
  if (overallMatch && currentPair.hierarchy && currentPair.legibility) {
    const h = currentPair.hierarchy;
    const l = currentPair.legibility;
    const p = currentPair.practicality || 7;
    const o = currentPair.originality || 7;
    // Simplified: use base dimensions (without anatomy dimensions which are computed dynamically)
    const baseScore = h * 0.25 + l * 0.30 + p * 0.25 + o * 0.20;
    const newOverall = Math.min(95, Math.max(60, Math.round(baseScore * 10)));
    const oldOverall = parseInt(overallMatch[2]);

    if (newOverall !== oldOverall) {
      newLines.push(overallMatch[1] + newOverall + overallMatch[3]);
      changes++;
      // Reset for next pair
      currentPair = {};
      continue;
    }
    currentPair = {};
  }

  // Reset on pair boundary
  if (line.match(/^\s*\},?\s*$/)) {
    currentPair = {};
  }

  newLines.push(line);
}

fs.writeFileSync("src/data/pairs.ts", newLines.join("\n"));
console.log(`Updated ${changes} values in pairs.ts`);

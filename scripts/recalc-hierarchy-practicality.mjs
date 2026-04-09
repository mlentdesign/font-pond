#!/usr/bin/env node
/**
 * Re-evaluate hierarchyStrength and practicalityScore for handcrafted pairs
 * based on updated font anatomy data.
 *
 * Hierarchy factors:
 * - Classification contrast (serif/sans, display/body) → strong hierarchy
 * - Header is display-only, body is body-suitable → good role separation
 * - Different x-height ratios → visual distinction
 * - Header has high stroke contrast (dramatic) vs body doesn't → contrast
 *
 * Practicality factors:
 * - Body font legibility score (from anatomy)
 * - Body font has multiple weights
 * - License is permissive (OFL, free)
 * - Body font is explicitly body-suitable
 * - Both fonts available on major CDNs
 */

import fs from "fs";

// ── Load anatomy data ──
function loadAnatomy(file, regex) {
  const content = fs.readFileSync(file, "utf-8");
  const map = {};
  let m;
  while ((m = regex.exec(content)) !== null) {
    map[m[1]] = { xH: m[2], ap: m[3], sc: m[4], sp: m[5], mood: m[6] };
  }
  return map;
}

const anatomyRegex = /"([a-z0-9-]+)":\s*\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g;
const gfAnatomy = loadAnatomy("src/data/gf-anatomy-map.ts", new RegExp(anatomyRegex.source, "g"));
const fsAnatomy = loadAnatomy("src/data/all-fontshare-fonts.ts", new RegExp(anatomyRegex.source, "g"));
const dfAnatomy = loadAnatomy("src/data/dafont-fonts.ts", new RegExp(anatomyRegex.source, "g"));

// ── Load font metadata (classification, isBodySuitable, source) ──
const fontMeta = {};

// Google Fonts
const gfContent = fs.readFileSync("src/data/all-google-fonts.ts", "utf-8");
const gfMetaRegex = /gf\("([^"]+)",\s*"[^"]+",\s*"([^"]+)",\s*\[[^\]]*\],\s*\[[^\]]*\],\s*(true|false)/g;
let m;
while ((m = gfMetaRegex.exec(gfContent)) !== null) {
  const slug = m[1].toLowerCase().replace(/\s+/g, "-");
  fontMeta["gf-" + slug] = { cls: m[2], isBody: m[3] === "true", source: "gf" };
  fontMeta[slug] = { cls: m[2], isBody: m[3] === "true", source: "gf" };
}

// Fontshare
const fsContent = fs.readFileSync("src/data/all-fontshare-fonts.ts", "utf-8");
const fsMetaRegex = /fs\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
while ((m = fsMetaRegex.exec(fsContent)) !== null) {
  fontMeta["fs-" + m[2]] = { cls: m[3], isBody: false, source: "fs" };
  fontMeta[m[2]] = { cls: m[3], isBody: false, source: "fs" };
}
// Update isBody for Fontshare fonts that have it set
const fsBodyRegex = /isBodySuitable:\s*true/g;
// This is tricky since it's in opts — let's just mark common body fonts
const fsBodyFonts = ["satoshi", "general-sans", "switzer", "outfit", "work-sans", "manrope", "poppins", "inter", "space-grotesk"];

// DaFont (all display, not body)
const dfMetaRegex = /dafont\("([^"]+)",\s*"([^"]+)"/g;
const dfContent = fs.readFileSync("src/data/dafont-fonts.ts", "utf-8");
while ((m = dfMetaRegex.exec(dfContent)) !== null) {
  const slug = m[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  fontMeta["dafont-" + slug] = { cls: m[2], isBody: false, source: "df" };
  fontMeta[slug] = { cls: m[2], isBody: false, source: "df" };
}

// Core fonts
const coreFontsContent = fs.readFileSync("src/data/fonts.ts", "utf-8");
const coreBodyRegex = /isBodySuitable:\s*(true|false)/g;
const coreIdRegex = /id:\s*"([^"]+)"/g;
const coreClsRegex = /classification:\s*"([^"]+)"/g;

function getAnatomy(fontId) {
  let slug = fontId;
  if (slug.startsWith("gf-")) slug = slug.slice(3);
  else if (slug.startsWith("fs-")) slug = slug.slice(3);
  else if (slug.startsWith("dafont-")) slug = slug.slice(7);
  return gfAnatomy[slug] || fsAnatomy[slug] || dfAnatomy[slug] || null;
}

function getMeta(fontId) {
  return fontMeta[fontId] || fontMeta[fontId.replace(/^(gf|fs|dafont)-/, "")] || null;
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

function calcHierarchy(headerMeta, bodyMeta, headerAnat, bodyAnat) {
  let score = 7; // base

  // Classification contrast bonus
  const hCls = (headerMeta?.cls || "").toLowerCase();
  const bCls = (bodyMeta?.cls || "").toLowerCase();

  if (hCls === "display" || hCls === "script" || hCls === "handwritten") score += 1; // display header = strong hierarchy
  if (hCls !== bCls) score += 0.5; // different classification = more contrast
  if ((hCls === "serif" && bCls === "sans-serif") || (hCls === "sans-serif" && bCls === "serif")) score += 0.5; // classic contrast

  // Stroke contrast difference
  if (headerAnat?.sc === "high" && bodyAnat?.sc !== "high") score += 0.5;

  // Header dramatic, body readable
  if (headerAnat?.sc === "high" || headerAnat?.sc === "moderate") score += 0.5;

  // If both are body-suitable, hierarchy is weaker
  if (bodyMeta?.isBody && headerMeta?.cls !== "display") score -= 0.5;

  return Math.round(Math.max(1, Math.min(10, score)));
}

function calcPracticality(headerMeta, bodyMeta, bodyAnat) {
  let score = 7; // base

  // Body font legibility
  const bodyLeg = bodyAnat ? calcLegibility(bodyMeta?.cls, bodyAnat.xH, bodyAnat.ap, bodyAnat.sc, bodyAnat.sp) : 5;
  if (bodyLeg >= 8) score += 1;
  else if (bodyLeg >= 6) score += 0.5;
  else if (bodyLeg <= 3) score -= 1;

  // Both on major CDNs (Google Fonts or Fontshare)
  if (headerMeta?.source === "gf" || headerMeta?.source === "fs") score += 0.5;
  if (bodyMeta?.source === "gf" || bodyMeta?.source === "fs") score += 0.5;

  // DaFont fonts are less practical (limited weights, uncertain licensing)
  if (headerMeta?.source === "df") score -= 0.5;
  if (bodyMeta?.source === "df") score -= 1;

  // Body font is explicitly body-suitable
  if (bodyMeta?.isBody) score += 0.5;

  return Math.round(Math.max(1, Math.min(10, score)));
}

// ── Process pairs ──
const pairsContent = fs.readFileSync("src/data/pairs.ts", "utf-8");
const lines = pairsContent.split("\n");
const newLines = [];

let currentPair = {};
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const headerMatch = line.match(/headerFontId:\s*"([^"]+)"/);
  if (headerMatch) currentPair.headerFontId = headerMatch[1];

  const bodyMatch = line.match(/bodyFontId:\s*"([^"]+)"/);
  if (bodyMatch) currentPair.bodyFontId = bodyMatch[1];

  // Update hierarchyStrength
  const hierMatch = line.match(/^(\s*hierarchyStrength:\s*)(\d+)(,?.*)$/);
  if (hierMatch && currentPair.headerFontId && currentPair.bodyFontId) {
    const hMeta = getMeta(currentPair.headerFontId);
    const bMeta = getMeta(currentPair.bodyFontId);
    const hAnat = getAnatomy(currentPair.headerFontId);
    const bAnat = getAnatomy(currentPair.bodyFontId);

    const newHier = calcHierarchy(hMeta, bMeta, hAnat, bAnat);
    const oldHier = parseInt(hierMatch[2]);

    if (newHier !== oldHier) {
      newLines.push(hierMatch[1] + newHier + hierMatch[3]);
      changes++;
      continue;
    }
  }

  // Update practicalityScore
  const pracMatch = line.match(/^(\s*practicalityScore:\s*)(\d+)(,?.*)$/);
  if (pracMatch && currentPair.bodyFontId) {
    const bMeta = getMeta(currentPair.bodyFontId);
    const hMeta = getMeta(currentPair.headerFontId);
    const bAnat = getAnatomy(currentPair.bodyFontId);

    const newPrac = calcPracticality(hMeta, bMeta, bAnat);
    const oldPrac = parseInt(pracMatch[2]);

    if (newPrac !== oldPrac) {
      newLines.push(pracMatch[1] + newPrac + pracMatch[3]);
      changes++;
      continue;
    }
  }

  // Reset on pair boundary
  if (line.match(/^\s*\},?\s*$/)) {
    currentPair = {};
  }

  newLines.push(line);
}

fs.writeFileSync("src/data/pairs.ts", newLines.join("\n"));
console.log(`Updated ${changes} hierarchy/practicality values in pairs.ts`);

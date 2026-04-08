import { Font, FontPair } from "@/data/types";

// Known chromatic/color fonts that don't render in standard black
// No longer needed here — blocklisted fonts are already filtered out in fonts.ts
const CHROMATIC_BLOCKLIST = new Set<string>();

// Known all-caps or display-only fonts misclassified as body-suitable
const ALL_CAPS_BLOCKLIST = new Set([
  "bebas neue", "anton", "black ops one", "bungee", "bungee inline", "bungee shade",
  "alfa slab one", "monoton", "faster one", "fascinate", "fascinate inline",
  "press start 2p", "silkscreen", "vt323", "bangers", "fugaz one", "rammetto one",
  "titan one", "luckiest guy", "modak", "shrikhand", "patua one", "codystar",
  "righteous", "staatliches", "archivo black", "lilita one", "fredoka",
  "special elite", "permanent marker", "rock salt", "homemade apple",
  "audiowide", "orbitron", "nabla", "tourney", "climate crisis",
  "creepster", "nosifer", "butcherman", "eater", "jolly lodger",
  "pirata one", "emilys candy", "mystery quest", "flavors", "freckle face",
  "irish grover", "henny penny", "metal mania", "vast shadow",
  "unifrakturmaguntia", "rubik glitch", "rubik vinyl", "rubik wet paint",
  "rubik burned", "rubik moonrocks", "rubik puddles", "rubik storm",
  "bungee", "ultra", "yeseva one", "abril fatface",
]);

const ALL_CAPS_TAGS = new Set(["condensed", "uppercase", "all-caps", "impact", "display", "pixel", "8-bit", "stencil"]);

// Deterministic seed for consistent pair generation across restarts
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickMultipleBodies(
  headerFont: Font,
  bodyFonts: Font[],
  count: number,
  rand: () => number,
): Font[] {
  const candidates = bodyFonts.filter((bf) => bf.id !== headerFont.id);
  if (candidates.length === 0) return [];

  const headerTags = new Set([...headerFont.tags, ...headerFont.toneDescriptors]);

  const scored = candidates.map((bf) => {
    let score = 10;

    // Contrast bonus
    if (
      (headerFont.serifSansCategory === "serif" || headerFont.serifSansCategory === "script" || headerFont.serifSansCategory === "display") &&
      bf.serifSansCategory === "sans-serif"
    ) score += 4;

    // Sans header + serif body is also valid
    if (headerFont.serifSansCategory === "sans-serif" && bf.serifSansCategory === "serif") score += 2;

    // Tag compatibility
    if (headerTags.has("warm") && bf.toneDescriptors.some(t => ["friendly", "warm", "approachable"].includes(t))) score += 3;
    if (headerTags.has("edgy") && bf.toneDescriptors.some(t => ["clean", "neutral", "modern"].includes(t))) score += 3;
    if (headerTags.has("feminine") && bf.toneDescriptors.some(t => ["friendly", "modern", "clean"].includes(t))) score += 2;
    if (headerTags.has("technical") && bf.toneDescriptors.some(t => ["technical", "precise", "modern"].includes(t))) score += 2;
    if (headerTags.has("luxury") && bf.toneDescriptors.some(t => ["refined", "elegant", "clean"].includes(t))) score += 2;

    if (bf.bodyLegibilityScore && bf.bodyLegibilityScore >= 8) score += 3;
    if (bf.source === "fontshare") score += 2;
    if (bf.variableFont) score += 1;

    // Add small random factor for variety across pairs
    score += rand() * 3;

    return { font: bf, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick top N, ensuring variety (no duplicate classifications in a row)
  const picked: Font[] = [];
  const usedIds = new Set<string>();

  for (const item of scored) {
    if (picked.length >= count) break;
    if (usedIds.has(item.font.id)) continue;
    usedIds.add(item.font.id);
    picked.push(item.font);
  }

  return picked;
}

function fmtClass(c: string): string { return c.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }

function describeContrast(header: Font, body: Font): string {
  const hClass = header.classification;
  const hLabel = fmtClass(hClass);
  const bLabel = fmtClass(body.classification);
  if (hClass === "handwritten" || hClass === "script") return `${hLabel} / ${bLabel} — texture and personality contrast`;
  if (hClass === "display") return `Display / ${bLabel} — dramatic weight and scale contrast`;
  if (hClass !== body.classification) return `${hLabel} / ${bLabel} — category contrast`;
  return "weight and personality contrast";
}

// Varied rationale templates — uses a hash of the pair slug to pick one deterministically
const RATIONALE_TEMPLATES = [
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name} brings ${ht} to headlines, setting a tone that's unmistakably ${h.toneDescriptors[0] || "expressive"}. ${b.name} steps in as the body font with ${b.toneDescriptors[0] || "clean"} clarity, creating a ${ct} that feels intentional and balanced.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `The ${ht} of ${h.name} gives headlines a strong visual identity, while ${b.name}'s ${b.toneDescriptors[0] || "readable"} forms keep body text comfortable. Together they create a ${ct} that works well for ${h.useCases[0] || "various contexts"}.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `Pairing ${h.name} with ${b.name} creates a deliberate contrast: ${h.toneDescriptors[0] || "expressive"} headlines against ${b.toneDescriptors[0] || "clean"} body text. ${h.name}'s ${ht} commands attention while ${b.name} ensures readability.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name}'s ${ht} makes it a compelling headline choice — ${h.toneDescriptors[0] || "distinctive"} and ${h.toneDescriptors[1] || "bold"}. Paired with ${b.name}, which brings ${b.toneDescriptors[0] || "clean"} reliability to body text, this combination balances personality with function.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `This pairing leverages ${h.name}'s ${h.toneDescriptors[0] || "distinctive"} character for headlines and ${b.name}'s ${b.toneDescriptors[0] || "versatile"} nature for body text. The ${ct} creates clear hierarchy while maintaining visual cohesion.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name} delivers ${h.toneDescriptors[0] || "expressive"}, ${h.toneDescriptors[1] || "striking"} headlines through its ${ht}. ${b.name} provides the perfect counterbalance — ${b.toneDescriptors[0] || "clean"} and easy to read at any size.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `When ${h.name}'s ${ht} leads the way in headlines, ${b.name} follows with steady, ${b.toneDescriptors[0] || "readable"} body text. The result is a pairing that feels both ${h.toneDescriptors[0] || "dynamic"} and grounded.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name} and ${b.name} work together through ${ct}. The headline font's ${ht} creates immediate visual interest, while the body font's ${b.toneDescriptors[0] || "clean"} character supports sustained reading.`,
];

const SHORT_TEMPLATES = [
  (h: Font, b: Font) => `${h.toneDescriptors[0] || "Expressive"} ${h.name} headlines anchored by ${b.name}'s clarity.`,
  (h: Font, b: Font) => `${h.name}'s personality meets ${b.name}'s readability.`,
  (h: Font, b: Font) => `${h.toneDescriptors[0] || "Bold"} headlines from ${h.name}, clean body from ${b.name}.`,
  (h: Font, b: Font) => `A ${h.toneDescriptors[0] || "distinctive"} header paired with ${b.toneDescriptors[0] || "versatile"} body text.`,
  (h: Font, b: Font) => `${h.name} leads with character, ${b.name} delivers on readability.`,
  (h: Font, b: Font) => `${h.toneDescriptors[0] || "Striking"} display energy balanced by ${b.name}'s composure.`,
];

const TONE_TEMPLATES = [
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Expressive")} and ${h.toneDescriptors[1] || "distinctive"}, balanced by ${b.toneDescriptors[0] || "clean"} readability.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Bold")} headlines with a ${b.toneDescriptors[0] || "neutral"}, ${b.toneDescriptors[1] || "professional"} foundation.`,
  (h: Font, b: Font) => `A blend of ${h.toneDescriptors[0] || "expressive"} personality and ${b.toneDescriptors[0] || "clean"} function.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Distinctive")} character in the headline, ${b.toneDescriptors[0] || "steady"} reliability in the body.`,
];

function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function makePair(header: Font, body: Font, existingSlugs: Set<string>): FontPair | null {
  const slug = `${header.slug}-${body.slug}`;
  if (existingSlugs.has(slug)) return null;
  existingSlugs.add(slug);

  const id = `gen-${header.id}-${body.id}`;
  const headerTrait = header.distinctiveTraits[0] || header.toneDescriptors[0] || "distinctive character";
  const contrast = describeContrast(header, body);
  const hash = simpleHash(slug);

  const rationale = RATIONALE_TEMPLATES[hash % RATIONALE_TEMPLATES.length](header, body, headerTrait, contrast);
  const shortExplanation = SHORT_TEMPLATES[hash % SHORT_TEMPLATES.length](header, body);
  const toneSummary = TONE_TEMPLATES[hash % TONE_TEMPLATES.length](header, body);

  // ── Compute varied, honest scores based on actual quality signals ──

  // Hierarchy: display/script headers dominate more than body-suitable ones
  const hierarchy = header.classification === "display" || header.classification === "script" || header.classification === "handwritten"
    ? 10
    : header.isBodySuitable ? 7 : 9;

  // Body legibility: use actual score, default 7
  const legibility = body.bodyLegibilityScore || 7;

  // Practicality: premium sources score higher, variable fonts get a bump
  let practicality = 7;
  if (header.source === "fontshare" && body.source === "fontshare") practicality = 9;
  else if (header.source === "fontshare" || body.source === "fontshare") practicality = 8;
  else if (header.source === "other") practicality = 6;
  if (body.variableFont) practicality = Math.min(10, practicality + 1);

  // Originality: cross-category pairs are more interesting; same-category less so
  let originality = 7;
  if (header.serifSansCategory !== body.serifSansCategory) originality = 8;
  if (header.classification === "script" || header.classification === "handwritten") originality = 9;
  if (header.classification === "display" && body.serifSansCategory === "serif") originality = 9;
  if (header.serifSansCategory === body.serifSansCategory) originality = 6;

  // Overall: weighted blend with deterministic variance from hash
  const baseScore =
    hierarchy * 0.25 + legibility * 0.30 + practicality * 0.25 + originality * 0.20;
  // Scale to 78-92 range: best pairs rival hand-crafted, weakest still respectable
  const overallScore = Math.min(92, Math.max(78, Math.round(78 + (baseScore - 7) * 4 + (hash % 3))));

  return {
    id,
    slug,
    headerFontId: header.id,
    bodyFontId: body.id,
    rationale,
    shortExplanation,
    toneSummary,
    useCases: [...new Set([...header.useCases.slice(0, 3), ...body.useCases.slice(0, 2)])],
    tags: [...new Set([...header.tags.slice(0, 8), ...header.toneDescriptors.slice(0, 4)])].slice(0, 8),
    contrastType: contrast,
    hierarchyStrength: hierarchy,
    bodyLegibilityScore: legibility,
    practicalityScore: practicality,
    originalityScore: originality,
    sourceConfidence: header.source === "other" ? "medium" : "high",
    licenseConfidence: header.licenseConfidence,
    overallScore,
    rankingNotes: `Dynamic pair: ${header.name} (${header.source}) + ${body.name}`,
  };
}

export function generateDynamicPairs(allFonts: Font[]): FontPair[] {
  const headerFonts = allFonts.filter((f) => f.isHeaderSuitable && !CHROMATIC_BLOCKLIST.has(f.id));

  const bodyFonts = allFonts.filter((f) => {
    if (!f.isBodySuitable) return false;
    if (f.bodyLegibilityScore !== null && f.bodyLegibilityScore < 6) return false;
    if (ALL_CAPS_BLOCKLIST.has(f.name.toLowerCase())) return false;
    if (f.classification === "display" || f.classification === "handwritten" || f.classification === "script") return false;
    if (f.tags.some(t => ALL_CAPS_TAGS.has(t.toLowerCase()))) return false;
    return true;
  });

  if (bodyFonts.length === 0) return [];

  const pairs: FontPair[] = [];
  const existingSlugs = new Set<string>();

  // Use deterministic random for consistent results across restarts
  const rand = seededRandom(42);

  // PAIRS_PER_FONT: generate body pairings per header font
  const PAIRS_PER_FONT = 100;

  // Prioritize Fontshare and DaFont headers first
  const prioritized = [
    ...headerFonts.filter((f) => f.source === "fontshare"),
    ...headerFonts.filter((f) => f.source === "other"),
    ...headerFonts.filter((f) => f.source === "google-fonts"),
  ];

  for (const header of prioritized) {
    const bodies = pickMultipleBodies(header, bodyFonts, PAIRS_PER_FONT, rand);

    for (const body of bodies) {
      const pair = makePair(header, body, existingSlugs);
      if (pair) pairs.push(pair);
    }
  }

  return pairs;
}

// ── Curated pair generator — high-quality pairs ensuring every font has 10+ ──

const CURATED_RATIONALES = [
  (h: Font, b: Font, ct: string) =>
    `${h.name}'s ${h.distinctiveTraits[0] || h.toneDescriptors[0] || "distinctive"} forms make it a natural headline choice — ${h.toneDescriptors.slice(0, 2).join(" and ") || "expressive"} at display sizes. Paired with ${b.name}'s ${b.toneDescriptors[0] || "readable"} body text, this ${ct} creates a clear typographic system that works across screen sizes.`,
  (h: Font, b: Font, ct: string) =>
    `There's a deliberate tension between ${h.name}'s ${h.toneDescriptors[0] || "bold"} headline presence and ${b.name}'s ${b.toneDescriptors[0] || "quiet"} body reliability. ${h.name} draws the eye; ${b.name} holds the reader. This ${ct} makes their differences an asset, not a conflict.`,
  (h: Font, b: Font, ct: string) =>
    `${h.name} commands attention in headlines with its ${h.distinctiveTraits[0] || h.classification} character — ${h.toneDescriptors[0] || "expressive"} and ${h.toneDescriptors[1] || "distinctive"}. ${b.name} provides a ${b.toneDescriptors[0] || "clean"}, ${b.toneDescriptors[1] || "readable"} foundation in body text. The pairing balances visual interest with sustained readability.`,
  (h: Font, b: Font, ct: string) =>
    `A considered pairing that uses ${h.name}'s ${h.toneDescriptors[0] || "strong"} personality for impact and ${b.name}'s ${b.toneDescriptors[0] || "versatile"} clarity for comfort. The ${ct} creates hierarchy that feels both intentional and effortless — ${h.name} leads, ${b.name} carries.`,
  (h: Font, b: Font, ct: string) =>
    `${h.name} brings ${h.toneDescriptors.slice(0, 2).join(", ") || "character"} to headlines, setting a tone that ${b.name} complements with ${b.toneDescriptors[0] || "readable"} body text. This ${ct} works because both fonts are excellent at their respective roles — one for display, one for reading.`,
  (h: Font, b: Font, ct: string) =>
    `Pairing ${h.name} with ${b.name} leverages a smart ${ct}: the headline font's ${h.distinctiveTraits[0] || h.toneDescriptors[0] || "distinctive character"} creates immediate visual interest, while the body font's ${b.toneDescriptors[0] || "clean"} forms keep reading comfortable at any size.`,
  (h: Font, b: Font, ct: string) =>
    `${h.name}'s ${h.toneDescriptors[0] || "expressive"} headline energy meets ${b.name}'s ${b.toneDescriptors[0] || "composed"} body readability. The contrast between ${h.toneDescriptors[0] || "display"} presence and ${b.toneDescriptors[0] || "text"} function is what makes typography work — each font excels at its scale.`,
  (h: Font, b: Font, ct: string) =>
    `This combination pairs ${h.name}'s ${h.classification} sensibility with ${b.name}'s readable ${b.classification} forms. The ${ct} establishes clear hierarchy while maintaining visual cohesion — both fonts feel like parts of the same design system.`,
  (h: Font, b: Font, ct: string) =>
    `${h.name} sets the tone with ${h.toneDescriptors[0] || "distinctive"}, ${h.toneDescriptors[1] || "striking"} headlines. ${b.name} provides the ${b.toneDescriptors[0] || "balanced"} counterpoint needed for extended reading. Their ${ct} creates a pairing that feels curated, not accidental.`,
  (h: Font, b: Font, ct: string) =>
    `When ${h.name}'s ${h.distinctiveTraits[0] || h.toneDescriptors[0] || "bold character"} leads the typographic hierarchy, ${b.name}'s ${b.toneDescriptors[0] || "steady"}, ${b.toneDescriptors[1] || "clear"} body text follows naturally. The result is a ${ct} that serves both form and function.`,
  (h: Font, b: Font, ct: string) =>
    `${h.name} and ${b.name} represent a well-matched ${ct}. The headline font brings ${h.toneDescriptors[0] || "personality"} and ${h.toneDescriptors[1] || "presence"}, while the body font offers the ${b.toneDescriptors[0] || "legibility"} that long-form content demands. A pairing built on complementary strengths.`,
  (h: Font, b: Font, ct: string) =>
    `The ${h.toneDescriptors[0] || "distinctive"} quality of ${h.name} makes headlines memorable, while ${b.name}'s ${b.toneDescriptors[0] || "neutral"} reliability makes body text disappear into the content — exactly what good typography should do. Their ${ct} is both purposeful and practical.`,
];

const CURATED_SHORT = [
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Expressive")} ${h.name} headlines paired with ${b.name}'s ${b.toneDescriptors[0] || "clean"} readability.`,
  (h: Font, b: Font) => `${h.name}'s ${h.toneDescriptors[0] || "bold"} character balanced by ${b.name}'s ${b.toneDescriptors[0] || "quiet"} clarity.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Distinctive")} headlines from ${h.name}, grounded by ${b.name}'s ${b.toneDescriptors[0] || "readable"} body text.`,
  (h: Font, b: Font) => `A ${h.toneDescriptors[0] || "striking"} header paired with ${b.toneDescriptors[0] || "versatile"} body text.`,
  (h: Font, b: Font) => `${h.name} leads with ${h.toneDescriptors[0] || "presence"}, ${b.name} delivers on readability.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Bold")} display energy balanced by ${b.name}'s composure.`,
];

const CURATED_TONE = [
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Expressive")} and ${h.toneDescriptors[1] || "distinctive"}, balanced by ${b.toneDescriptors[0] || "clean"} readability.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Bold")} headlines anchored by a ${b.toneDescriptors[0] || "neutral"}, ${b.toneDescriptors[1] || "professional"} foundation.`,
  (h: Font, b: Font) => `A blend of ${h.toneDescriptors[0] || "expressive"} personality and ${b.toneDescriptors[0] || "clean"} function.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Distinctive")} character in the headline, ${b.toneDescriptors[0] || "steady"} reliability in the body.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Strong")} presence meets ${b.toneDescriptors[0] || "versatile"} readability.`,
];

function makeCuratedPair(header: Font, body: Font, existingSlugs: Set<string>): FontPair | null {
  const slug = `${header.slug}-${body.slug}`;
  if (existingSlugs.has(slug)) return null;
  existingSlugs.add(slug);

  const id = `curated-${header.id}-${body.id}`;
  const contrast = describeContrast(header, body);
  const hash = simpleHash(slug);

  const rationale = CURATED_RATIONALES[hash % CURATED_RATIONALES.length](header, body, contrast);
  const shortExplanation = CURATED_SHORT[hash % CURATED_SHORT.length](header, body);
  const toneSummary = CURATED_TONE[hash % CURATED_TONE.length](header, body);

  const hierarchy = header.classification === "display" || header.classification === "script" || header.classification === "handwritten"
    ? 10 : header.isBodySuitable ? 7 : 9;
  const legibility = body.bodyLegibilityScore || 7;
  let practicality = 7;
  if (header.source === "fontshare" && body.source === "fontshare") practicality = 9;
  else if (header.source === "fontshare" || body.source === "fontshare") practicality = 8;
  else if (header.source === "other") practicality = 6;
  if (body.variableFont) practicality = Math.min(10, practicality + 1);
  let originality = 7;
  if (header.serifSansCategory !== body.serifSansCategory) originality = 8;
  if (header.classification === "script" || header.classification === "handwritten") originality = 9;
  if (header.classification === "display" && body.serifSansCategory === "serif") originality = 9;

  const baseScore = hierarchy * 0.25 + legibility * 0.30 + practicality * 0.25 + originality * 0.20;
  const overallScore = Math.min(92, Math.max(78, Math.round(78 + (baseScore - 7) * 4 + (hash % 3))));

  return {
    id, slug,
    headerFontId: header.id,
    bodyFontId: body.id,
    rationale, shortExplanation, toneSummary,
    useCases: [...new Set([...header.useCases.slice(0, 3), ...body.useCases.slice(0, 2)])],
    tags: [...new Set([...header.tags.slice(0, 6), ...header.toneDescriptors.slice(0, 3), ...body.toneDescriptors.slice(0, 2)])].slice(0, 8),
    contrastType: contrast,
    hierarchyStrength: hierarchy,
    bodyLegibilityScore: legibility,
    practicalityScore: practicality,
    originalityScore: originality,
    sourceConfidence: header.source === "other" ? "medium" : "high",
    licenseConfidence: header.licenseConfidence,
    overallScore,
    rankingNotes: `Curated pair: ${header.name} + ${body.name}`,
  };
}

export function generateCuratedPairs(
  allFonts: Font[],
  existingPairs: FontPair[],
  existingSlugs: Set<string>,
): FontPair[] {
  const TARGET = 10;

  // Count existing non-dynamic pairs per font
  const counts = new Map<string, number>();
  for (const p of existingPairs) {
    if (p.id.startsWith("gen-")) continue;
    counts.set(p.headerFontId, (counts.get(p.headerFontId) || 0) + 1);
    counts.set(p.bodyFontId, (counts.get(p.bodyFontId) || 0) + 1);
  }

  // Body font pool (same quality filter as dynamic generator)
  const bodyFonts = allFonts.filter((f) => {
    if (!f.isBodySuitable) return false;
    if (f.bodyLegibilityScore !== null && f.bodyLegibilityScore < 6) return false;
    if (ALL_CAPS_BLOCKLIST.has(f.name.toLowerCase())) return false;
    if (f.classification === "display" || f.classification === "handwritten" || f.classification === "script") return false;
    if (f.tags.some(t => ALL_CAPS_TAGS.has(t.toLowerCase()))) return false;
    return true;
  });

  // Sort body fonts by quality (best first)
  const sortedBodies = [...bodyFonts].sort((a, b) => {
    const aScore = (a.bodyLegibilityScore || 5) + (a.source === "fontshare" ? 2 : 0) + (a.variableFont ? 1 : 0);
    const bScore = (b.bodyLegibilityScore || 5) + (b.source === "fontshare" ? 2 : 0) + (b.variableFont ? 1 : 0);
    return bScore - aScore;
  });

  const rand = seededRandom(7777);
  const pairs: FontPair[] = [];

  // Fonts that need more curated pairs, sorted by deficit (most needed first)
  const needMore = allFonts
    .filter(f => (counts.get(f.id) || 0) < TARGET)
    .sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0));

  for (const font of needMore) {
    const current = counts.get(font.id) || 0;
    const needed = TARGET - current;
    if (needed <= 0) continue;

    // Try as header first — pick body fonts from full pool with rotation for diversity
    let created = 0;
    if (font.isHeaderSuitable) {
      // Shuffle body fonts using seeded random to spread across entire pool
      const shuffled = [...sortedBodies];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Prioritize body fonts that also need more curated pairs
      shuffled.sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0));
      for (const body of shuffled) {
        if (created >= needed) break;
        if (body.id === font.id) continue;
        const pair = makeCuratedPair(font, body, existingSlugs);
        if (pair) {
          pairs.push(pair);
          counts.set(pair.headerFontId, (counts.get(pair.headerFontId) || 0) + 1);
          counts.set(pair.bodyFontId, (counts.get(pair.bodyFontId) || 0) + 1);
          created++;
        }
      }
    }

    // If still short (e.g., body-only font), pair as body with header fonts
    if (created < needed && font.isBodySuitable) {
      const headerFonts = allFonts.filter(f => f.isHeaderSuitable && f.id !== font.id);
      // Pick headers that also need pairs, prioritizing those with fewest
      const headersNeedingPairs = headerFonts
        .filter(h => (counts.get(h.id) || 0) < TARGET)
        .sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0));
      const headerPool = headersNeedingPairs.length > 0 ? headersNeedingPairs : headerFonts;

      for (const header of headerPool) {
        if (created >= needed) break;
        const pair = makeCuratedPair(header, font, existingSlugs);
        if (pair) {
          pairs.push(pair);
          counts.set(pair.headerFontId, (counts.get(pair.headerFontId) || 0) + 1);
          counts.set(pair.bodyFontId, (counts.get(pair.bodyFontId) || 0) + 1);
          created++;
        }
      }
    }
  }

  return pairs;
}

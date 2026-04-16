import { Font, FontPair } from "@/data/types";
import { SEVERELY_ILLEGIBLE_FONT_IDS } from "@/data/illegible-fonts";

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

    // Anatomy-informed bonuses
    if (bf.apertureOpenness === "open") score += 2;
    if (bf.xHeightRatio === "high") score += 1;
    if (bf.strokeContrast === "high") score -= 1; // high contrast hurts body legibility

    // X-height harmony bonus
    const hx = headerFont.xHeightRatio || "moderate";
    const bx = bf.xHeightRatio || "moderate";
    if (hx === bx) score += 2;

    // Personality contrast bonus
    const hm = headerFont.moodCategory || "neutral";
    const bm = bf.moodCategory || "neutral";
    if (hm !== bm) score += 1; // some contrast is good

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
  const headerIllegible = SEVERELY_ILLEGIBLE_FONT_IDS.has(header.id);
  const bodyIllegible = SEVERELY_ILLEGIBLE_FONT_IDS.has(body.id);

  // Base contrast description
  let base: string;
  if (hClass === "handwritten" || hClass === "script") base = `${hLabel} / ${bLabel} — texture and personality contrast`;
  else if (hClass === "display") base = `Display / ${bLabel} — dramatic weight and scale contrast`;
  else if (hClass !== body.classification) base = `${hLabel} / ${bLabel} — category contrast`;
  else base = "weight and personality contrast";

  // Flag illegibility so users know why scores are low
  if (headerIllegible && bodyIllegible) {
    return `${base}. Note: both ${header.name} and ${body.name} have decorative letterforms that are hard to read — best used sparingly for visual effect.`;
  }
  if (headerIllegible) {
    return `${base}. Note: ${header.name}'s letterforms are decorative and not truly legible — pair works visually but headlines won't be easy to read.`;
  }
  if (bodyIllegible) {
    return `${base}. Note: ${body.name} has decorative letterforms that aren't legible for body text — use for effect, not for reading.`;
  }
  return base;
}

// Varied rationale templates — uses a hash of the pair slug to pick one deterministically
const RATIONALE_TEMPLATES = [
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name} brings ${ht} to headlines, setting a tone that's unmistakably ${h.toneDescriptors[0] || "expressive"}. ${b.name} rounds out the system with ${b.toneDescriptors[0] || "clean"} clarity — a ${ct} that feels intentional and balanced.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `The ${ht} of ${h.name} gives headlines a strong visual identity, while ${b.name}'s ${b.toneDescriptors[0] || "readable"} forms keep longer passages comfortable. A combination well suited for ${h.useCases[0] || "various contexts"}.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `Pairing ${h.name} with ${b.name} creates a deliberate contrast: ${h.toneDescriptors[0] || "expressive"} headlines against ${b.toneDescriptors[0] || "clean"} running copy. ${h.name}'s ${ht} commands attention while ${b.name} keeps things effortlessly readable.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name}'s ${ht} makes it a compelling headline choice — ${h.toneDescriptors[0] || "distinctive"} and ${h.toneDescriptors[1] || "bold"}. ${b.name} brings ${b.toneDescriptors[0] || "clean"} reliability to everything underneath, balancing personality with comfort.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `This pairing leverages ${h.name}'s ${h.toneDescriptors[0] || "distinctive"} character up top and ${b.name}'s ${b.toneDescriptors[0] || "versatile"} nature everywhere else. The ${ct} gives each font a clear role without competing for attention.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name} delivers ${h.toneDescriptors[0] || "expressive"}, ${h.toneDescriptors[1] || "striking"} headlines through its ${ht}. ${b.name} offers the perfect counterbalance — ${b.toneDescriptors[0] || "clean"} and comfortable at every size.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `When ${h.name}'s ${ht} leads the way, ${b.name} follows with steady, ${b.toneDescriptors[0] || "readable"} support. The result is something that feels both ${h.toneDescriptors[0] || "dynamic"} and grounded — a natural hierarchy.`,
  (h: Font, b: Font, ht: string, ct: string) =>
    `${h.name} and ${b.name} make a strong team through ${ct}. One draws you in with ${ht}; the other keeps you reading with ${b.toneDescriptors[0] || "clean"}, composed forms.`,
];

const SHORT_TEMPLATES = [
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Expressive")} ${h.name} headlines anchored by ${b.name}'s ${b.toneDescriptors[0] || "clean"} clarity.`,
  (h: Font, b: Font) => `${h.name}'s ${h.toneDescriptors[0] || "bold"} personality meets ${b.name}'s composure.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Bold")} headlines from ${h.name}, grounded by ${b.name}'s ${b.toneDescriptors[0] || "steady"} forms.`,
  (h: Font, b: Font) => `${h.name} for impact, ${b.name} for everything else.`,
  (h: Font, b: Font) => `${h.name} leads with ${h.toneDescriptors[0] || "character"}; ${b.name} keeps things comfortable.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Striking")} display energy paired with ${b.name}'s ${b.toneDescriptors[0] || "quiet"} reliability.`,
  (h: Font, b: Font) => `A ${h.toneDescriptors[0] || "distinctive"} headline voice matched by ${b.name}'s ${b.toneDescriptors[0] || "even"} tone.`,
  (h: Font, b: Font) => `${h.name} sets the mood. ${b.name} carries the message.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Confident")} ${h.name} up top, ${b.toneDescriptors[0] || "versatile"} ${b.name} throughout.`,
  (h: Font, b: Font) => `Two fonts, one system — ${h.name}'s ${h.toneDescriptors[0] || "presence"} and ${b.name}'s clarity.`,
  (h: Font, b: Font) => `${h.name} brings the ${h.toneDescriptors[0] || "personality"}. ${b.name} brings the readability.`,
  (h: Font, b: Font) => `A pairing that balances ${h.name}'s ${h.toneDescriptors[0] || "energy"} with ${b.name}'s restraint.`,
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

// ── Typography-research-informed scoring helpers ──

// X-height harmony: how well the header and body x-heights align for visual cohesion
function computeXHeightHarmony(header: Font, body: Font): number {
  const hx = header.xHeightRatio || "moderate";
  const bx = body.xHeightRatio || "moderate";
  // Same x-height = best harmony; adjacent = good; opposite = weaker
  if (hx === bx) return 9;
  const scale = { low: 0, moderate: 1, high: 2 };
  const diff = Math.abs(scale[hx] - scale[bx]);
  return diff === 1 ? 7 : 5;
}

// Role fitness: how well each font fits its assigned role (header vs body)
function computeRoleFitness(header: Font, body: Font): number {
  let score = 5;

  // Header fitness: display/script fonts are ideal headers
  if (header.classification === "display" || header.classification === "script" || header.classification === "handwritten") score += 2;
  else if (!header.isBodySuitable) score += 1; // header-only fonts are good headers

  // Body fitness: high legibility anatomy = great body font
  const bodyLeg = body.bodyLegibilityScore || 5;
  if (bodyLeg >= 9) score += 3;
  else if (bodyLeg >= 7) score += 2;
  else if (bodyLeg >= 5) score += 1;

  // Anatomy bonuses for body font
  if (body.apertureOpenness === "open") score += 1;
  if (body.xHeightRatio === "high") score += 1;
  if (body.strokeContrast === "high" && body.isBodySuitable) score -= 1; // high contrast hurts body legibility

  // Penalty: display-only font used as body
  if (!body.isBodySuitable) score -= 2;
  if (body.letterSpacing === "tight") score -= 1;

  return Math.min(10, Math.max(1, score));
}

// Personality contrast: complementary mood contrast (too similar = bland, too different = clash)
function computePersonalityContrast(header: Font, body: Font): number {
  const hm = header.moodCategory || "neutral";
  const bm = body.moodCategory || "neutral";

  // Same mood = low contrast, can work but less interesting
  if (hm === bm) return 5;

  // Complementary pairs score high
  const complementary: Record<string, string[]> = {
    elegant:      ["neutral", "modern", "warm", "traditional"],
    bold:         ["neutral", "modern", "warm"],
    playful:      ["neutral", "modern", "warm"],
    experimental: ["neutral", "modern", "technical"],
    traditional:  ["modern", "neutral", "elegant"],
    warm:         ["modern", "neutral", "elegant", "bold"],
    modern:       ["traditional", "elegant", "warm", "bold"],
    technical:    ["warm", "elegant", "modern"],
    neutral:      ["elegant", "bold", "playful", "experimental", "warm", "traditional"],
  };

  if (complementary[hm]?.includes(bm)) return 8;

  // Clashing pairs score low
  const clashing: Record<string, string[]> = {
    playful:      ["traditional", "technical"],
    experimental: ["traditional"],
    bold:         ["elegant"],
    technical:    ["playful"],
  };

  if (clashing[hm]?.includes(bm)) return 3;

  return 6; // neutral default
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

  // New anatomy-informed dimensions
  const xHeightHarmony = computeXHeightHarmony(header, body);
  const roleFitness = computeRoleFitness(header, body);
  const personalityContrast = computePersonalityContrast(header, body);

  // Overall: weighted blend with new dimensions (rebalanced from original 4 to 7)
  const baseScore =
    hierarchy * 0.15 +
    legibility * 0.20 +
    practicality * 0.15 +
    originality * 0.15 +
    xHeightHarmony * 0.15 +
    roleFitness * 0.10 +
    personalityContrast * 0.10;
  // Scale to 78-92 range: best pairs rival hand-crafted, weakest still respectable
  let overallScore = Math.min(92, Math.max(78, Math.round(78 + (baseScore - 7) * 4 + (hash % 3))));
  // Penalty: if header OR body is categorically illegible (barcode/waveform/etc.),
  // the whole pair is hard to read — legibility, practicality, and overall all drop.
  const headerIllegible = SEVERELY_ILLEGIBLE_FONT_IDS.has(header.id);
  const bodyIllegible = SEVERELY_ILLEGIBLE_FONT_IDS.has(body.id);
  const anyIllegible = headerIllegible || bodyIllegible;
  if (anyIllegible) overallScore = Math.max(50, overallScore - 25);
  // Pair legibility: if either font is illegible, cap at 2/10. Body illegible is worst (1).
  const finalLegibility = bodyIllegible ? 1 : headerIllegible ? Math.min(2, legibility) : legibility;
  // Practicality: hard-to-read pairs aren't practical for real-world use
  const finalPracticality = anyIllegible ? Math.min(3, practicality) : practicality;
  // Role fitness: an illegible header can't perform the header role
  const finalRoleFitness = headerIllegible ? Math.max(1, roleFitness - 5) : roleFitness;

  return {
    id,
    url: `/pair/${slug}`,
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
    bodyLegibilityScore: finalLegibility,
    practicalityScore: finalPracticality,
    originalityScore: originality,
    xHeightHarmony,
    roleFitness: finalRoleFitness,
    personalityContrast,
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

  // Generate diverse pairs — lazy-loaded so no page load impact
  const PAIRS_PER_FONT = 15;
  const MAX_DYNAMIC_PAIRS = 25000;

  // Prioritize Fontshare and DaFont headers first
  const prioritized = [
    ...headerFonts.filter((f) => f.source === "fontshare"),
    ...headerFonts.filter((f) => f.source === "other"),
    ...headerFonts.filter((f) => f.source === "google-fonts"),
  ];

  for (const header of prioritized) {
    if (pairs.length >= MAX_DYNAMIC_PAIRS) break;
    const bodies = pickMultipleBodies(header, bodyFonts, PAIRS_PER_FONT, rand);

    for (const body of bodies) {
      const pair = makePair(header, body, existingSlugs);
      if (pair) pairs.push(pair);
      if (pairs.length >= MAX_DYNAMIC_PAIRS) break;
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
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Expressive")} ${h.name} paired with ${b.name}'s ${b.toneDescriptors[0] || "clean"} composure.`,
  (h: Font, b: Font) => `${h.name}'s ${h.toneDescriptors[0] || "bold"} character, tempered by ${b.name}.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Distinctive")} headlines from ${h.name}. ${b.name} handles the rest.`,
  (h: Font, b: Font) => `${h.name} for the first impression, ${b.name} for the lasting one.`,
  (h: Font, b: Font) => `${h.name} and ${b.name} — ${h.toneDescriptors[0] || "presence"} meets ${b.toneDescriptors[0] || "clarity"}.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Bold")} display energy grounded by ${b.name}'s ${b.toneDescriptors[0] || "steady"} forms.`,
  (h: Font, b: Font) => `A ${h.toneDescriptors[0] || "striking"} voice up top, ${b.toneDescriptors[0] || "measured"} tone below.`,
  (h: Font, b: Font) => `${h.name} draws you in. ${b.name} keeps you reading.`,
  (h: Font, b: Font) => `${cap(h.toneDescriptors[0] || "Confident")} headlines with a ${b.toneDescriptors[0] || "quiet"}, capable foundation.`,
  (h: Font, b: Font) => `${h.name} brings ${h.toneDescriptors[0] || "personality"}; ${b.name} brings balance.`,
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

  const xHeightHarmony = computeXHeightHarmony(header, body);
  const roleFitness = computeRoleFitness(header, body);
  const personalityContrast = computePersonalityContrast(header, body);

  const baseScore =
    hierarchy * 0.15 +
    legibility * 0.20 +
    practicality * 0.15 +
    originality * 0.15 +
    xHeightHarmony * 0.15 +
    roleFitness * 0.10 +
    personalityContrast * 0.10;
  let overallScore = Math.min(92, Math.max(78, Math.round(78 + (baseScore - 7) * 4 + (hash % 3))));
  // Mirror the dynamic-pair illegible penalty
  const headerIllegible = SEVERELY_ILLEGIBLE_FONT_IDS.has(header.id);
  const bodyIllegible = SEVERELY_ILLEGIBLE_FONT_IDS.has(body.id);
  const anyIllegible = headerIllegible || bodyIllegible;
  if (anyIllegible) overallScore = Math.max(50, overallScore - 25);
  const finalLegibility = bodyIllegible ? 1 : headerIllegible ? Math.min(2, legibility) : legibility;
  const finalPracticality = anyIllegible ? Math.min(3, practicality) : practicality;
  const finalRoleFitness = headerIllegible ? Math.max(1, roleFitness - 5) : roleFitness;

  return {
    id,
    url: `/pair/${slug}`, slug,
    headerFontId: header.id,
    bodyFontId: body.id,
    rationale, shortExplanation, toneSummary,
    useCases: [...new Set([...header.useCases.slice(0, 3), ...body.useCases.slice(0, 2)])],
    tags: [...new Set([...header.tags.slice(0, 6), ...header.toneDescriptors.slice(0, 3), ...body.toneDescriptors.slice(0, 2)])].slice(0, 8),
    contrastType: contrast,
    hierarchyStrength: hierarchy,
    bodyLegibilityScore: finalLegibility,
    practicalityScore: finalPracticality,
    originalityScore: originality,
    xHeightHarmony,
    roleFitness: finalRoleFitness,
    personalityContrast,
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

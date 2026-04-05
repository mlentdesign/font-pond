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

function describeContrast(header: Font, body: Font): string {
  const hClass = header.classification;
  if (hClass === "handwritten" || hClass === "script") return `${hClass}/${body.classification} — texture and personality contrast`;
  if (hClass === "display") return `display/${body.classification} — dramatic weight and scale contrast`;
  if (hClass !== body.classification) return `${hClass}/${body.classification} — category contrast`;
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
    hierarchyStrength: header.isBodySuitable ? 7 : 9,
    bodyLegibilityScore: body.bodyLegibilityScore || 7,
    practicalityScore: header.source === "other" ? 6 : 7,
    originalityScore: 8,
    sourceConfidence: header.source === "other" ? "medium" : "high",
    licenseConfidence: header.licenseConfidence,
    overallScore: 80,
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

  // PAIRS_PER_FONT: generate 12 body pairings per header font
  const PAIRS_PER_FONT = 12;

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

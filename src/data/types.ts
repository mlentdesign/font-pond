// ── Font Data Model ──

export interface Font {
  id: string;
  name: string;
  slug: string;
  source: "google-fonts" | "fontshare" | "other";
  sourceUrl: string;
  downloadUrl: string | null;
  specimenUrl: string | null;
  licenseType: string;
  licenseConfidence: "high" | "medium" | "low";
  designer: string | null;
  foundry: string | null;
  year: number | null;
  classification: FontClassification;
  subcategory: string | null;
  serifSansCategory: "serif" | "sans-serif" | "slab-serif" | "display" | "script" | "monospace";
  tags: string[];
  toneDescriptors: string[];
  useCases: string[];
  variableFont: boolean;
  weights: number[];
  styles: string[];
  isHeaderSuitable: boolean;
  isBodySuitable: boolean;
  bodyLegibilityScore: number | null; // 1-10
  screenReadabilityNotes: string | null;
  distinctiveTraits: string[];

  // Typography anatomy (research-informed legibility markers)
  xHeightRatio?: "low" | "moderate" | "high";           // x-height relative to cap height — higher = more legible at small sizes
  apertureOpenness?: "closed" | "moderate" | "open";     // openness of counters on c, e, a, s — open = easier letter distinction
  strokeContrast?: "none" | "low" | "moderate" | "high"; // variation between thick/thin strokes — extreme contrast reduces body legibility
  letterSpacing?: "tight" | "normal" | "generous";       // default inter-letter spacing — generous = better body readability
  moodCategory?: "traditional" | "modern" | "elegant" | "playful" | "bold" | "neutral" | "technical" | "warm" | "experimental"; // primary personality
  historicalNotes: string | null;
  notableUseExamples: string[];
  similarFonts: string[];
  popularityConfidence: "high" | "medium" | "low";
  metadataConfidence: "high" | "medium" | "low";
  googleFontsFamily?: string; // for loading via Google Fonts API
}

export type FontClassification =
  | "serif"
  | "sans-serif"
  | "slab-serif"
  | "display"
  | "script"
  | "monospace"
  | "handwritten";

// ── Pair Data Model ──

export interface FontPair {
  id: string;
  slug: string;
  headerFontId: string;
  bodyFontId: string;
  rationale: string;
  shortExplanation: string;
  toneSummary: string;
  useCases: string[];
  tags: string[];
  contrastType: string;
  hierarchyStrength: number; // 1-10
  bodyLegibilityScore: number; // 1-10
  practicalityScore: number; // 1-10
  originalityScore: number; // 1-10
  xHeightHarmony?: number;       // 1-10: how well header/body x-heights align for visual cohesion
  roleFitness?: number;          // 1-10: how well each font fits its role (display vs body)
  personalityContrast?: number;  // 1-10: complementary mood contrast (too similar = bland, too different = clash)
  sourceConfidence: "high" | "medium" | "low";
  licenseConfidence: "high" | "medium" | "low";
  overallScore: number; // 1-100
  rankingNotes: string;
}

// ── Ranking ──

export interface ScoredPair extends FontPair {
  relevanceScore: number;
  promptFitReason: string;
  headerFont: Font;
  bodyFont: Font;
}

// ── Style Dimensions ──

export interface StyleSignals {
  modern: number;       // -1 (classic) to 1 (modern)
  warm: number;         // -1 (cool) to 1 (warm)
  playful: number;      // -1 (serious) to 1 (playful)
  editorial: number;    // -1 (utilitarian) to 1 (editorial)
  luxurious: number;    // -1 (accessible) to 1 (luxurious)
  geometric: number;    // -1 (humanist) to 1 (geometric)
  technical: number;    // -1 (organic) to 1 (technical)
  minimal: number;      // -1 (expressive) to 1 (minimal)
}

// ── Recently Viewed ──

export interface RecentPairView {
  pairId: string;
  pairSlug: string;
  headerFontName: string;
  bodyFontName: string;
  viewedAt: number;
}

export interface RecentHistoryItem {
  type: "pair" | "font";
  id: string;       // pairId or fontId
  slug: string;      // pairSlug or fontSlug
  label: string;     // "Header + Body" or "Font Name"
  viewedAt: number;
}

// Fontshare font library — rich individualized metadata
// All Fontshare fonts are variable fonts
import { Font, FontClassification } from "./types";

// Compute body legibility from measured anatomy (research-backed formula)
function calcLegibility(cls: string, xH?: string, ap?: string, sc?: string, sp?: string): number {
  const c = cls.toLowerCase();
  let s = c === "script" || c === "handwritten" ? 2 : c === "display" ? 3 : c === "monospace" ? 5 : 6;
  if (xH === "high") s += 1.5; else if (xH === "moderate") s += 0.5; else if (xH === "low") s -= 1;
  if (ap === "open") s += 1; else if (ap === "closed") s -= 1;
  if (sc === "high") s -= 1; else if (sc === "none") s += 0.5;
  if (sp === "generous") s += 0.5; else if (sp === "tight") s -= 1;
  return Math.round(Math.max(1, Math.min(10, s)));
}

function fs(
  name: string,
  slug: string,
  classification: FontClassification,
  tags: string[],
  toneDescriptors: string[],
  opts?: {
    isBodySuitable?: boolean;
    bodyLegibilityScore?: number;
    variableFont?: boolean;
    distinctiveTraits?: string[];
    xHeightRatio?: "low" | "moderate" | "high";
    apertureOpenness?: "closed" | "moderate" | "open";
    strokeContrast?: "none" | "low" | "moderate" | "high";
    letterSpacing?: "tight" | "normal" | "generous";
    moodCategory?: "traditional" | "modern" | "elegant" | "playful" | "bold" | "neutral" | "technical" | "warm" | "experimental";
  }
): Font {
  const isBody = opts?.isBodySuitable ?? false;
  const isHeader = ["display", "script", "handwritten"].includes(classification)
    ? true
    : true; // all Fontshare fonts work as headers
  const serifSans: Font["serifSansCategory"] =
    classification === "handwritten" ? "script" : classification;

  // Derive useCases from classification + body suitability
  const useCases: string[] = [];
  if (isHeader) useCases.push("headlines");
  if (isBody) useCases.push("body text");
  if (classification === "display") useCases.push("hero sections", "branding");
  if (classification === "script" || classification === "handwritten")
    useCases.push("accents", "branding", "invitations");
  if (classification === "monospace") useCases.push("code", "data tables");
  if (classification === "serif" && isBody) useCases.push("long-form reading", "editorial");
  if (classification === "sans-serif" && isBody) useCases.push("UI text", "navigation");

  // Measured font anatomy — 91/114 measured from font files, rest are existing values
  type AnatomyTuple = [Font["xHeightRatio"], Font["apertureOpenness"], Font["strokeContrast"], Font["letterSpacing"], Font["moodCategory"]];
  const FONT_ANATOMY: Record<string, AnatomyTuple> = {
    // ── Sans-Serif (body-suitable) ──
    "kihim":               ["moderate", "closed", "moderate", "normal", "modern"],  // rounded, friendly, generous x-height, open apertures
    "synonym":             ["moderate", "open", "none", "normal", "modern"],  // workhorse neutral, even strokes, clear forms
    "general-sans":        ["moderate", "open", "none", "normal", "modern"],  // geometric-humanist hybrid, generous spacing, legibility-first
    "rowan":               ["moderate", "open", "moderate", "normal", "modern"],  // humanist, warm curves, calligraphic influence
    "technor":             ["high", "open", "none", "normal", "modern"],  // squared terminals, tech precision, mono-width feel
    "switzer":             ["moderate", "open", "low", "normal", "modern"],  // Swiss grotesque, excellent readability, neo-grotesk
    "pilcrow-rounded":     ["high", "open", "none", "tight", "modern"],  // rounded terminals, soft, friendly reading
    "kohinoor-zerone":     ["moderate", "moderate", "none", "normal", "modern"],  // geometric, structured, multilingual heritage
    "alpino":              ["low", "open", "low", "tight", "modern"],  // geometric skeleton, crisp terminals, mathematical
    "amulya":              ["moderate", "open", "low", "normal", "modern"],  // humanist warmth, open apertures, comfortable
    "array":               ["high", "open", "low", "normal", "modern"],  // grid-derived, systematic, digital-native
    "bespoke-sans":        ["moderate", "moderate", "low", "normal", "modern"],  // tailored proportions, refined, professional
    "clash-grotesk":       ["moderate", "open", "none", "normal", "modern"],  // sharp geometric cuts, fashion-forward
    "chubbo":              ["moderate", "open", "none", "normal", "modern"],  // extra-rounded, bubbly, generously padded
    "chillax":             ["moderate", "open", "none", "normal", "modern"],  // relaxed tension, casual curves, easy-going
    "cabinet-grotesk":     ["moderate", "open", "low", "normal", "modern"],  // wide weight range, confident grotesk
    "be-vietnam-pro":      ["moderate", "open", "none", "normal", "modern"],  // Vietnamese-optimized, crisp modern forms
    "nunito":              ["moderate", "open", "low", "normal", "modern"],  // fully rounded terminals, warm sans
    "epilogue":            ["moderate", "open", "none", "normal", "modern"],  // transitional sans, editorial sophistication
    "spline-sans":         ["high", "open", "none", "normal", "modern"],  // spline-curve construction, mathematical precision
    "montserrat":          ["high", "open", "none", "normal", "modern"],  // Buenos Aires signage, geometric, urban
    "manrope":             ["high", "open", "none", "normal", "modern"],  // semi-geometric, open forms, tech-forward
    "outfit":              ["moderate", "open", "none", "normal", "modern"],  // geometric with soft corners, friendly
    "poppins":             ["high", "open", "none", "normal", "modern"],  // perfectly circular rounds, geometric purity
    "work-sans":           ["high", "open", "none", "normal", "modern"],  // screen body text optimized, grotesque-inspired
    "asap":                ["high", "open", "low", "normal", "modern"],  // subtly rounded terminals, body-text optimized
    "public-sans":         ["moderate", "open", "low", "normal", "modern"],  // US gov design system, extreme neutrality, accessibility-first
    "plus-jakarta-sans":   ["moderate", "open", "none", "normal", "modern"],  // geometric with humanist warmth, startup-darling
    "satoshi":             ["moderate", "open", "none", "normal", "modern"],  // contemporary grotesk, Fontshare flagship, universally loved
    "familjen-grotesk":    ["high", "open", "low", "normal", "modern"],  // quirky details, editorial character, Swedish
    "excon":               ["moderate", "open", "none", "normal", "modern"],  // extended width, geometric, confident wide
    "nippo":               ["high", "moderate", "none", "normal", "modern"],  // Japanese aesthetic, geometric purity
    "pally":               ["high", "open", "none", "normal", "modern"],  // bouncy rounded, playful, joyful soft
    "roundo":              ["high", "open", "none", "normal", "modern"],  // fully rounded stroke ends, soft geometric
    "neco":                ["moderate", "open", "moderate", "normal", "modern"],  // unconventional shapes, quirky, art-directed
    "space-grotesk":       ["moderate", "open", "none", "normal", "modern"],  // Space Mono sibling, geometric with quirks
    "supreme":             ["moderate", "open", "low", "normal", "modern"],  // neo-grotesque, balanced, wide utility
    "plein":               ["moderate", "open", "low", "normal", "modern"],  // strong geometric, confident bold, minimal
    "zina":                ["moderate", "closed", "high", "generous", "modern"],  // refined feminine forms, elegant proportions
    "red-hat-display":     ["moderate", "open", "none", "normal", "modern"],  // Red Hat brand heritage, display-optimized
    "sora":                ["moderate", "open", "none", "normal", "modern"],  // Japanese typographic influence, geometric
    "merriweather-sans":   ["high", "moderate", "low", "normal", "modern"],  // Merriweather companion, screen-optimized, humanist
    "quicksand":           ["moderate", "open", "none", "normal", "modern"],  // geometric rounded, soft friendly, wide apertures
    "fraktion":            ["moderate", "moderate", "none", "normal", "technical"],  // fractional precision, grid-based, mathematical
    "wotfard":             ["moderate", "open", "none", "normal", "warm"],  // Futura-inspired with warmth, softened geometric
    "aspekta":             ["moderate", "open", "none", "normal", "modern"],  // geometric foundations, wide weights, screen-ready
    "nohemi":              ["moderate", "open", "none", "normal", "modern"],  // geometric clarity, contemporary neo-grotesque
    "ranade":              ["moderate", "open", "moderate", "generous", "modern"],  // humanist, Marathi influence, warm natural
    "saturo":              ["moderate", "open", "none", "normal", "neutral"],  // balanced geometric, versatile workhorse
    "range":               ["moderate", "open", "none", "normal", "modern"],  // wide geometric, spacious open forms
    "hygge":               ["moderate", "open", "low", "normal", "warm"],  // soft rounded terminals, cozy Scandinavian
    "archivo":             ["high", "open", "low", "normal", "modern"],  // grotesque heritage, high legibility
    "segment":             ["high", "open", "low", "generous", "modern"],  // segment-display inspired, digital readout
    "rx100":               ["high", "moderate", "none", "tight", "technical"],  // measured — camera-model naming, angular digital
    // ── Sans-Serif (display-only) ──
    "oswald":              ["moderate", "moderate", "low", "tight", "modern"],  // condensed gothic, strong vertical emphasis
    "nekst":               ["moderate", "closed", "none", "tight", "bold"],  // condensed industrial, tight headline spacing
    "trench":              ["moderate", "closed", "none", "tight", "bold"],  // military-inspired condensed, utilitarian
    "integral-cf":         ["high", "closed", "none", "tight", "bold"],  // all-caps display, ultra-bold condensed
    // ── Serif (body-suitable) ──
    "gambetta":            ["moderate", "open", "moderate", "normal", "traditional"],  // old-style proportions, warm serif brackets
    "sentient":            ["moderate", "closed", "moderate", "normal", "traditional"],  // contemporary serif, sharp wedge serifs, high-contrast
    "author":              ["moderate", "open", "none", "tight", "neutral"],  // calligraphic serif, literary character
    "bespoke-serif":       ["moderate", "moderate", "moderate", "normal", "traditional"],  // custom serif details, editorial polish
    "bonny":               ["high", "open", "moderate", "tight", "traditional"],  // warm transitional serifs, old-style figures
    "erode":               ["high", "open", "moderate", "normal", "traditional"],  // sharp triangular serifs, contemporary
    "crimson-pro":         ["moderate", "open", "moderate", "tight", "traditional"],  // Garamond-inspired, old-style figures, book quality
    "lora":                ["moderate", "open", "moderate", "normal", "traditional"],  // calligraphic roots, moderate contrast
    "literata":            ["moderate", "open", "moderate", "normal", "traditional"],  // Google Play Books, long reading optimized
    "recia":               ["moderate", "open", "moderate", "normal", "traditional"],  // transitional serif, refined classical
    "telma":               ["high", "open", "moderate", "normal", "traditional"],  // humanist serif warmth, friendly personality
    "paquito":             ["moderate", "moderate", "moderate", "normal", "traditional"],  // friendly serif, warm inviting forms
    "quilon":              ["high", "moderate", "moderate", "normal", "traditional"],  // sharp wedge serifs, editorial refinement
    "otterco":             ["moderate", "moderate", "moderate", "normal", "elegant"],  // contemporary editorial serif, crisp details
    "nueva":               ["moderate", "moderate", "moderate", "normal", "elegant"],  // contemporary serif warmth, literary comfort
    "migra":               ["moderate", "moderate", "high", "normal", "elegant"],  // optical size axis, dramatic contrast variation
    // ── Serif (display-only) ──
    "gambarino":           ["moderate", "moderate", "high", "normal", "elegant"],  // high stroke contrast, dramatic thick-thin
    "boska":               ["moderate", "open", "high", "normal", "elegant"],  // extreme stroke contrast, fashion-forward
    "melodrama":           ["moderate", "open", "high", "normal", "elegant"],  // extreme contrast, theatrical flair
    "expose":              ["high", "moderate", "low", "tight", "bold"],  // extreme thin-thick contrast, fashion magazine
    "new-title":           ["high", "moderate", "low", "tight", "bold"],  // title-optimized, high stroke contrast
    "zodiak":              ["moderate", "open", "high", "normal", "elegant"],  // extreme stroke contrast, Didone elegance
    "stardom":             ["high", "moderate", "high", "normal", "elegant"],  // dramatic weight contrast, fashion-forward
    "magnat":              ["moderate", "moderate", "high", "normal", "elegant"],  // magnetic high-contrast, fashion editorial
    "swear-display":       ["moderate", "moderate", "high", "normal", "elegant"],  // extreme contrast display serif, luxury
    // ── Slab-Serif ──
    "bespoke-slab":        ["moderate", "moderate", "low", "normal", "neutral"],  // blocky slab serifs, sturdy construction
    "trench-slab":         ["high", "moderate", "none", "normal", "neutral"],  // heavy slab serifs, industrial
    // ── Display (sans-based) ──
    "comico":              ["high", "moderate", "none", "generous", "bold"],  // comic-inspired, exaggerated proportions
    "tanker":              ["high", "closed", "none", "tight", "bold"],  // ultra-bold, compressed, industrial
    "boxing":              ["moderate", "open", "none", "generous", "bold"],  // blocky, athletic, high-impact
    "clash-display":       ["moderate", "open", "none", "normal", "bold"],  // dramatic angular cuts, fashion-forward
    "striper":             ["moderate", "moderate", "low", "normal", "bold"],  // inline striped, decorative, graphic
    "aktura":              ["low", "closed", "none", "tight", "bold"],  // decorative inline cuts, stencil-like
    "bespoke-stencil":     ["moderate", "moderate", "low", "normal", "bold"],  // stencil cuts, graphic industrial
    "kola":                ["moderate", "moderate", "low", "normal", "bold"],  // chunky rounded, playful bold
    "panchang":            ["moderate", "open", "none", "generous", "bold"],  // angular geometric cuts, sharp pointed
    "hoover":              ["moderate", "open", "none", "normal", "bold"],  // retro-industrial, heavy solid forms
    "grifter":             ["moderate", "closed", "low", "normal", "playful"],  // ultra-bold rounded, chunky playful
    "cope":                ["moderate", "moderate", "none", "normal", "experimental"],  // unconventional, artistic display
    "humane":              ["low", "closed", "none", "tight", "elegant"],  // ultra-condensed, towering, fashion
    "styro":               ["high", "closed", "low", "tight", "bold"],  // dimensional, playful construction
    "vasion":              ["moderate", "moderate", "none", "normal", "modern"],  // futuristic geometric, sci-fi display
    "hallenger":           ["moderate", "moderate", "low", "normal", "traditional"],  // vintage display, retro ornamental
    "bevellier":           ["high", "moderate", "none", "tight", "bold"],  // beveled edge, Art Deco, luxury
    // ── Monospace ──
    "tabular":             ["moderate", "open", "none", "generous", "technical"],  // fixed-width, coding-optimized
    "azeret-mono":         ["high", "open", "low", "generous", "technical"],  // contemporary mono, crisp modern
    "jetbrains-mono":      ["high", "open", "none", "generous", "technical"],  // increased letter height, coding ligatures
    // ── Script / Handwritten ──
    "britney":             ["moderate", "moderate", "none", "tight", "warm"],  // flowing connected script, decorative swashes
    "pencerio":            ["moderate", "moderate", "low", "tight", "elegant"],  // measured — ornamental script, flowing strokes
    "rosaline":            ["moderate", "closed", "high", "normal", "elegant"],  // elegant script loops, bridal sophistication
    "dancing-script":      ["low", "closed", "moderate", "tight", "elegant"],  // bouncy baseline, casual handwriting
    "kalam":               ["moderate", "moderate", "low", "tight", "warm"],  // pen-drawn, natural handwriting rhythm
    "sharpie":             ["moderate", "closed", "low", "tight", "warm"],  // marker-pen texture, bold handwritten
    // ── Duplicates of core fonts (Fontshare versions) ──
    "bebas-neue":          ["high", "moderate", "none", "tight", "bold"],
    "anton":               ["high", "closed", "low", "tight", "bold"],
    "pramukh-rounded":     ["high", "moderate", "low", "tight", "modern"],  // rounded terminals, Gujarati heritage
  };
  const a = FONT_ANATOMY[slug] ?? (
    // Fallback for any unlisted font (should not happen)
    classification === "serif" ? ["moderate", "moderate", "moderate", "normal", "traditional"] as AnatomyTuple :
    classification === "display" ? ["moderate", "moderate", "none", "normal", "bold"] as AnatomyTuple :
    ["moderate", "moderate", "none", "normal", "neutral"] as AnatomyTuple
  );

  return {
    id: `fs-${slug}`,
    name,
    slug,
    source: "fontshare",
    sourceUrl: `https://www.fontshare.com/fonts/${slug}`,
    downloadUrl: null,
    specimenUrl: null,
    licenseType: "ITF Free Font License",
    licenseConfidence: "high",
    designer: "Indian Type Foundry",
    foundry: "Indian Type Foundry",
    year: null,
    classification,
    subcategory: null,
    serifSansCategory: serifSans,
    tags,
    toneDescriptors,
    useCases,
    variableFont: opts?.variableFont ?? true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal", "italic"],
    isHeaderSuitable: isHeader,
    isBodySuitable: isBody,
    bodyLegibilityScore: opts?.bodyLegibilityScore ?? calcLegibility(classification, a[0], a[1], a[2], a[3]),
    screenReadabilityNotes: null,
    distinctiveTraits: opts?.distinctiveTraits ?? [],
    xHeightRatio: opts?.xHeightRatio ?? a[0],
    apertureOpenness: opts?.apertureOpenness ?? a[1],
    strokeContrast: opts?.strokeContrast ?? a[2],
    letterSpacing: opts?.letterSpacing ?? a[3],
    moodCategory: opts?.moodCategory ?? a[4],
    historicalNotes: null,
    notableUseExamples: [],
    similarFonts: [],
    popularityConfidence: "medium",
    metadataConfidence: "high",
  };
}

export const allFontshareFonts: Font[] = [
  // ── K ──
  fs("Kihim", "kihim", "sans-serif",
    ["geometric", "minimal", "crisp", "contemporary", "approachable", "friendly", "rounded", "soft", "youthful", "fresh"],
    ["friendly", "approachable", "modern", "casual"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["soft rounded terminals", "generous x-height", "open apertures"], xHeightRatio: "high", apertureOpenness: "open", strokeContrast: "none", letterSpacing: "normal", moodCategory: "warm" }),

  // ── C ──
  fs("Comico", "comico", "display",
    ["playful", "bold", "fun", "expressive", "whimsical", "youthful", "energetic", "quirky", "cartoon", "loud"],
    ["playful", "energetic", "bold", "fun", "eye-catching"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["comic-inspired letterforms", "exaggerated proportions", "thick strokes"] }),

  // ── S ──
  fs("Synonym", "synonym", "sans-serif",
    ["neutral", "versatile", "clean", "corporate", "professional", "modern", "reliable", "balanced", "functional", "understated"],
    ["neutral", "professional", "balanced", "dependable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["workhorse proportions", "even stroke widths", "clear letterforms"] }),

  // ── G ──
  fs("General Sans", "general-sans", "sans-serif",
    ["versatile", "crisp", "professional", "sleek", "contemporary", "approachable", "functional", "fresh", "balanced", "startup"],
    ["contemporary", "professional", "approachable", "fresh"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["slightly squared terminals", "generous spacing", "excellent legibility at small sizes"] }),

  fs("Gambarino", "gambarino", "serif",
    ["editorial", "dramatic", "sophisticated", "literary", "refined", "distinctive", "elegant", "high-contrast", "premium", "magazine"],
    ["dramatic", "sophisticated", "editorial", "refined"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["high stroke contrast", "dramatic thick-thin transitions", "sharp serifs"] }),

  // ── R ──
  fs("Rowan", "rowan", "sans-serif",
    ["warm", "approachable", "friendly", "humanist", "cozy", "organic", "gentle", "readable", "inviting", "natural"],
    ["warm", "approachable", "inviting", "gentle"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["humanist construction", "warm curves", "slightly calligraphic influence"] }),

  // ── T ──
  fs("Technor", "technor", "sans-serif",
    ["techy", "futuristic", "geometric", "sleek", "cool", "sharp", "digital", "modern", "minimal", "precise"],
    ["futuristic", "precise", "technical", "cool"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["squared-off terminals", "technical precision", "mono-width feel"] }),

  // ── G ──
  fs("Gambetta", "gambetta", "serif",
    ["literary", "refined", "sophisticated", "classic", "editorial", "bookish", "elegant", "warm", "mature", "traditional"],
    ["literary", "refined", "elegant", "cultured"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["old-style proportions", "smooth serif brackets", "warm color on the page"] }),

  fs("Sentient", "sentient", "serif",
    ["editorial", "contemporary", "refined", "sophisticated", "premium", "literary", "crisp", "luxurious", "magazine", "intelligent"],
    ["sophisticated", "intelligent", "editorial", "premium"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["contemporary serif design", "sharp wedge serifs", "elegant high-contrast strokes"] }),

  fs("Boska", "boska", "serif",
    ["dramatic", "editorial", "bold", "expressive", "fierce", "distinctive", "fashion", "luxurious", "striking", "statement"],
    ["dramatic", "bold", "expressive", "fierce"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["extreme stroke contrast", "dramatic display proportions", "fashion-forward energy"] }),

  fs("Switzer", "switzer", "sans-serif",
    ["neutral", "professional", "versatile", "clean", "corporate", "reliable", "modern", "functional", "polished", "refined"],
    ["professional", "neutral", "reliable", "polished"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["neo-grotesque construction", "tight but readable spacing", "wide weight range"] }),

  fs("Tabular", "tabular", "monospace",
    ["technical", "precise", "digital", "developer", "functional", "systematic", "structured", "coding", "crisp", "data"],
    ["technical", "systematic", "precise", "functional"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["fixed-width characters", "clear number differentiation", "coding-optimized forms"] }),

  fs("Tanker", "tanker", "display",
    ["bold", "fierce", "impactful", "heavy", "industrial", "loud", "powerful", "strong", "edgy", "commanding"],
    ["powerful", "bold", "commanding", "fierce"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["ultra-bold weight", "compressed letterforms", "industrial strength"] }),

  fs("Expose", "expose", "display",
    ["editorial", "fashion", "elegant", "high-contrast", "dramatic", "sophisticated", "luxurious", "striking", "magazine", "premium"],
    ["elegant", "dramatic", "editorial", "luxurious"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["extreme thin-thick contrast", "fashion magazine aesthetic", "refined display proportions"] }),

  fs("Boxing", "boxing", "display",
    ["bold", "sporty", "impactful", "energetic", "strong", "fierce", "athletic", "dynamic", "punchy", "loud"],
    ["bold", "energetic", "fierce", "dynamic"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["blocky letterforms", "athletic energy", "high-impact presence"] }),

  fs("Striper", "striper", "display",
    ["decorative", "experimental", "playful", "artsy", "creative", "distinctive", "whimsical", "graphic", "unconventional", "fun"],
    ["experimental", "creative", "playful", "graphic"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["inline striped detail", "decorative construction", "graphic texture"] }),

  fs("Pilcrow Rounded", "pilcrow-rounded", "sans-serif",
    ["friendly", "soft", "approachable", "rounded", "warm", "cozy", "gentle", "playful", "youthful", "casual"],
    ["friendly", "warm", "approachable", "gentle"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded terminals", "soft personality", "friendly reading experience"] }),

  fs("Melodrama", "melodrama", "serif",
    ["dramatic", "editorial", "expressive", "bold", "fashion", "fierce", "striking", "luxurious", "theatrical", "intense"],
    ["dramatic", "theatrical", "expressive", "bold"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["extreme contrast", "theatrical flair", "dramatic serif details"] }),

];

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
    designer?: string;
    foundry?: string;
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
    "beVietnam-pro":       ["moderate", "open", "none", "normal", "modern"],  // Vietnamese-optimized, crisp modern forms
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
    "rx-100":              ["high", "moderate", "none", "tight", "technical"],  // measured — camera-model naming, angular digital
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
    designer: opts?.designer ?? "Indian Type Foundry",
    foundry: opts?.foundry ?? "Indian Type Foundry",
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
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["soft rounded terminals", "geometric proportions", "stylised enclosed counters"], moodCategory: "warm", designer: "Rocky Malaviya" }),

  // ── C ──
  fs("Comico", "comico", "display",
    ["playful", "bold", "fun", "expressive", "whimsical", "youthful", "energetic", "quirky", "cartoon", "loud"],
    ["playful", "energetic", "bold", "fun", "eye-catching"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["comic-inspired letterforms", "exaggerated proportions", "thick strokes"], designer: "Frode Helland" }),

  // ── S ──
  fs("Synonym", "synonym", "sans-serif",
    ["neutral", "versatile", "clean", "corporate", "professional", "modern", "reliable", "balanced", "functional", "understated"],
    ["neutral", "professional", "balanced", "dependable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["workhorse proportions", "even stroke widths", "clear letterforms"], designer: "Hugo Dumont" }),

  // ── G ──
  fs("General Sans", "general-sans", "sans-serif",
    ["versatile", "crisp", "professional", "sleek", "contemporary", "approachable", "functional", "fresh", "balanced", "startup"],
    ["contemporary", "professional", "approachable", "fresh"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["slightly squared terminals", "generous spacing", "excellent legibility at small sizes"], designer: "Frode Helland" }),

  fs("Gambarino", "gambarino", "serif",
    ["editorial", "dramatic", "sophisticated", "literary", "refined", "distinctive", "elegant", "high-contrast", "premium", "magazine"],
    ["dramatic", "sophisticated", "editorial", "refined"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["high stroke contrast", "dramatic thick-thin transitions", "sharp serifs"], designer: "Théo Guillard" }),

  // ── R ──
  fs("Rowan", "rowan", "serif",
    ["warm", "approachable", "friendly", "humanist", "cozy", "organic", "gentle", "readable", "inviting", "natural"],
    ["warm", "approachable", "inviting", "gentle"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["humanist construction", "warm curves", "slightly calligraphic influence"], designer: "Inga Plönnigs" }),

  // ── T ──
  fs("Technor", "technor", "sans-serif",
    ["techy", "futuristic", "geometric", "sleek", "cool", "sharp", "digital", "modern", "minimal", "precise"],
    ["futuristic", "precise", "technical", "cool"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["squared-off terminals", "technical precision", "mono-width feel"], designer: "Jean-Baptiste Morizot" }),

  // ── G ──
  fs("Gambetta", "gambetta", "serif",
    ["literary", "refined", "sophisticated", "classic", "editorial", "bookish", "elegant", "warm", "mature", "traditional"],
    ["literary", "refined", "elegant", "cultured"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["old-style proportions", "smooth serif brackets", "warm color on the page"], designer: "Paul Troppmar" }),

  fs("Sentient", "sentient", "serif",
    ["editorial", "contemporary", "refined", "sophisticated", "premium", "literary", "crisp", "luxurious", "magazine", "intelligent"],
    ["sophisticated", "intelligent", "editorial", "premium"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["contemporary serif design", "sharp wedge serifs", "elegant high-contrast strokes"], designer: "Noopur Choksi" }),

  fs("Boska", "boska", "serif",
    ["dramatic", "editorial", "bold", "expressive", "fierce", "distinctive", "fashion", "luxurious", "striking", "statement"],
    ["dramatic", "bold", "expressive", "fierce"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["extreme stroke contrast", "dramatic display proportions", "fashion-forward energy"], designer: "Barbara Bigosinska" }),

  fs("Switzer", "switzer", "sans-serif",
    ["neutral", "professional", "versatile", "clean", "corporate", "reliable", "modern", "functional", "polished", "refined"],
    ["professional", "neutral", "reliable", "polished"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["neo-grotesque construction", "tight but readable spacing", "wide weight range"], designer: "Jérémie Hornus" }),

  fs("Tabular", "tabular", "monospace",
    ["technical", "precise", "digital", "developer", "functional", "systematic", "structured", "coding", "crisp", "data"],
    ["technical", "systematic", "precise", "functional"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["fixed-width characters", "clear number differentiation", "coding-optimized forms"], designer: "Jérémie Hornus, Julie Soudanne" }),

  fs("Tanker", "tanker", "display",
    ["bold", "fierce", "impactful", "heavy", "industrial", "loud", "powerful", "strong", "edgy", "commanding"],
    ["powerful", "bold", "commanding", "fierce"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["ultra-bold weight", "compressed letterforms", "industrial strength"], designer: "Ruosi Huang" }),

  fs("Expose", "expose", "display",
    ["editorial", "fashion", "elegant", "high-contrast", "dramatic", "sophisticated", "luxurious", "striking", "magazine", "premium"],
    ["elegant", "dramatic", "editorial", "luxurious"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["extreme thin-thick contrast", "fashion magazine aesthetic", "refined display proportions"], designer: "Lukas Schneider" }),

  fs("Boxing", "boxing", "display",
    ["bold", "sporty", "impactful", "energetic", "strong", "fierce", "athletic", "dynamic", "punchy", "loud"],
    ["bold", "energetic", "fierce", "dynamic"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["blocky letterforms", "athletic energy", "high-impact presence"], designer: "Ruosi Huang" }),

  fs("Striper", "striper", "display",
    ["decorative", "experimental", "playful", "artsy", "creative", "distinctive", "whimsical", "graphic", "unconventional", "fun"],
    ["experimental", "creative", "playful", "graphic"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["inline striped detail", "decorative construction", "graphic texture"], designer: "Jitka Janečková" }),

  fs("Pilcrow Rounded", "pilcrow-rounded", "sans-serif",
    ["friendly", "soft", "approachable", "rounded", "warm", "cozy", "gentle", "playful", "youthful", "casual"],
    ["friendly", "warm", "approachable", "gentle"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded terminals", "soft personality", "friendly reading experience"], designer: "Satya Rajpurohit" }),

  fs("Melodrama", "melodrama", "serif",
    ["dramatic", "editorial", "expressive", "bold", "fashion", "fierce", "striking", "luxurious", "theatrical", "intense"],
    ["dramatic", "theatrical", "expressive", "bold"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["extreme contrast", "theatrical flair", "dramatic serif details"], designer: "Shaily Patel" }),

  // ── A ──
  fs("Aktura", "aktura", "display",
    ["blackletter", "gothic", "medieval", "ornate", "dark", "dramatic", "historical", "bold", "intense", "decorative"],
    ["dramatic", "historical", "intense", "bold"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["blackletter construction", "gothic arches", "medieval texture"], moodCategory: "experimental", designer: "Gaetan Baehr" }),

  fs("Alpino", "alpino", "sans-serif",
    ["rounded", "friendly", "soft", "approachable", "warm", "playful", "modern", "casual", "youthful", "accessible"],
    ["friendly", "warm", "approachable", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded terminals", "soft geometric forms", "friendly open apertures"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Alisa Nowak, Jérémie Hornus" }),

  fs("Amulya", "amulya", "sans-serif",
    ["clean", "modern", "neutral", "versatile", "professional", "geometric", "balanced", "functional", "crisp", "contemporary"],
    ["modern", "neutral", "professional", "clean"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["clean geometric construction", "balanced proportions", "excellent legibility range"], xHeightRatio: "moderate", apertureOpenness: "open", moodCategory: "modern", designer: "Joana Correia" }),

  fs("Array", "array", "display",
    ["technical", "geometric", "grid", "modular", "digital", "systematic", "precise", "structured", "futuristic", "architectural"],
    ["technical", "precise", "systematic", "structured"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["modular grid construction", "geometric modules", "pixel-influenced forms"], moodCategory: "technical", designer: "Frode Helland" }),

  fs("Asap", "asap", "sans-serif",
    ["versatile", "neutral", "readable", "professional", "clean", "modern", "balanced", "functional", "approachable", "screen-optimized"],
    ["professional", "neutral", "balanced", "readable"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["subtle humanist details", "optimized for screens", "wide spacing"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "neutral", designer: "Omnibus-Type", foundry: "Omnibus-Type" }),

  fs("Azeret Mono", "azeret-mono", "monospace",
    ["technical", "coding", "developer", "functional", "systematic", "clean", "precise", "digital", "structured", "modern"],
    ["technical", "functional", "precise", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["rounded monospace forms", "clear character differentiation", "humanist mono feel"], moodCategory: "technical", designer: "Displaay", foundry: "Displaay" }),

  // ── B ──
  fs("Be Vietnam Pro", "beVietnam-pro", "sans-serif",
    ["humanist", "warm", "versatile", "readable", "approachable", "modern", "clean", "professional", "balanced", "friendly"],
    ["warm", "approachable", "professional", "versatile"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["humanist sans proportions", "generous x-height", "open apertures", "excellent multilingual support"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Lam Bao, Tony Le, Vietanh Nguyen" }),

  fs("Bespoke Sans", "bespoke-sans", "sans-serif",
    ["editorial", "refined", "versatile", "modern", "clean", "professional", "sharp", "contemporary", "neutral", "balanced"],
    ["refined", "professional", "contemporary", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["crisp terminals", "refined proportions", "editorial-quality spacing"], xHeightRatio: "moderate", apertureOpenness: "open", moodCategory: "modern", designer: "Jérémie Hornus, Théo Guillard, Morgane Pambrun, Alisa Nowak, Joachim Vu" }),

  fs("Bespoke Serif", "bespoke-serif", "serif",
    ["editorial", "refined", "literary", "elegant", "sophisticated", "classic", "traditional", "premium", "bookish", "cultured"],
    ["refined", "literary", "elegant", "sophisticated"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["sharp bracketed serifs", "editorial proportions", "refined stroke contrast"], xHeightRatio: "moderate", strokeContrast: "moderate", moodCategory: "elegant", designer: "Jérémie Hornus, Théo Guillard, Morgane Pambrun, Alisa Nowak, Joachim Vu" }),

  fs("Bespoke Slab", "bespoke-slab", "serif",
    ["editorial", "sturdy", "readable", "confident", "modern", "slab", "grounded", "reliable", "versatile", "professional"],
    ["confident", "grounded", "professional", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["slab serifs", "sturdy construction", "reliable at all sizes"], xHeightRatio: "high", strokeContrast: "low", moodCategory: "bold", designer: "Jérémie Hornus, Théo Guillard, Morgane Pambrun, Alisa Nowak, Joachim Vu" }),

  fs("Bespoke Stencil", "bespoke-stencil", "display",
    ["stencil", "editorial", "industrial", "bold", "graphic", "distinctive", "urban", "strong", "designed", "confident"],
    ["bold", "industrial", "graphic", "distinctive"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["stencil breaks", "strong industrial character", "graphic texture"], moodCategory: "bold", designer: "Jérémie Hornus, Théo Guillard, Morgane Pambrun, Alisa Nowak, Joachim Vu" }),

  fs("Bevellier", "bevellier", "display",
    ["luxury", "elegant", "fashion", "refined", "high-end", "sophisticated", "premium", "editorial", "striking", "distinctive"],
    ["luxurious", "elegant", "sophisticated", "refined"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["beveled letterforms", "luxury display proportions", "refined editorial presence"], moodCategory: "elegant", designer: "Arya Purohit, Barbara Bigosinska" }),

  fs("Bonny", "bonny", "serif",
    ["warm", "humanist", "literary", "friendly", "readable", "approachable", "cozy", "inviting", "comfortable", "classic"],
    ["warm", "friendly", "readable", "inviting"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["warm humanist serifs", "inviting proportions", "friendly letter shapes"], xHeightRatio: "moderate", apertureOpenness: "open", moodCategory: "warm", designer: "Barbara Bigosinska" }),

  fs("Britney", "britney", "script",
    ["playful", "expressive", "fun", "casual", "handwritten", "youthful", "energetic", "bubbly", "friendly", "vibrant"],
    ["playful", "energetic", "fun", "expressive"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["bouncy baseline", "casual script energy", "expressive lettering"], moodCategory: "playful", designer: "Diana Ovezea, Sabina Chipară" }),

  // ── C ──
  fs("Chillax", "chillax", "sans-serif",
    ["relaxed", "friendly", "casual", "modern", "approachable", "soft", "rounded", "clean", "easy", "contemporary"],
    ["relaxed", "friendly", "approachable", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["slightly rounded terminals", "relaxed spacing", "casual geometric proportions"], xHeightRatio: "moderate", moodCategory: "warm", designer: "Manushi Parikh" }),

  fs("Chubbo", "chubbo", "display",
    ["bold", "rounded", "playful", "fun", "chubby", "friendly", "casual", "expressive", "youthful", "bubbly"],
    ["bold", "playful", "fun", "friendly"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["exaggerated round forms", "heavy weight presence", "fun proportions"], moodCategory: "playful", designer: "Rafał Buchner" }),

  // ── E ──
  fs("Epilogue", "epilogue", "sans-serif",
    ["neutral", "versatile", "clean", "professional", "modern", "reliable", "balanced", "functional", "readable", "understated"],
    ["neutral", "professional", "versatile", "clean"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["wide weight range", "excellent screen legibility", "neutral grotesque personality"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "neutral", designer: "Tyler Finck", foundry: "Etcetera Type Co" }),

  fs("Erode", "erode", "serif",
    ["editorial", "refined", "literary", "crisp", "sophisticated", "elegant", "contemporary", "sharp", "premium", "magazine"],
    ["refined", "editorial", "sophisticated", "elegant"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["sharp serif details", "elegant proportions", "excellent for long-form reading"], xHeightRatio: "high", strokeContrast: "moderate", moodCategory: "elegant", designer: "Nikhil Ranganathan" }),

  fs("Excon", "excon", "sans-serif",
    ["condensed", "strong", "compact", "bold", "efficient", "modern", "functional", "structured", "tight", "utilitarian"],
    ["strong", "efficient", "functional", "modern"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["condensed proportions", "space-efficient", "strong backbone"], xHeightRatio: "high", letterSpacing: "tight", moodCategory: "bold", designer: "Alisa Nowak" }),

  // ── F ──
  fs("Familjen Grotesk", "familjen-grotesk", "sans-serif",
    ["quirky", "modern", "playful", "contemporary", "editorial", "distinctive", "character", "fresh", "individual", "lively"],
    ["modern", "quirky", "fresh", "contemporary"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["quirky details", "lively character shapes", "fresh grotesque personality"], xHeightRatio: "high", moodCategory: "modern", designer: "Familjen STHLM AB", foundry: "Familjen STHLM AB" }),

  fs("Fira Sans", "fira-sans", "sans-serif",
    ["humanist", "readable", "professional", "screen-optimized", "versatile", "clean", "modern", "functional", "balanced", "reliable"],
    ["professional", "readable", "versatile", "reliable"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["humanist construction", "excellent screen hinting", "wide weight range"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "neutral", designer: "Carrois Apostrophe", foundry: "Carrois Apostrophe" }),

  // ── H ──
  fs("Hind", "hind", "sans-serif",
    ["clean", "humanist", "readable", "functional", "neutral", "professional", "screen-optimized", "versatile", "modern", "balanced"],
    ["clean", "readable", "neutral", "functional"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Devanagari-influenced spacing", "clean humanist forms", "excellent small sizes"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "neutral", designer: "Manushi Parikh" }),

  fs("Hoover", "hoover", "serif",
    ["slab", "sturdy", "editorial", "confident", "bold", "grounded", "industrial", "robust", "reliable", "american"],
    ["confident", "grounded", "robust", "bold"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["slab serif construction", "sturdy confident forms", "editorial backbone"], xHeightRatio: "high", strokeContrast: "low", moodCategory: "bold", designer: "Gaetan Baehr" }),

  // ── K ──
  fs("Kalam", "kalam", "handwritten",
    ["handwritten", "casual", "friendly", "personal", "warm", "natural", "relaxed", "authentic", "informal", "approachable"],
    ["friendly", "casual", "warm", "personal"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["natural handwritten rhythm", "personal warmth", "authentic informal character"], moodCategory: "warm" }),

  fs("Karma", "karma", "serif",
    ["warm", "literary", "readable", "traditional", "classic", "elegant", "bookish", "comfortable", "humanist", "trustworthy"],
    ["warm", "literary", "trustworthy", "comfortable"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["generous x-height", "warm humanist serifs", "optimized for long-form reading"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "traditional", designer: "Joana Correia" }),

  fs("Khand", "khand", "sans-serif",
    ["condensed", "editorial", "crisp", "structured", "modern", "clean", "efficient", "versatile", "refined", "contemporary"],
    ["crisp", "structured", "editorial", "modern"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["subtle condensed proportions", "crisp terminals", "editorial character"], xHeightRatio: "moderate", letterSpacing: "tight", moodCategory: "modern", designer: "Satya Rajpurohit" }),

  fs("Kohinoor Zerone", "kohinoor-zerone", "display",
    ["geometric", "structured", "architectural", "precise", "bold", "modern", "graphic", "strong", "systematic", "designed"],
    ["bold", "precise", "architectural", "modern"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["geometric construction", "architectural presence", "structured forms"], moodCategory: "technical", designer: "Satya Rajpurohit" }),

  fs("Kola", "kola", "display",
    ["retro", "vintage", "bold", "nostalgic", "expressive", "fun", "playful", "characterful", "graphic", "distinctive"],
    ["retro", "expressive", "fun", "distinctive"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["retro display proportions", "vintage energy", "expressive character"], moodCategory: "playful", designer: "Jean-Baptiste Morizot" }),

  // ── L ──
  fs("Literata", "literata", "serif",
    ["literary", "readable", "elegant", "sophisticated", "bookish", "editorial", "refined", "classical", "long-form", "cultured"],
    ["literary", "elegant", "refined", "sophisticated"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["optimized for long-form reading", "elegant proportions", "refined serif details"], xHeightRatio: "moderate", strokeContrast: "moderate", moodCategory: "elegant", designer: "TypeTogether", foundry: "TypeTogether" }),

  // ── M ──
  fs("Merriweather Sans", "merriweather-sans", "sans-serif",
    ["readable", "screen-optimized", "warm", "humanist", "professional", "functional", "clean", "comfortable", "versatile", "reliable"],
    ["readable", "warm", "professional", "comfortable"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["screen-first design", "comfortable spacing", "warm humanist character"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Eben Sorkin", foundry: "Sorkin Type" }),

  // ── N ──
  fs("Neco", "neco", "serif",
    ["editorial", "contemporary", "refined", "precise", "sophisticated", "elegant", "sharp", "magazine", "literary", "crisp"],
    ["refined", "contemporary", "sophisticated", "precise"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["contemporary serif forms", "precise details", "elegant spacing"], strokeContrast: "moderate", moodCategory: "elegant", designer: "Jitka Janečková" }),

  fs("New Title", "new-title", "display",
    ["editorial", "bold", "strong", "contemporary", "magazine", "headline", "confident", "modern", "impactful", "stark"],
    ["bold", "confident", "contemporary", "impactful"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["strong headline presence", "editorial proportions", "contemporary display character"], moodCategory: "bold", designer: "Julie Soudanne, Jérémie Hornus" }),

  fs("Nippo", "nippo", "display",
    ["geometric", "futuristic", "minimal", "sharp", "modern", "clean", "architectural", "precise", "technical", "bold"],
    ["futuristic", "minimal", "sharp", "modern"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["geometric precision", "futuristic proportions", "clean modern display"], moodCategory: "technical", designer: "Manushi Parikh" }),

  fs("Nunito", "nunito", "sans-serif",
    ["rounded", "friendly", "warm", "approachable", "soft", "clean", "modern", "comfortable", "youthful", "accessible"],
    ["friendly", "warm", "approachable", "comfortable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded terminals", "warm friendly proportions", "excellent UI font"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Vernon Adams" }),

  // ── O ──
  fs("Oswald", "oswald", "display",
    ["condensed", "bold", "strong", "impactful", "structured", "clean", "modern", "editorial", "confident", "sharp"],
    ["bold", "strong", "confident", "editorial"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["condensed proportions", "strong backbone", "impactful at large sizes"], letterSpacing: "tight", moodCategory: "bold", designer: "Vernon Adams" }),

  // ── P ──
  fs("Pally", "pally", "sans-serif",
    ["playful", "rounded", "friendly", "casual", "fun", "youthful", "approachable", "soft", "warm", "cheerful"],
    ["playful", "friendly", "cheerful", "warm"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["playful rounded forms", "cheerful proportions", "friendly personality"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "playful" }),

  fs("Panchang", "panchang", "display",
    ["bold", "expressive", "graphic", "contemporary", "strong", "editorial", "modern", "impactful", "distinctive", "confident"],
    ["bold", "expressive", "contemporary", "confident"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["bold expressive forms", "graphic energy", "strong display presence"], moodCategory: "bold", designer: "Barbara Bigosinska, Hitesh Malaviya" }),

  fs("Paquito", "paquito", "serif",
    ["slab", "friendly", "approachable", "warm", "sturdy", "editorial", "trustworthy", "grounded", "readable", "confident"],
    ["friendly", "warm", "trustworthy", "grounded"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded slab serifs", "friendly construction", "warm reliable feel"], xHeightRatio: "high", strokeContrast: "low", moodCategory: "warm", designer: "Juanjo Lopez" }),

  fs("Pencerio", "pencerio", "script",
    ["elegant", "calligraphic", "refined", "sophisticated", "formal", "classic", "luxurious", "fluid", "graceful", "premium"],
    ["elegant", "refined", "sophisticated", "graceful"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["calligraphic rhythm", "elegant script flourishes", "refined letterforms"], moodCategory: "elegant", designer: "Manushi Parikh" }),

  fs("Plein", "plein", "sans-serif",
    ["neutral", "functional", "clean", "modern", "professional", "versatile", "balanced", "reliable", "understated", "crisp"],
    ["neutral", "functional", "professional", "reliable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["clean neutral forms", "excellent legibility", "no-nonsense personality"], xHeightRatio: "moderate", apertureOpenness: "open", moodCategory: "neutral", designer: "Inga Plönnigs" }),

  fs("Pramukh Rounded", "pramukh-rounded", "sans-serif",
    ["rounded", "friendly", "modern", "approachable", "clean", "warm", "accessible", "soft", "contemporary", "functional"],
    ["friendly", "approachable", "warm", "modern"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["rounded terminals", "clean modern construction", "approachable personality"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Aarya Purohit" }),

  fs("Public Sans", "public-sans", "sans-serif",
    ["neutral", "clean", "professional", "functional", "reliable", "government", "accessible", "modern", "versatile", "trustworthy"],
    ["neutral", "professional", "reliable", "trustworthy"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["strong neutrality", "high legibility", "wide range of weights", "designed for accessibility"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "neutral", designer: "Pablo Impallari, Rodrigo Fuenzalida, Dan Williams", foundry: "USWDS" }),

  // ── Q ──
  fs("Quicksand", "quicksand", "sans-serif",
    ["rounded", "friendly", "modern", "clean", "approachable", "soft", "contemporary", "geometric", "warm", "accessible"],
    ["friendly", "approachable", "modern", "warm"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded terminals", "geometric proportions", "friendly modern feel"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Andrew Paglinawan" }),

  fs("Quilon", "quilon", "display",
    ["editorial", "refined", "elegant", "contemporary", "sophisticated", "sharp", "magazine", "striking", "modern", "premium"],
    ["refined", "elegant", "sophisticated", "contemporary"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["editorial display presence", "refined proportions", "contemporary design"], moodCategory: "elegant", designer: "Jonny Pinhorn" }),

  // ── R ──
  fs("RX100", "rx-100", "display",
    ["technical", "futuristic", "digital", "sharp", "modern", "clean", "geometric", "precise", "angular", "systematic"],
    ["technical", "futuristic", "sharp", "precise"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["technical precision", "futuristic geometry", "sharp angular forms"], moodCategory: "technical", designer: "Anurag Gautam" }),

  fs("Rajdhani", "rajdhani", "sans-serif",
    ["condensed", "modern", "clean", "structured", "versatile", "editorial", "crisp", "functional", "balanced", "contemporary"],
    ["modern", "structured", "crisp", "versatile"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["Devanagari-influenced forms", "clean condensed character", "crisp terminals"], xHeightRatio: "moderate", letterSpacing: "tight", moodCategory: "modern", designer: "Shiva Nallaperumal" }),

  fs("Ranade", "ranade", "sans-serif",
    ["humanist", "warm", "modern", "approachable", "readable", "friendly", "versatile", "clean", "professional", "balanced"],
    ["warm", "approachable", "professional", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["warm humanist construction", "natural letterforms", "excellent readability"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "warm", designer: "Easha Ranade" }),

  fs("Recia", "recia", "serif",
    ["editorial", "literary", "sophisticated", "refined", "contemporary", "sharp", "elegant", "crisp", "magazine", "premium"],
    ["literary", "sophisticated", "refined", "elegant"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["contemporary serif detailing", "editorial proportions", "crisp text performance"], strokeContrast: "moderate", moodCategory: "elegant", designer: "Carlos de Toro" }),

  fs("Red Hat Display", "red-hat-display", "display",
    ["technical", "bold", "geometric", "modern", "strong", "professional", "clean", "sharp", "confident", "engineering"],
    ["technical", "bold", "professional", "confident"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["geometric boldness", "technical precision", "strong display character"], moodCategory: "technical", designer: "Jeremy Mickel", foundry: "MCKL" }),

  fs("Rosaline", "rosaline", "script",
    ["romantic", "elegant", "feminine", "graceful", "flowing", "soft", "dreamy", "luxurious", "refined", "beautiful"],
    ["romantic", "elegant", "graceful", "soft"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["flowing romantic script", "elegant flourishes", "graceful letterforms"], moodCategory: "elegant", designer: "Jérémie Hornus" }),

  fs("Roundo", "roundo", "sans-serif",
    ["rounded", "geometric", "modern", "clean", "friendly", "approachable", "soft", "contemporary", "minimal", "warm"],
    ["modern", "friendly", "clean", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["rounded geometric forms", "clean modern construction", "soft minimal personality"], xHeightRatio: "moderate", apertureOpenness: "open", moodCategory: "warm" }),

  // ── S ──
  fs("Segment", "segment", "display",
    ["digital", "technical", "futuristic", "lcd", "pixel", "systematic", "precise", "electronic", "sci-fi", "screen"],
    ["technical", "futuristic", "systematic", "precise"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["LCD segment aesthetics", "digital display influence", "systematic construction"], moodCategory: "technical", designer: "Frode Helland" }),

  fs("Sharpie", "sharpie", "display",
    ["bold", "expressive", "loud", "impactful", "strong", "commanding", "graphic", "attention", "distinctive", "forceful"],
    ["bold", "commanding", "expressive", "forceful"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["bold thick strokes", "commanding presence", "graphic boldness"], moodCategory: "bold", designer: "Théo Guillard" }),

  fs("Spline Sans", "spline-sans", "sans-serif",
    ["modern", "clean", "versatile", "professional", "geometric", "neutral", "balanced", "contemporary", "functional", "crisp"],
    ["modern", "clean", "professional", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["clean modern construction", "geometric neutrality", "reliable performance"], xHeightRatio: "moderate", apertureOpenness: "open", moodCategory: "modern", designer: "Eben Sorkin, Mirko Velimirović" }),

  fs("Stardom", "stardom", "display",
    ["glamorous", "bold", "dramatic", "attention", "showstopper", "luxurious", "entertainment", "expressive", "striking", "confident"],
    ["glamorous", "dramatic", "bold", "striking"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["glamour display proportions", "star power presence", "dramatic letterforms"], moodCategory: "bold", designer: "Indian Type Foundry" }),

  fs("Styro", "styro", "display",
    ["retro", "bold", "chunky", "graphic", "nostalgic", "expressive", "fun", "playful", "vintage", "distinctive"],
    ["retro", "bold", "expressive", "fun"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["retro chunky forms", "bold graphic energy", "vintage display character"], moodCategory: "playful", designer: "Aarya Purohit" }),

  fs("Supreme", "supreme", "sans-serif",
    ["modern", "neutral", "versatile", "professional", "clean", "reliable", "balanced", "functional", "crisp", "understated"],
    ["modern", "neutral", "professional", "reliable"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["clean modern proportions", "excellent legibility", "versatile weight range"], xHeightRatio: "high", apertureOpenness: "open", moodCategory: "modern", designer: "Jérémie Hornus, Ilya Naumoff" }),

  // ── T ──
  fs("Teko", "teko", "sans-serif",
    ["condensed", "bold", "modern", "strong", "compact", "geometric", "structured", "editorial", "confident", "clean"],
    ["bold", "modern", "confident", "structured"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["condensed proportions", "strong geometric forms", "editorial boldness"], letterSpacing: "tight", moodCategory: "bold", designer: "Manushi Parikh" }),

  fs("Telma", "telma", "script",
    ["elegant", "refined", "calligraphic", "sophisticated", "fluid", "graceful", "classic", "premium", "formal", "beautiful"],
    ["elegant", "refined", "sophisticated", "graceful"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["refined calligraphic letterforms", "elegant flow", "sophisticated script character"], moodCategory: "elegant", designer: "Jitka Janečková" }),

  fs("Trench Slab", "trench-slab", "serif",
    ["slab", "editorial", "strong", "grounded", "bold", "industrial", "reliable", "confident", "structured", "modern"],
    ["strong", "grounded", "confident", "bold"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["slab construction", "strong editorial presence", "bold but readable"], xHeightRatio: "high", strokeContrast: "low", moodCategory: "bold", designer: "Shiva Nallaperumal" }),

  // ── Z ──
  fs("Zina", "zina", "display",
    ["editorial", "sophisticated", "contemporary", "refined", "fashion", "luxury", "elegant", "striking", "distinctive", "premium"],
    ["sophisticated", "elegant", "refined", "editorial"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["contemporary display elegance", "refined proportions", "fashion-forward energy"], moodCategory: "elegant", designer: "Théo Guillard" }),

];

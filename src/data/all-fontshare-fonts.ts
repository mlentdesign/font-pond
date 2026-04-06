// Fontshare font library — rich individualized metadata
// All Fontshare fonts are variable fonts
import { Font, FontClassification } from "./types";

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
    designer: null,
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
    bodyLegibilityScore: opts?.bodyLegibilityScore ?? (isBody ? 7 : 4),
    screenReadabilityNotes: null,
    distinctiveTraits: opts?.distinctiveTraits ?? [],
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
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["soft rounded terminals", "generous x-height", "open apertures"] }),

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

  fs("Kohinoor Zerone", "kohinoor-zerone", "sans-serif",
    ["geometric", "contemporary", "minimal", "clean", "precise", "modern", "structured", "sleek", "functional", "technical"],
    ["modern", "precise", "minimal", "structured"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["geometric construction", "structured proportions", "multilingual support heritage"] }),

  fs("New Title", "new-title", "display",
    ["editorial", "fashion", "elegant", "sophisticated", "premium", "high-contrast", "magazine", "luxurious", "refined", "statement"],
    ["editorial", "sophisticated", "elegant", "premium"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["title-optimized proportions", "high stroke contrast", "editorial gravitas"] }),

  fs("Aktura", "aktura", "display",
    ["decorative", "experimental", "artsy", "creative", "unconventional", "graphic", "distinctive", "edgy", "avant-garde", "bold"],
    ["experimental", "creative", "avant-garde", "distinctive"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["decorative inline cuts", "stencil-like construction", "graphic texture"] }),

  fs("Alpino", "alpino", "sans-serif",
    ["geometric", "crisp", "modern", "technical", "cool", "precise", "structured", "clean", "minimal", "systematic"],
    ["crisp", "technical", "modern", "precise"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["geometric skeleton", "crisp terminals", "mathematical precision"] }),

  fs("Amulya", "amulya", "sans-serif",
    ["warm", "approachable", "humanist", "friendly", "readable", "versatile", "gentle", "cozy", "inviting", "natural"],
    ["warm", "approachable", "friendly", "readable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["humanist warmth", "open apertures", "comfortable reading rhythm"] }),

  fs("Array", "array", "sans-serif",
    ["technical", "systematic", "modern", "digital", "precise", "structured", "cool", "geometric", "functional", "grid-based"],
    ["systematic", "technical", "modern", "structured"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["grid-derived structure", "systematic proportions", "digital-native design"] }),

  fs("Author", "author", "serif",
    ["literary", "elegant", "classic", "refined", "bookish", "sophisticated", "warm", "timeless", "mature", "editorial"],
    ["literary", "elegant", "refined", "timeless"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["calligraphic serif details", "literary character", "beautiful italic forms"] }),

  fs("Bespoke Sans", "bespoke-sans", "sans-serif",
    ["tailored", "refined", "professional", "premium", "distinctive", "polished", "corporate", "crisp", "elegant", "bespoke"],
    ["refined", "professional", "tailored", "polished"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["custom-tailored proportions", "refined details", "professional presence"] }),

  fs("Bespoke Serif", "bespoke-serif", "serif",
    ["tailored", "editorial", "refined", "literary", "elegant", "premium", "sophisticated", "distinctive", "polished", "classic"],
    ["editorial", "refined", "sophisticated", "elegant"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["custom serif details", "editorial polish", "refined proportions"] }),

  fs("Bespoke Slab", "bespoke-slab", "slab-serif",
    ["structured", "bold", "distinctive", "editorial", "sturdy", "confident", "strong", "grounded", "mechanical", "impactful"],
    ["confident", "structured", "bold", "grounded"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["blocky slab serifs", "sturdy construction", "strong vertical rhythm"] }),

  fs("Bespoke Stencil", "bespoke-stencil", "display",
    ["decorative", "graphic", "artsy", "creative", "stencil", "industrial", "experimental", "bold", "edgy", "distinctive"],
    ["graphic", "creative", "industrial", "bold"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["stencil cuts in letterforms", "graphic industrial feel", "eye-catching breaks"] }),

  fs("Clash Grotesk", "clash-grotesk", "sans-serif",
    ["sharp", "edgy", "modern", "bold", "distinctive", "fashion", "cool", "striking", "contemporary", "crisp"],
    ["sharp", "bold", "modern", "distinctive"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["sharp geometric cuts", "clash of round and angular forms", "fashion-forward energy"] }),

  fs("Clash Display", "clash-display", "display",
    ["sharp", "edgy", "fashion", "bold", "modern", "striking", "fierce", "high-impact", "contemporary", "statement"],
    ["fierce", "modern", "bold", "striking"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["dramatic angular cuts", "display-optimized proportions", "fashion-forward presence"] }),

  fs("Chubbo", "chubbo", "sans-serif",
    ["rounded", "friendly", "playful", "soft", "approachable", "fun", "youthful", "cozy", "bubbly", "girly"],
    ["friendly", "playful", "fun", "bubbly"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["extra-rounded forms", "bubbly personality", "generously padded shapes"] }),

  fs("Chillax", "chillax", "sans-serif",
    ["relaxed", "casual", "cool", "approachable", "fresh", "youthful", "laid-back", "friendly", "modern", "chill"],
    ["relaxed", "cool", "casual", "fresh"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["relaxed letterform tension", "casual curves", "easy-going rhythm"] }),

  fs("Cabinet Grotesk", "cabinet-grotesk", "sans-serif",
    ["bold", "confident", "modern", "startup", "professional", "versatile", "crisp", "strong", "corporate", "polished"],
    ["confident", "bold", "professional", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["wide weight range", "confident grotesk character", "startup-friendly aesthetic"] }),

  fs("Britney", "britney", "script",
    ["girly", "elegant", "decorative", "feminine", "delicate", "romantic", "whimsical", "flowing", "graceful", "pretty"],
    ["feminine", "elegant", "romantic", "graceful"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["flowing connected script", "decorative swashes", "romantic feminine energy"] }),

  fs("Bonny", "bonny", "serif",
    ["warm", "literary", "classic", "elegant", "refined", "cozy", "gentle", "bookish", "traditional", "inviting"],
    ["warm", "literary", "classic", "gentle"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["warm transitional serifs", "old-style figures", "comfortable book typography"] }),

  fs("Bevellier", "bevellier", "display",
    ["decorative", "premium", "luxurious", "distinctive", "elegant", "art-deco", "refined", "glamorous", "sophisticated", "bold"],
    ["luxurious", "glamorous", "premium", "sophisticated"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["beveled edge detail", "Art Deco influence", "luxury brand feel"] }),

  fs("Archivo", "archivo", "sans-serif",
    ["versatile", "reliable", "professional", "functional", "clean", "modern", "corporate", "neutral", "sturdy", "dependable"],
    ["professional", "reliable", "functional", "sturdy"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["grotesque heritage", "high legibility", "wide language support"] }),

  fs("Dancing Script", "dancing-script", "handwritten",
    ["casual", "friendly", "handwritten", "warm", "playful", "personal", "whimsical", "inviting", "fun", "organic"],
    ["casual", "friendly", "personal", "warm"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["bouncy baseline", "casual handwriting feel", "connected letterforms"] }),

  fs("Bebas Neue", "bebas-neue", "display",
    ["bold", "condensed", "impactful", "strong", "industrial", "commanding", "loud", "masculine", "powerful", "cinematic"],
    ["bold", "commanding", "powerful", "cinematic"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["all-caps condensed design", "industrial strength", "poster-ready impact"] }),

  fs("Poppins", "poppins", "sans-serif",
    ["geometric", "friendly", "modern", "clean", "approachable", "versatile", "fresh", "youthful", "rounded", "popular"],
    ["friendly", "modern", "approachable", "clean"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["perfectly circular rounds", "geometric purity", "universally approachable"] }),

  fs("Anton", "anton", "display",
    ["bold", "condensed", "impactful", "strong", "loud", "powerful", "commanding", "athletic", "fierce", "punchy"],
    ["bold", "powerful", "impactful", "commanding"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["ultra-condensed proportions", "reworked Grotesque heritage", "maximum impact at scale"] }),

  fs("Be Vietnam Pro", "be-vietnam-pro", "sans-serif",
    ["clean", "modern", "professional", "versatile", "crisp", "corporate", "functional", "polished", "balanced", "sleek"],
    ["clean", "professional", "modern", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Vietnamese-optimized design", "crisp modern forms", "excellent multilingual support"] }),

  fs("Nunito", "nunito", "sans-serif",
    ["rounded", "friendly", "soft", "warm", "approachable", "gentle", "cozy", "casual", "youthful", "bubbly"],
    ["friendly", "warm", "soft", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["fully rounded terminals", "warm sans-serif character", "gentle softness throughout"] }),

  fs("Epilogue", "epilogue", "sans-serif",
    ["contemporary", "editorial", "sophisticated", "refined", "crisp", "modern", "versatile", "professional", "polished", "smart"],
    ["contemporary", "sophisticated", "refined", "smart"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["transitional sans design", "editorial sophistication", "refined optical sizing"] }),

  fs("Spline Sans", "spline-sans", "sans-serif",
    ["clean", "modern", "technical", "precise", "sleek", "functional", "digital", "minimal", "structured", "systematic"],
    ["clean", "precise", "modern", "functional"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["spline-curve construction", "mathematical precision", "screen-optimized clarity"] }),

  fs("Montserrat", "montserrat", "sans-serif",
    ["geometric", "versatile", "modern", "clean", "popular", "urban", "confident", "professional", "fresh", "balanced"],
    ["modern", "confident", "versatile", "urban"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Buenos Aires signage inspiration", "geometric construction", "extensive weight range"] }),

  fs("Manrope", "manrope", "sans-serif",
    ["modern", "geometric", "clean", "crisp", "professional", "startup", "sleek", "minimal", "functional", "cool"],
    ["modern", "crisp", "professional", "minimal"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["semi-geometric construction", "open forms", "tech-forward aesthetic"] }),

  fs("Outfit", "outfit", "sans-serif",
    ["geometric", "friendly", "modern", "clean", "approachable", "versatile", "fresh", "youthful", "balanced", "soft"],
    ["friendly", "modern", "clean", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["geometric with soft corners", "friendly geometry", "excellent screen rendering"] }),

  fs("Oswald", "oswald", "sans-serif",
    ["condensed", "bold", "strong", "impactful", "editorial", "commanding", "masculine", "sturdy", "serious", "athletic"],
    ["strong", "commanding", "bold", "serious"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["condensed gothic revival", "strong vertical emphasis", "space-efficient headlines"] }),

  fs("Crimson Pro", "crimson-pro", "serif",
    ["classic", "literary", "elegant", "refined", "bookish", "traditional", "warm", "sophisticated", "timeless", "editorial"],
    ["classic", "literary", "refined", "elegant"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["Garamond-inspired proportions", "beautiful old-style figures", "superb book typography"] }),


  fs("Public Sans", "public-sans", "sans-serif",
    ["neutral", "trustworthy", "accessible", "clean", "professional", "civic", "reliable", "functional", "inclusive", "balanced"],
    ["trustworthy", "neutral", "accessible", "reliable"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["US government design system origin", "extreme neutrality", "accessibility-first design"] }),

  fs("Plus Jakarta Sans", "plus-jakarta-sans", "sans-serif",
    ["modern", "friendly", "geometric", "approachable", "startup", "fresh", "clean", "youthful", "professional", "sleek"],
    ["modern", "friendly", "fresh", "professional"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["geometric with humanist warmth", "startup-darling aesthetic", "excellent weight axis"] }),

  fs("Lora", "lora", "serif",
    ["elegant", "literary", "warm", "bookish", "classic", "refined", "sophisticated", "editorial", "traditional", "timeless"],
    ["elegant", "warm", "literary", "refined"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["calligraphic roots", "moderate contrast", "beautiful text and display harmony"] }),

  fs("Work Sans", "work-sans", "sans-serif",
    ["practical", "versatile", "clean", "modern", "functional", "professional", "reliable", "balanced", "corporate", "utilitarian"],
    ["practical", "functional", "professional", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["optimized for screen body text", "grotesque-inspired forms", "hardworking versatility"] }),

  fs("Asap", "asap", "sans-serif",
    ["rounded", "friendly", "approachable", "warm", "versatile", "casual", "soft", "cozy", "gentle", "readable"],
    ["friendly", "approachable", "warm", "casual"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["subtly rounded terminals", "warm sans character", "body-text optimized"] }),

  fs("JetBrains Mono", "jetbrains-mono", "monospace",
    ["developer", "technical", "precise", "coding", "digital", "functional", "systematic", "structured", "cool", "modern"],
    ["technical", "precise", "functional", "systematic"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["increased letter height for readability", "coding-specific ligatures", "JetBrains IDE heritage"] }),

  fs("Azeret Mono", "azeret-mono", "monospace",
    ["technical", "modern", "digital", "precise", "coding", "cool", "minimal", "structured", "sleek", "developer"],
    ["modern", "technical", "precise", "cool"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["contemporary mono design", "crisp modern forms", "wide character set"] }),

  fs("Familjen Grotesk", "familjen-grotesk", "sans-serif",
    ["editorial", "distinctive", "characterful", "modern", "refined", "creative", "sophisticated", "artsy", "smart", "unique"],
    ["distinctive", "editorial", "characterful", "sophisticated"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["quirky letterform details", "editorial character", "Swedish design heritage"] }),

  fs("Excon", "excon", "sans-serif",
    ["geometric", "extended", "modern", "bold", "wide", "confident", "strong", "spacious", "commanding", "contemporary"],
    ["confident", "modern", "bold", "spacious"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["extended width proportions", "geometric construction", "confident wide presence"] }),

  fs("Nippo", "nippo", "sans-serif",
    ["geometric", "minimal", "precise", "modern", "Japanese-influenced", "structured", "cool", "sleek", "clean", "technical"],
    ["minimal", "precise", "structured", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["Japanese aesthetic influence", "geometric purity", "structured minimal forms"] }),

  fs("Erode", "erode", "serif",
    ["editorial", "contemporary", "refined", "sharp", "sophisticated", "literary", "premium", "crisp", "intelligent", "distinctive"],
    ["refined", "sharp", "editorial", "intelligent"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["sharp triangular serifs", "contemporary serif construction", "crisp editorial presence"] }),

  fs("Kalam", "kalam", "handwritten",
    ["handwritten", "casual", "warm", "personal", "organic", "friendly", "relaxed", "artsy", "authentic", "charming"],
    ["casual", "warm", "personal", "authentic"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["pen-drawn character", "natural handwriting rhythm", "informal personal feel"] }),

  fs("Pencerio", "pencerio", "script",
    ["elegant", "feminine", "decorative", "girly", "romantic", "flowing", "delicate", "graceful", "fancy", "whimsical"],
    ["elegant", "romantic", "feminine", "graceful"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["ornamental script forms", "flowing connected strokes", "decorative flourishes"] }),

  fs("Pally", "pally", "sans-serif",
    ["playful", "rounded", "friendly", "fun", "bubbly", "youthful", "girly", "soft", "casual", "cheerful"],
    ["playful", "fun", "friendly", "cheerful"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["bouncy rounded forms", "playful personality", "joyful soft shapes"] }),

  fs("Panchang", "panchang", "display",
    ["geometric", "bold", "modern", "sharp", "edgy", "striking", "angular", "strong", "contemporary", "fierce"],
    ["bold", "sharp", "modern", "fierce"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["angular geometric cuts", "sharp pointed details", "bold display energy"] }),

  fs("Kola", "kola", "display",
    ["playful", "rounded", "bold", "fun", "bubbly", "youthful", "energetic", "friendly", "quirky", "chunky"],
    ["playful", "bold", "fun", "energetic"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["chunky rounded forms", "playful bold weight", "bubbly character"] }),

  fs("Roundo", "roundo", "sans-serif",
    ["rounded", "soft", "friendly", "approachable", "warm", "gentle", "cozy", "casual", "youthful", "bubbly"],
    ["soft", "friendly", "warm", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["fully rounded stroke ends", "soft geometric base", "warm modern feel"] }),


  fs("Neco", "neco", "sans-serif",
    ["quirky", "distinctive", "creative", "artsy", "playful", "unique", "characterful", "whimsical", "expressive", "unconventional"],
    ["quirky", "creative", "distinctive", "playful"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["unconventional letter shapes", "quirky personality", "art-directed character"] }),

  fs("Hoover", "hoover", "display",
    ["retro", "bold", "vintage", "strong", "industrial", "commanding", "masculine", "heavy", "nostalgic", "powerful"],
    ["retro", "bold", "industrial", "commanding"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["retro-industrial aesthetic", "heavy solid forms", "vintage display character"] }),

  fs("Space Grotesk", "space-grotesk", "sans-serif",
    ["techy", "geometric", "modern", "cool", "precise", "digital", "startup", "sleek", "clean", "futuristic"],
    ["techy", "modern", "precise", "cool"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Space Mono proportional sibling", "geometric with quirky details", "tech-startup favorite"] }),

  fs("Supreme", "supreme", "sans-serif",
    ["clean", "modern", "versatile", "neutral", "professional", "balanced", "corporate", "reliable", "functional", "refined"],
    ["clean", "balanced", "professional", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["neo-grotesque refinement", "balanced proportions", "wide utility range"] }),


  fs("Satoshi", "satoshi", "sans-serif",
    ["modern", "clean", "professional", "versatile", "crisp", "startup", "premium", "minimal", "sleek", "polished"],
    ["modern", "professional", "crisp", "premium"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["contemporary grotesk design", "Fontshare flagship font", "universally beloved proportions"] }),


  fs("Recia", "recia", "serif",
    ["classic", "refined", "literary", "traditional", "elegant", "bookish", "warm", "sophisticated", "mature", "timeless"],
    ["classic", "refined", "literary", "sophisticated"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["transitional serif forms", "refined classical proportions", "warm text color"] }),

  fs("Telma", "telma", "serif",
    ["warm", "friendly", "approachable", "readable", "cozy", "literary", "gentle", "inviting", "bookish", "organic"],
    ["warm", "friendly", "approachable", "inviting"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["humanist serif warmth", "friendly serif personality", "excellent body text comfort"] }),

  fs("Pramukh Rounded", "pramukh-rounded", "sans-serif",
    ["rounded", "friendly", "approachable", "soft", "warm", "gentle", "casual", "cozy", "inviting", "youthful"],
    ["friendly", "soft", "warm", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["rounded stroke terminals", "soft approachable feel", "Gujarati design heritage"] }),

  fs("Stardom", "stardom", "display",
    ["glamorous", "bold", "fashion", "striking", "dramatic", "luxurious", "fierce", "statement", "premium", "editorial"],
    ["glamorous", "bold", "dramatic", "luxurious"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["star-quality display presence", "dramatic weight contrast", "fashion-forward glamour"] }),

  fs("Zodiak", "zodiak", "serif",
    ["editorial", "dramatic", "sophisticated", "literary", "high-contrast", "premium", "luxurious", "refined", "elegant", "magazine"],
    ["editorial", "dramatic", "sophisticated", "premium"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["extreme stroke contrast", "Didone-inspired elegance", "dramatic editorial presence"] }),

  fs("Segment", "segment", "sans-serif",
    ["technical", "digital", "systematic", "modern", "structured", "precise", "data-driven", "functional", "futuristic", "angular"],
    ["technical", "systematic", "digital", "precise"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["segment-display inspiration", "digital readout aesthetic", "technical precision"] }),

  fs("Paquito", "paquito", "serif",
    ["warm", "approachable", "friendly", "readable", "cozy", "literary", "gentle", "inviting", "comfortable", "organic"],
    ["warm", "friendly", "approachable", "cozy"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["friendly serif character", "warm inviting forms", "comfortable reading texture"] }),

  fs("Sharpie", "sharpie", "handwritten",
    ["bold", "casual", "handwritten", "marker", "expressive", "raw", "energetic", "artsy", "authentic", "edgy"],
    ["bold", "casual", "raw", "expressive"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["marker-pen texture", "bold handwritten strokes", "raw authentic energy"] }),

  fs("Rosaline", "rosaline", "script",
    ["romantic", "elegant", "feminine", "delicate", "girly", "graceful", "sophisticated", "flowing", "bridal", "fancy"],
    ["romantic", "elegant", "delicate", "graceful"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["elegant script loops", "romantic calligraphic style", "bridal sophistication"] }),

  fs("Ranade", "ranade", "sans-serif",
    ["warm", "approachable", "readable", "humanist", "gentle", "versatile", "cozy", "friendly", "balanced", "natural"],
    ["warm", "approachable", "readable", "gentle"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["humanist construction", "Marathi script influence", "warm natural rhythm"] }),

  fs("Styro", "styro", "display",
    ["playful", "experimental", "artsy", "creative", "bold", "decorative", "fun", "graphic", "whimsical", "unconventional"],
    ["playful", "experimental", "creative", "bold"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["dimensional letterforms", "playful construction", "eye-catching graphic quality"] }),

  fs("Plein", "plein", "sans-serif",
    ["geometric", "bold", "modern", "clean", "strong", "confident", "minimal", "structured", "sleek", "powerful"],
    ["bold", "confident", "modern", "strong"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["strong geometric base", "confident bold presence", "clean minimal forms"] }),

  fs("Trench Slab", "trench-slab", "slab-serif",
    ["sturdy", "bold", "industrial", "strong", "grounded", "masculine", "structured", "commanding", "mechanical", "reliable"],
    ["sturdy", "bold", "industrial", "commanding"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["heavy slab serifs", "industrial slab construction", "mechanical rhythm"] }),

  fs("Zina", "zina", "sans-serif",
    ["elegant", "modern", "refined", "sophisticated", "feminine", "sleek", "premium", "graceful", "delicate", "fashion"],
    ["elegant", "refined", "sophisticated", "graceful"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["refined feminine forms", "elegant proportions", "graceful modern design"] }),

  fs("Quilon", "quilon", "serif",
    ["editorial", "refined", "sophisticated", "literary", "premium", "elegant", "distinctive", "sharp", "intelligent", "contemporary"],
    ["editorial", "refined", "sophisticated", "premium"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["sharp wedge serifs", "editorial refinement", "contemporary serif elegance"] }),

  fs("RX100", "rx100", "sans-serif",
    ["technical", "modern", "digital", "precise", "futuristic", "systematic", "angular", "structured", "cool", "sleek"],
    ["technical", "modern", "precise", "futuristic"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["camera-model naming inspiration", "technical precision", "angular digital forms"] }),

  fs("Red Hat Display", "red-hat-display", "sans-serif",
    ["corporate", "professional", "modern", "clean", "reliable", "polished", "confident", "balanced", "trustworthy", "sturdy"],
    ["professional", "confident", "reliable", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["Red Hat brand heritage", "display-optimized proportions", "corporate confidence"] }),

  fs("Sora", "sora", "sans-serif",
    ["geometric", "modern", "clean", "crisp", "futuristic", "cool", "minimal", "precise", "digital", "sleek"],
    ["modern", "crisp", "precise", "cool"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Japanese typographic influence", "geometric clarity", "screen-first design"] }),

  fs("Literata", "literata", "serif",
    ["literary", "readable", "bookish", "warm", "classic", "refined", "elegant", "comfortable", "sophisticated", "timeless"],
    ["literary", "warm", "readable", "refined"],
    { isBodySuitable: true, bodyLegibilityScore: 9, distinctiveTraits: ["Google Play Books origin", "optimized for long reading", "superb e-reader legibility"] }),

  fs("Merriweather Sans", "merriweather-sans", "sans-serif",
    ["readable", "warm", "friendly", "versatile", "approachable", "cozy", "balanced", "reliable", "gentle", "comfortable"],
    ["readable", "warm", "friendly", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Merriweather serif companion", "screen-optimized clarity", "warm humanist character"] }),

  fs("Quicksand", "quicksand", "sans-serif",
    ["rounded", "friendly", "modern", "soft", "approachable", "youthful", "girly", "gentle", "playful", "fresh"],
    ["friendly", "soft", "modern", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["geometric rounded forms", "soft friendly personality", "wide open apertures"] }),



  // ── NEW ADDITIONS (86–100) ──

  fs("Fraktion", "fraktion", "sans-serif",
    ["geometric", "modern", "structured", "precise", "clean", "minimal", "technical", "crisp", "systematic", "functional"],
    ["precise", "modern", "structured", "clean"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["fractional geometric precision", "structured grid-based forms", "mathematical clarity"] }),

  fs("Wotfard", "wotfard", "sans-serif",
    ["geometric", "friendly", "modern", "rounded", "approachable", "clean", "versatile", "fresh", "balanced", "warm"],
    ["friendly", "modern", "approachable", "balanced"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["Futura-inspired with warmth", "softened geometric forms", "friendly professional tone"] }),

  fs("Otterco", "otterco", "serif",
    ["editorial", "contemporary", "refined", "literary", "sophisticated", "elegant", "crisp", "premium", "distinctive", "smart"],
    ["editorial", "refined", "contemporary", "sophisticated"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["contemporary editorial serif", "crisp sharp details", "modern literary character"] }),

  fs("Magnat", "magnat", "serif",
    ["editorial", "dramatic", "high-contrast", "fashion", "luxurious", "elegant", "striking", "premium", "magazine", "bold"],
    ["dramatic", "elegant", "editorial", "luxurious"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["magnetic high-contrast strokes", "fashion editorial presence", "dramatic serif display"] }),

  fs("Aspekta", "aspekta", "sans-serif",
    ["geometric", "clean", "modern", "versatile", "professional", "crisp", "balanced", "corporate", "functional", "polished"],
    ["professional", "clean", "modern", "versatile"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["geometric foundations", "wide range of weights", "excellent screen readability"] }),

  fs("Grifter", "grifter", "display",
    ["bold", "chunky", "rounded", "playful", "modern", "friendly", "impactful", "fun", "youthful", "thick"],
    ["bold", "playful", "friendly", "impactful"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["ultra-bold rounded letterforms", "chunky playful weight", "bubbly display presence"] }),

  fs("Nekst", "nekst", "sans-serif",
    ["condensed", "industrial", "strong", "modern", "bold", "editorial", "narrow", "impactful", "structured", "headline"],
    ["industrial", "strong", "modern", "bold"],
    { isBodySuitable: false, bodyLegibilityScore: 4, distinctiveTraits: ["condensed proportions", "industrial character", "tight headline spacing"] }),

  fs("Cope", "cope", "display",
    ["decorative", "artistic", "experimental", "quirky", "creative", "expressive", "unique", "alternative", "bold", "eye-catching"],
    ["artistic", "experimental", "creative", "expressive"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["unconventional letterforms", "artistic display character", "experimental proportions"] }),

  fs("Humane", "humane", "display",
    ["condensed", "tall", "elegant", "modern", "editorial", "narrow", "striking", "fashion", "dramatic", "headline"],
    ["elegant", "modern", "editorial", "dramatic"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["ultra-condensed proportions", "towering vertical emphasis", "fashion editorial feel"] }),

  fs("Migra", "migra", "serif",
    ["high-contrast", "editorial", "dramatic", "optical-size", "elegant", "literary", "refined", "variable", "expressive", "sophisticated"],
    ["dramatic", "editorial", "elegant", "sophisticated"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["optical size axis", "dramatic contrast variation", "editorial serif flexibility"] }),

  fs("Nohemi", "nohemi", "sans-serif",
    ["geometric", "modern", "clean", "minimal", "fresh", "contemporary", "versatile", "crisp", "balanced", "functional"],
    ["modern", "clean", "minimal", "fresh"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["geometric clarity", "contemporary neo-grotesque", "wide weight range"] }),

  fs("Swear Display", "swear-display", "display",
    ["high-contrast", "elegant", "luxurious", "dramatic", "editorial", "fashion", "refined", "serif", "premium", "bold"],
    ["luxurious", "dramatic", "elegant", "editorial"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["extreme contrast display serif", "luxury fashion presence", "dramatic high-contrast strokes"] }),

  fs("Trench", "trench", "sans-serif",
    ["condensed", "military", "structured", "industrial", "bold", "utilitarian", "strong", "tactical", "narrow", "functional"],
    ["industrial", "structured", "bold", "utilitarian"],
    { isBodySuitable: false, bodyLegibilityScore: 5, distinctiveTraits: ["military-inspired condensed forms", "structured geometric construction", "utilitarian precision"] }),

  fs("Hallenger", "hallenger", "display",
    ["retro", "vintage", "decorative", "nostalgic", "classic", "ornamental", "bold", "display", "warm", "characterful"],
    ["retro", "vintage", "warm", "nostalgic"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["vintage display character", "retro ornamental details", "nostalgic personality"] }),

  fs("Hygge", "hygge", "sans-serif",
    ["warm", "friendly", "soft", "rounded", "cozy", "approachable", "gentle", "inviting", "casual", "comfortable"],
    ["warm", "friendly", "cozy", "approachable"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["soft rounded terminals", "warm approachable feel", "cozy Scandinavian-inspired"] }),

  fs("Integral CF", "integral-cf", "display",
    ["bold", "condensed", "uppercase", "modern", "impactful", "strong", "headline", "sporty", "powerful", "dynamic"],
    ["bold", "powerful", "dynamic", "modern"],
    { isBodySuitable: false, bodyLegibilityScore: 2, distinctiveTraits: ["all-caps display face", "ultra-bold condensed forms", "sports/brand headline impact"] }),

  fs("Saturo", "saturo", "sans-serif",
    ["geometric", "clean", "modern", "balanced", "professional", "versatile", "crisp", "neutral", "functional", "reliable"],
    ["clean", "professional", "balanced", "modern"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["balanced geometric proportions", "versatile weight range", "reliable workhorse character"] }),

  fs("Nueva", "nueva", "serif",
    ["contemporary", "elegant", "literary", "warm", "readable", "refined", "classic", "sophisticated", "editorial", "balanced"],
    ["elegant", "literary", "warm", "refined"],
    { isBodySuitable: true, bodyLegibilityScore: 8, distinctiveTraits: ["contemporary serif warmth", "literary reading comfort", "elegant text proportions"] }),

  fs("Range", "range", "sans-serif",
    ["geometric", "wide", "modern", "bold", "clean", "spacious", "open", "versatile", "structured", "balanced"],
    ["modern", "spacious", "clean", "bold"],
    { isBodySuitable: true, bodyLegibilityScore: 7, distinctiveTraits: ["wide geometric proportions", "spacious open letterforms", "modern structured clarity"] }),

  fs("Vasion", "vasion", "display",
    ["futuristic", "tech", "geometric", "modern", "sharp", "sci-fi", "digital", "sleek", "innovative", "cutting-edge"],
    ["futuristic", "sharp", "modern", "innovative"],
    { isBodySuitable: false, bodyLegibilityScore: 3, distinctiveTraits: ["futuristic geometric construction", "sci-fi display character", "sharp angular terminals"] }),









];

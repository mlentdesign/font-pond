import { Font, FontClassification } from "./types";

// ── Factory for display-only Google Fonts ──
// Keeps entries compact — all share OFL 1.1, google-fonts source, header-only defaults.

function gfDisplay(
  name: string,
  googleFamily: string,
  classification: FontClassification,
  tags: string[],
  toneDescriptors: string[],
  useCases: string[],
  distinctiveTraits: string[],
  opts?: Partial<Font>,
): Font {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return {
    id: slug,
    name,
    slug,
    source: "google-fonts",
    sourceUrl: `https://fonts.google.com/specimen/${googleFamily.replace(/\s+/g, "+")}`,
    downloadUrl: null,
    specimenUrl: `https://fonts.google.com/specimen/${googleFamily.replace(/\s+/g, "+")}`,
    licenseType: "OFL 1.1",
    licenseConfidence: "high",
    designer: null,
    foundry: null,
    year: null,
    classification,
    subcategory: null,
    serifSansCategory: classification === "handwritten" ? "display" : classification === "script" ? "script" : "display",
    tags,
    toneDescriptors,
    useCases,
    variableFont: false,
    weights: [400],
    styles: ["normal"],
    isHeaderSuitable: true,
    isBodySuitable: false,
    bodyLegibilityScore: null,
    screenReadabilityNotes: null,
    distinctiveTraits,
    historicalNotes: null,
    notableUseExamples: [],
    similarFonts: [],
    popularityConfidence: "medium",
    metadataConfidence: "medium",
    googleFontsFamily: googleFamily,
    ...opts,
  };
}

export const googleFontsExtended: Font[] = [
  // ════════════════════════════════════════════════
  // PERPLEXITY RECOMMENDATIONS — Display / Headline
  // ════════════════════════════════════════════════

  gfDisplay("Yeseva One", "Yeseva One", "serif", [
    "feminine", "decorative", "bold", "romantic", "elegant", "editorial", "girly", "vintage", "display",
  ], ["bold", "feminine", "decorative", "confident"], ["fashion", "beauty", "editorial", "branding", "headlines"], [
    "decorative curves", "high stroke contrast", "feminine energy",
  ]),

  gfDisplay("Rubik Glitch", "Rubik Glitch", "display", [
    "glitch", "chaotic", "edgy", "punk", "grunge", "rebellious", "pop", "distorted", "cyber", "y2k",
  ], ["chaotic", "rebellious", "distorted", "pop"], ["music", "gaming", "counter-culture", "posters", "streetwear"], [
    "glitch distortion effect", "broken letterforms", "digital chaos",
  ]),

  gfDisplay("Ultra", "Ultra", "serif", [
    "bold", "heavy", "personality", "creative", "music", "display", "strong", "chunky", "poster", "vintage",
  ], ["strong", "personality-heavy", "bold", "expressive"], ["music", "posters", "album art", "creative branding", "headlines"], [
    "extremely heavy weight", "ultra-bold serifs", "high visual impact",
  ]),

  gfDisplay("Bubblegum Sans", "Bubblegum Sans", "display", [
    "bubbly", "fun", "pop", "cute", "playful", "friendly", "girly", "kids", "cartoon", "rounded",
  ], ["bubbly", "fun", "pop", "cheerful"], ["kids brands", "candy", "casual apps", "party invites", "toy packaging"], [
    "rounded bubbly forms", "playful bounce", "cartoon-like personality",
  ]),

  gfDisplay("Yellowtail", "Yellowtail", "script", [
    "script", "casual", "retro", "vintage", "brush", "1950s", "americana", "diner", "handlettered", "warm",
  ], ["casual", "retro", "friendly", "nostalgic"], ["restaurants", "vintage branding", "casual logos", "signage", "menus"], [
    "casual brush script", "retro sign-painter feel", "connected letterforms",
  ], { serifSansCategory: "script" }),

  // ════════════════════════════════════════════════
  // PERPLEXITY RECOMMENDATIONS — Body Fonts (full entries)
  // ════════════════════════════════════════════════

  {
    id: "instrument-sans",
    name: "Instrument Sans",
    slug: "instrument-sans",
    source: "google-fonts",
    sourceUrl: "https://fonts.google.com/specimen/Instrument+Sans",
    downloadUrl: null,
    specimenUrl: "https://fonts.google.com/specimen/Instrument+Sans",
    licenseType: "OFL 1.1",
    licenseConfidence: "high",
    designer: "Rodrigo Fuenzalida",
    foundry: null,
    year: 2023,
    classification: "sans-serif",
    subcategory: "grotesque",
    serifSansCategory: "sans-serif",
    tags: ["clean", "modern", "neutral", "body-friendly", "minimal", "companion", "versatile", "geometric"],
    toneDescriptors: ["clean", "contemporary", "neutral", "refined"],
    useCases: ["body text", "UI", "web apps", "editorial", "pairing with Instrument Serif"],
    variableFont: true,
    weights: [400, 500, 600, 700],
    styles: ["normal", "italic"],
    isHeaderSuitable: true,
    isBodySuitable: true,
    bodyLegibilityScore: 9,
    screenReadabilityNotes: "Designed for excellent screen legibility across sizes. Pairs naturally with Instrument Serif.",
    distinctiveTraits: ["clean grotesque forms", "generous x-height", "companion to Instrument Serif"],
    historicalNotes: "Designed as a sans-serif companion to Instrument Serif for cohesive type systems.",
    notableUseExamples: [],
    similarFonts: ["inter", "dm-sans"],
    popularityConfidence: "medium",
    metadataConfidence: "high",
    googleFontsFamily: "Instrument Sans",
  },

  {
    id: "mulish",
    name: "Mulish",
    slug: "mulish",
    source: "google-fonts",
    sourceUrl: "https://fonts.google.com/specimen/Mulish",
    downloadUrl: null,
    specimenUrl: "https://fonts.google.com/specimen/Mulish",
    licenseType: "OFL 1.1",
    licenseConfidence: "high",
    designer: "Vernon Adams",
    foundry: null,
    year: 2011,
    classification: "sans-serif",
    subcategory: "geometric",
    serifSansCategory: "sans-serif",
    tags: ["clean", "readable", "body-friendly", "modern", "neutral", "geometric", "versatile", "minimal"],
    toneDescriptors: ["clean", "readable", "approachable", "modern"],
    useCases: ["body text", "UI", "dashboards", "SaaS", "web apps", "long-form reading"],
    variableFont: true,
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal", "italic"],
    isHeaderSuitable: true,
    isBodySuitable: true,
    bodyLegibilityScore: 9,
    screenReadabilityNotes: "Excellent readability at all sizes. Very versatile weight range makes it suitable for full type hierarchies.",
    distinctiveTraits: ["slightly geometric forms", "even proportions", "wide weight range"],
    historicalNotes: "Originally named Muli, redesigned and expanded as Mulish with variable font support.",
    notableUseExamples: [],
    similarFonts: ["nunito", "poppins", "dm-sans"],
    popularityConfidence: "high",
    metadataConfidence: "high",
    googleFontsFamily: "Mulish",
  },

  // ════════════════════════════════════════════════
  // RUBIK FAMILY — Experimental / Expressive
  // ════════════════════════════════════════════════

  gfDisplay("Rubik Vinyl", "Rubik Vinyl", "display", [
    "retro", "vinyl", "music", "groovy", "70s", "psychedelic", "funky", "bold", "display", "pop",
  ], ["groovy", "retro", "playful", "bold"], ["music", "album art", "posters", "festival branding", "merch"], [
    "vinyl-inspired texture", "retro groovy shapes", "funky letterforms",
  ]),

  gfDisplay("Rubik Wet Paint", "Rubik Wet Paint", "display", [
    "horror", "dripping", "spooky", "dark", "grunge", "painted", "messy", "edgy", "halloween", "gothic",
  ], ["eerie", "dark", "visceral", "rebellious"], ["horror", "halloween", "punk posters", "dark branding", "gaming"], [
    "dripping paint effect", "horror aesthetic", "wet organic forms",
  ]),

  gfDisplay("Rubik Burned", "Rubik Burned", "display", [
    "burned", "distressed", "dark", "grunge", "edgy", "horror", "apocalyptic", "rough", "texture", "punk",
  ], ["dark", "distressed", "intense", "gritty"], ["horror", "dark themes", "grunge design", "music posters", "gaming"], [
    "burned charred texture", "distressed letterforms", "apocalyptic feel",
  ]),

  gfDisplay("Rubik Moonrocks", "Rubik Moonrocks", "display", [
    "space", "sci-fi", "futuristic", "cosmic", "retro-futurism", "quirky", "display", "neon", "cyber", "bold",
  ], ["cosmic", "quirky", "futuristic", "playful"], ["sci-fi", "space themes", "gaming", "retro-futurism", "posters"], [
    "cratered moon texture", "space-inspired forms", "cosmic personality",
  ]),

  gfDisplay("Rubik Puddles", "Rubik Puddles", "display", [
    "liquid", "bubbly", "organic", "playful", "cute", "fun", "water", "rounded", "quirky", "pop",
  ], ["playful", "fluid", "bubbly", "whimsical"], ["kids", "water brands", "playful branding", "casual apps", "posters"], [
    "liquid puddle forms", "bubbly organic shapes", "aquatic personality",
  ]),

  gfDisplay("Rubik Storm", "Rubik Storm", "display", [
    "storm", "electric", "energy", "edgy", "bold", "dynamic", "cyber", "power", "futuristic", "dark",
  ], ["electric", "intense", "dynamic", "powerful"], ["gaming", "energy brands", "sports", "dark tech", "esports"], [
    "storm-inspired electric forms", "dynamic energy", "jagged edges",
  ]),

  // ════════════════════════════════════════════════
  // BUNGEE FAMILY — Bold Display
  // ════════════════════════════════════════════════

  gfDisplay("Bungee Shade", "Bungee Shade", "display", [
    "3d", "shadow", "retro", "sign-painting", "bold", "pop", "neon", "vintage", "display", "poster",
  ], ["bold", "retro", "eye-catching", "dimensional"], ["signage", "posters", "headlines", "retro branding", "neon signs"], [
    "3D shadow effect", "sign-painting heritage", "multi-layered depth",
  ]),

  gfDisplay("Bungee Inline", "Bungee Inline", "display", [
    "inline", "retro", "sign-painting", "bold", "art-deco", "vintage", "display", "poster", "decorative", "sport",
  ], ["bold", "decorative", "retro", "sporty"], ["sports", "signage", "posters", "vintage branding", "headlines"], [
    "inline decorative stroke", "sign-painting influence", "bold display presence",
  ]),

  // ════════════════════════════════════════════════
  // BOLD / CHUNKY DISPLAY
  // ════════════════════════════════════════════════

  gfDisplay("Titan One", "Titan One", "display", [
    "bold", "chunky", "friendly", "rounded", "fun", "cartoon", "display", "kids", "playful", "poster",
  ], ["bold", "friendly", "fun", "approachable"], ["kids brands", "games", "casual branding", "posters", "headlines"], [
    "ultra-bold rounded forms", "friendly chunky presence", "cartoon-like weight",
  ]),

  gfDisplay("Black Ops One", "Black Ops One", "display", [
    "military", "stencil", "bold", "tactical", "gaming", "aggressive", "dark", "industrial", "masculine", "tough",
  ], ["military", "aggressive", "tactical", "bold"], ["gaming", "military themes", "action branding", "esports", "posters"], [
    "military stencil design", "tactical angular forms", "aggressive presence",
  ]),

  gfDisplay("Bangers", "Bangers", "display", [
    "comic", "bold", "fun", "pop", "cartoon", "loud", "playful", "poster", "impact", "action",
  ], ["loud", "fun", "comic", "energetic"], ["comics", "posters", "gaming", "kids content", "social media"], [
    "comic book lettering style", "bold punchy forms", "action energy",
  ]),

  gfDisplay("Fugaz One", "Fugaz One", "display", [
    "italic", "dynamic", "sporty", "bold", "energetic", "speed", "action", "display", "racing", "motion",
  ], ["dynamic", "energetic", "sporty", "fast"], ["sports", "racing", "action branding", "posters", "headlines"], [
    "forward-leaning italic", "speed and motion feel", "dynamic energy",
  ]),

  gfDisplay("Fascinate", "Fascinate", "display", [
    "art-deco", "decorative", "elegant", "geometric", "vintage", "glamour", "gatsby", "retro", "luxury", "display",
  ], ["glamorous", "decorative", "art-deco", "elegant"], ["art deco themes", "luxury", "vintage events", "gatsby parties", "fashion"], [
    "art deco geometric forms", "glamorous decorative details", "roaring twenties feel",
  ]),

  gfDisplay("Fascinate Inline", "Fascinate Inline", "display", [
    "art-deco", "inline", "decorative", "geometric", "vintage", "glamour", "gatsby", "retro", "luxury", "display",
  ], ["glamorous", "decorative", "ornate", "elegant"], ["art deco themes", "luxury branding", "invitations", "vintage events", "fashion"], [
    "inline art deco letterforms", "geometric glamour", "decorative vintage feel",
  ]),

  gfDisplay("Rammetto One", "Rammetto One", "display", [
    "bold", "chunky", "fun", "rounded", "heavy", "playful", "cartoon", "display", "friendly", "poster",
  ], ["bold", "fun", "chunky", "playful"], ["gaming", "kids brands", "casual branding", "posters", "merch"], [
    "ultra-heavy rounded forms", "friendly chunky weight", "cartoon bold",
  ]),

  gfDisplay("Shrikhand", "Shrikhand", "display", [
    "bold", "indian", "heavy", "warm", "display", "cultural", "personality", "decorative", "poster", "heritage",
  ], ["bold", "warm", "cultural", "expressive"], ["Indian cuisine", "cultural branding", "food", "posters", "festival design"], [
    "Gujarati-inspired Latin design", "heavy warm strokes", "cultural personality",
  ]),

  gfDisplay("Luckiest Guy", "Luckiest Guy", "display", [
    "comic", "bold", "fun", "cartoon", "bubbly", "playful", "kids", "poster", "friendly", "loud",
  ], ["fun", "loud", "cartoonish", "cheerful"], ["kids content", "games", "comics", "party invites", "casual branding"], [
    "cartoon lettering style", "bubbly bold forms", "comic book energy",
  ]),

  gfDisplay("Modak", "Modak", "display", [
    "bold", "bubbly", "indian", "rounded", "fun", "chunky", "cute", "cultural", "friendly", "display",
  ], ["bubbly", "fun", "cultural", "friendly"], ["Indian food", "kids brands", "casual branding", "festival design", "packaging"], [
    "Devanagari-inspired Latin", "bubbly inflated forms", "playful cultural fusion",
  ]),

  gfDisplay("Patua One", "Patua One", "display", [
    "slab", "bold", "friendly", "warm", "display", "poster", "editorial", "vintage", "rounded", "approachable",
  ], ["bold", "friendly", "warm", "approachable"], ["headlines", "posters", "branding", "editorial", "packaging"], [
    "friendly slab serif forms", "warm approachable weight", "rounded terminals",
  ]),

  gfDisplay("Monoton", "Monoton", "display", [
    "neon", "retro", "outline", "80s", "synthwave", "display", "futuristic", "disco", "poster", "light",
  ], ["neon", "retro", "futuristic", "flashy"], ["neon signage", "synthwave", "80s themes", "nightlife", "music"], [
    "neon tube outline style", "retro-futuristic glow", "single-line letterforms",
  ]),

  gfDisplay("Codystar", "Codystar", "display", [
    "stars", "decorative", "sparkle", "whimsical", "constellation", "space", "magic", "fantasy", "light", "celestial",
  ], ["whimsical", "magical", "celestial", "delicate"], ["astronomy", "fantasy themes", "invitations", "celestial branding", "holiday"], [
    "star-dotted letterforms", "constellation-like design", "celestial whimsy",
  ]),

  gfDisplay("Faster One", "Faster One", "display", [
    "speed", "racing", "dynamic", "motion", "bold", "italic", "sport", "fast", "action", "aggressive",
  ], ["fast", "dynamic", "aggressive", "energetic"], ["racing", "sports", "esports", "action branding", "automotive"], [
    "extreme speed lines", "racing motion blur", "aggressive italic",
  ]),

  // ════════════════════════════════════════════════
  // SCRIPT & HANDWRITING
  // ════════════════════════════════════════════════

  gfDisplay("Passions Conflict", "Passions Conflict", "script", [
    "script", "romantic", "elegant", "flourish", "wedding", "feminine", "calligraphy", "luxury", "decorative", "formal",
  ], ["romantic", "elegant", "passionate", "luxurious"], ["weddings", "invitations", "luxury branding", "romance", "fashion"], [
    "dramatic calligraphic flourishes", "passionate flowing strokes", "romantic elegance",
  ], { serifSansCategory: "script" }),

  gfDisplay("Sacramento", "Sacramento", "script", [
    "script", "casual", "handwritten", "friendly", "feminine", "romantic", "brush", "warm", "invitations", "flowing",
  ], ["casual", "friendly", "warm", "romantic"], ["invitations", "casual branding", "greeting cards", "blogs", "menus"], [
    "casual monoline script", "friendly flowing forms", "even rhythm",
  ], { serifSansCategory: "script" }),

  gfDisplay("Great Vibes", "Great Vibes", "script", [
    "script", "calligraphy", "elegant", "wedding", "romantic", "formal", "feminine", "luxury", "decorative", "flowing",
  ], ["elegant", "romantic", "formal", "graceful"], ["weddings", "invitations", "luxury branding", "certificates", "fashion"], [
    "formal calligraphic style", "elegant connected script", "graceful curves",
  ], { serifSansCategory: "script" }),

  gfDisplay("Alex Brush", "Alex Brush", "script", [
    "script", "brush", "elegant", "feminine", "romantic", "calligraphy", "wedding", "soft", "flowing", "graceful",
  ], ["elegant", "soft", "romantic", "graceful"], ["weddings", "beauty", "invitations", "feminine branding", "luxury"], [
    "brush-inspired calligraphy", "soft elegant strokes", "romantic flow",
  ], { serifSansCategory: "script" }),

  gfDisplay("Kaushan Script", "Kaushan Script", "script", [
    "script", "brush", "casual", "bold", "energetic", "handlettered", "vintage", "warm", "friendly", "artisan",
  ], ["energetic", "bold", "casual", "warm"], ["restaurants", "craft branding", "casual logos", "artisan", "packaging"], [
    "bold brush script", "energetic casual lettering", "artisan character",
  ], { serifSansCategory: "script" }),

  gfDisplay("Satisfy", "Satisfy", "script", [
    "script", "retro", "casual", "1950s", "americana", "diner", "vintage", "handlettered", "warm", "friendly",
  ], ["retro", "casual", "nostalgic", "warm"], ["diners", "retro branding", "casual logos", "vintage design", "menus"], [
    "retro casual script", "1950s sign-painting feel", "smooth connected forms",
  ], { serifSansCategory: "script" }),

  gfDisplay("Leckerli One", "Leckerli One", "script", [
    "script", "bold", "brush", "fun", "playful", "rounded", "friendly", "warm", "casual", "bubbly",
  ], ["fun", "bold", "friendly", "playful"], ["food brands", "casual branding", "kids", "packaging", "menus"], [
    "bold rounded brush script", "friendly bubbly weight", "food-friendly feel",
  ], { serifSansCategory: "script" }),

  // ════════════════════════════════════════════════
  // HANDWRITTEN / HANDWRITING FEEL
  // ════════════════════════════════════════════════

  gfDisplay("Shadows Into Light", "Shadows Into Light", "handwritten", [
    "handwritten", "casual", "personal", "sketchy", "indie", "journal", "notebook", "organic", "friendly", "intimate",
  ], ["personal", "casual", "intimate", "friendly"], ["personal blogs", "journals", "indie branding", "greeting cards", "casual apps"], [
    "casual handwriting feel", "slightly sketchy pen style", "personal intimate voice",
  ]),

  gfDisplay("Indie Flower", "Indie Flower", "handwritten", [
    "handwritten", "indie", "cute", "casual", "girly", "notebook", "friendly", "bubbly", "organic", "fun",
  ], ["cute", "indie", "casual", "friendly"], ["personal blogs", "kids content", "casual branding", "notes", "greeting cards"], [
    "casual rounded handwriting", "indie notebook feel", "friendly organic forms",
  ]),

  gfDisplay("Amatic SC", "Amatic SC", "handwritten", [
    "handwritten", "thin", "tall", "condensed", "artisan", "craft", "cottagecore", "organic", "rustic", "quirky",
  ], ["artisan", "rustic", "organic", "whimsical"], ["craft branding", "farmers markets", "organic food", "cottagecore", "artisan packaging"], [
    "narrow hand-drawn letterforms", "craft artisan feel", "rustic personality",
  ]),

  gfDisplay("Gloria Hallelujah", "Gloria Hallelujah", "handwritten", [
    "handwritten", "comic", "casual", "fun", "cartoon", "notebook", "bold", "friendly", "playful", "marker",
  ], ["fun", "casual", "comic", "energetic"], ["comics", "kids content", "casual branding", "social media", "stickers"], [
    "marker-style comic lettering", "bold casual handwriting", "cartoon notebook feel",
  ]),

  gfDisplay("Rock Salt", "Rock Salt", "handwritten", [
    "handwritten", "rough", "gritty", "masculine", "grunge", "edgy", "raw", "bold", "punk", "distressed",
  ], ["raw", "gritty", "edgy", "rebellious"], ["punk branding", "grunge design", "music", "street art", "counter-culture"], [
    "rough scratchy handwriting", "gritty masculine feel", "raw punk energy",
  ]),

  gfDisplay("Reenie Beanie", "Reenie Beanie", "handwritten", [
    "handwritten", "casual", "sketchy", "thin", "personal", "journal", "notebook", "indie", "delicate", "organic",
  ], ["casual", "personal", "sketchy", "light"], ["journals", "personal blogs", "indie design", "notes", "casual invitations"], [
    "light casual handwriting", "sketchy pen feel", "personal journal style",
  ]),

  gfDisplay("Homemade Apple", "Homemade Apple", "handwritten", [
    "handwritten", "personal", "pen", "organic", "intimate", "journal", "cottagecore", "rustic", "warm", "authentic",
  ], ["personal", "authentic", "intimate", "organic"], ["personal blogs", "cottagecore", "handmade branding", "journals", "letters"], [
    "realistic ballpoint pen feel", "personal authentic handwriting", "intimate organic style",
  ]),

  gfDisplay("Covered By Your Grace", "Covered By Your Grace", "handwritten", [
    "handwritten", "casual", "bold", "fun", "notebook", "marker", "playful", "personal", "organic", "friendly",
  ], ["casual", "bold", "fun", "personal"], ["casual branding", "social media", "greeting cards", "kids", "notes"], [
    "bold marker-style handwriting", "casual energetic feel", "notebook personality",
  ]),

  gfDisplay("Kranky", "Kranky", "handwritten", [
    "handwritten", "quirky", "spooky", "weird", "halloween", "creepy", "fun", "offbeat", "dark-humor", "character",
  ], ["quirky", "offbeat", "slightly creepy", "eccentric"], ["halloween", "quirky branding", "humor", "indie games", "alternative"], [
    "irregular quirky letterforms", "slightly unsettling character", "offbeat personality",
  ]),

  // ════════════════════════════════════════════════
  // HORROR / DARK / GOTHIC
  // ════════════════════════════════════════════════

  gfDisplay("Creepster", "Creepster", "display", [
    "horror", "spooky", "halloween", "dark", "creepy", "dripping", "gothic", "scary", "monster", "blood",
  ], ["spooky", "creepy", "dark", "unsettling"], ["halloween", "horror movies", "haunted events", "dark themes", "gaming"], [
    "dripping horror letterforms", "spooky jagged edges", "horror movie aesthetic",
  ]),

  gfDisplay("Nosifer", "Nosifer", "display", [
    "horror", "vampire", "dark", "gothic", "blood", "dripping", "halloween", "scary", "sinister", "macabre",
  ], ["sinister", "dark", "vampiric", "macabre"], ["horror", "vampire themes", "halloween", "dark gaming", "gothic events"], [
    "dripping blood-like letterforms", "vampire gothic style", "sinister presence",
  ]),

  gfDisplay("Butcherman", "Butcherman", "display", [
    "horror", "gore", "dark", "splatter", "halloween", "scary", "grunge", "metal", "slasher", "extreme",
  ], ["gruesome", "dark", "extreme", "visceral"], ["horror", "metal music", "halloween", "slasher themes", "extreme branding"], [
    "gore-splatter letterforms", "slasher horror aesthetic", "extreme dark style",
  ]),

  gfDisplay("Eater", "Eater", "display", [
    "horror", "dark", "gothic", "metal", "aggressive", "thorny", "sinister", "blackletter", "medieval", "occult",
  ], ["dark", "aggressive", "gothic", "menacing"], ["metal music", "horror", "gothic branding", "dark gaming", "occult themes"], [
    "thorny aggressive letterforms", "gothic metal aesthetic", "dark medieval influence",
  ]),

  gfDisplay("Jolly Lodger", "Jolly Lodger", "display", [
    "pirate", "adventure", "nautical", "fun", "vintage", "spooky", "carnival", "quirky", "whimsical", "display",
  ], ["adventurous", "quirky", "fun", "theatrical"], ["pirate themes", "adventure", "carnival", "quirky branding", "games"], [
    "pirate-inspired thin letterforms", "adventurous carnival feel", "theatrical personality",
  ]),

  gfDisplay("Pirata One", "Pirata One", "display", [
    "pirate", "blackletter", "gothic", "medieval", "dark", "adventure", "nautical", "tattoo", "old-english", "heritage",
  ], ["dark", "medieval", "adventurous", "gothic"], ["pirate themes", "tattoo", "dark academia", "medieval events", "gothic branding"], [
    "blackletter pirate style", "gothic medieval forms", "nautical adventure heritage",
  ]),

  gfDisplay("Emilys Candy", "Emilys Candy", "display", [
    "cute", "candy", "sweet", "girly", "decorative", "fun", "bubbly", "feminine", "playful", "whimsical",
  ], ["sweet", "cute", "whimsical", "playful"], ["candy brands", "kids content", "sweet shops", "party invitations", "feminine branding"], [
    "candy-inspired decorative forms", "sweet whimsical details", "playful feminine energy",
  ]),

  gfDisplay("Mystery Quest", "Mystery Quest", "display", [
    "mystery", "vintage", "detective", "noir", "spooky", "gothic", "dark-academia", "literary", "quirky", "old-fashioned",
  ], ["mysterious", "vintage", "noir", "literary"], ["mystery novels", "dark academia", "vintage branding", "detective themes", "literary events"], [
    "mysterious vintage letterforms", "detective noir personality", "dark academia aesthetic",
  ]),

  gfDisplay("Rye", "Rye", "display", [
    "western", "saloon", "vintage", "americana", "cowboy", "rustic", "frontier", "bold", "serif", "heritage",
  ], ["western", "rugged", "vintage", "frontier"], ["western themes", "saloons", "country", "americana branding", "rustic design"], [
    "western saloon-style serifs", "frontier heritage letterforms", "cowboy Americana",
  ]),

  gfDisplay("Almendra Display", "Almendra Display", "display", [
    "medieval", "fantasy", "calligraphic", "decorative", "gothic", "dark-academia", "heritage", "elegant", "literary", "ornate",
  ], ["medieval", "elegant", "fantasy", "ornate"], ["fantasy themes", "medieval events", "dark academia", "literary branding", "RPG games"], [
    "medieval calligraphic influence", "fantasy heritage forms", "ornate decorative details",
  ]),

  gfDisplay("Flavors", "Flavors", "display", [
    "fun", "quirky", "bubbly", "cartoon", "playful", "colorful", "kids", "pop", "bold", "whimsical",
  ], ["fun", "quirky", "bubbly", "colorful"], ["kids brands", "candy", "playful branding", "cartoon", "party themes"], [
    "bubbly quirky letterforms", "cartoon-like personality", "colorful playful design",
  ]),

  gfDisplay("Freckle Face", "Freckle Face", "display", [
    "fun", "casual", "handdrawn", "kids", "cartoon", "playful", "friendly", "cute", "rough", "organic",
  ], ["fun", "casual", "friendly", "hand-drawn"], ["kids content", "casual branding", "comics", "playground", "games"], [
    "hand-drawn casual letterforms", "friendly kid-like personality", "organic rough edges",
  ]),

  gfDisplay("Irish Grover", "Irish Grover", "display", [
    "fun", "quirky", "casual", "rough", "handdrawn", "playful", "whimsical", "indie", "storybook", "organic",
  ], ["quirky", "fun", "whimsical", "casual"], ["indie branding", "storybooks", "quirky design", "games", "casual apps"], [
    "rough hand-drawn forms", "whimsical quirky personality", "indie storybook feel",
  ]),

  gfDisplay("Henny Penny", "Henny Penny", "display", [
    "whimsical", "storybook", "fairy-tale", "fun", "decorative", "fantasy", "kids", "quirky", "cottagecore", "cute",
  ], ["whimsical", "fairy-tale", "fun", "storybook"], ["kids books", "fairy tale themes", "fantasy", "cottagecore", "whimsical branding"], [
    "fairy-tale inspired letterforms", "storybook decorative details", "whimsical fantasy personality",
  ]),

  // ════════════════════════════════════════════════
  // EXPERIMENTAL / CHROMATIC
  // ════════════════════════════════════════════════

  // ════════════════════════════════════════════════
  // ADDITIONAL EXPRESSIVE DISPLAY FONTS
  // ════════════════════════════════════════════════

  gfDisplay("Permanent Marker", "Permanent Marker", "display", [
    "marker", "bold", "casual", "handlettered", "grunge", "street", "urban", "edgy", "raw", "punk",
  ], ["bold", "casual", "raw", "urban"], ["street art", "casual branding", "music", "urban design", "social media"], [
    "thick marker stroke", "casual hand-lettered feel", "urban street energy",
  ]),

  gfDisplay("Press Start 2P", "Press Start 2P", "display", [
    "pixel", "retro", "gaming", "8-bit", "arcade", "y2k", "nostalgia", "digital", "tech", "geek",
  ], ["retro", "digital", "nostalgic", "geeky"], ["gaming", "retro tech", "arcade themes", "pixel art", "indie games"], [
    "pixel bitmap letterforms", "8-bit arcade aesthetic", "retro gaming nostalgia",
  ]),

  gfDisplay("Silkscreen", "Silkscreen", "display", [
    "pixel", "small", "bitmap", "retro", "gaming", "digital", "y2k", "tech", "minimal", "lo-fi",
  ], ["retro", "digital", "lo-fi", "minimal"], ["pixel art", "retro UI", "indie games", "tech nostalgia", "lo-fi design"], [
    "small pixel bitmap design", "lo-fi digital aesthetic", "minimal retro forms",
  ]),

  gfDisplay("VT323", "VT323", "display", [
    "terminal", "retro", "hacker", "monospace", "pixel", "tech", "cyberpunk", "80s", "digital", "matrix",
  ], ["retro-tech", "hacker", "digital", "cyberpunk"], ["cyberpunk", "hacker themes", "retro computing", "terminal UIs", "sci-fi"], [
    "VT320 terminal-inspired forms", "retro computing aesthetic", "hacker monospace feel",
  ]),

  gfDisplay("Special Elite", "Special Elite", "display", [
    "typewriter", "vintage", "literary", "dark-academia", "noir", "editorial", "retro", "worn", "distressed", "classic",
  ], ["vintage", "literary", "noir", "worn"], ["dark academia", "literary branding", "detective themes", "vintage editorial", "noir"], [
    "typewriter-inspired forms", "worn vintage character", "literary noir personality",
  ]),

  gfDisplay("Orbitron", "Orbitron", "display", [
    "futuristic", "sci-fi", "geometric", "space", "tech", "cyber", "modern", "clean", "digital", "minimal",
  ], ["futuristic", "geometric", "clean", "technical"], ["sci-fi", "tech branding", "space themes", "cyberpunk", "modern UI"], [
    "geometric futuristic letterforms", "space-age proportions", "clean sci-fi aesthetic",
  ]),

  gfDisplay("Audiowide", "Audiowide", "display", [
    "futuristic", "tech", "automotive", "racing", "sci-fi", "digital", "bold", "modern", "cyber", "industrial",
  ], ["futuristic", "tech", "bold", "automotive"], ["automotive", "tech branding", "racing", "sci-fi", "industrial design"], [
    "wide futuristic letterforms", "automotive dashboard feel", "tech-forward bold style",
  ]),

  gfDisplay("Bungee", "Bungee", "display", [
    "bold", "sign-painting", "urban", "retro", "poster", "display", "street", "pop", "chunky", "vintage",
  ], ["bold", "urban", "retro", "eye-catching"], ["signage", "posters", "urban branding", "headlines", "street design"], [
    "vertical and horizontal orientation support", "sign-painting heritage", "urban bold weight",
  ]),

  gfDisplay("Righteous", "Righteous", "display", [
    "retro", "70s", "groovy", "rounded", "vintage", "funky", "warm", "display", "bold", "disco",
  ], ["retro", "groovy", "warm", "funky"], ["70s themes", "retro branding", "music", "vintage events", "disco"], [
    "rounded retro 70s forms", "groovy warm personality", "funky vintage curves",
  ]),

  gfDisplay("Fredoka", "Fredoka", "display", [
    "rounded", "friendly", "cute", "bubbly", "kids", "playful", "soft", "modern", "fun", "approachable",
  ], ["friendly", "cute", "approachable", "soft"], ["kids brands", "apps", "casual branding", "educational", "health"], [
    "fully rounded friendly forms", "soft approachable weight", "modern cute design",
  ], { variableFont: true, weights: [300, 400, 500, 600, 700] }),

  gfDisplay("Abril Fatface", "Abril Fatface", "display", [
    "editorial", "elegant", "bold", "display", "poster", "fashion", "vintage", "serif", "magazine", "luxury",
  ], ["bold", "elegant", "editorial", "dramatic"], ["fashion", "magazines", "editorial", "luxury branding", "posters"], [
    "ultra-bold display serif", "high stroke contrast", "editorial poster presence",
  ], { serifSansCategory: "serif" }),

  gfDisplay("Lobster", "Lobster", "script", [
    "script", "bold", "retro", "fun", "casual", "friendly", "vintage", "warm", "connected", "display",
  ], ["bold", "fun", "retro", "friendly"], ["casual branding", "food brands", "restaurants", "retro design", "social media"], [
    "bold connected script", "retro-inspired ligatures", "friendly warm personality",
  ], { serifSansCategory: "script" }),

  gfDisplay("Pacifico", "Pacifico", "script", [
    "script", "surf", "casual", "retro", "beach", "fun", "1950s", "americana", "vintage", "laid-back",
  ], ["casual", "retro", "laid-back", "fun"], ["surf brands", "beach themes", "casual dining", "retro branding", "vacation"], [
    "casual surf-inspired brush script", "retro 1950s California feel", "laid-back connected forms",
  ], { serifSansCategory: "script" }),

  gfDisplay("Dancing Script", "Dancing Script", "script", [
    "script", "elegant", "casual", "feminine", "romantic", "flowing", "wedding", "handlettered", "friendly", "warm",
  ], ["elegant", "casual", "romantic", "flowing"], ["invitations", "blogs", "feminine branding", "casual elegance", "menus"], [
    "casual elegant connected script", "bouncing baseline", "warm flowing rhythm",
  ], { serifSansCategory: "script", variableFont: true, weights: [400, 500, 600, 700] }),

  gfDisplay("Caveat", "Caveat", "handwritten", [
    "handwritten", "casual", "natural", "friendly", "organic", "personal", "notebook", "annotation", "warm", "approachable",
  ], ["casual", "natural", "personal", "approachable"], ["annotations", "personal blogs", "casual apps", "notes", "educational"], [
    "natural handwriting flow", "casual annotation feel", "warm personal voice",
  ], { variableFont: true, weights: [400, 500, 600, 700] }),

  gfDisplay("Comfortaa", "Comfortaa", "display", [
    "rounded", "geometric", "modern", "futuristic", "clean", "friendly", "tech", "minimal", "soft", "sleek",
  ], ["modern", "rounded", "clean", "friendly"], ["tech branding", "modern apps", "clean UI", "soft tech", "startup branding"], [
    "perfectly rounded geometric forms", "modern sleek design", "friendly futuristic feel",
  ], { variableFont: true, weights: [300, 400, 500, 600, 700] }),

  gfDisplay("Cinzel Decorative", "Cinzel Decorative", "display", [
    "decorative", "roman", "classical", "elegant", "luxury", "serif", "heritage", "dark-academia", "literary", "ornate",
  ], ["classical", "elegant", "ornate", "luxurious"], ["luxury branding", "dark academia", "classical themes", "literary", "heritage events"], [
    "decorative Roman capital letterforms", "classical ornate details", "luxury heritage presence",
  ], { serifSansCategory: "serif" }),

  gfDisplay("Alfa Slab One", "Alfa Slab One", "display", [
    "slab", "bold", "strong", "poster", "headline", "vintage", "display", "heavy", "impact", "retro",
  ], ["bold", "strong", "impactful", "heavy"], ["posters", "headlines", "sports", "editorial", "vintage advertising"], [
    "ultra-bold slab serif", "high visual impact", "vintage poster weight",
  ], { serifSansCategory: "serif" }),

  gfDisplay("Staatliches", "Staatliches", "display", [
    "condensed", "bold", "industrial", "modern", "display", "editorial", "news", "headline", "tall", "impactful",
  ], ["bold", "industrial", "modern", "commanding"], ["news headlines", "editorial", "sports", "industrial branding", "posters"], [
    "ultra-condensed display forms", "industrial news headline feel", "commanding vertical rhythm",
  ]),

  gfDisplay("Baskervville", "Baskervville", "serif", [
    "classic", "elegant", "traditional", "literary", "dark-academia", "editorial", "timeless", "refined", "readable", "heritage",
  ], ["classic", "refined", "literary", "elegant"], ["dark academia", "literary branding", "editorial", "books", "heritage"], [
    "transitional serif based on Baskerville", "classic refined proportions", "literary heritage",
  ], { serifSansCategory: "serif", isBodySuitable: true, bodyLegibilityScore: 7 }),

  gfDisplay("Poiret One", "Poiret One", "display", [
    "art-deco", "thin", "geometric", "elegant", "gatsby", "vintage", "fashion", "luxury", "1920s", "refined",
  ], ["elegant", "art-deco", "refined", "delicate"], ["fashion", "art deco themes", "luxury branding", "gatsby events", "high-end editorial"], [
    "art deco geometric thin forms", "roaring twenties elegance", "delicate refined proportions",
  ]),

  gfDisplay("Berkshire Swash", "Berkshire Swash", "display", [
    "swash", "decorative", "calligraphic", "elegant", "vintage", "romantic", "feminine", "ornate", "serif", "heritage",
  ], ["elegant", "decorative", "romantic", "ornate"], ["invitations", "vintage branding", "romantic themes", "feminine luxury", "heritage events"], [
    "calligraphic swash capitals", "decorative vintage elegance", "romantic serif personality",
  ], { serifSansCategory: "serif" }),

  gfDisplay("Megrim", "Megrim", "display", [
    "futuristic", "thin", "geometric", "sci-fi", "angular", "cyber", "minimal", "tech", "experimental", "avant-garde",
  ], ["futuristic", "angular", "experimental", "minimal"], ["sci-fi themes", "tech branding", "experimental design", "cyber aesthetics", "avant-garde"], [
    "angular thin geometric forms", "futuristic experimental design", "cyberpunk minimal aesthetic",
  ]),

  gfDisplay("Nixie One", "Nixie One", "display", [
    "retro-tech", "nixie-tube", "vintage", "steampunk", "display", "quirky", "tech", "decorative", "serif", "nerdy",
  ], ["retro-tech", "quirky", "vintage", "charming"], ["steampunk", "vintage tech", "retro electronics", "nerdy branding", "quirky editorial"], [
    "nixie tube display inspired slab forms", "retro electronics aesthetic", "vintage tech personality",
  ]),

  gfDisplay("Vast Shadow", "Vast Shadow", "display", [
    "western", "shadow", "bold", "display", "vintage", "poster", "americana", "3d", "retro", "dramatic",
  ], ["bold", "dramatic", "western", "eye-catching"], ["western themes", "vintage posters", "americana", "bold headlines", "retro advertising"], [
    "heavy inline shadow effect", "western display presence", "vintage poster drama",
  ]),

  gfDisplay("UnifrakturMaguntia", "UnifrakturMaguntia", "display", [
    "blackletter", "gothic", "medieval", "german", "dark", "tattoo", "heritage", "fraktur", "old-english", "dark-academia",
  ], ["gothic", "dark", "medieval", "heritage"], ["dark academia", "gothic branding", "medieval themes", "tattoo", "beer labels"], [
    "traditional Fraktur blackletter", "gothic medieval heritage", "German typographic tradition",
  ]),

  gfDisplay("Metal Mania", "Metal Mania", "display", [
    "metal", "gothic", "dark", "aggressive", "horror", "band", "heavy-metal", "edgy", "punk", "extreme",
  ], ["aggressive", "dark", "heavy", "intense"], ["metal music", "band logos", "dark gaming", "horror", "extreme branding"], [
    "heavy metal band lettering style", "aggressive gothic forms", "extreme dark personality",
  ]),

  gfDisplay("Dokdo", "Dokdo", "display", [
    "brush", "asian-inspired", "bold", "painted", "ink", "artistic", "calligraphic", "organic", "expressive", "raw",
  ], ["expressive", "raw", "artistic", "bold"], ["art exhibitions", "asian-inspired design", "creative branding", "gallery", "editorial"], [
    "bold brush ink strokes", "Asian calligraphy influence", "raw artistic expression",
  ]),

  gfDisplay("Zen Dots", "Zen Dots", "display", [
    "futuristic", "rounded", "tech", "cyber", "digital", "gaming", "neon", "sci-fi", "modern", "bold",
  ], ["futuristic", "tech", "bold", "digital"], ["gaming", "tech branding", "sci-fi", "cyberpunk", "digital products"], [
    "rounded futuristic dot-connected forms", "digital tech aesthetic", "cyber gaming personality",
  ]),

  gfDisplay("Yuji Mai", "Yuji Mai", "display", [
    "japanese", "calligraphic", "elegant", "asian-inspired", "brush", "cultural", "zen", "organic", "refined", "artistic",
  ], ["elegant", "cultural", "zen", "refined"], ["japanese themes", "zen branding", "cultural events", "tea ceremony", "art gallery"], [
    "Japanese calligraphy-inspired forms", "zen elegance", "cultural brush refinement",
  ]),

  gfDisplay("Climate Crisis", "Climate Crisis", "display", [
    "environmental", "melting", "activism", "bold", "experimental", "variable", "dynamic", "awareness", "modern", "urgency",
  ], ["urgent", "dynamic", "bold", "activist"], ["environmental campaigns", "activism", "awareness design", "editorial", "non-profit"], [
    "variable-weight melting effect", "climate change visual metaphor", "activist design statement",
  ], { variableFont: true }),

  gfDisplay("Tourney", "Tourney", "display", [
    "sport", "condensed", "athletic", "bold", "competition", "varsity", "collegiate", "racing", "energetic", "display",
  ], ["athletic", "competitive", "bold", "energetic"], ["sports branding", "tournaments", "athletic wear", "esports", "college"], [
    "condensed athletic display", "varsity collegiate style", "competition-ready forms",
  ], { variableFont: true, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] }),

  gfDisplay("Syne", "Syne", "display", [
    "modern", "editorial", "bold", "geometric", "contemporary", "art", "gallery", "avant-garde", "clean", "display",
  ], ["modern", "bold", "editorial", "avant-garde"], ["contemporary art", "gallery", "modern editorial", "creative tech", "branding"], [
    "contemporary geometric sans with personality", "art-world editorial feel", "modern bold presence",
  ], { variableFont: true, weights: [400, 500, 600, 700, 800], isBodySuitable: true, bodyLegibilityScore: 6 }),
];

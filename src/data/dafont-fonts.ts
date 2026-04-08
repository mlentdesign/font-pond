import type { Font, FontClassification } from "./types";

// ── Personality enrichment ──
// Auto-adds more expressive/descriptive tags based on existing tags

const PERSONALITY_MAP: Record<string, string[]> = {
  grunge: ["raw", "fierce", "rebellious", "underground", "unpolished"],
  punk: ["fierce", "defiant", "anarchic", "anti-establishment", "loud"],
  cute: ["adorable", "sweet", "girly", "kawaii", "charming"],
  bubbly: ["girly", "youthful", "peppy", "cheerful", "lively"],
  elegant: ["refined", "sophisticated", "graceful", "premium", "luxurious"],
  gothic: ["dark", "mysterious", "dramatic", "ornate", "brooding"],
  retro: ["nostalgic", "throwback", "classic", "groovy", "vintage-inspired"],
  horror: ["spooky", "sinister", "eerie", "haunting", "macabre"],
  pixel: ["nostalgic", "geeky", "arcade", "lo-fi", "digital"],
  brush: ["artistic", "expressive", "dynamic", "fresh", "gestural"],
  script: ["flowing", "graceful", "romantic", "personal", "charming"],
  handwritten: ["authentic", "personal", "intimate", "casual", "human"],
  bold: ["powerful", "commanding", "assertive", "striking", "impactful"],
  feminine: ["graceful", "delicate", "girly", "romantic", "soft"],
  warm: ["cozy", "inviting", "approachable", "comforting", "friendly"],
  futuristic: ["sleek", "cutting-edge", "innovative", "forward-looking", "sci-fi"],
  western: ["frontier", "rugged", "adventurous", "rustic", "cowboy"],
  stencil: ["military", "industrial", "utilitarian", "structured", "tactical"],
  neon: ["vibrant", "electric", "nightlife", "flashy", "80s-inspired"],
  decorative: ["ornamental", "fancy", "detailed", "elaborate", "eye-catching"],
};

function enrichTags(tags: string[], toneDescriptors: string[]): string[] {
  const extra = new Set<string>();
  for (const tag of [...tags, ...toneDescriptors]) {
    const additions = PERSONALITY_MAP[tag.toLowerCase()];
    if (additions) {
      for (const a of additions) extra.add(a);
    }
  }
  return [...new Set([...tags, ...extra])];
}

// ── Factory ──

function dafont(
  name: string,
  classification: FontClassification,
  tags: string[],
  toneDescriptors: string[],
  useCases: string[],
  distinctiveTraits: string[],
  opts?: {
    subcategory?: string;
    designer?: string;
    year?: number;
    licenseType?: string;
    serifSansCategory?: Font["serifSansCategory"];
    xHeightRatio?: Font["xHeightRatio"];
    apertureOpenness?: Font["apertureOpenness"];
    strokeContrast?: Font["strokeContrast"];
    letterSpacing?: Font["letterSpacing"];
    moodCategory?: Font["moodCategory"];
  }
): Font {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const enrichedTags = enrichTags(tags, toneDescriptors);
  // Per-font anatomy derivation from tags/traits/tones
  const allWords = [...tags, ...toneDescriptors, ...distinctiveTraits].map(s => s.toLowerCase()).join(" ");
  const derivedXHeight: Font["xHeightRatio"] = opts?.xHeightRatio ??
    (allWords.includes("condensed") || allWords.includes("impact") || allWords.includes("bold") || allWords.includes("heavy") ? "high" :
     allWords.includes("script") || allWords.includes("calligraph") || allWords.includes("decorative") || allWords.includes("ornate") ? "low" : "moderate");
  const derivedAperture: Font["apertureOpenness"] = opts?.apertureOpenness ??
    (allWords.includes("condensed") || allWords.includes("tight") || allWords.includes("impact") || allWords.includes("heavy") || allWords.includes("block") ? "closed" :
     allWords.includes("open") || allWords.includes("rounded") || allWords.includes("friendly") ? "open" : "moderate");
  const derivedStroke: Font["strokeContrast"] = opts?.strokeContrast ??
    (allWords.includes("high-contrast") || allWords.includes("elegant") && classification === "serif" ? "high" :
     allWords.includes("script") || allWords.includes("calligraph") || allWords.includes("brush") ? "moderate" :
     allWords.includes("slab") || allWords.includes("rounded") ? "low" : "none");
  const derivedSpacing: Font["letterSpacing"] = opts?.letterSpacing ??
    (allWords.includes("condensed") || allWords.includes("tight") || allWords.includes("impact") || allWords.includes("heavy") ? "tight" :
     allWords.includes("wide") || allWords.includes("spaced") || allWords.includes("generous") ? "generous" : "normal");
  const derivedMood: Font["moodCategory"] = opts?.moodCategory ??
    (allWords.includes("grunge") || allWords.includes("punk") || allWords.includes("horror") || allWords.includes("experimental") || allWords.includes("raw") ? "experimental" :
     allWords.includes("playful") || allWords.includes("fun") || allWords.includes("cute") || allWords.includes("bubbly") || allWords.includes("cartoon") ? "playful" :
     allWords.includes("elegant") || allWords.includes("luxury") || allWords.includes("sophisticated") || allWords.includes("refined") ? "elegant" :
     allWords.includes("bold") || allWords.includes("impactful") || allWords.includes("powerful") || allWords.includes("fierce") || allWords.includes("commanding") ? "bold" :
     allWords.includes("warm") || allWords.includes("friendly") || allWords.includes("casual") || allWords.includes("handwritten") ? "warm" :
     allWords.includes("retro") || allWords.includes("vintage") || allWords.includes("classic") || allWords.includes("western") ? "traditional" :
     allWords.includes("pixel") || allWords.includes("stencil") || allWords.includes("military") || allWords.includes("digital") ? "technical" :
     allWords.includes("modern") || allWords.includes("sleek") || allWords.includes("futuristic") ? "modern" : "bold");
  return {
    id: `dafont-${slug}`,
    name,
    slug,
    source: "other",
    sourceUrl: `https://www.dafont.com/${slug}.font`,
    downloadUrl: null,
    specimenUrl: null,
    licenseType: opts?.licenseType ?? "Free",
    licenseConfidence: "medium",
    designer: opts?.designer ?? null,
    foundry: null,
    year: opts?.year ?? null,
    classification,
    subcategory: opts?.subcategory ?? null,
    serifSansCategory: opts?.serifSansCategory ?? "display",
    tags: enrichedTags,
    toneDescriptors,
    useCases,
    variableFont: false,
    weights: [400],
    styles: ["normal"],
    isHeaderSuitable: true,
    isBodySuitable: false,
    bodyLegibilityScore: 2,
    screenReadabilityNotes: null,
    distinctiveTraits,
    xHeightRatio: derivedXHeight,
    apertureOpenness: derivedAperture,
    strokeContrast: derivedStroke,
    letterSpacing: derivedSpacing,
    moodCategory: derivedMood,
    historicalNotes: null,
    notableUseExamples: [],
    similarFonts: [],
    popularityConfidence: "medium",
    metadataConfidence: "medium",
  };
}

// ── 200 DaFont Display / Header Fonts ──

export const dafontFonts: Font[] = [

  // ─── GRUNGE / DISTRESSED (~25) ───

  dafont("A Damn Mess", "display",
    ["grunge", "messy", "distressed", "punk", "dirty", "chaotic", "rough"],
    ["chaotic", "raw", "anarchic", "unpolished"],
    ["punk flyer", "underground event", "skateboard graphic", "zine"],
    ["intentionally messy letter construction", "anti-design aesthetic"],
    { designer: "Spork Thug Typography", xHeightRatio: "moderate", apertureOpenness: "moderate", strokeContrast: "none", letterSpacing: "normal", moodCategory: "experimental" },
  ),

  dafont("Punkboy", "display",
    ["grunge", "punk", "bold", "distressed", "rough", "angular", "aggressive"],
    ["rebellious", "loud", "confrontational", "energetic"],
    ["concert poster", "skateboard deck", "punk merch", "street art"],
    ["angular punk-influenced forms", "heavy ink distortion"],
    { designer: "PressGang Studios", xHeightRatio: "high", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "tight", moodCategory: "experimental" },
  ),


  dafont("Angst", "display",
    ["grunge", "dark", "heavy", "distressed", "bold", "angsty", "rough"],
    ["brooding", "intense", "dark", "emotional"],
    ["metal poster", "dark themed events", "album cover", "editorial"],
    ["heavy blackened letterforms", "emotionally charged weight"],
    { xHeightRatio: "high", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "tight", moodCategory: "experimental" },
  ),


  dafont("Dirty Headline", "display",
    ["grunge", "headline", "bold", "dirty", "distressed", "heavy", "impactful", "urban"],
    ["loud", "bold", "gritty", "impactful"],
    ["newspaper headline", "protest poster", "bold statement", "editorial"],
    ["thick bold forms with grime overlay", "newspaper distress"],
    { xHeightRatio: "high", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "tight", moodCategory: "bold" },
  ),

  dafont("Capture It", "display",
    ["grunge", "stencil", "rough", "military", "distressed", "urban", "spray"],
    ["rugged", "tactical", "urban", "street"],
    ["military poster", "street art", "urban branding", "action movie"],
    ["stencil with spray-paint bleed", "urban military hybrid"],
    { xHeightRatio: "high", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "normal", moodCategory: "technical" },
  ),
  dafont("Another Danger", "display",
    ["grunge", "brush", "rough", "danger", "aggressive", "textured", "distressed", "edgy"],
    ["dangerous", "edgy", "raw", "intense"],
    ["action movie", "extreme sports", "warning poster", "aggressive branding"],
    ["rough brush strokes", "danger-sign aesthetic"],
    { designer: "The Branded Quotes", xHeightRatio: "moderate", apertureOpenness: "moderate", strokeContrast: "low", letterSpacing: "normal", moodCategory: "experimental" },
  ),

  dafont("Crust Clean", "display",
    ["grunge", "crust", "punk", "rough", "heavy", "angular", "distressed"],
    ["crusty", "raw", "underground", "aggressive"],
    ["crust punk", "DIY show flyer", "underground zine", "noise music"],
    ["heavily degraded crust punk style", "hand-cut stencil look"],
    { designer: "alien foundery", xHeightRatio: "high", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "tight", moodCategory: "experimental" },
  ),



  dafont("Dirty Ego", "display",
    ["grunge", "modern", "distressed", "urban", "textured", "bold", "edgy"],
    ["urban", "contemporary", "gritty", "bold"],
    ["streetwear", "urban branding", "hip-hop poster", "fashion"],
    ["modern sans with grime overlay", "clean structure + dirty texture"],
    { xHeightRatio: "moderate", apertureOpenness: "moderate", strokeContrast: "none", letterSpacing: "normal", moodCategory: "experimental" },
  ),

  dafont("28 Days Later", "display",
    ["grunge", "horror", "scratched", "distressed", "dark", "apocalyptic", "rough"],
    ["terrifying", "post-apocalyptic", "tense", "desperate"],
    ["horror movie", "apocalypse theme", "survival game", "dark poster"],
    ["scratched survival-horror letterforms", "infected/degraded feel"],
    { designer: "Filmhimmel", xHeightRatio: "moderate", apertureOpenness: "moderate", strokeContrast: "none", letterSpacing: "normal", moodCategory: "experimental" },
  ),

  dafont("Neuropol", "display",
    ["grunge", "tech", "futuristic", "angular", "distressed", "sci-fi", "digital"],
    ["technological", "edgy", "futuristic", "digital"],
    ["tech poster", "sci-fi game", "cyber event", "digital art"],
    ["angular tech forms with distress", "cyberpunk grunge hybrid"],
    { xHeightRatio: "moderate", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "normal", moodCategory: "technical" },
  ),

  dafont("Guttural", "display",
    ["grunge", "metal", "extreme", "heavy", "aggressive", "dark", "distressed"],
    ["brutal", "extreme", "visceral", "relentless"],
    ["death metal", "extreme music", "horror", "dark poster"],
    ["extreme metal-influenced letterforms", "visceral distortion"],
    { designer: "James Stone", xHeightRatio: "high", apertureOpenness: "closed", strokeContrast: "none", letterSpacing: "tight", moodCategory: "experimental" },
  ),

  dafont("Eraser", "display",
    ["grunge", "erased", "faded", "distressed", "subtle", "worn", "chalky"],
    ["faded", "ghostly", "worn", "subtle"],
    ["minimal poster", "faded vintage", "artistic branding", "gallery"],
    ["partially erased letterforms", "chalk-on-blackboard texture"],
    { xHeightRatio: "moderate", apertureOpenness: "moderate", strokeContrast: "none", letterSpacing: "normal", moodCategory: "experimental" },
  ),

  // ─── SCRIPT / FEMININE / HANDWRITTEN (~25) ───

  dafont("Sacramento", "script",
    ["script", "flowing", "casual", "elegant", "feminine", "light", "airy", "handwritten"],
    ["light", "breezy", "casual-elegant", "warm"],
    ["blog", "invitation", "lifestyle brand", "personal site"],
    ["thin flowing script", "light and airy feel"],
    { designer: "Creatype Studio", serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Pacifico", "script",
    ["script", "retro", "surf", "casual", "fun", "rounded", "friendly", "vintage"],
    ["fun", "retro", "laid-back", "sunny"],
    ["surf brand", "casual restaurant", "fun branding", "beach theme"],
    ["retro surf-culture script", "1950s casual vibe"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Honey Script", "script",
    ["script", "sweet", "rounded", "feminine", "soft", "warm", "friendly", "cozy"],
    ["sweet", "warm", "approachable", "gentle"],
    ["bakery", "kids brand", "greeting card", "sweet shop"],
    ["soft rounded script", "honey-like flowing warmth"],
    { serifSansCategory: "script" }
  ),


  dafont("Angeline Vintage", "script",
    ["script", "vintage", "feminine", "ornamental", "elegant", "retro", "decorative"],
    ["nostalgic", "romantic", "vintage", "ornate"],
    ["vintage branding", "antique shop", "romantic poster", "retro wedding"],
    ["vintage-styled ornamental script", "decorative swash capitals"],
    { designer: "Burntilldead Typefoundry", serifSansCategory: "script" }
  ),


  dafont("Sophia", "script",
    ["script", "feminine", "modern", "calligraphy", "elegant", "thin", "bridal", "chic"],
    ["elegant", "modern", "feminine", "sophisticated"],
    ["fashion brand", "bridal", "beauty blog", "luxury packaging"],
    ["modern thin calligraphy", "contemporary feminine elegance"],
    { serifSansCategory: "script" }
  ),

  dafont("Scriptina", "script",
    ["script", "calligraphy", "formal", "ornate", "flowing", "classic", "decorative", "elegant"],
    ["formal", "classic", "ornate", "decorative"],
    ["wedding", "formal certificate", "luxury brand", "elegant poster"],
    ["classic ornamental calligraphy", "generous flourishes"],
    { serifSansCategory: "script" }
  ),

  dafont("Respective", "script",
    ["script", "formal", "calligraphy", "elegant", "connected", "flowing", "decorative"],
    ["respectful", "formal", "polished", "classic"],
    ["formal invitation", "awards", "upscale branding", "ceremony"],
    ["formal connected script", "polished and professional"],
    { serifSansCategory: "script" }
  ),

  dafont("Windsong", "script",
    ["script", "airy", "light", "feminine", "flowing", "delicate", "whimsical", "elegant"],
    ["airy", "whimsical", "delicate", "dreamy"],
    ["poetry book", "feminine brand", "romantic poster", "personal blog"],
    ["ultra-light windswept script", "delicate floating letterforms"],
    { serifSansCategory: "script" }
  ),


  dafont("Blessed Day", "script",
    ["script", "handwritten", "religious", "warm", "flowing", "personal", "heartfelt"],
    ["heartfelt", "warm", "personal", "sincere"],
    ["greeting card", "church event", "personal letter", "inspirational quote"],
    ["warm flowing hand script", "personal handwritten feel"],
    { serifSansCategory: "script" }
  ),

  dafont("Milkshake", "script",
    ["script", "thick", "retro", "fun", "bold", "rounded", "casual", "friendly"],
    ["fun", "retro", "friendly", "casual"],
    ["food brand", "retro diner", "fun poster", "casual branding"],
    ["thick retro casual script", "milkshake-era nostalgia"],
    { serifSansCategory: "script" }
  ),

  dafont("Love Ya Like A Sister", "handwritten",
    ["handwritten", "casual", "fun", "girly", "playful", "youthful", "friendly", "cute"],
    ["playful", "fun", "youthful", "friendly"],
    ["teen brand", "casual blog", "playful poster", "social media"],
    ["casual girly handwriting", "youthful personality"],
    { serifSansCategory: "display" }
  ),

  dafont("Nothing You Could Do", "handwritten",
    ["handwritten", "messy", "casual", "natural", "authentic", "raw", "personal"],
    ["authentic", "casual", "real", "unpolished"],
    ["personal brand", "indie music", "casual heading", "blog"],
    ["natural messy handwriting", "authentic imperfection"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  // ─── RETRO / VINTAGE (~20) ───

  dafont("Groovy", "display",
    ["retro", "groovy", "70s", "psychedelic", "rounded", "funky", "hippie", "vintage"],
    ["groovy", "funky", "nostalgic", "psychedelic"],
    ["70s party", "retro poster", "vintage shop", "disco event"],
    ["rounded 70s letterforms", "flower-power era styling"],
    { designer: "Patrick Burnens" },
  ),

  dafont("Lobster", "display",
    ["retro", "script-display", "bold", "connected", "vintage", "warm", "friendly", "classic"],
    ["warm", "friendly", "retro", "approachable"],
    ["restaurant", "food brand", "retro heading", "casual branding"],
    ["bold connected display", "retro sign-painting influence"],
    // Also on Google Fonts
  ),
  dafont("Edo SZ", "display",
    ["retro", "japanese-inspired", "geometric", "angular", "bold", "display", "asian", "poster"],
    ["dramatic", "cultural", "bold", "stylized"],
    ["japanese restaurant", "martial arts", "asian-themed event", "poster"],
    ["japanese-inspired geometric display", "angular stylized forms"],
  ),

  dafont("Magnolia Sky", "script",
    ["retro", "script", "vintage", "elegant", "feminine", "flowing", "nostalgic", "romantic"],
    ["vintage", "romantic", "feminine", "nostalgic"],
    ["vintage wedding", "retro branding", "feminine poster", "antique shop"],
    ["vintage-style flowing script", "1940s glamour influence"],
    { serifSansCategory: "script" }
  ),

  dafont("Komika Axis", "display",
    ["retro", "comic", "bold", "fun", "cartoon", "rounded", "energetic", "pop"],
    ["fun", "energetic", "comic", "loud"],
    ["comic book", "gaming", "kids brand", "fun poster"],
    ["comic-book inspired bold type", "pop-art energy"],
  ),

  dafont("Burnstown Dam", "display",
    ["retro", "art-deco", "vintage", "elegant", "decorative", "stylized", "classic", "1920s"],
    ["elegant", "vintage", "refined", "classic"],
    ["vintage poster", "1920s theme", "classic branding", "elegant event"],
    ["art deco influenced vintage display", "1920s elegance"],
  ),

  dafont("Tropical Asian", "display",
    ["retro", "tiki", "tropical", "exotic", "vintage", "fun", "bamboo", "island"],
    ["exotic", "tropical", "fun", "festive"],
    ["tiki bar", "tropical party", "island theme", "exotic restaurant"],
    ["bamboo-styled tropical display", "tiki-era nostalgia"],
    { designer: "Konstantine Studio" },
  ),

  dafont("Diner", "display",
    ["retro", "diner", "50s", "americana", "classic", "vintage", "neon", "sign"],
    ["nostalgic", "classic", "warm", "americana"],
    ["diner menu", "50s party", "americana branding", "retro sign"],
    ["1950s diner signage style", "classic americana feel"],
  ),

  dafont("Chunk Five", "slab-serif",
    ["retro", "slab-serif", "bold", "heavy", "vintage", "display", "strong", "poster"],
    ["bold", "strong", "retro", "impactful"],
    ["poster headline", "vintage branding", "bold statement", "retro heading"],
    ["ultra-bold slab serif", "vintage poster weight"],
    { serifSansCategory: "slab-serif" }
  ),

  dafont("Bebas Neue", "display",
    ["retro", "condensed", "tall", "modern", "clean", "bold", "versatile", "uppercase"],
    ["modern", "clean", "bold", "professional"],
    ["poster", "headline", "branding", "editorial", "film title"],
    ["ultra-condensed uppercase display", "extremely popular free font"],
    // Also on Google Fonts
  ),


  dafont("Yeasty Flavors", "display",
    ["retro", "craft-beer", "vintage", "ornamental", "rustic", "artisanal", "label"],
    ["artisanal", "rustic", "vintage", "handcrafted"],
    ["craft beer", "artisan food", "vintage label", "rustic brand"],
    ["vintage label-style display", "craft brewery aesthetic"],
  ),

  dafont("Rumble Brave", "display",
    ["retro", "vintage", "textured", "classic", "masculine", "weathered", "bold"],
    ["rugged", "vintage", "masculine", "classic"],
    ["vintage poster", "masculine branding", "adventure", "classic heading"],
    ["weathered vintage display", "classic rugged charm"],
  ),

  // ─── GOTHIC / BLACKLETTER (~15) ───



  dafont("Deutsch Gothic", "display",
    ["blackletter", "gothic", "german", "traditional", "heavy", "formal", "dark", "bold"],
    ["formal", "heavy", "traditional", "authoritative"],
    ["gothic branding", "beer label", "traditional heading", "dark poster"],
    ["german-style gothic blackletter", "heavy traditional forms"],
    { designer: "James Fordyce" },
  ),

  dafont("Kingthings Petrock", "display",
    ["blackletter", "gothic", "medieval", "rough", "handwritten", "rustic", "ancient"],
    ["rustic", "ancient", "medieval", "organic"],
    ["medieval event", "rustic theme", "fantasy game", "historic branding"],
    ["rough handwritten blackletter", "medieval manuscript feel"],
  ),

  dafont("Cloister Black", "display",
    ["blackletter", "gothic", "classic", "formal", "religious", "ornate", "traditional"],
    ["solemn", "formal", "religious", "reverent"],
    ["religious text", "formal certificate", "gothic heading", "brewery label"],
    ["classic cloister blackletter", "religious manuscript influence"],
  ),



  dafont("Diploma", "display",
    ["blackletter", "formal", "certificate", "traditional", "classic", "calligraphy", "official"],
    ["formal", "official", "traditional", "authoritative"],
    ["diploma", "certificate", "formal document", "traditional heading"],
    ["formal blackletter for documents", "official certificate style"],
    { designer: "Vladimir Nikolic" },
  ),

  dafont("Teutonic", "display",
    ["blackletter", "teutonic", "german", "angular", "dark", "heavy", "medieval", "stern"],
    ["stern", "dark", "powerful", "imposing"],
    ["dark branding", "medieval event", "heavy-metal", "gothic poster"],
    ["angular teutonic blackletter", "imposing Germanic forms"],
    { designer: "Paul Lloyd" },
  ),

  dafont("London", "display",
    ["blackletter", "newspaper", "masthead", "gothic", "british", "traditional", "editorial"],
    ["traditional", "editorial", "authoritative", "british"],
    ["newspaper masthead", "editorial heading", "traditional brand"],
    ["newspaper-masthead blackletter", "london Times influence"],
  ),

  dafont("Pieces of Eight", "display",
    ["blackletter", "pirate", "fantasy", "adventure", "decorative", "themed", "nautical"],
    ["adventurous", "pirate", "fantasy", "playful-dark"],
    ["pirate theme", "adventure game", "fantasy poster", "themed event"],
    ["pirate-themed blackletter", "swashbuckler ornaments"],
  ),

  dafont("Bastarda", "display",
    ["blackletter", "bastarda", "calligraphy", "medieval", "scribal", "historic", "formal"],
    ["historic", "scribal", "medieval", "academic"],
    ["medieval manuscript", "academic heading", "historic event"],
    ["bastarda calligraphic blackletter", "scribal manuscript style"],
  ),

  // ─── PIXEL / GAMING / 8-BIT (~15) ───

  dafont("Pixel Operator", "monospace",
    ["pixel", "8-bit", "retro-gaming", "bitmap", "clean", "minimal", "digital", "arcade"],
    ["digital", "retro", "clean", "nostalgic"],
    ["retro game", "pixel art", "indie game UI", "8-bit project"],
    ["clean pixel-grid font", "legible bitmap design"],
    { serifSansCategory: "monospace" }
  ),

  dafont("VCR OSD Mono", "monospace",
    ["pixel", "VCR", "retro-tech", "mono", "screen", "tape", "80s", "digital"],
    ["retro-tech", "nostalgic", "analog-digital", "lo-fi"],
    ["vHS aesthetic", "retro video", "80s tech theme", "vaporwave"],
    ["vCR on-screen display style", "tape-era nostalgia"],
    { serifSansCategory: "monospace" }
  ),

  dafont("Press Start 2P", "display",
    ["pixel", "arcade", "gaming", "8-bit", "retro", "bold", "blocky", "classic"],
    ["arcade", "fun", "nostalgic", "energetic"],
    ["arcade game", "retro gaming", "8-bit project", "gaming poster"],
    ["classic arcade pixel font", "nES-era gaming style"],
    // Also on Google Fonts
  ),

  dafont("Commodore 64", "monospace",
    ["pixel", "C64", "retro-computing", "8-bit", "vintage-tech", "classic", "home-computer"],
    ["retro-computing", "nostalgic", "classic", "geeky"],
    ["retro computing", "C64 tribute", "vintage tech poster", "nostalgia"],
    ["commodore 64 system font recreation", "home computer era"],
    { serifSansCategory: "monospace" }
  ),

  dafont("Silkscreen", "display",
    ["pixel", "bitmap", "small", "clean", "minimal", "web", "screen", "digital"],
    ["minimal", "digital", "clean", "technical"],
    ["uI element", "pixel art", "small display text", "digital project"],
    ["small clean pixel font", "web-optimized bitmap"],
    { designer: "Jason Aleksandr Kottke" },
  ),

  dafont("Visitor", "display",
    ["pixel", "futuristic", "sci-fi", "digital", "small", "clean", "minimal", "tech"],
    ["futuristic", "minimal", "digital", "sleek"],
    ["sci-fi game", "tech interface", "futuristic UI", "digital project"],
    ["small futuristic pixel font", "sci-fi display feel"],
  ),

  dafont("Upheaval", "display",
    ["pixel", "bold", "chunky", "gaming", "heavy", "arcade", "impactful", "strong"],
    ["bold", "impactful", "heavy", "powerful"],
    ["game title", "bold pixel heading", "retro poster", "gaming brand"],
    ["heavy bold pixel display", "maximum pixel impact"],
  ),


  dafont("Joystix", "display",
    ["pixel", "gaming", "arcade", "bold", "retro", "fun", "chunky", "console"],
    ["fun", "arcade", "bold", "playful"],
    ["arcade cabinet", "gaming poster", "retro event", "pixel project"],
    ["chunky arcade-style pixel font", "console gaming nostalgia"],
  ),

  dafont("Eight Bit Dragon", "display",
    ["pixel", "fantasy", "gaming", "dragon", "RPG", "adventure", "retro", "bold"],
    ["adventurous", "fantasy", "bold", "epic"],
    ["rPG game", "fantasy pixel art", "adventure game", "gaming poster"],
    ["fantasy RPG pixel font", "dragon-quest era style"],
  ),

  dafont("Minecraftia", "display",
    ["pixel", "minecraft", "gaming", "blocky", "square", "crafting", "sandbox", "popular"],
    ["blocky", "fun", "creative", "familiar"],
    ["minecraft project", "sandbox game", "crafting theme", "gaming content"],
    ["minecraft-inspired pixel font", "blocky sandbox style"],
  ),


  dafont("Super Mario 256", "display",
    ["pixel", "mario", "platformer", "gaming", "nostalgic", "fun", "classic", "nintendo"],
    ["nostalgic", "fun", "classic", "joyful"],
    ["platformer game", "nintendo tribute", "retro gaming", "nostalgia project"],
    ["mario-inspired pixel display", "platform game nostalgia"],
    { designer: "fsuarez913" },
  ),



  // ─── CUTE / BUBBLY / KAWAII (~20) ───

  dafont("Cookies", "display",
    ["cute", "sweet", "rounded", "friendly", "warm", "bakery", "fun", "soft"],
    ["sweet", "warm", "friendly", "cozy"],
    ["bakery brand", "kids menu", "sweet shop", "cute packaging"],
    ["cookie-sweet rounded display", "warm bakery feel"],
  ),

  dafont("Sniglet", "display",
    ["cute", "rounded", "modern", "friendly", "soft", "clean", "approachable", "gentle"],
    ["friendly", "approachable", "soft", "modern"],
    ["app branding", "friendly UI", "modern kids brand", "tech startup"],
    ["modern rounded friendly display", "soft approachable forms"],
  ),

  dafont("KG Happy", "handwritten",
    ["cute", "handwritten", "happy", "round", "bubbly", "cheerful", "school", "youthful"],
    ["happy", "cheerful", "youthful", "sunny"],
    ["school project", "happy poster", "children's brand", "cheerful heading"],
    ["happy bubbly handwriting", "youthful school-style writing"],
    { serifSansCategory: "display", designer: "Kimberly Geswein" }
  ),

  dafont("Kawaii", "display",
    ["cute", "kawaii", "japanese-pop", "rounded", "bubbly", "anime", "sweet", "pastel"],
    ["kawaii", "adorable", "sweet", "pop"],
    ["kawaii brand", "anime poster", "cute packaging", "japanese-pop style"],
    ["kawaii-styled bubbly display", "japanese cute culture influence"],
  ),

  dafont("Jelly Crazies", "display",
    ["cute", "jelly", "wobbly", "fun", "playful", "bouncy", "colorful", "kids"],
    ["wobbly", "fun", "silly", "playful"],
    ["kids party", "fun heading", "playful poster", "toy packaging"],
    ["wobbly jelly-like letterforms", "bouncy playful motion"],
  ),

  dafont("Coiny", "display",
    ["cute", "rounded", "slightly-rough", "handmade", "playful", "textured", "fun", "warm"],
    ["handmade", "playful", "warm", "crafty"],
    ["craft brand", "handmade shop", "playful packaging", "artisan"],
    ["slightly rough rounded display", "handmade crafty charm"],
    // Also on Google Fonts
  ),

  dafont("Comfortaa", "display",
    ["cute", "geometric", "rounded", "modern", "clean", "soft", "futuristic", "friendly"],
    ["modern", "soft", "clean", "futuristic-friendly"],
    ["tech startup", "modern app", "friendly heading", "clean branding"],
    ["geometric rounded modern display", "soft-tech aesthetic"],
    // Also on Google Fonts
  ),

  dafont("Titan One", "display",
    ["cute", "bold", "slab", "rounded", "heavy", "friendly", "chunky", "strong"],
    ["bold", "strong", "friendly", "chunky"],
    ["bold heading", "sports-fun", "strong kids brand", "chunky poster"],
    ["bold rounded slab display", "strong yet friendly weight"],
    // Also on Google Fonts
  ),


  dafont("Boogaloo", "display",
    ["cute", "retro", "rounded", "casual", "fun", "60s", "playful", "bouncy"],
    ["fun", "retro", "bouncy", "casual"],
    ["retro poster", "fun branding", "casual heading", "60s theme"],
    ["retro-casual rounded display", "1960s fun personality"],
    { designer: "SolFonts" },
    // Also on Google Fonts
  ),

  dafont("Short Stack", "handwritten",
    ["cute", "handwritten", "casual", "round", "simple", "friendly", "notebook", "natural"],
    ["casual", "simple", "friendly", "natural"],
    ["notebook style", "casual blog", "kids brand", "simple heading"],
    ["casual round handwriting", "natural notebook feel"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  // ─── BRUSH / PAINTED (~15) ───

  dafont("Bushcraft", "display",
    ["brush", "thick", "bold", "painted", "expressive", "hand-drawn", "artistic", "raw"],
    ["expressive", "artistic", "bold", "raw"],
    ["art poster", "expressive heading", "creative brand", "gallery"],
    ["thick bold brush strokes", "artistic hand-painted feel"],
  ),



  dafont("Stroke Dimension", "display",
    ["brush", "artistic", "expressive", "thick", "paint", "abstract", "bold", "creative"],
    ["artistic", "abstract", "expressive", "creative"],
    ["art exhibition", "creative brand", "abstract poster", "gallery"],
    ["thick artistic brush strokes", "abstract paint quality"],
  ),


  dafont("Chinese Rocks", "display",
    ["brush", "asian-inspired", "bold", "expressive", "inky", "calligraphy", "artistic"],
    ["bold", "expressive", "inky", "artistic"],
    ["asian-themed design", "ink art poster", "artistic heading"],
    ["asian-inspired brush display", "bold ink strokes"],
  ),

  dafont("Adrenaline", "display",
    ["brush", "bold", "speed", "dynamic", "sports", "energetic", "fast", "italic"],
    ["energetic", "fast", "dynamic", "powerful"],
    ["sports brand", "extreme sports", "energy poster", "action heading"],
    ["speed-styled brush display", "dynamic athletic energy"],
    { designer: "Creative Lab" },
  ),

  // ─── ART DECO / NOUVEAU (~10) ───

  dafont("Broadway", "display",
    ["art-deco", "broadway", "theater", "bold", "glamorous", "showtime", "classic", "1930s"],
    ["glamorous", "theatrical", "bold", "show-stopping"],
    ["theater poster", "broadway event", "show heading", "glamour branding"],
    ["classic Broadway theater display", "show-business glamour"],
    { designer: "Vladimir Nikolic" },
  ),






  // ─── SCI-FI / FUTURISTIC (~15) ───

  dafont("Orbitron", "display",
    ["sci-fi", "futuristic", "geometric", "space", "tech", "modern", "angular", "digital"],
    ["futuristic", "technological", "precise", "modern"],
    ["sci-fi movie", "tech brand", "space poster", "futuristic UI"],
    ["geometric space-age display", "orbital precision"],
    // Also on Google Fonts
  ),

  dafont("Ethnocentric", "display",
    ["sci-fi", "futuristic", "italic", "angular", "space", "dynamic", "tech", "aggressive"],
    ["dynamic", "futuristic", "aggressive", "fast"],
    ["sci-fi game", "space poster", "tech heading", "futuristic brand"],
    ["angular italic futuristic display", "high-speed space aesthetic"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Alien Encounters", "display",
    ["sci-fi", "alien", "space", "digital", "angular", "tech", "extraterrestrial", "glowing"],
    ["alien", "mysterious", "technological", "otherworldly"],
    ["sci-fi poster", "alien theme", "space game", "uFO event"],
    ["alien-tech angular display", "extraterrestrial aesthetic"],
    { designer: "ShyFonts" },
  ),
  dafont("Conthrax", "display",
    ["sci-fi", "geometric", "modern", "tech", "clean", "futuristic", "angular", "precise"],
    ["precise", "modern", "technological", "clean"],
    ["tech startup", "futuristic UI", "clean sci-fi", "modern heading"],
    ["clean geometric futuristic display", "precision-tech feel"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Azonix", "display",
    ["sci-fi", "futuristic", "bold", "geometric", "modern", "space", "angular", "display"],
    ["bold", "futuristic", "modern", "impactful"],
    ["sci-fi poster", "bold tech heading", "space branding", "futuristic event"],
    ["bold geometric futuristic display", "space-age impact"],
  ),

  dafont("Neuropolitical", "display",
    ["sci-fi", "futuristic", "angular", "tech", "cyber", "digital", "sleek", "modern"],
    ["sleek", "cyber", "futuristic", "digital"],
    ["cyberpunk", "tech poster", "digital event", "futuristic branding"],
    ["angular cyber-tech display", "neuropolitical aesthetic"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Galaxy", "display",
    ["sci-fi", "space", "glowing", "futuristic", "ethereal", "cosmic", "display", "wide"],
    ["cosmic", "ethereal", "vast", "glowing"],
    ["space poster", "cosmic event", "galaxy theme", "ethereal heading"],
    ["cosmic space display type", "galaxy-scale grandeur"],
    { designer: "Franky van Deursen" },
  ),

  dafont("Quantum", "display",
    ["sci-fi", "tech", "minimal", "futuristic", "clean", "geometric", "modern", "digital"],
    ["minimal", "tech", "precise", "futuristic"],
    ["tech brand", "minimal sci-fi", "clean heading", "quantum computing"],
    ["minimal futuristic display", "quantum precision"],
  ),

  dafont("Blade Runner Movie Font", "display",
    ["sci-fi", "cyberpunk", "neon", "futuristic", "film", "dark", "atmospheric", "retro-future"],
    ["dystopian", "atmospheric", "dark", "cinematic"],
    ["cyberpunk poster", "retro-future event", "dark sci-fi", "film tribute"],
    ["blade Runner-inspired display", "retro-future cyberpunk"],
    { designer: "Phil Steinschneider" },
  ),

  dafont("Kiona", "display",
    ["sci-fi", "modern", "geometric", "clean", "uppercase", "futuristic", "minimal", "sharp"],
    ["modern", "sharp", "clean", "futuristic"],
    ["modern brand", "clean heading", "futuristic poster", "minimal design"],
    ["sharp modern geometric display", "clean futuristic forms"],
    { designer: "Michael Muranaka" },
  ),

  dafont("Nasalization", "display",
    ["sci-fi", "NASA", "space", "tech", "rounded", "futuristic", "aerospace", "bold"],
    ["aerospace", "official", "futuristic", "bold"],
    ["space agency", "aerospace branding", "NASA-style heading", "tech poster"],
    ["nASA-inspired rounded display", "aerospace program aesthetic"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Exoplanet", "display",
    ["sci-fi", "space", "thin", "elegant", "futuristic", "cosmic", "modern", "wide"],
    ["cosmic", "elegant", "vast", "modern"],
    ["space documentary", "cosmic brand", "elegant sci-fi", "astronomy"],
    ["elegant space-themed display", "exoplanetary elegance"],
  ),

  // ─── HORROR / DARK (~10) ───



  dafont("Feast of Flesh BB", "display",
    ["horror", "zombie", "rotting", "gore", "organic", "dark", "extreme", "decomposing"],
    ["gruesome", "decomposing", "visceral", "extreme"],
    ["zombie movie", "horror game", "extreme poster", "gore heading"],
    ["rotting zombie-flesh letterforms", "decomposition aesthetic"],
    { designer: "Blambot" },
  ),


  dafont("Bloody", "display",
    ["horror", "blood", "dripping", "red", "dark", "splatter", "visceral", "gore"],
    ["bloody", "visceral", "shocking", "dark"],
    ["horror movie title", "blood-themed event", "dark poster", "gore heading"],
    ["blood-dripping letterforms", "splatter horror style"],
    { designer: "James Fordyce" },
  ),

  dafont("Ghastly Panic", "display",
    ["horror", "panic", "scratchy", "chaotic", "dark", "unsettling", "distorted", "frantic"],
    ["panicked", "chaotic", "frantic", "unsettling"],
    ["horror game", "panic event", "dark heading", "psychological thriller"],
    ["frantic distorted horror display", "psychological terror"],
    { designer: "Sinister Fonts" },
  ),

  dafont("Zombie Holocaust", "display",
    ["horror", "zombie", "apocalypse", "dark", "heavy", "extreme", "undead", "survival"],
    ["apocalyptic", "extreme", "brutal", "undead"],
    ["zombie game", "apocalypse poster", "survival horror", "dark event"],
    ["extreme zombie-apocalypse display", "undead survival aesthetic"],
    { designer: "Sinister Fonts" },
  ),

  dafont("Grinched", "display",
    ["horror", "grinch", "christmas-dark", "whimsical", "quirky", "holiday", "mischievous"],
    ["mischievous", "quirky", "darkly-fun", "holiday"],
    ["dark christmas", "quirky holiday", "mischievous heading", "seasonal"],
    ["grinch-inspired quirky display", "dark whimsical holiday"],
    { designer: "Sharkshock" },
  ),

  // ─── STENCIL / MILITARY (~10) ───

  dafont("Stencil", "display",
    ["stencil", "military", "industrial", "bold", "classic", "utilitarian", "army", "blocky"],
    ["military", "utilitarian", "strong", "industrial"],
    ["military poster", "industrial brand", "army heading", "bold statement"],
    ["classic military stencil display", "standard-issue aesthetic"],
    { designer: "WAP Type" },
  ),

  dafont("Gunplay", "display",
    ["stencil", "military", "angular", "aggressive", "tactical", "sharp", "modern", "action"],
    ["aggressive", "tactical", "sharp", "modern-military"],
    ["action movie", "tactical game", "military poster", "aggressive heading"],
    ["angular military-action stencil", "modern tactical sharpness"],
  ),

  dafont("Cargo", "display",
    ["stencil", "shipping", "industrial", "bold", "crate", "transport", "rough", "utility"],
    ["industrial", "utilitarian", "rough", "working-class"],
    ["shipping brand", "industrial poster", "cargo heading", "warehouse"],
    ["cargo crate stencil display", "industrial shipping aesthetic"],
  ),

  dafont("Sewer Sys", "display",
    ["stencil", "industrial", "underground", "rough", "utility", "urban", "gritty", "system"],
    ["underground", "industrial", "gritty", "urban"],
    ["underground event", "industrial brand", "utility poster", "urban heading"],
    ["industrial utility stencil", "underground system aesthetic"],
    { designer: ".ttf" },
  ),


  dafont("Over There", "display",
    ["stencil", "military", "vintage", "WWI", "WWII", "historic", "wartime", "propaganda"],
    ["historic", "wartime", "patriotic", "vintage-military"],
    ["wartime poster", "vintage military", "historic event", "propaganda style"],
    ["vintage wartime stencil", "wWI/WWII era military"],
    { designer: "imagex" },
  ),

  dafont("Blockletter", "display",
    ["stencil", "block", "clean", "minimal", "modern", "geometric", "simple", "sharp"],
    ["clean", "sharp", "minimal", "modern"],
    ["modern stencil", "clean heading", "minimal poster", "sharp brand"],
    ["clean geometric block stencil", "minimal precision"],
  ),

  // ─── WESTERN / RUSTIC (~10) ───

  dafont("Wanted M54", "display",
    ["western", "wanted", "vintage", "cowboy", "poster", "serif", "rough", "frontier"],
    ["outlaw", "rugged", "frontier", "vintage"],
    ["wanted poster", "western event", "cowboy brand", "frontier heading"],
    ["classic wanted-poster display", "wild West sheriff office aesthetic"],
    { designer: "justme54s" },
  ),

  dafont("Saddlebag", "display",
    ["western", "rustic", "cowboy", "leather", "vintage", "rough", "frontier", "trail"],
    ["rustic", "trail-worn", "cowboy", "rugged"],
    ["cowboy event", "rustic branding", "trail heading", "western poster"],
    ["rustic cowboy display", "saddlebag-worn character"],
  ),


  dafont("Woodgod", "display",
    ["western", "wood-type", "rustic", "carved", "vintage", "natural", "textured", "frontier"],
    ["rustic", "natural", "carved", "frontier"],
    ["wood-type poster", "rustic brand", "natural heading", "carved sign"],
    ["wood-carved western display", "frontier wood-type tradition"],
  ),

  dafont("Cowboys", "display",
    ["western", "cowboy", "classic", "frontier", "bold", "display", "vintage", "americana"],
    ["cowboy", "classic", "frontier", "bold"],
    ["cowboy event", "western movie", "frontier brand", "americana poster"],
    ["classic cowboy display type", "wild West character"],
  ),

  dafont("Western", "display",
    ["western", "classic", "decorative", "ornamental", "vintage", "serif", "frontier", "saloon"],
    ["classic", "decorative", "vintage", "ornamental"],
    ["western theme", "saloon sign", "vintage event", "decorative heading"],
    ["classic ornamental western display", "saloon-sign decoration"],
    { designer: "James L. DeVriese" },
  ),


  dafont("Gallow Tree", "display",
    ["western", "dark-western", "horror-western", "grim", "frontier", "bold", "menacing"],
    ["grim", "dark", "menacing", "frontier"],
    ["dark western", "grim poster", "menacing heading", "horror-western"],
    ["dark western display", "gallows frontier darkness"],
  ),

  // ─── NEON / 80s (~10) ───
  dafont("Neon", "display",
    ["neon", "glowing", "sign", "bright", "night", "bar", "electric", "urban"],
    ["glowing", "electric", "nightlife", "bright"],
    ["neon sign", "nightclub", "bar branding", "bright poster"],
    ["classic neon tube display", "electric sign glow"],
    { designer: "Fenotype" },
  ),

  dafont("Outrun Future", "display",
    ["neon", "80s", "synthwave", "retro-future", "bold", "tech", "racing", "chrome"],
    ["retro-future", "fast", "bold", "synthwave"],
    ["synthwave poster", "retro racing", "80s event", "outrun game"],
    ["outrun-style retro future display", "80s racing aesthetic"],
  ),




  dafont("Chrome", "display",
    ["neon", "chrome", "metallic", "80s", "shiny", "reflective", "bold", "heavy"],
    ["shiny", "metallic", "bold", "impressive"],
    ["80s poster", "chrome branding", "metallic heading", "bold event"],
    ["chrome metallic display", "80s shiny metal aesthetic"],
    { designer: "Artem Sukhinin" },
  ),


  // ─── DISPLAY / DECORATIVE (additional) ───

  dafont("Impact Label", "display",
    ["display", "label", "bold", "vintage", "retro", "impactful", "heavy", "packaging"],
    ["bold", "vintage", "commanding", "nostalgic"],
    ["label design", "packaging", "retro branding", "vintage poster"],
    ["heavy label-style display", "vintage packaging feel"],
    { designer: "Tension Type" }
  ),

  dafont("Coolvetica", "display",
    ["display", "groovy", "70s", "retro", "smooth", "rounded", "casual", "warm"],
    ["groovy", "casual", "retro", "cool"],
    ["retro branding", "70s poster", "album cover", "casual heading"],
    ["smooth 70s-inspired letterforms", "casual rounded display"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("College", "display",
    ["display", "varsity", "sport", "block", "athletic", "bold", "collegiate", "team"],
    ["sporty", "bold", "energetic", "team-spirit"],
    ["sports jersey", "varsity branding", "athletic poster", "college merch"],
    ["classic varsity block letters", "athletic jersey style"],
    { designer: "Matthew Welch" },
  ),

  dafont("Blackout", "display",
    ["display", "bold", "heavy", "block", "solid", "minimal", "modern", "fill"],
    ["bold", "modern", "minimal", "heavy"],
    ["poster", "bold heading", "modern branding", "strong statement"],
    ["ultra-heavy solid block letters", "no-nonsense bold display"],
    { designer: "Tyler Finck" }
  ),

  dafont("Nova Square", "display",
    ["display", "geometric", "square", "modern", "tech", "angular", "digital", "grid"],
    ["modern", "technical", "precise", "digital"],
    ["tech UI", "digital display", "modern branding", "geometric heading"],
    ["square geometric display letterforms", "grid-based digital design"],
  ),

  // ─── SCRIPT / HANDWRITING (additional) ───

  dafont("Tangerine", "handwritten",
    ["script", "calligraphy", "elegant", "thin", "formal", "ornate", "wedding"],
    ["elegant", "formal", "delicate", "ornate"],
    ["wedding invitation", "formal card", "elegant certificate", "luxury heading"],
    ["delicate formal calligraphic script", "ornate wedding-style elegance"],
  ),

  // ─── PIXEL / RETRO / GAMING (additional) ───

  dafont("Bit Cell", "display",
    ["pixel", "retro", "gaming", "8bit", "tiny", "minimal", "bitmap", "lo-fi"],
    ["retro", "digital", "minimal", "lo-fi"],
    ["retro game", "pixel art", "8-bit project", "digital nostalgia"],
    ["tiny pixel bitmap font", "minimal 8-bit character set"],
  ),

  dafont("Dogica", "display",
    ["pixel", "retro", "bold", "gaming", "bitmap", "heavy", "display", "arcade"],
    ["bold", "retro", "heavy", "commanding"],
    ["game title", "retro heading", "pixel poster", "gaming brand"],
    ["heavy bold pixel display", "commanding bitmap letterforms"],
  ),

  dafont("Early GameBoy", "display",
    ["pixel", "retro", "gaming", "gameboy", "nostalgic", "8bit", "portable", "nintendo"],
    ["nostalgic", "retro", "playful", "lo-fi"],
    ["retro gaming", "gameboy tribute", "pixel art", "nostalgic project"],
    ["gameBoy-era pixel display", "portable gaming nostalgia"],
    { designer: "Jimmy Campbell" },
  ),

  // ─── GOTHIC / BLACKLETTER (additional) ───

  dafont("Pirata One", "display",
    ["gothic", "pirate", "blackletter", "adventure", "nautical", "bold", "decorative"],
    ["adventurous", "bold", "dramatic", "swashbuckling"],
    ["pirate theme", "adventure game", "nautical branding", "bold gothic heading"],
    ["pirate-inspired blackletter", "adventurous nautical gothic"],
  ),

  dafont("Metal Mania", "display",
    ["gothic", "metal", "blackletter", "heavy", "dark", "aggressive", "band", "extreme"],
    ["extreme", "dark", "aggressive", "heavy"],
    ["metal band logo", "extreme music", "dark poster", "heavy heading"],
    ["heavy metal blackletter display", "extreme aggressive gothic forms"],
  ),

  dafont("Ruritania", "display",
    ["gothic", "blackletter", "fantasy", "medieval", "ornate", "romantic", "european"],
    ["romantic", "medieval", "fantasy", "mysterious"],
    ["fantasy book", "medieval event", "romantic gothic", "rPG title"],
    ["romantic European blackletter", "fantasy medieval atmosphere"],
    { designer: "Paul Lloyd" },
  ),

  dafont("Minster", "display",
    ["gothic", "blackletter", "clean", "modern", "bold", "strong", "dark", "readable"],
    ["strong", "dark", "bold", "commanding"],
    ["heavy metal", "dark branding", "gothic poster", "strong heading"],
    ["bold modern blackletter", "strong commanding gothic forms"],
    { designer: "Paul Lloyd" },
  ),

  // ─── SANS-SERIF (additional) ───

  dafont("Jura", "sans-serif",
    ["sans-serif", "light", "modern", "clean", "tech", "minimal", "elegant"],
    ["light", "modern", "elegant", "minimal"],
    ["minimal branding", "light heading", "modern UI", "elegant tech"],
    ["light elegant modern sans-serif", "clean minimal letterforms"],
    { serifSansCategory: "sans-serif" }
  ),

  // ─── SERIF (additional) ───

  dafont("Cinzel", "serif",
    ["serif", "classic", "Roman", "elegant", "display", "uppercase", "monumental", "timeless"],
    ["classic", "elegant", "monumental", "timeless"],
    ["luxury brand", "book title", "classical event", "elegant heading"],
    ["roman-inspired monumental serif", "classic uppercase elegance"],
    { serifSansCategory: "serif" }
  ),

  // ─── STENCIL / MILITARY (additional) ───

  dafont("Capture Smallz", "display",
    ["stencil", "small-caps", "military", "urban", "distressed", "rough", "street"],
    ["urban", "rough", "street", "tactical"],
    ["street art", "urban branding", "military style", "small-caps heading"],
    ["small-caps urban stencil", "street-military hybrid"],
  ),

  // ─── GRUNGE / PUNK (additional) ───

  dafont("Shlop", "display",
    ["grunge", "messy", "melting", "dripping", "horror", "wet", "distorted", "grotesque"],
    ["messy", "horror", "dripping", "grotesque"],
    ["horror poster", "slime theme", "messy branding", "grotesque heading"],
    ["melting dripping display letters", "wet grotesque distortion"],
  ),

  // ─── ADDITIONAL DISPLAY ───

  // ─── ADDITIONAL DISPLAY FONTS (replacements for Google Fonts overlaps) ───
  dafont("Beyond Wonderland", "display",
    ["fantasy", "whimsical", "decorative", "storybook", "magical", "ornate"],
    ["whimsical", "magical", "dreamy", "enchanting"],
    ["children book", "fantasy theme", "fairy tale", "magical branding"],
    ["whimsical storybook letterforms", "alice-inspired decorative display"],
    { designer: "Christopher Hansen" },
  ),

  dafont("Kingthings Exeter", "serif",
    ["medieval", "historical", "old-english", "traditional", "ornate"],
    ["historical", "traditional", "noble", "classic"],
    ["medieval theme", "historical document", "period piece", "heritage"],
    ["medieval uncial-inspired serif", "historical manuscript lettering"],
  ),

  dafont("Kingthings Petrock", "serif",
    ["medieval", "celtic", "historical", "decorative", "stone"],
    ["ancient", "mystical", "historical", "rugged"],
    ["celtic branding", "medieval game", "historical poster", "stone carving"],
    ["celtic stone-carved letterforms", "ancient historical serif"],
  ),
  dafont("Adam", "sans-serif",
    ["geometric", "futuristic", "modern", "sharp", "angular", "tech"],
    ["futuristic", "sharp", "modern", "technical"],
    ["tech branding", "sci-fi poster", "modern heading", "futuristic display"],
    ["sharp angular geometric sans", "futuristic technical display"],
  ),
  dafont("Coolvetica", "sans-serif",
    ["retro", "helvetica", "70s", "rounded", "casual", "warm"],
    ["retro", "friendly", "casual", "warm"],
    ["retro branding", "70s poster", "casual heading", "vintage ad"],
    ["retro rounded Helvetica variant", "70s-inspired casual sans"],
  ),

  dafont("Horizon", "display",
    ["futuristic", "wide", "tech", "space", "geometric", "sci-fi"],
    ["futuristic", "bold", "expansive", "tech"],
    ["sci-fi poster", "space branding", "futuristic heading", "tech display"],
    ["wide futuristic geometric display", "space-age tech letterforms"],
  ),
  dafont("Scriptina", "script",
    ["calligraphy", "formal", "elegant", "ornate", "classic", "wedding"],
    ["elegant", "formal", "classic", "ornate"],
    ["formal invitation", "luxury label", "classic branding", "ornate heading"],
    ["formal ornate calligraphic script", "classic elegant lettering"],
  ),

  dafont("Respective", "script",
    ["brush", "rough", "casual", "handmade", "artistic", "texture"],
    ["casual", "rough", "artistic", "authentic"],
    ["artisan brand", "handmade label", "casual branding", "craft heading"],
    ["rough casual brush script", "authentic handmade lettering"],
  ),

  dafont("Helsinki", "sans-serif",
    ["minimal", "scandinavian", "clean", "modern", "geometric", "nordic"],
    ["minimal", "clean", "modern", "calm"],
    ["scandinavian branding", "minimal heading", "nordic design", "clean display"],
    ["clean Scandinavian-inspired sans", "minimal Nordic display"],
    { designer: "Vic Fieger" },
  ),

  dafont("Selima", "script",
    ["brush", "natural", "organic", "handwritten", "flowing", "casual"],
    ["natural", "organic", "warm", "personal"],
    ["natural brand", "organic product", "lifestyle blog", "personal brand"],
    ["natural organic brush script", "warm flowing hand-lettering"],
  ),

  dafont("Pricedown", "display",
    ["retro", "advertising", "bold", "fun", "signage", "70s"],
    ["fun", "retro", "bold", "playful"],
    ["retro advertising", "game title", "fun heading", "signage"],
    ["retro advertising display", "bold fun signage lettering"],
  ),
  dafont("College", "display",
    ["college", "varsity", "sports", "bold", "block", "american"],
    ["athletic", "bold", "traditional", "energetic"],
    ["sports team", "college branding", "varsity heading", "athletic display"],
    ["classic varsity block display", "american college letterforms"],
  ),
  dafont("Caviar Dreams", "sans-serif",
    ["thin", "elegant", "modern", "geometric", "light", "clean"],
    ["elegant", "modern", "airy", "refined"],
    ["luxury branding", "beauty heading", "elegant display", "fashion"],
    ["thin elegant geometric sans", "light modern refined display"],
  ),

  dafont("Rounded Elegance", "sans-serif",
    ["rounded", "friendly", "modern", "clean", "soft", "approachable"],
    ["friendly", "modern", "warm", "approachable"],
    ["friendly branding", "app heading", "modern display", "soft title"],
    ["friendly rounded modern sans", "approachable soft letterforms"],
  ),

  dafont("Existence", "sans-serif",
    ["stencil", "modern", "clean", "geometric", "light", "minimal"],
    ["modern", "minimal", "clean", "airy"],
    ["modern branding", "stencil heading", "minimal display", "clean title"],
    ["modern stencil-style sans", "clean geometric light display"],
  ),
  dafont("Bebas Kai", "sans-serif",
    ["condensed", "tall", "modern", "clean", "display", "narrow"],
    ["modern", "clean", "tall", "direct"],
    ["poster heading", "modern display", "tall title", "clean branding"],
    ["tall condensed modern display sans", "clean narrow letterforms"],
  ),
  dafont("Ostrich Sans", "sans-serif",
    ["ultra-thin", "tall", "condensed", "modern", "minimal", "elegant"],
    ["minimal", "elegant", "tall", "delicate"],
    ["fashion heading", "minimal branding", "elegant display", "light title"],
    ["ultra-thin tall condensed sans", "minimal elegant display"],
    { designer: "Tyler Finck" },
  ),

  dafont("Brownhill Script", "script",
    ["signature", "elegant", "flowing", "personal", "calligraphic"],
    ["elegant", "personal", "refined", "romantic"],
    ["wedding heading", "personal brand", "elegant card", "signature logo"],
    ["elegant signature calligraphic script", "personal refined lettering"],
    { designer: "Sizimon.id" },
  ),

  dafont("Nordic", "display",
    ["runic", "viking", "angular", "bold", "historical", "norse"],
    ["bold", "ancient", "powerful", "mystical"],
    ["viking branding", "nordic game", "historical heading", "mythology"],
    ["bold runic Viking-inspired display", "norse angular letterforms"],
    { designer: "No Images Fonts" },
  ),

  dafont("Impact Label", "display",
    ["label", "vintage", "stamp", "rounded", "retro", "badge"],
    ["vintage", "casual", "retro", "authentic"],
    ["vintage label", "product tag", "badge design", "retro branding"],
    ["vintage label stamp display", "retro badge-style lettering"],
  ),

  dafont("Blox", "display",
    ["pixel", "blocky", "retro", "digital", "game", "8-bit"],
    ["retro", "digital", "playful", "nostalgic"],
    ["retro game", "pixel art", "digital heading", "arcade branding"],
    ["blocky pixel-art display", "retro 8-bit game letterforms"],
  ),

  dafont("Edo SZ", "display",
    ["japanese", "eastern", "decorative", "brush", "cultural", "bold"],
    ["cultural", "bold", "decorative", "artistic"],
    ["asian restaurant", "martial arts", "cultural branding", "eastern theme"],
    ["japanese-inspired brush display", "eastern decorative letterforms"],
  ),

  dafont("Tomatoes", "script",
    ["brush", "organic", "handwritten", "natural", "casual", "fresh"],
    ["organic", "fresh", "natural", "casual"],
    ["food brand", "organic product", "fresh label", "natural heading"],
    ["organic casual brush script", "fresh natural hand-lettering"],
  ),

  dafont("Sophia", "script",
    ["calligraphy", "elegant", "romantic", "bridal", "flowing", "thin"],
    ["elegant", "romantic", "delicate", "refined"],
    ["bridal brand", "elegant heading", "romantic card", "beauty label"],
    ["thin elegant calligraphic script", "bridal romantic lettering"],
  ),

  dafont("Aaargh", "sans-serif",
    ["bold", "strong", "modern", "geometric", "display", "sturdy"],
    ["bold", "strong", "direct", "modern"],
    ["bold heading", "modern display", "strong branding", "direct title"],
    ["bold sturdy geometric sans", "strong modern display"],
  ),

  dafont("Nickainley", "script",
    ["monoline", "vintage", "casual", "retro", "hand-lettered"],
    ["vintage", "casual", "retro", "authentic"],
    ["vintage logo", "retro branding", "casual heading", "hand-lettered title"],
    ["monoline vintage casual script", "retro hand-lettered display"],
  ),
  dafont("Reckoner", "sans-serif",
    ["condensed", "modern", "clean", "narrow", "professional"],
    ["professional", "modern", "clean", "structured"],
    ["professional heading", "modern display", "clean branding", "narrow title"],
    ["condensed modern professional sans", "clean narrow structured display"],
    { designer: "Alex Dale" },
  ),
  dafont("Tahu", "script",
    ["brush", "bold", "modern", "dynamic", "thick", "confident"],
    ["bold", "dynamic", "confident", "modern"],
    ["bold heading", "dynamic branding", "confident display", "modern title"],
    ["bold modern brush script", "dynamic confident hand-lettering"],
  ),

  dafont("Znikomit", "sans-serif",
    ["thin", "light", "minimal", "modern", "elegant", "tall"],
    ["minimal", "elegant", "light", "airy"],
    ["minimal branding", "elegant heading", "light display", "modern title"],
    ["thin minimal modern sans", "elegant light tall display"],
  ),  dafont("Braxton", "script",
    ["handwritten", "casual", "personal", "natural", "simple"],
    ["casual", "natural", "personal", "relaxed"],
    ["casual brand", "personal heading", "natural display", "simple title"],
    ["casual personal handwritten script", "natural simple hand-lettering"],
    { designer: "Eztudio" },
  ),

  // ─── ADDITIONAL FREE FONTS (replacement batch) ───

  dafont("Biko", "sans-serif",
    ["sans-serif", "geometric", "modern", "clean", "friendly", "rounded", "versatile", "soft"],
    ["friendly", "approachable", "modern", "warm"],
    ["app interface", "brand identity", "modern heading", "friendly website"],
    ["soft geometric sans with rounded terminals", "warm contemporary proportions"],
  ),

  dafont("Maxwell", "sans-serif",
    ["sans-serif", "condensed", "bold", "modern", "strong", "clean", "geometric", "display"],
    ["bold", "strong", "contemporary", "impactful"],
    ["bold heading", "poster title", "brand display", "packaging"],
    ["condensed modern geometric sans", "strong vertical emphasis"],
  ),

  dafont("Disorder", "display",
    ["grunge", "distressed", "rough", "textured", "punk", "raw", "aggressive", "gritty"],
    ["chaotic", "raw", "aggressive", "intense"],
    ["punk flyer", "underground event", "grunge poster", "distressed graphic"],
    ["heavily distressed display letterforms", "rough textured surface treatment"],
    { designer: "Vladimir Nikolic" },
  ),

  dafont("Arkhip", "display",
    ["display", "bold", "condensed", "strong", "modern", "geometric", "russian", "constructivist"],
    ["bold", "industrial", "commanding", "structured"],
    ["poster headline", "bold branding", "editorial title", "event signage"],
    ["bold condensed geometric display", "constructivist-inspired weight"],
  ),

  dafont("Riesling", "display",
    ["display", "art-deco", "elegant", "thin", "decorative", "vintage", "uppercase", "glamorous"],
    ["elegant", "glamorous", "refined", "vintage"],
    ["luxury branding", "fashion title", "art-deco design", "elegant invitation"],
    ["art-deco inspired thin display", "decorative vintage elegance"],
  ),

  dafont("Hero", "sans-serif",
    ["sans-serif", "geometric", "modern", "clean", "neutral", "versatile", "minimal", "professional"],
    ["clean", "professional", "neutral", "modern"],
    ["corporate heading", "clean website", "professional branding", "app title"],
    ["clean geometric sans with neutral character", "versatile modern proportions"],
  ),

  dafont("Borg", "display",
    ["display", "futuristic", "sci-fi", "tech", "geometric", "bold", "angular", "space"],
    ["futuristic", "technological", "bold", "cosmic"],
    ["sci-fi design", "tech branding", "game title", "futuristic poster"],
    ["angular futuristic display forms", "sci-fi geometric construction"],
    { designer: "davidsumdesign" },
  ),

  dafont("Cubic", "display",
    ["display", "geometric", "blocky", "pixel", "angular", "modern", "bold", "structured"],
    ["geometric", "structured", "technical", "bold"],
    ["tech poster", "geometric design", "game branding", "modern display"],
    ["blocky geometric letterforms", "structured angular construction"],
    { designer: "Valdeir Junior" },
  ),

  dafont("Nulshock", "display",
    ["display", "futuristic", "tech", "bold", "sci-fi", "industrial", "sharp", "modern"],
    ["futuristic", "industrial", "powerful", "technical"],
    ["tech branding", "game UI", "sci-fi title", "industrial display"],
    ["bold industrial futuristic display", "sharp technical letterforms"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Stentiga", "display",
    ["display", "decorative", "modern", "elegant", "unique", "artistic", "creative", "stylized"],
    ["creative", "artistic", "distinctive", "modern"],
    ["creative branding", "artistic heading", "unique display", "fashion title"],
    ["distinctive decorative display forms", "modern artistic stylization"],
  ),

  dafont("Raustila", "script",
    ["script", "brush", "handwritten", "casual", "flowing", "artistic", "expressive", "bold"],
    ["artistic", "expressive", "warm", "personal"],
    ["greeting card", "brand signature", "artistic heading", "lifestyle blog"],
    ["bold brush script with natural flow", "expressive hand-lettered character"],
    { serifSansCategory: "script" as const }
  ),

  dafont("Halo", "display",
    ["display", "rounded", "bold", "modern", "fun", "friendly", "bubbly", "playful"],
    ["friendly", "fun", "playful", "warm"],
    ["kids brand", "fun heading", "friendly display", "playful packaging"],
    ["bold rounded display with friendly character", "bubbly playful letterforms"],
    { designer: "Will Turnbow" },
  ),

  dafont("Foglihten", "serif",
    ["serif", "elegant", "decorative", "art-nouveau", "ornamental", "classic", "refined", "display"],
    ["elegant", "ornamental", "refined", "classic"],
    ["luxury branding", "elegant invitation", "decorative title", "wine label"],
    ["ornamental serif with art-nouveau influence", "elegant decorative terminals"],
    { designer: "Will Turnbow", serifSansCategory: "serif" as const }
  ),

  dafont("Prime", "sans-serif",
    ["sans-serif", "geometric", "minimal", "clean", "modern", "structured", "sharp", "technical"],
    ["minimal", "precise", "modern", "technical"],
    ["tech heading", "minimal branding", "clean display", "modern interface"],
    ["precise geometric sans with sharp edges", "structured minimal construction"],
    { designer: "Simon Murdoch" },
  ),

  // ─── REPLACEMENT BATCH 2 (verified DaFont links, public domain) ───

  dafont("Forza", "sans-serif",
    ["sans-serif", "geometric", "bold", "modern", "condensed", "industrial", "strong", "technical"],
    ["industrial", "strong", "technical", "commanding"],
    ["engineering brand", "industrial heading", "bold display", "tech title"],
    ["industrial geometric sans with condensed proportions", "technical precision lettering"],
  ),
  dafont("Rex", "display",
    ["display", "bold", "inline", "retro", "decorative", "vintage", "poster", "dimensional"],
    ["bold", "retro", "decorative", "playful"],
    ["poster title", "retro branding", "vintage display", "event heading"],
    ["bold inline display with dimensional depth", "retro poster-style character"],
    { designer: "Jimmy Moon" },
  ),
  dafont("Venera", "sans-serif",
    ["sans-serif", "geometric", "wide", "modern", "clean", "display", "structured", "elegant"],
    ["modern", "elegant", "structured", "confident"],
    ["fashion heading", "modern branding", "wide display title", "editorial"],
    ["wide geometric sans with elegant spacing", "structured modern proportions"],
    { designer: "Vladimir Nikolic" },
  ),
  dafont("Walkway", "sans-serif",
    ["sans-serif", "thin", "light", "modern", "clean", "minimal", "elegant", "delicate"],
    ["light", "airy", "refined", "minimal"],
    ["minimal heading", "light branding", "clean website", "portfolio title"],
    ["ultra-thin sans with delicate stroke weight", "airy minimal letterforms"],
  ),
  dafont("Satisfaction", "script",
    ["script", "casual", "handwritten", "brush", "flowing", "warm", "personal", "vintage"],
    ["casual", "warm", "personal", "friendly"],
    ["greeting card", "casual branding", "lifestyle blog", "personal project"],
    ["casual flowing brush script", "warm vintage handwritten character"],
    { designer: "Billy Argel Fonts", serifSansCategory: "script" as const }
  ),
  dafont("Electroharmonix", "display",
    ["display", "futuristic", "russian", "angular", "stylized", "bold", "unique", "exotic"],
    ["exotic", "bold", "distinctive", "artistic"],
    ["music branding", "exotic display", "festival poster", "artistic heading"],
    ["faux-Cyrillic stylized display", "angular exotic letterforms"],
  ),
  dafont("Fenwick", "serif",
    ["serif", "elegant", "traditional", "classic", "editorial", "readable", "refined", "book"],
    ["elegant", "classic", "refined", "literary"],
    ["book title", "editorial heading", "classic branding", "literary website"],
    ["refined traditional serif with editorial proportions", "classic book typography character"],
    { serifSansCategory: "serif" as const }
  ),
  dafont("Hiruko", "sans-serif",
    ["sans-serif", "geometric", "modern", "clean", "rounded", "friendly", "tech", "versatile"],
    ["modern", "friendly", "clean", "approachable"],
    ["app branding", "friendly heading", "modern website", "tech startup"],
    ["softened geometric sans with friendly terminals", "modern tech-friendly design"],
  ),
  dafont("Klill", "sans-serif",
    ["sans-serif", "clean", "modern", "readable", "neutral", "versatile", "professional", "utility"],
    ["clean", "professional", "neutral", "reliable"],
    ["corporate heading", "professional branding", "clean interface", "utility display"],
    ["clean neutral sans with professional proportions", "versatile utilitarian letterforms"],
  ),
  dafont("Magnum", "display",
    ["display", "bold", "heavy", "impactful", "strong", "condensed", "poster", "loud"],
    ["bold", "impactful", "powerful", "loud"],
    ["bold poster", "impactful heading", "loud display", "strong title"],
    ["ultra-bold heavy impact display", "maximum visual weight letterforms"],
    { designer: "Fontalicious" },
  ),
  dafont("Origami", "display",
    ["display", "geometric", "angular", "folded", "creative", "artistic", "unique", "modern"],
    ["creative", "artistic", "geometric", "unique"],
    ["creative branding", "artistic display", "unique heading", "design portfolio"],
    ["faceted geometric display inspired by paper folding", "angular origami-like construction"],
    { designer: "Peter Fritzsche" },
  ),
  dafont("Quark", "sans-serif",
    ["sans-serif", "modern", "geometric", "clean", "scientific", "technical", "sharp", "precise"],
    ["scientific", "precise", "modern", "technical"],
    ["science branding", "technical heading", "precision display", "research website"],
    ["precise geometric sans with scientific character", "sharp technical letterforms"],
  ),
  dafont("Radikal", "sans-serif",
    ["sans-serif", "geometric", "modern", "bold", "clean", "structured", "versatile", "professional"],
    ["bold", "modern", "structured", "confident"],
    ["modern heading", "professional display", "bold branding", "corporate title"],
    ["bold geometric sans with strong structure", "confident modern proportions"],
    { designer: "Michael Pinto" },
  ),
  dafont("Whitin", "display",
    ["display", "handwritten", "brush", "casual", "artistic", "expressive", "textured", "creative"],
    ["casual", "artistic", "expressive", "creative"],
    ["creative heading", "artistic branding", "casual display", "lifestyle design"],
    ["textured brush display with hand-painted feel", "artistic casual letterforms"],
  ),
  dafont("Xolto", "sans-serif",
    ["sans-serif", "geometric", "rounded", "modern", "friendly", "soft", "clean", "approachable"],
    ["friendly", "modern", "approachable", "soft"],
    ["friendly branding", "rounded display", "approachable heading", "app interface"],
    ["soft rounded geometric sans", "friendly approachable proportions"],
  ),
  dafont("Zag", "sans-serif",
    ["sans-serif", "bold", "geometric", "modern", "sharp", "angular", "condensed", "dynamic"],
    ["bold", "dynamic", "sharp", "energetic"],
    ["sports branding", "dynamic heading", "bold display", "energetic title"],
    ["bold angular geometric sans with dynamic energy", "sharp condensed letterforms"],
  ),
  dafont("Ahellya", "script",
    ["script", "elegant", "calligraphy", "romantic", "flowing", "decorative", "wedding", "feminine"],
    ["elegant", "romantic", "refined", "graceful"],
    ["wedding invitation", "luxury branding", "elegant heading", "romantic design"],
    ["elegant calligraphic script with flowing strokes", "romantic decorative letterforms"],
    { designer: "Fontalicious", serifSansCategory: "script" as const }
  ),
  dafont("Junegull", "display",
    ["display", "retro", "vintage", "bold", "fun", "playful", "nostalgic", "rounded"],
    ["retro", "fun", "playful", "nostalgic"],
    ["retro poster", "vintage branding", "fun heading", "nostalgic design"],
    ["bold retro display with vintage charm", "playful rounded nostalgic character"],
  ),
  dafont("Plakkaat", "display",
    ["display", "bold", "heavy", "rough", "textured", "poster", "industrial", "grunge"],
    ["bold", "rough", "industrial", "raw"],
    ["concert poster", "industrial display", "rough heading", "gritty branding"],
    ["heavy textured poster display", "rough industrial letterforms"],
  ),
  dafont("Steelfish", "sans-serif",
    ["sans-serif", "condensed", "bold", "narrow", "modern", "strong", "display", "headline"],
    ["strong", "condensed", "modern", "impactful"],
    ["headline display", "condensed title", "sports branding", "news heading"],
    ["ultra-condensed bold sans for headlines", "narrow high-impact letterforms"],
  ),
  dafont("Molot", "display",
    ["display", "bold", "heavy", "industrial", "russian", "constructivist", "strong", "angular"],
    ["bold", "industrial", "commanding", "powerful"],
    ["industrial poster", "bold branding", "powerful heading", "event display"],
    ["heavy industrial display with constructivist roots", "angular powerful letterforms"],
  ),
  dafont("Porcelain", "sans-serif",
    ["sans-serif", "thin", "delicate", "elegant", "light", "feminine", "refined", "graceful"],
    ["delicate", "refined", "elegant", "feminine"],
    ["fashion heading", "elegant branding", "delicate display", "luxury title"],
    ["ultra-thin elegant sans with delicate strokes", "refined feminine proportions"],
  ),
  dafont("Abberancy", "display",
    ["display", "grunge", "distorted", "experimental", "glitch", "punk", "raw", "chaotic"],
    ["chaotic", "experimental", "raw", "rebellious"],
    ["experimental art", "punk flyer", "glitch design", "alternative branding"],
    ["distorted experimental display forms", "chaotic glitch-punk letterforms"],
  ),

  // ─── REPLACEMENT BATCH 3 ───

  dafont("Sansumi", "sans-serif",
    ["sans-serif", "geometric", "modern", "clean", "rounded", "soft", "friendly", "minimal"],
    ["friendly", "modern", "soft", "approachable"],
    ["app interface", "friendly branding", "modern website", "clean heading"],
    ["softly rounded geometric sans", "warm minimal proportions"],
  ),
  dafont("Stilu", "sans-serif",
    ["sans-serif", "modern", "clean", "editorial", "sharp", "elegant", "versatile", "professional"],
    ["sharp", "elegant", "professional", "modern"],
    ["editorial heading", "sharp branding", "professional title", "magazine display"],
    ["sharp modern sans with editorial precision", "clean professional letterforms"],
  ),
  dafont("Blackpine", "script",
    ["script", "brush", "bold", "handwritten", "rustic", "outdoor", "rough", "natural"],
    ["rustic", "bold", "adventurous", "natural"],
    ["outdoor branding", "adventure heading", "rustic display", "nature logo"],
    ["bold rustic brush script", "outdoor adventure hand-lettering"],
    { serifSansCategory: "script" as const }
  ),
  dafont("Caffeen", "display",
    ["display", "rounded", "bold", "fun", "playful", "bubbly", "modern", "friendly"],
    ["fun", "bold", "playful", "energetic"],
    ["fun branding", "playful heading", "bold display", "youth marketing"],
    ["bold rounded display with bubbly energy", "playful modern letterforms"],
    { designer: "Caffeen Fonts" },
  ),
  dafont("Galette", "serif",
    ["serif", "elegant", "classic", "refined", "editorial", "literary", "traditional", "readable"],
    ["elegant", "refined", "classic", "literary"],
    ["book heading", "editorial display", "literary title", "classic branding"],
    ["refined classic serif with editorial character", "traditional literary proportions"],
    { designer: "Caffeen Fonts", serifSansCategory: "serif" as const }
  ),
  dafont("Halogen", "sans-serif",
    ["sans-serif", "futuristic", "tech", "geometric", "sharp", "modern", "angular", "sci-fi"],
    ["futuristic", "sharp", "technical", "sleek"],
    ["tech branding", "sci-fi display", "futuristic heading", "gaming title"],
    ["sharp futuristic geometric sans", "angular tech-forward letterforms"],
  ),
  dafont("Nickname", "handwritten",
    ["handwritten", "casual", "friendly", "personal", "fun", "warm", "informal", "playful"],
    ["casual", "friendly", "personal", "warm"],
    ["personal blog", "casual branding", "friendly heading", "informal design"],
    ["casual handwritten with personal warmth", "friendly informal letterforms"],
  ),
  dafont("Redux", "display",
    ["display", "bold", "modern", "geometric", "strong", "condensed", "industrial", "structured"],
    ["bold", "structured", "industrial", "modern"],
    ["bold heading", "industrial branding", "modern poster", "strong display"],
    ["bold structured geometric display", "industrial modern letterforms"],
    { designer: "Murder Fonts" },
  ),
  dafont("Neogrey", "sans-serif",
    ["sans-serif", "modern", "geometric", "clean", "neutral", "versatile", "professional", "sharp"],
    ["modern", "clean", "professional", "versatile"],
    ["corporate heading", "modern branding", "clean display", "professional title"],
    ["clean modern geometric sans", "versatile professional proportions"],
  ),
  dafont("Mexcellent", "display",
    ["display", "bold", "3d", "dimensional", "retro", "fun", "decorative", "poster"],
    ["bold", "fun", "retro", "dimensional"],
    ["party poster", "fun display", "retro branding", "event title"],
    ["bold 3D dimensional display type", "retro fun poster character"],
  ),
  dafont("Loveline", "script",
    ["script", "romantic", "feminine", "elegant", "flowing", "wedding", "delicate", "calligraphy"],
    ["romantic", "delicate", "feminine", "graceful"],
    ["wedding design", "romantic heading", "feminine branding", "love-themed display"],
    ["delicate romantic calligraphic script", "feminine flowing letterforms"],
    { designer: "Murder Fonts", serifSansCategory: "script" as const }
  ),
  dafont("Verve", "sans-serif",
    ["sans-serif", "modern", "geometric", "clean", "sharp", "editorial", "versatile", "structured"],
    ["modern", "sharp", "editorial", "confident"],
    ["editorial heading", "modern display", "sharp branding", "clean title"],
    ["sharp modern geometric sans", "editorial confidence in letterforms"],
  ),
  dafont("Thunderstorm", "script",
    ["script", "brush", "bold", "dramatic", "expressive", "energetic", "dynamic", "hand-lettered"],
    ["dramatic", "energetic", "bold", "expressive"],
    ["music poster", "dramatic heading", "energetic branding", "bold display"],
    ["bold dramatic brush script", "energetic hand-lettered character"],
    { designer: "Excellent Ritma Florendia", serifSansCategory: "script" as const }
  ),
  dafont("Dited", "sans-serif",
    ["sans-serif", "modern", "dotted", "tech", "unique", "futuristic", "digital", "display"],
    ["tech", "futuristic", "unique", "digital"],
    ["tech display", "digital branding", "futuristic heading", "unique title"],
    ["dotted/dashed modern sans with digital feel", "tech-inspired display letterforms"],
  ),

];

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
  }
): Font {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const enrichedTags = enrichTags(tags, toneDescriptors);
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

  dafont("Vtks Revolt", "display",
    ["grunge", "distressed", "punk", "heavy", "rough", "textured", "aggressive", "urban"],
    ["edgy", "raw", "rebellious", "intense", "chaotic"],
    ["poster", "band logo", "punk flyer", "album art", "streetwear"],
    ["Deeply eroded letterforms", "Ink-splatter textures"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Vtks Distress", "display",
    ["grunge", "distressed", "scratched", "worn", "rough", "textured", "trash", "dirty"],
    ["gritty", "raw", "urban", "aggressive"],
    ["poster", "music flyer", "underground events", "street art"],
    ["Heavily scratched surface", "Torn paper effect"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("CF Punk Fashion", "display",
    ["grunge", "punk", "torn", "collage", "ransom", "cut-out", "mixed", "anarchic"],
    ["rebellious", "chaotic", "DIY", "confrontational"],
    ["punk flyer", "zine", "protest art", "album cover", "counterculture"],
    ["Ransom-note cut-out style", "Mixed typeface collage"],
  ),

  dafont("Bleeding Cowboys", "display",
    ["grunge", "western", "distressed", "decorative", "worn", "vintage", "textured", "ornate"],
    ["dramatic", "rugged", "dark", "atmospheric"],
    ["band logo", "tattoo", "western poster", "album art"],
    ["Ornamental swashes with distressed texture", "Western-grunge hybrid"],
    { designer: "Last Soundtrack" }
  ),


  dafont("Trash Hand", "handwritten",
    ["grunge", "handwritten", "messy", "scrawled", "raw", "marker", "urban", "casual"],
    ["gritty", "authentic", "street", "lo-fi"],
    ["street poster", "DIY zine", "indie music", "skate brand"],
    ["Hastily scrawled marker style", "Uneven baseline"],
  ),

  dafont("A Damn Mess", "display",
    ["grunge", "messy", "distressed", "punk", "dirty", "chaotic", "rough"],
    ["chaotic", "raw", "anarchic", "unpolished"],
    ["punk flyer", "underground event", "skateboard graphic", "zine"],
    ["Intentionally messy letter construction", "Anti-design aesthetic"],
  ),

  dafont("Punkboy", "display",
    ["grunge", "punk", "bold", "distressed", "rough", "angular", "aggressive"],
    ["rebellious", "loud", "confrontational", "energetic"],
    ["concert poster", "skateboard deck", "punk merch", "street art"],
    ["Angular punk-influenced forms", "Heavy ink distortion"],
  ),


  dafont("Angst", "display",
    ["grunge", "dark", "heavy", "distressed", "bold", "angsty", "rough"],
    ["brooding", "intense", "dark", "emotional"],
    ["metal poster", "dark themed events", "album cover", "editorial"],
    ["Heavy blackened letterforms", "Emotionally charged weight"],
  ),


  dafont("Dirty Headline", "display",
    ["grunge", "headline", "bold", "dirty", "distressed", "heavy", "impactful", "urban"],
    ["loud", "bold", "gritty", "impactful"],
    ["newspaper headline", "protest poster", "bold statement", "editorial"],
    ["Thick bold forms with grime overlay", "Newspaper distress"],
  ),

  dafont("Capture It", "display",
    ["grunge", "stencil", "rough", "military", "distressed", "urban", "spray"],
    ["rugged", "tactical", "urban", "street"],
    ["military poster", "street art", "urban branding", "action movie"],
    ["Stencil with spray-paint bleed", "Urban military hybrid"],
  ),


  dafont("Vtks Black", "display",
    ["grunge", "black", "heavy", "bold", "distressed", "dark", "textured", "aggressive"],
    ["dark", "heavy", "ominous", "powerful"],
    ["heavy metal", "dark poster", "gothic event", "extreme branding"],
    ["Ultra-heavy weight with grime", "Maximum impact letterforms"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Another Danger", "display",
    ["grunge", "brush", "rough", "danger", "aggressive", "textured", "distressed", "edgy"],
    ["dangerous", "edgy", "raw", "intense"],
    ["action movie", "extreme sports", "warning poster", "aggressive branding"],
    ["Rough brush strokes", "Danger-sign aesthetic"],
  ),

  dafont("Crust Clean", "display",
    ["grunge", "crust", "punk", "rough", "heavy", "angular", "distressed"],
    ["crusty", "raw", "underground", "aggressive"],
    ["crust punk", "DIY show flyer", "underground zine", "noise music"],
    ["Heavily degraded crust punk style", "Hand-cut stencil look"],
  ),



  dafont("Dirty Ego", "display",
    ["grunge", "modern", "distressed", "urban", "textured", "bold", "edgy"],
    ["urban", "contemporary", "gritty", "bold"],
    ["streetwear", "urban branding", "hip-hop poster", "fashion"],
    ["Modern sans with grime overlay", "Clean structure + dirty texture"],
  ),

  dafont("28 Days Later", "display",
    ["grunge", "horror", "scratched", "distressed", "dark", "apocalyptic", "rough"],
    ["terrifying", "post-apocalyptic", "tense", "desperate"],
    ["horror movie", "apocalypse theme", "survival game", "dark poster"],
    ["Scratched survival-horror letterforms", "Infected/degraded feel"],
  ),

  dafont("Neuropol", "display",
    ["grunge", "tech", "futuristic", "angular", "distressed", "sci-fi", "digital"],
    ["technological", "edgy", "futuristic", "digital"],
    ["tech poster", "sci-fi game", "cyber event", "digital art"],
    ["Angular tech forms with distress", "Cyberpunk grunge hybrid"],
  ),

  dafont("Hacked", "display",
    ["grunge", "digital", "glitch", "tech", "corrupted", "distressed", "cyber"],
    ["corrupted", "digital", "anarchic", "tech-gritty"],
    ["hacking theme", "digital art", "cyberpunk", "tech event"],
    ["Digitally corrupted letterforms", "Glitch-distress hybrid"],
  ),

  dafont("Guttural", "display",
    ["grunge", "metal", "extreme", "heavy", "aggressive", "dark", "distressed"],
    ["brutal", "extreme", "visceral", "relentless"],
    ["death metal", "extreme music", "horror", "dark poster"],
    ["Extreme metal-influenced letterforms", "Visceral distortion"],
  ),

  dafont("Eraser", "display",
    ["grunge", "erased", "faded", "distressed", "subtle", "worn", "chalky"],
    ["faded", "ghostly", "worn", "subtle"],
    ["minimal poster", "faded vintage", "artistic branding", "gallery"],
    ["Partially erased letterforms", "Chalk-on-blackboard texture"],
  ),

  // ─── SCRIPT / FEMININE / HANDWRITTEN (~25) ───



  dafont("Great Vibes", "script",
    ["script", "elegant", "calligraphy", "formal", "flowing", "romantic", "ornate", "classic"],
    ["elegant", "formal", "refined", "graceful"],
    ["wedding", "formal event", "luxury brand", "certificate"],
    ["Classical calligraphic script", "Generous ascender loops"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Sacramento", "script",
    ["script", "flowing", "casual", "elegant", "feminine", "light", "airy", "handwritten"],
    ["light", "breezy", "casual-elegant", "warm"],
    ["blog", "invitation", "lifestyle brand", "personal site"],
    ["Thin flowing script", "Light and airy feel"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Alex Brush", "script",
    ["script", "brush", "calligraphy", "elegant", "flowing", "romantic", "formal"],
    ["elegant", "refined", "romantic", "traditional"],
    ["wedding invitation", "formal event", "beauty brand", "greeting card"],
    ["Brush-style calligraphic script", "Formal yet warm"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Dancing Script", "script",
    ["script", "casual", "bouncy", "friendly", "handwritten", "lively", "fun", "feminine"],
    ["lively", "casual", "cheerful", "friendly"],
    ["greeting card", "casual invitation", "blog", "cafe menu"],
    ["Bouncing baseline", "Lively casual script"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Pacifico", "script",
    ["script", "retro", "surf", "casual", "fun", "rounded", "friendly", "vintage"],
    ["fun", "retro", "laid-back", "sunny"],
    ["surf brand", "casual restaurant", "fun branding", "beach theme"],
    ["Retro surf-culture script", "1950s casual vibe"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Allura", "script",
    ["script", "formal", "calligraphy", "elegant", "romantic", "flowing", "luxury"],
    ["formal", "graceful", "sophisticated", "romantic"],
    ["wedding", "formal invitation", "luxury brand", "certificate"],
    ["Formal calligraphic script", "Delicate hairlines"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Honey Script", "script",
    ["script", "sweet", "rounded", "feminine", "soft", "warm", "friendly", "cozy"],
    ["sweet", "warm", "approachable", "gentle"],
    ["bakery", "kids brand", "greeting card", "sweet shop"],
    ["Soft rounded script", "Honey-like flowing warmth"],
    { serifSansCategory: "script" }
  ),


  dafont("Angeline Vintage", "script",
    ["script", "vintage", "feminine", "ornamental", "elegant", "retro", "decorative"],
    ["nostalgic", "romantic", "vintage", "ornate"],
    ["vintage branding", "antique shop", "romantic poster", "retro wedding"],
    ["Vintage-styled ornamental script", "Decorative swash capitals"],
    { serifSansCategory: "script" }
  ),


  dafont("Sophia", "script",
    ["script", "feminine", "modern", "calligraphy", "elegant", "thin", "bridal", "chic"],
    ["elegant", "modern", "feminine", "sophisticated"],
    ["fashion brand", "bridal", "beauty blog", "luxury packaging"],
    ["Modern thin calligraphy", "Contemporary feminine elegance"],
    { serifSansCategory: "script" }
  ),

  dafont("Scriptina", "script",
    ["script", "calligraphy", "formal", "ornate", "flowing", "classic", "decorative", "elegant"],
    ["formal", "classic", "ornate", "decorative"],
    ["wedding", "formal certificate", "luxury brand", "elegant poster"],
    ["Classic ornamental calligraphy", "Generous flourishes"],
    { serifSansCategory: "script" }
  ),

  dafont("Respective", "script",
    ["script", "formal", "calligraphy", "elegant", "connected", "flowing", "decorative"],
    ["respectful", "formal", "polished", "classic"],
    ["formal invitation", "awards", "upscale branding", "ceremony"],
    ["Formal connected script", "Polished and professional"],
    { serifSansCategory: "script" }
  ),

  dafont("Windsong", "script",
    ["script", "airy", "light", "feminine", "flowing", "delicate", "whimsical", "elegant"],
    ["airy", "whimsical", "delicate", "dreamy"],
    ["poetry book", "feminine brand", "romantic poster", "personal blog"],
    ["Ultra-light windswept script", "Delicate floating letterforms"],
    { serifSansCategory: "script" }
  ),


  dafont("Blessed Day", "script",
    ["script", "handwritten", "religious", "warm", "flowing", "personal", "heartfelt"],
    ["heartfelt", "warm", "personal", "sincere"],
    ["greeting card", "church event", "personal letter", "inspirational quote"],
    ["Warm flowing hand script", "Personal handwritten feel"],
    { serifSansCategory: "script" }
  ),

  dafont("Euphoria Script", "script",
    ["script", "joyful", "bouncy", "feminine", "lively", "fun", "calligraphy", "upbeat"],
    ["joyful", "energetic", "celebratory", "playful"],
    ["party invitation", "celebration poster", "fun branding", "festive"],
    ["Bouncy joyful script", "Celebratory energy"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Milkshake", "script",
    ["script", "thick", "retro", "fun", "bold", "rounded", "casual", "friendly"],
    ["fun", "retro", "friendly", "casual"],
    ["food brand", "retro diner", "fun poster", "casual branding"],
    ["Thick retro casual script", "Milkshake-era nostalgia"],
    { serifSansCategory: "script" }
  ),


  dafont("Amatic SC", "handwritten",
    ["handwritten", "condensed", "narrow", "quirky", "tall", "simple", "sketchy", "artsy"],
    ["quirky", "artsy", "casual", "hand-drawn"],
    ["indie film", "craft brand", "art poster", "quirky heading"],
    ["Tall narrow hand-drawn caps", "Sketchy charm"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Love Ya Like A Sister", "handwritten",
    ["handwritten", "casual", "fun", "girly", "playful", "youthful", "friendly", "cute"],
    ["playful", "fun", "youthful", "friendly"],
    ["teen brand", "casual blog", "playful poster", "social media"],
    ["Casual girly handwriting", "Youthful personality"],
    { serifSansCategory: "display" }
  ),

  dafont("Nothing You Could Do", "handwritten",
    ["handwritten", "messy", "casual", "natural", "authentic", "raw", "personal"],
    ["authentic", "casual", "real", "unpolished"],
    ["personal brand", "indie music", "casual heading", "blog"],
    ["Natural messy handwriting", "Authentic imperfection"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Arizonia", "script",
    ["script", "elegant", "formal", "flowing", "calligraphy", "wedding", "romantic"],
    ["elegant", "romantic", "flowing", "refined"],
    ["wedding", "beauty brand", "elegant heading", "invitation"],
    ["Flowing formal calligraphic script", "Refined curves"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  // ─── RETRO / VINTAGE (~20) ───

  dafont("Groovy", "display",
    ["retro", "groovy", "70s", "psychedelic", "rounded", "funky", "hippie", "vintage"],
    ["groovy", "funky", "nostalgic", "psychedelic"],
    ["70s party", "retro poster", "vintage shop", "disco event"],
    ["Rounded 70s letterforms", "Flower-power era styling"],
  ),

  dafont("Lobster", "display",
    ["retro", "script-display", "bold", "connected", "vintage", "warm", "friendly", "classic"],
    ["warm", "friendly", "retro", "approachable"],
    ["restaurant", "food brand", "retro heading", "casual branding"],
    ["Bold connected display", "Retro sign-painting influence"],
    // Also on Google Fonts
  ),

  dafont("Righteous", "display",
    ["retro", "geometric", "70s", "rounded", "bold", "groovy", "warm", "display"],
    ["groovy", "confident", "retro", "bold"],
    ["70s branding", "retro poster", "music festival", "vintage shop"],
    ["Geometric 70s display", "Rounded retro forms"],
    // Also on Google Fonts
  ),

  dafont("Bungee Shade", "display",
    ["retro", "3d", "layered", "sign", "bold", "decorative", "vintage", "dimensional"],
    ["bold", "dimensional", "eye-catching", "retro"],
    ["poster", "signage", "display heading", "event branding"],
    ["Layered 3D sign-painting style", "Multiple design layers"],
    // Also on Google Fonts
  ),

  dafont("Lemon Milk", "display",
    ["retro", "modern", "geometric", "clean", "bold", "rounded", "minimal", "contemporary"],
    ["clean", "modern-retro", "confident", "minimal"],
    ["modern branding", "clean heading", "product packaging", "social media"],
    ["Modern geometric with retro nod", "Clean rounded forms"],
  ),

  dafont("Edo SZ", "display",
    ["retro", "japanese-inspired", "geometric", "angular", "bold", "display", "asian", "poster"],
    ["dramatic", "cultural", "bold", "stylized"],
    ["japanese restaurant", "martial arts", "asian-themed event", "poster"],
    ["Japanese-inspired geometric display", "Angular stylized forms"],
  ),

  dafont("Magnolia Sky", "script",
    ["retro", "script", "vintage", "elegant", "feminine", "flowing", "nostalgic", "romantic"],
    ["vintage", "romantic", "feminine", "nostalgic"],
    ["vintage wedding", "retro branding", "feminine poster", "antique shop"],
    ["Vintage-style flowing script", "1940s glamour influence"],
    { serifSansCategory: "script" }
  ),

  dafont("Komika Axis", "display",
    ["retro", "comic", "bold", "fun", "cartoon", "rounded", "energetic", "pop"],
    ["fun", "energetic", "comic", "loud"],
    ["comic book", "gaming", "kids brand", "fun poster"],
    ["Comic-book inspired bold type", "Pop-art energy"],
  ),

  dafont("Burnstown Dam", "display",
    ["retro", "art-deco", "vintage", "elegant", "decorative", "stylized", "classic", "1920s"],
    ["elegant", "vintage", "refined", "classic"],
    ["vintage poster", "1920s theme", "classic branding", "elegant event"],
    ["Art deco influenced vintage display", "1920s elegance"],
  ),

  dafont("Tropical Asian", "display",
    ["retro", "tiki", "tropical", "exotic", "vintage", "fun", "bamboo", "island"],
    ["exotic", "tropical", "fun", "festive"],
    ["tiki bar", "tropical party", "island theme", "exotic restaurant"],
    ["Bamboo-styled tropical display", "Tiki-era nostalgia"],
  ),

  dafont("Diner", "display",
    ["retro", "diner", "50s", "americana", "classic", "vintage", "neon", "sign"],
    ["nostalgic", "classic", "warm", "americana"],
    ["diner menu", "50s party", "americana branding", "retro sign"],
    ["1950s diner signage style", "Classic americana feel"],
  ),

  dafont("Chunk Five", "slab-serif",
    ["retro", "slab-serif", "bold", "heavy", "vintage", "display", "strong", "poster"],
    ["bold", "strong", "retro", "impactful"],
    ["poster headline", "vintage branding", "bold statement", "retro heading"],
    ["Ultra-bold slab serif", "Vintage poster weight"],
    { serifSansCategory: "slab-serif" }
  ),


  dafont("Franchise", "display",
    ["retro", "condensed", "tall", "bold", "vintage", "sports", "strong", "masculine"],
    ["strong", "bold", "masculine", "vintage"],
    ["sports branding", "vintage poster", "bold headline", "athletic"],
    ["Tall condensed vintage display", "Sports-era influence"],
  ),

  dafont("Bebas Neue", "display",
    ["retro", "condensed", "tall", "modern", "clean", "bold", "versatile", "uppercase"],
    ["modern", "clean", "bold", "professional"],
    ["poster", "headline", "branding", "editorial", "film title"],
    ["Ultra-condensed uppercase display", "Extremely popular free font"],
    // Also on Google Fonts
  ),


  dafont("Yeasty Flavors", "display",
    ["retro", "craft-beer", "vintage", "ornamental", "rustic", "artisanal", "label"],
    ["artisanal", "rustic", "vintage", "handcrafted"],
    ["craft beer", "artisan food", "vintage label", "rustic brand"],
    ["Vintage label-style display", "Craft brewery aesthetic"],
  ),

  dafont("Rumble Brave", "display",
    ["retro", "vintage", "textured", "classic", "masculine", "weathered", "bold"],
    ["rugged", "vintage", "masculine", "classic"],
    ["vintage poster", "masculine branding", "adventure", "classic heading"],
    ["Weathered vintage display", "Classic rugged charm"],
  ),


  dafont("Henny Penny", "display",
    ["retro", "whimsical", "quirky", "decorative", "storybook", "playful", "charming"],
    ["whimsical", "charming", "storybook", "quirky"],
    ["children's book", "fairy tale", "whimsical brand", "storybook heading"],
    ["Whimsical storybook display", "Fairy-tale charm"],
    // Also on Google Fonts
  ),

  // ─── GOTHIC / BLACKLETTER (~15) ───



  dafont("Deutsch Gothic", "display",
    ["blackletter", "gothic", "german", "traditional", "heavy", "formal", "dark", "bold"],
    ["formal", "heavy", "traditional", "authoritative"],
    ["gothic branding", "beer label", "traditional heading", "dark poster"],
    ["German-style gothic blackletter", "Heavy traditional forms"],
  ),

  dafont("Kingthings Petrock", "display",
    ["blackletter", "gothic", "medieval", "rough", "handwritten", "rustic", "ancient"],
    ["rustic", "ancient", "medieval", "organic"],
    ["medieval event", "rustic theme", "fantasy game", "historic branding"],
    ["Rough handwritten blackletter", "Medieval manuscript feel"],
  ),

  dafont("Cloister Black", "display",
    ["blackletter", "gothic", "classic", "formal", "religious", "ornate", "traditional"],
    ["solemn", "formal", "religious", "reverent"],
    ["religious text", "formal certificate", "gothic heading", "brewery label"],
    ["Classic cloister blackletter", "Religious manuscript influence"],
  ),



  dafont("Quentin Caps", "display",
    ["blackletter", "caps", "modern-gothic", "bold", "dark", "tattoo", "heavy"],
    ["dark", "bold", "modern-gothic", "intense"],
    ["tattoo lettering", "modern gothic brand", "dark poster", "band logo"],
    ["Modern blackletter capitals", "Tattoo-influenced gothic"],
  ),



  dafont("Diploma", "display",
    ["blackletter", "formal", "certificate", "traditional", "classic", "calligraphy", "official"],
    ["formal", "official", "traditional", "authoritative"],
    ["diploma", "certificate", "formal document", "traditional heading"],
    ["Formal blackletter for documents", "Official certificate style"],
  ),

  dafont("Teutonic", "display",
    ["blackletter", "teutonic", "german", "angular", "dark", "heavy", "medieval", "stern"],
    ["stern", "dark", "powerful", "imposing"],
    ["dark branding", "medieval event", "heavy-metal", "gothic poster"],
    ["Angular teutonic blackletter", "Imposing Germanic forms"],
  ),

  dafont("London", "display",
    ["blackletter", "newspaper", "masthead", "gothic", "british", "traditional", "editorial"],
    ["traditional", "editorial", "authoritative", "british"],
    ["newspaper masthead", "editorial heading", "traditional brand"],
    ["Newspaper-masthead blackletter", "London Times influence"],
  ),

  dafont("Pieces of Eight", "display",
    ["blackletter", "pirate", "fantasy", "adventure", "decorative", "themed", "nautical"],
    ["adventurous", "pirate", "fantasy", "playful-dark"],
    ["pirate theme", "adventure game", "fantasy poster", "themed event"],
    ["Pirate-themed blackletter", "Swashbuckler ornaments"],
  ),

  dafont("Bastarda", "display",
    ["blackletter", "bastarda", "calligraphy", "medieval", "scribal", "historic", "formal"],
    ["historic", "scribal", "medieval", "academic"],
    ["medieval manuscript", "academic heading", "historic event"],
    ["Bastarda calligraphic blackletter", "Scribal manuscript style"],
  ),

  // ─── PIXEL / GAMING / 8-BIT (~15) ───

  dafont("Pixel Operator", "monospace",
    ["pixel", "8-bit", "retro-gaming", "bitmap", "clean", "minimal", "digital", "arcade"],
    ["digital", "retro", "clean", "nostalgic"],
    ["retro game", "pixel art", "indie game UI", "8-bit project"],
    ["Clean pixel-grid font", "Legible bitmap design"],
    { serifSansCategory: "monospace" }
  ),

  dafont("VCR OSD Mono", "monospace",
    ["pixel", "VCR", "retro-tech", "mono", "screen", "tape", "80s", "digital"],
    ["retro-tech", "nostalgic", "analog-digital", "lo-fi"],
    ["VHS aesthetic", "retro video", "80s tech theme", "vaporwave"],
    ["VCR on-screen display style", "Tape-era nostalgia"],
    { serifSansCategory: "monospace" }
  ),

  dafont("Press Start 2P", "display",
    ["pixel", "arcade", "gaming", "8-bit", "retro", "bold", "blocky", "classic"],
    ["arcade", "fun", "nostalgic", "energetic"],
    ["arcade game", "retro gaming", "8-bit project", "gaming poster"],
    ["Classic arcade pixel font", "NES-era gaming style"],
    // Also on Google Fonts
  ),

  dafont("Commodore 64", "monospace",
    ["pixel", "C64", "retro-computing", "8-bit", "vintage-tech", "classic", "home-computer"],
    ["retro-computing", "nostalgic", "classic", "geeky"],
    ["retro computing", "C64 tribute", "vintage tech poster", "nostalgia"],
    ["Commodore 64 system font recreation", "Home computer era"],
    { serifSansCategory: "monospace" }
  ),

  dafont("Silkscreen", "display",
    ["pixel", "bitmap", "small", "clean", "minimal", "web", "screen", "digital"],
    ["minimal", "digital", "clean", "technical"],
    ["UI element", "pixel art", "small display text", "digital project"],
    ["Small clean pixel font", "Web-optimized bitmap"],
  ),

  dafont("Visitor", "display",
    ["pixel", "futuristic", "sci-fi", "digital", "small", "clean", "minimal", "tech"],
    ["futuristic", "minimal", "digital", "sleek"],
    ["sci-fi game", "tech interface", "futuristic UI", "digital project"],
    ["Small futuristic pixel font", "Sci-fi display feel"],
  ),

  dafont("Upheaval", "display",
    ["pixel", "bold", "chunky", "gaming", "heavy", "arcade", "impactful", "strong"],
    ["bold", "impactful", "heavy", "powerful"],
    ["game title", "bold pixel heading", "retro poster", "gaming brand"],
    ["Heavy bold pixel display", "Maximum pixel impact"],
  ),


  dafont("Joystix", "display",
    ["pixel", "gaming", "arcade", "bold", "retro", "fun", "chunky", "console"],
    ["fun", "arcade", "bold", "playful"],
    ["arcade cabinet", "gaming poster", "retro event", "pixel project"],
    ["Chunky arcade-style pixel font", "Console gaming nostalgia"],
  ),

  dafont("Eight Bit Dragon", "display",
    ["pixel", "fantasy", "gaming", "dragon", "RPG", "adventure", "retro", "bold"],
    ["adventurous", "fantasy", "bold", "epic"],
    ["RPG game", "fantasy pixel art", "adventure game", "gaming poster"],
    ["Fantasy RPG pixel font", "Dragon-quest era style"],
  ),

  dafont("Minecraftia", "display",
    ["pixel", "minecraft", "gaming", "blocky", "square", "crafting", "sandbox", "popular"],
    ["blocky", "fun", "creative", "familiar"],
    ["minecraft project", "sandbox game", "crafting theme", "gaming content"],
    ["Minecraft-inspired pixel font", "Blocky sandbox style"],
  ),


  dafont("Super Mario 256", "display",
    ["pixel", "mario", "platformer", "gaming", "nostalgic", "fun", "classic", "nintendo"],
    ["nostalgic", "fun", "classic", "joyful"],
    ["platformer game", "nintendo tribute", "retro gaming", "nostalgia project"],
    ["Mario-inspired pixel display", "Platform game nostalgia"],
  ),



  // ─── CUTE / BUBBLY / KAWAII (~20) ───

  dafont("Bubblegum Sans", "display",
    ["cute", "bubbly", "rounded", "fun", "playful", "friendly", "pop", "soft"],
    ["playful", "fun", "cheerful", "bubbly"],
    ["kids brand", "toy packaging", "fun poster", "party invitation"],
    ["Rounded bubbly sans", "Bubblegum-pop energy"],
    // Also on Google Fonts
  ),

  dafont("Cookies", "display",
    ["cute", "sweet", "rounded", "friendly", "warm", "bakery", "fun", "soft"],
    ["sweet", "warm", "friendly", "cozy"],
    ["bakery brand", "kids menu", "sweet shop", "cute packaging"],
    ["Cookie-sweet rounded display", "Warm bakery feel"],
  ),

  dafont("Chewy", "display",
    ["cute", "rounded", "bold", "fun", "cartoon", "friendly", "chunky", "playful"],
    ["fun", "chunky", "playful", "bold"],
    ["children's product", "cartoon show", "fun heading", "toy brand"],
    ["Chunky rounded cartoon display", "Chewy bold personality"],
    // Also on Google Fonts
  ),

  dafont("Sniglet", "display",
    ["cute", "rounded", "modern", "friendly", "soft", "clean", "approachable", "gentle"],
    ["friendly", "approachable", "soft", "modern"],
    ["app branding", "friendly UI", "modern kids brand", "tech startup"],
    ["Modern rounded friendly display", "Soft approachable forms"],
  ),

  dafont("Comic Neue", "handwritten",
    ["cute", "comic", "casual", "friendly", "handwritten", "lighthearted", "clean", "fun"],
    ["casual", "lighthearted", "friendly", "unpretentious"],
    ["comic", "casual blog", "friendly branding", "informal heading"],
    ["Clean comic-style font", "Refined Comic Sans alternative"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("KG Happy", "handwritten",
    ["cute", "handwritten", "happy", "round", "bubbly", "cheerful", "school", "youthful"],
    ["happy", "cheerful", "youthful", "sunny"],
    ["school project", "happy poster", "children's brand", "cheerful heading"],
    ["Happy bubbly handwriting", "Youthful school-style writing"],
    { serifSansCategory: "display", designer: "Kimberly Geswein" }
  ),

  dafont("Kawaii", "display",
    ["cute", "kawaii", "japanese-pop", "rounded", "bubbly", "anime", "sweet", "pastel"],
    ["kawaii", "adorable", "sweet", "pop"],
    ["kawaii brand", "anime poster", "cute packaging", "japanese-pop style"],
    ["Kawaii-styled bubbly display", "Japanese cute culture influence"],
  ),

  dafont("Jelly Crazies", "display",
    ["cute", "jelly", "wobbly", "fun", "playful", "bouncy", "colorful", "kids"],
    ["wobbly", "fun", "silly", "playful"],
    ["kids party", "fun heading", "playful poster", "toy packaging"],
    ["Wobbly jelly-like letterforms", "Bouncy playful motion"],
  ),

  dafont("Fredoka One", "display",
    ["cute", "rounded", "bold", "friendly", "modern", "soft", "approachable", "clean"],
    ["friendly", "bold", "approachable", "warm"],
    ["kids app", "friendly branding", "bold heading", "modern kids brand"],
    ["Bold rounded modern display", "Approachable weight"],
    // Also on Google Fonts
  ),

  dafont("Baloo", "display",
    ["cute", "rounded", "bold", "indian", "friendly", "chunky", "warm", "multicultural"],
    ["warm", "friendly", "bold", "welcoming"],
    ["indian branding", "warm heading", "multicultural design", "bold poster"],
    ["Bold rounded multicultural display", "Warm chunky forms"],
    // Also on Google Fonts
  ),

  dafont("Coiny", "display",
    ["cute", "rounded", "slightly-rough", "handmade", "playful", "textured", "fun", "warm"],
    ["handmade", "playful", "warm", "crafty"],
    ["craft brand", "handmade shop", "playful packaging", "artisan"],
    ["Slightly rough rounded display", "Handmade crafty charm"],
    // Also on Google Fonts
  ),

  dafont("Comfortaa", "display",
    ["cute", "geometric", "rounded", "modern", "clean", "soft", "futuristic", "friendly"],
    ["modern", "soft", "clean", "futuristic-friendly"],
    ["tech startup", "modern app", "friendly heading", "clean branding"],
    ["Geometric rounded modern display", "Soft-tech aesthetic"],
    // Also on Google Fonts
  ),

  dafont("Luckiest Guy", "display",
    ["cute", "bold", "cartoon", "fun", "chunky", "loud", "impactful", "playful"],
    ["loud", "fun", "bold", "cartoon"],
    ["cartoon title", "fun poster", "kids heading", "game branding"],
    ["Bold cartoon display", "Loud fun personality"],
    // Also on Google Fonts
  ),

  dafont("Titan One", "display",
    ["cute", "bold", "slab", "rounded", "heavy", "friendly", "chunky", "strong"],
    ["bold", "strong", "friendly", "chunky"],
    ["bold heading", "sports-fun", "strong kids brand", "chunky poster"],
    ["Bold rounded slab display", "Strong yet friendly weight"],
    // Also on Google Fonts
  ),


  dafont("Boogaloo", "display",
    ["cute", "retro", "rounded", "casual", "fun", "60s", "playful", "bouncy"],
    ["fun", "retro", "bouncy", "casual"],
    ["retro poster", "fun branding", "casual heading", "60s theme"],
    ["Retro-casual rounded display", "1960s fun personality"],
    // Also on Google Fonts
  ),

  dafont("Short Stack", "handwritten",
    ["cute", "handwritten", "casual", "round", "simple", "friendly", "notebook", "natural"],
    ["casual", "simple", "friendly", "natural"],
    ["notebook style", "casual blog", "kids brand", "simple heading"],
    ["Casual round handwriting", "Natural notebook feel"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Patrick Hand", "handwritten",
    ["cute", "handwritten", "casual", "personal", "friendly", "natural", "simple", "warm"],
    ["personal", "warm", "casual", "authentic"],
    ["personal blog", "casual heading", "friendly branding", "note style"],
    ["Natural casual handwriting", "Warm personal feel"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Shojumaru", "display",
    ["cute", "japanese", "bold", "rounded", "anime", "asian", "pop", "decorative"],
    ["bold", "japanese-pop", "decorative", "energetic"],
    ["anime poster", "japanese restaurant", "asian branding", "pop heading"],
    ["Japanese-influenced rounded bold", "Anime-pop energy"],
    // Also on Google Fonts
  ),

  dafont("Bangers", "display",
    ["cute", "comic", "bold", "loud", "impact", "cartoon", "action", "pop-art"],
    ["loud", "bold", "comic", "action-packed"],
    ["comic book", "action poster", "bold heading", "pop-art design"],
    ["Bold comic-book display", "Action-word styling"],
    // Also on Google Fonts
  ),

  // ─── BRUSH / PAINTED (~15) ───

  dafont("Bushcraft", "display",
    ["brush", "thick", "bold", "painted", "expressive", "hand-drawn", "artistic", "raw"],
    ["expressive", "artistic", "bold", "raw"],
    ["art poster", "expressive heading", "creative brand", "gallery"],
    ["Thick bold brush strokes", "Artistic hand-painted feel"],
  ),



  dafont("Stroke Dimension", "display",
    ["brush", "artistic", "expressive", "thick", "paint", "abstract", "bold", "creative"],
    ["artistic", "abstract", "expressive", "creative"],
    ["art exhibition", "creative brand", "abstract poster", "gallery"],
    ["Thick artistic brush strokes", "Abstract paint quality"],
  ),

  dafont("Permanent Marker", "handwritten",
    ["brush", "marker", "bold", "casual", "hand-drawn", "thick", "whiteboard", "rough"],
    ["casual", "bold", "rough", "direct"],
    ["whiteboard", "casual heading", "DIY project", "bold note"],
    ["Thick marker-style lettering", "Whiteboard marker feel"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Cabin Sketch", "display",
    ["brush", "sketch", "hand-drawn", "outline", "artistic", "double-stroke", "creative"],
    ["sketchy", "artistic", "creative", "hand-drawn"],
    ["creative heading", "art project", "sketch style", "indie brand"],
    ["Sketchy double-stroke display", "Hand-drawn outline style"],
    // Also on Google Fonts
  ),


  dafont("Chinese Rocks", "display",
    ["brush", "asian-inspired", "bold", "expressive", "inky", "calligraphy", "artistic"],
    ["bold", "expressive", "inky", "artistic"],
    ["asian-themed design", "ink art poster", "artistic heading"],
    ["Asian-inspired brush display", "Bold ink strokes"],
  ),

  dafont("Yellowtail", "script",
    ["brush", "retro", "script", "sign-painting", "vintage", "flowing", "casual", "warm"],
    ["retro", "warm", "casual", "sign-painted"],
    ["vintage sign", "retro branding", "warm heading", "casual logo"],
    ["Retro sign-painter brush script", "Vintage warmth"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Blacksword", "display",
    ["brush", "bold", "aggressive", "calligraphy", "sharp", "dark", "dramatic", "thick"],
    ["dramatic", "dark", "aggressive", "powerful"],
    ["dark branding", "dramatic poster", "bold logo", "heavy heading"],
    ["Bold aggressive brush calligraphy", "Sword-like sharp terminals"],
  ),


  dafont("Adrenaline", "display",
    ["brush", "bold", "speed", "dynamic", "sports", "energetic", "fast", "italic"],
    ["energetic", "fast", "dynamic", "powerful"],
    ["sports brand", "extreme sports", "energy poster", "action heading"],
    ["Speed-styled brush display", "Dynamic athletic energy"],
  ),

  dafont("Vtks Animal 2", "display",
    ["brush", "wild", "organic", "expressive", "artistic", "bold", "natural", "raw"],
    ["wild", "organic", "expressive", "natural"],
    ["nature poster", "wild branding", "organic heading", "art exhibit"],
    ["Wild organic brush forms", "Animal-energy brush strokes"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Baron Neue", "display",
    ["brush", "modern", "thin", "uppercase", "clean", "elegant", "fashion", "minimal"],
    ["elegant", "modern", "clean", "sophisticated"],
    ["fashion brand", "modern heading", "clean poster", "elegant branding"],
    ["Thin modern uppercase display", "Fashion-forward elegance"],
  ),

  dafont("Kaushan Script", "script",
    ["brush", "script", "casual", "connected", "flowing", "lively", "modern", "friendly"],
    ["lively", "casual", "friendly", "warm"],
    ["casual brand", "friendly heading", "modern script logo", "social media"],
    ["Casual connected brush script", "Lively flowing strokes"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  // ─── ART DECO / NOUVEAU (~10) ───

  dafont("Metropolis 1920", "display",
    ["art-deco", "1920s", "geometric", "gatsby", "elegant", "vintage", "ornamental", "luxury"],
    ["elegant", "gatsby", "luxurious", "vintage"],
    ["gatsby party", "1920s event", "luxury brand", "art deco poster"],
    ["Classic 1920s art deco display", "Gatsby-era geometric elegance"],
  ),

  dafont("Poiret One", "display",
    ["art-deco", "thin", "geometric", "elegant", "fashion", "1920s", "refined", "decorative"],
    ["refined", "elegant", "delicate", "artistic"],
    ["fashion brand", "art gallery", "elegant heading", "luxury poster"],
    ["Thin art deco geometric display", "Fashion-forward elegance"],
    // Also on Google Fonts
  ),

  dafont("Cardo", "serif",
    ["art-deco", "serif", "classic", "elegant", "book", "traditional", "refined", "literary"],
    ["classic", "literary", "refined", "traditional"],
    ["book title", "literary heading", "classic branding", "editorial"],
    ["Classic book-style serif", "Literary elegance"],
    { serifSansCategory: "serif" }
    // Also on Google Fonts
  ),

  dafont("Vast Shadow", "display",
    ["art-deco", "shadow", "decorative", "bold", "vintage", "dimensional", "poster", "circus"],
    ["bold", "decorative", "dramatic", "vintage"],
    ["poster headline", "vintage circus", "decorative heading", "event"],
    ["Bold shadow display type", "Vintage poster dimensionality"],
    // Also on Google Fonts
  ),

  dafont("Broadway", "display",
    ["art-deco", "broadway", "theater", "bold", "glamorous", "showtime", "classic", "1930s"],
    ["glamorous", "theatrical", "bold", "show-stopping"],
    ["theater poster", "broadway event", "show heading", "glamour branding"],
    ["Classic Broadway theater display", "Show-business glamour"],
  ),






  // ─── SCI-FI / FUTURISTIC (~15) ───

  dafont("Orbitron", "display",
    ["sci-fi", "futuristic", "geometric", "space", "tech", "modern", "angular", "digital"],
    ["futuristic", "technological", "precise", "modern"],
    ["sci-fi movie", "tech brand", "space poster", "futuristic UI"],
    ["Geometric space-age display", "Orbital precision"],
    // Also on Google Fonts
  ),

  dafont("Audiowide", "display",
    ["sci-fi", "futuristic", "wide", "tech", "bold", "modern", "automotive", "racing"],
    ["futuristic", "bold", "tech", "automotive"],
    ["racing game", "tech brand", "automotive poster", "futuristic heading"],
    ["Wide futuristic display", "Automotive-tech aesthetic"],
    // Also on Google Fonts
  ),

  dafont("Ethnocentric", "display",
    ["sci-fi", "futuristic", "italic", "angular", "space", "dynamic", "tech", "aggressive"],
    ["dynamic", "futuristic", "aggressive", "fast"],
    ["sci-fi game", "space poster", "tech heading", "futuristic brand"],
    ["Angular italic futuristic display", "High-speed space aesthetic"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Alien Encounters", "display",
    ["sci-fi", "alien", "space", "digital", "angular", "tech", "extraterrestrial", "glowing"],
    ["alien", "mysterious", "technological", "otherworldly"],
    ["sci-fi poster", "alien theme", "space game", "UFO event"],
    ["Alien-tech angular display", "Extraterrestrial aesthetic"],
  ),

  dafont("Starcraft", "display",
    ["sci-fi", "gaming", "futuristic", "bold", "tech", "space", "strategy", "military-sci-fi"],
    ["strategic", "powerful", "futuristic", "commanding"],
    ["strategy game", "sci-fi branding", "space military", "gaming poster"],
    ["Military sci-fi display", "Space command aesthetic"],
  ),

  dafont("Conthrax", "display",
    ["sci-fi", "geometric", "modern", "tech", "clean", "futuristic", "angular", "precise"],
    ["precise", "modern", "technological", "clean"],
    ["tech startup", "futuristic UI", "clean sci-fi", "modern heading"],
    ["Clean geometric futuristic display", "Precision-tech feel"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Azonix", "display",
    ["sci-fi", "futuristic", "bold", "geometric", "modern", "space", "angular", "display"],
    ["bold", "futuristic", "modern", "impactful"],
    ["sci-fi poster", "bold tech heading", "space branding", "futuristic event"],
    ["Bold geometric futuristic display", "Space-age impact"],
  ),

  dafont("Neuropolitical", "display",
    ["sci-fi", "futuristic", "angular", "tech", "cyber", "digital", "sleek", "modern"],
    ["sleek", "cyber", "futuristic", "digital"],
    ["cyberpunk", "tech poster", "digital event", "futuristic branding"],
    ["Angular cyber-tech display", "Neuropolitical aesthetic"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Zero Hour", "display",
    ["sci-fi", "military", "stencil", "futuristic", "bold", "tactical", "countdown", "tech"],
    ["tactical", "urgent", "military-tech", "commanding"],
    ["military sci-fi", "countdown poster", "tactical game", "tech heading"],
    ["Military-futuristic stencil display", "Countdown urgency"],
  ),

  dafont("Galaxy", "display",
    ["sci-fi", "space", "glowing", "futuristic", "ethereal", "cosmic", "display", "wide"],
    ["cosmic", "ethereal", "vast", "glowing"],
    ["space poster", "cosmic event", "galaxy theme", "ethereal heading"],
    ["Cosmic space display type", "Galaxy-scale grandeur"],
  ),

  dafont("Quantum", "display",
    ["sci-fi", "tech", "minimal", "futuristic", "clean", "geometric", "modern", "digital"],
    ["minimal", "tech", "precise", "futuristic"],
    ["tech brand", "minimal sci-fi", "clean heading", "quantum computing"],
    ["Minimal futuristic display", "Quantum precision"],
  ),

  dafont("Blade Runner Movie Font", "display",
    ["sci-fi", "cyberpunk", "neon", "futuristic", "film", "dark", "atmospheric", "retro-future"],
    ["dystopian", "atmospheric", "dark", "cinematic"],
    ["cyberpunk poster", "retro-future event", "dark sci-fi", "film tribute"],
    ["Blade Runner-inspired display", "Retro-future cyberpunk"],
  ),

  dafont("Kiona", "display",
    ["sci-fi", "modern", "geometric", "clean", "uppercase", "futuristic", "minimal", "sharp"],
    ["modern", "sharp", "clean", "futuristic"],
    ["modern brand", "clean heading", "futuristic poster", "minimal design"],
    ["Sharp modern geometric display", "Clean futuristic forms"],
  ),

  dafont("Nasalization", "display",
    ["sci-fi", "NASA", "space", "tech", "rounded", "futuristic", "aerospace", "bold"],
    ["aerospace", "official", "futuristic", "bold"],
    ["space agency", "aerospace branding", "NASA-style heading", "tech poster"],
    ["NASA-inspired rounded display", "Aerospace program aesthetic"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("Exoplanet", "display",
    ["sci-fi", "space", "thin", "elegant", "futuristic", "cosmic", "modern", "wide"],
    ["cosmic", "elegant", "vast", "modern"],
    ["space documentary", "cosmic brand", "elegant sci-fi", "astronomy"],
    ["Elegant space-themed display", "Exoplanetary elegance"],
  ),

  // ─── HORROR / DARK (~10) ───

  dafont("Creepster", "display",
    ["horror", "spooky", "halloween", "creepy", "dripping", "fun-horror", "seasonal", "dark"],
    ["spooky", "creepy", "fun-scary", "halloween"],
    ["halloween poster", "horror movie", "spooky event", "haunted house"],
    ["Creepy dripping display", "Fun-horror letterforms"],
    // Also on Google Fonts
  ),

  dafont("Nosifer", "display",
    ["horror", "vampire", "dark", "dripping", "blood", "gothic", "extreme", "nocturnal"],
    ["terrifying", "dark", "bloody", "nocturnal"],
    ["vampire movie", "horror poster", "dark event", "gothic heading"],
    ["Blood-dripping vampire display", "Nosferatu-inspired horror"],
    // Also on Google Fonts
  ),



  dafont("Feast of Flesh BB", "display",
    ["horror", "zombie", "rotting", "gore", "organic", "dark", "extreme", "decomposing"],
    ["gruesome", "decomposing", "visceral", "extreme"],
    ["zombie movie", "horror game", "extreme poster", "gore heading"],
    ["Rotting zombie-flesh letterforms", "Decomposition aesthetic"],
  ),


  dafont("Bloody", "display",
    ["horror", "blood", "dripping", "red", "dark", "splatter", "visceral", "gore"],
    ["bloody", "visceral", "shocking", "dark"],
    ["horror movie title", "blood-themed event", "dark poster", "gore heading"],
    ["Blood-dripping letterforms", "Splatter horror style"],
  ),

  dafont("Ghastly Panic", "display",
    ["horror", "panic", "scratchy", "chaotic", "dark", "unsettling", "distorted", "frantic"],
    ["panicked", "chaotic", "frantic", "unsettling"],
    ["horror game", "panic event", "dark heading", "psychological thriller"],
    ["Frantic distorted horror display", "Psychological terror"],
  ),

  dafont("Zombie Holocaust", "display",
    ["horror", "zombie", "apocalypse", "dark", "heavy", "extreme", "undead", "survival"],
    ["apocalyptic", "extreme", "brutal", "undead"],
    ["zombie game", "apocalypse poster", "survival horror", "dark event"],
    ["Extreme zombie-apocalypse display", "Undead survival aesthetic"],
  ),

  dafont("Grinched", "display",
    ["horror", "grinch", "christmas-dark", "whimsical", "quirky", "holiday", "mischievous"],
    ["mischievous", "quirky", "darkly-fun", "holiday"],
    ["dark christmas", "quirky holiday", "mischievous heading", "seasonal"],
    ["Grinch-inspired quirky display", "Dark whimsical holiday"],
  ),

  // ─── STENCIL / MILITARY (~10) ───

  dafont("Stencil", "display",
    ["stencil", "military", "industrial", "bold", "classic", "utilitarian", "army", "blocky"],
    ["military", "utilitarian", "strong", "industrial"],
    ["military poster", "industrial brand", "army heading", "bold statement"],
    ["Classic military stencil display", "Standard-issue aesthetic"],
  ),

  dafont("Army", "display",
    ["stencil", "military", "bold", "green", "army", "tactical", "heavy", "blocky"],
    ["military", "tactical", "strong", "commanding"],
    ["army branding", "military event", "tactical heading", "veteran"],
    ["Army-style bold stencil", "Military command presence"],
  ),

  dafont("Gunplay", "display",
    ["stencil", "military", "angular", "aggressive", "tactical", "sharp", "modern", "action"],
    ["aggressive", "tactical", "sharp", "modern-military"],
    ["action movie", "tactical game", "military poster", "aggressive heading"],
    ["Angular military-action stencil", "Modern tactical sharpness"],
  ),

  dafont("Stardos Stencil", "display",
    ["stencil", "vintage", "elegant", "serif", "classic", "refined", "decorative", "retro"],
    ["refined", "vintage", "elegant", "classic"],
    ["vintage poster", "elegant stencil", "classic heading", "refined brand"],
    ["Elegant vintage serif stencil", "Refined stencil forms"],
    // Also on Google Fonts
  ),

  dafont("Allerta Stencil", "display",
    ["stencil", "modern", "clean", "sans", "alert", "clear", "functional", "bold"],
    ["alert", "clear", "functional", "modern"],
    ["warning sign", "modern stencil", "clear heading", "functional design"],
    ["Modern clean sans stencil", "Alert functional clarity"],
    // Also on Google Fonts
  ),

  dafont("Cargo", "display",
    ["stencil", "shipping", "industrial", "bold", "crate", "transport", "rough", "utility"],
    ["industrial", "utilitarian", "rough", "working-class"],
    ["shipping brand", "industrial poster", "cargo heading", "warehouse"],
    ["Cargo crate stencil display", "Industrial shipping aesthetic"],
  ),

  dafont("Sewer Sys", "display",
    ["stencil", "industrial", "underground", "rough", "utility", "urban", "gritty", "system"],
    ["underground", "industrial", "gritty", "urban"],
    ["underground event", "industrial brand", "utility poster", "urban heading"],
    ["Industrial utility stencil", "Underground system aesthetic"],
  ),


  dafont("Over There", "display",
    ["stencil", "military", "vintage", "WWI", "WWII", "historic", "wartime", "propaganda"],
    ["historic", "wartime", "patriotic", "vintage-military"],
    ["wartime poster", "vintage military", "historic event", "propaganda style"],
    ["Vintage wartime stencil", "WWI/WWII era military"],
  ),

  dafont("Blockletter", "display",
    ["stencil", "block", "clean", "minimal", "modern", "geometric", "simple", "sharp"],
    ["clean", "sharp", "minimal", "modern"],
    ["modern stencil", "clean heading", "minimal poster", "sharp brand"],
    ["Clean geometric block stencil", "Minimal precision"],
  ),

  // ─── WESTERN / RUSTIC (~10) ───

  dafont("Wanted M54", "display",
    ["western", "wanted", "vintage", "cowboy", "poster", "serif", "rough", "frontier"],
    ["outlaw", "rugged", "frontier", "vintage"],
    ["wanted poster", "western event", "cowboy brand", "frontier heading"],
    ["Classic wanted-poster display", "Wild West sheriff office aesthetic"],
  ),

  dafont("Rye", "display",
    ["western", "slab-serif", "vintage", "saloon", "bold", "decorative", "rustic", "frontier"],
    ["rustic", "frontier", "bold", "saloon"],
    ["saloon branding", "western poster", "frontier heading", "rustic event"],
    ["Western saloon slab display", "Frontier-town character"],
    // Also on Google Fonts
  ),

  dafont("Saddlebag", "display",
    ["western", "rustic", "cowboy", "leather", "vintage", "rough", "frontier", "trail"],
    ["rustic", "trail-worn", "cowboy", "rugged"],
    ["cowboy event", "rustic branding", "trail heading", "western poster"],
    ["Rustic cowboy display", "Saddlebag-worn character"],
  ),


  dafont("Woodgod", "display",
    ["western", "wood-type", "rustic", "carved", "vintage", "natural", "textured", "frontier"],
    ["rustic", "natural", "carved", "frontier"],
    ["wood-type poster", "rustic brand", "natural heading", "carved sign"],
    ["Wood-carved western display", "Frontier wood-type tradition"],
  ),

  dafont("Cowboys", "display",
    ["western", "cowboy", "classic", "frontier", "bold", "display", "vintage", "americana"],
    ["cowboy", "classic", "frontier", "bold"],
    ["cowboy event", "western movie", "frontier brand", "americana poster"],
    ["Classic cowboy display type", "Wild West character"],
  ),

  dafont("Western", "display",
    ["western", "classic", "decorative", "ornamental", "vintage", "serif", "frontier", "saloon"],
    ["classic", "decorative", "vintage", "ornamental"],
    ["western theme", "saloon sign", "vintage event", "decorative heading"],
    ["Classic ornamental western display", "Saloon-sign decoration"],
  ),


  dafont("Gallow Tree", "display",
    ["western", "dark-western", "horror-western", "grim", "frontier", "bold", "menacing"],
    ["grim", "dark", "menacing", "frontier"],
    ["dark western", "grim poster", "menacing heading", "horror-western"],
    ["Dark western display", "Gallows frontier darkness"],
  ),

  dafont("Outlaw", "display",
    ["western", "outlaw", "rough", "bold", "rugged", "frontier", "vintage", "lawless"],
    ["lawless", "rugged", "bold", "rough"],
    ["outlaw brand", "rough heading", "western event", "rugged poster"],
    ["Rough outlaw western display", "Lawless frontier character"],
  ),

  // ─── NEON / 80s (~10) ───

  dafont("Streamster", "script",
    ["neon", "80s", "script", "retro-future", "synthwave", "flowing", "chrome", "glowing"],
    ["retro-future", "synthwave", "glowing", "nostalgic"],
    ["synthwave poster", "80s party", "retro event", "neon heading"],
    ["80s neon script display", "Synthwave glow aesthetic"],
    { serifSansCategory: "script" }
  ),

  dafont("Neon", "display",
    ["neon", "glowing", "sign", "bright", "night", "bar", "electric", "urban"],
    ["glowing", "electric", "nightlife", "bright"],
    ["neon sign", "nightclub", "bar branding", "bright poster"],
    ["Classic neon tube display", "Electric sign glow"],
  ),

  dafont("Outrun Future", "display",
    ["neon", "80s", "synthwave", "retro-future", "bold", "tech", "racing", "chrome"],
    ["retro-future", "fast", "bold", "synthwave"],
    ["synthwave poster", "retro racing", "80s event", "outrun game"],
    ["Outrun-style retro future display", "80s racing aesthetic"],
  ),

  dafont("Lazer 84", "display",
    ["neon", "80s", "laser", "retro", "chrome", "angular", "synthwave", "sharp"],
    ["sharp", "80s", "laser", "retro-cool"],
    ["80s party", "laser theme", "retro poster", "synthwave event"],
    ["1984-era laser display", "Sharp chrome angles"],
  ),




  dafont("Chrome", "display",
    ["neon", "chrome", "metallic", "80s", "shiny", "reflective", "bold", "heavy"],
    ["shiny", "metallic", "bold", "impressive"],
    ["80s poster", "chrome branding", "metallic heading", "bold event"],
    ["Chrome metallic display", "80s shiny metal aesthetic"],
  ),


  // ─── DISPLAY / DECORATIVE (additional) ───

  dafont("Impact Label", "display",
    ["display", "label", "bold", "vintage", "retro", "impactful", "heavy", "packaging"],
    ["bold", "vintage", "commanding", "nostalgic"],
    ["label design", "packaging", "retro branding", "vintage poster"],
    ["Heavy label-style display", "Vintage packaging feel"],
    { designer: "Tension Type" }
  ),

  dafont("Coolvetica", "display",
    ["display", "groovy", "70s", "retro", "smooth", "rounded", "casual", "warm"],
    ["groovy", "casual", "retro", "cool"],
    ["retro branding", "70s poster", "album cover", "casual heading"],
    ["Smooth 70s-inspired letterforms", "Casual rounded display"],
    { designer: "Typodermic Fonts" }
  ),

  dafont("College", "display",
    ["display", "varsity", "sport", "block", "athletic", "bold", "collegiate", "team"],
    ["sporty", "bold", "energetic", "team-spirit"],
    ["sports jersey", "varsity branding", "athletic poster", "college merch"],
    ["Classic varsity block letters", "Athletic jersey style"],
  ),

  dafont("Blackout", "display",
    ["display", "bold", "heavy", "block", "solid", "minimal", "modern", "fill"],
    ["bold", "modern", "minimal", "heavy"],
    ["poster", "bold heading", "modern branding", "strong statement"],
    ["Ultra-heavy solid block letters", "No-nonsense bold display"],
    { designer: "Tyler Finck" }
  ),

  dafont("Baumans", "display",
    ["display", "geometric", "modern", "tech", "clean", "futuristic", "digital"],
    ["futuristic", "clean", "tech", "modern"],
    ["tech branding", "futuristic poster", "digital display", "modern heading"],
    ["Geometric futuristic display", "Clean tech letterforms"],
  ),

  dafont("Megrim", "display",
    ["display", "thin", "geometric", "art-deco", "elegant", "angular", "fashion", "modern"],
    ["elegant", "modern", "angular", "refined"],
    ["fashion branding", "art-deco poster", "modern editorial", "elegant heading"],
    ["Thin geometric art-deco display", "Angular elegant forms"],
  ),

  dafont("Nova Square", "display",
    ["display", "geometric", "square", "modern", "tech", "angular", "digital", "grid"],
    ["modern", "technical", "precise", "digital"],
    ["tech UI", "digital display", "modern branding", "geometric heading"],
    ["Square geometric display letterforms", "Grid-based digital design"],
  ),

  dafont("Bungee", "display",
    ["display", "bold", "signage", "urban", "layered", "heavy", "vertical", "modern"],
    ["bold", "urban", "energetic", "impactful"],
    ["signage", "urban branding", "bold poster", "vertical display"],
    ["Vertical signage display", "Urban layered bold design"],
    { designer: "David Jonathan Ross" }
  ),

  // ─── SCRIPT / HANDWRITING (additional) ───

  dafont("Cookie", "handwritten",
    ["script", "casual", "brush", "retro", "friendly", "warm", "vintage", "sign"],
    ["warm", "friendly", "retro", "casual"],
    ["bakery branding", "casual invite", "friendly heading", "vintage sign"],
    ["Casual retro brush script", "Warm friendly sign-painter feel"],
  ),

  dafont("Clicker Script", "handwritten",
    ["script", "elegant", "formal", "flowing", "calligraphy", "connected", "classic"],
    ["elegant", "formal", "classic", "refined"],
    ["formal invitation", "wedding card", "elegant heading", "classical event"],
    ["Formal flowing calligraphic script", "Classic connected elegance"],
  ),

  dafont("Italianno", "handwritten",
    ["script", "elegant", "Italian", "flowing", "calligraphy", "thin", "romantic"],
    ["elegant", "romantic", "flowing", "Mediterranean"],
    ["Italian restaurant", "elegant branding", "romantic heading", "fine dining"],
    ["Elegant Italian-inspired calligraphy", "Flowing romantic thin script"],
  ),

  dafont("Norican", "handwritten",
    ["script", "brush", "casual", "flowing", "warm", "friendly", "sign-painter"],
    ["warm", "casual", "friendly", "inviting"],
    ["casual branding", "friendly sign", "warm heading", "cafe menu"],
    ["Casual sign-painter brush script", "Warm flowing letterforms"],
  ),

  dafont("Rouge Script", "handwritten",
    ["script", "elegant", "French", "calligraphy", "thin", "romantic", "classic"],
    ["elegant", "French", "romantic", "refined"],
    ["French branding", "elegant invite", "romantic heading", "bistro menu"],
    ["French-inspired elegant thin script", "Classic romantic calligraphy"],
  ),

  dafont("Tangerine", "handwritten",
    ["script", "calligraphy", "elegant", "thin", "formal", "ornate", "wedding"],
    ["elegant", "formal", "delicate", "ornate"],
    ["wedding invitation", "formal card", "elegant certificate", "luxury heading"],
    ["Delicate formal calligraphic script", "Ornate wedding-style elegance"],
  ),

  dafont("Bromello", "handwritten",
    ["script", "brush", "modern", "feminine", "flowing", "casual", "trendy"],
    ["modern", "feminine", "trendy", "soft"],
    ["fashion brand", "beauty blog", "social media", "modern wedding"],
    ["Modern brush script", "Trendy feminine flow"],
  ),

  dafont("Mr Dafoe", "handwritten",
    ["script", "brush", "bold", "dramatic", "expressive", "dynamic", "artistic"],
    ["dramatic", "expressive", "bold", "artistic"],
    ["dramatic heading", "artistic branding", "bold statement", "expressive poster"],
    ["Bold dramatic brush script", "Expressive dynamic strokes"],
  ),

  // ─── PIXEL / RETRO / GAMING (additional) ───

  dafont("Bit Cell", "display",
    ["pixel", "retro", "gaming", "8bit", "tiny", "minimal", "bitmap", "lo-fi"],
    ["retro", "digital", "minimal", "lo-fi"],
    ["retro game", "pixel art", "8-bit project", "digital nostalgia"],
    ["Tiny pixel bitmap font", "Minimal 8-bit character set"],
  ),

  dafont("Dogica", "display",
    ["pixel", "retro", "bold", "gaming", "bitmap", "heavy", "display", "arcade"],
    ["bold", "retro", "heavy", "commanding"],
    ["game title", "retro heading", "pixel poster", "gaming brand"],
    ["Heavy bold pixel display", "Commanding bitmap letterforms"],
  ),

  dafont("Early GameBoy", "display",
    ["pixel", "retro", "gaming", "gameboy", "nostalgic", "8bit", "portable", "Nintendo"],
    ["nostalgic", "retro", "playful", "lo-fi"],
    ["retro gaming", "gameboy tribute", "pixel art", "nostalgic project"],
    ["GameBoy-era pixel display", "Portable gaming nostalgia"],
  ),

  dafont("VT323", "display",
    ["pixel", "retro", "terminal", "monospace", "hacker", "green-screen", "computer", "80s"],
    ["retro", "technical", "hacker", "digital"],
    ["terminal UI", "retro computing", "hacker aesthetic", "vintage screen"],
    ["VT320 terminal pixel font", "Vintage green-screen computer feel"],
  ),

  dafont("Share Tech Mono", "display",
    ["pixel", "monospace", "tech", "terminal", "clean", "coding", "digital", "modern"],
    ["technical", "clean", "digital", "precise"],
    ["code display", "tech dashboard", "terminal UI", "developer tool"],
    ["Clean tech monospace", "Modern terminal-style design"],
    { serifSansCategory: "monospace" }
  ),

  // ─── GOTHIC / BLACKLETTER (additional) ───

  dafont("MedievalSharp", "display",
    ["gothic", "medieval", "sharp", "fantasy", "RPG", "angular", "historical", "dark"],
    ["medieval", "sharp", "dark", "fantasy"],
    ["RPG game", "medieval event", "fantasy poster", "historical heading"],
    ["Sharp medieval gothic display", "Angular fantasy letterforms"],
  ),

  dafont("Pirata One", "display",
    ["gothic", "pirate", "blackletter", "adventure", "nautical", "bold", "decorative"],
    ["adventurous", "bold", "dramatic", "swashbuckling"],
    ["pirate theme", "adventure game", "nautical branding", "bold gothic heading"],
    ["Pirate-inspired blackletter", "Adventurous nautical gothic"],
  ),

  dafont("New Rocker", "display",
    ["gothic", "blackletter", "rock", "bold", "metal", "dark", "aggressive", "modern"],
    ["aggressive", "dark", "bold", "rock"],
    ["rock band", "metal poster", "dark branding", "gothic rock heading"],
    ["Modern rock-inspired blackletter", "Bold aggressive gothic display"],
  ),

  dafont("Metal Mania", "display",
    ["gothic", "metal", "blackletter", "heavy", "dark", "aggressive", "band", "extreme"],
    ["extreme", "dark", "aggressive", "heavy"],
    ["metal band logo", "extreme music", "dark poster", "heavy heading"],
    ["Heavy metal blackletter display", "Extreme aggressive gothic forms"],
  ),

  dafont("Ruritania", "display",
    ["gothic", "blackletter", "fantasy", "medieval", "ornate", "romantic", "European"],
    ["romantic", "medieval", "fantasy", "mysterious"],
    ["fantasy book", "medieval event", "romantic gothic", "RPG title"],
    ["Romantic European blackletter", "Fantasy medieval atmosphere"],
  ),

  dafont("Minster", "display",
    ["gothic", "blackletter", "clean", "modern", "bold", "strong", "dark", "readable"],
    ["strong", "dark", "bold", "commanding"],
    ["heavy metal", "dark branding", "gothic poster", "strong heading"],
    ["Bold modern blackletter", "Strong commanding gothic forms"],
  ),

  // ─── SANS-SERIF (additional) ───

  dafont("Aldrich", "sans-serif",
    ["sans-serif", "geometric", "tech", "modern", "clean", "digital", "industrial"],
    ["technical", "modern", "clean", "industrial"],
    ["tech branding", "industrial design", "modern UI", "digital heading"],
    ["Geometric industrial sans-serif", "Clean technical digital design"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Electrolize", "sans-serif",
    ["sans-serif", "tech", "futuristic", "digital", "clean", "modern", "sharp"],
    ["futuristic", "digital", "sharp", "modern"],
    ["tech startup", "futuristic UI", "digital branding", "sharp heading"],
    ["Futuristic digital sans-serif", "Sharp tech-forward design"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Jura", "sans-serif",
    ["sans-serif", "light", "modern", "clean", "tech", "minimal", "elegant"],
    ["light", "modern", "elegant", "minimal"],
    ["minimal branding", "light heading", "modern UI", "elegant tech"],
    ["Light elegant modern sans-serif", "Clean minimal letterforms"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Saira", "sans-serif",
    ["sans-serif", "geometric", "modern", "versatile", "clean", "professional", "wide"],
    ["professional", "modern", "versatile", "clean"],
    ["professional branding", "modern heading", "versatile UI", "corporate design"],
    ["Versatile geometric sans-serif", "Professional modern design"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Kanit", "sans-serif",
    ["sans-serif", "modern", "Thai", "geometric", "clean", "versatile", "round"],
    ["modern", "clean", "versatile", "friendly"],
    ["modern branding", "clean heading", "versatile UI", "friendly design"],
    ["Modern geometric sans-serif", "Thai-Latin versatile design"],
    { serifSansCategory: "sans-serif" }
  ),

  // ─── SERIF (additional) ───

  dafont("Cinzel", "serif",
    ["serif", "classic", "Roman", "elegant", "display", "uppercase", "monumental", "timeless"],
    ["classic", "elegant", "monumental", "timeless"],
    ["luxury brand", "book title", "classical event", "elegant heading"],
    ["Roman-inspired monumental serif", "Classic uppercase elegance"],
    { serifSansCategory: "serif" }
  ),

  dafont("Playfair Display", "serif",
    ["serif", "elegant", "high-contrast", "display", "modern", "transitional", "stylish", "editorial"],
    ["elegant", "stylish", "modern", "sophisticated"],
    ["fashion magazine", "luxury branding", "elegant heading", "editorial"],
    ["High-contrast transitional display serif", "Modern editorial elegance"],
    { serifSansCategory: "serif" }
  ),

  dafont("Cormorant", "serif",
    ["serif", "elegant", "display", "high-contrast", "refined", "Garamond-like", "classical", "literary"],
    ["refined", "classical", "elegant", "literary"],
    ["book cover", "literary magazine", "elegant branding", "classical heading"],
    ["Refined Garamond-inspired display serif", "Classical literary elegance"],
    { serifSansCategory: "serif" }
  ),

  dafont("Crimson Text", "serif",
    ["serif", "elegant", "readable", "book", "old-style", "warm", "classic", "body"],
    ["elegant", "readable", "warm", "classic"],
    ["body text", "book design", "long-form reading", "elegant content"],
    ["Elegant old-style book serif", "Warm readable text design"],
    { serifSansCategory: "serif" }
  ),

  // ─── STENCIL / MILITARY (additional) ───

  dafont("Bungee Inline", "display",
    ["stencil", "inline", "bold", "signage", "urban", "layered", "modern", "display"],
    ["bold", "urban", "modern", "graphic"],
    ["urban signage", "modern poster", "bold branding", "inline heading"],
    ["Inline signage stencil display", "Modern urban layered design"],
    { designer: "David Jonathan Ross" }
  ),

  dafont("Major Mono Display", "display",
    ["stencil", "monospace", "modern", "minimal", "geometric", "experimental", "display"],
    ["experimental", "modern", "minimal", "avant-garde"],
    ["experimental design", "modern branding", "minimal poster", "avant-garde heading"],
    ["Experimental monospace stencil display", "Minimal geometric construction"],
  ),

  dafont("Saginaw", "display",
    ["stencil", "military", "bold", "industrial", "structured", "utilitarian", "clean"],
    ["military", "structured", "clean", "strong"],
    ["military branding", "industrial heading", "structured poster", "utilitarian design"],
    ["Clean military stencil display", "Structured bold industrial forms"],
  ),

  dafont("Capture Smallz", "display",
    ["stencil", "small-caps", "military", "urban", "distressed", "rough", "street"],
    ["urban", "rough", "street", "tactical"],
    ["street art", "urban branding", "military style", "small-caps heading"],
    ["Small-caps urban stencil", "Street-military hybrid"],
  ),

  // ─── GRUNGE / PUNK (additional) ───

  dafont("Shlop", "display",
    ["grunge", "messy", "melting", "dripping", "horror", "wet", "distorted", "grotesque"],
    ["messy", "horror", "dripping", "grotesque"],
    ["horror poster", "slime theme", "messy branding", "grotesque heading"],
    ["Melting dripping display letters", "Wet grotesque distortion"],
  ),

  dafont("Dokdo", "display",
    ["grunge", "brush", "rough", "Asian", "expressive", "artistic", "raw", "bold"],
    ["expressive", "raw", "artistic", "bold"],
    ["artistic poster", "expressive heading", "raw branding", "bold statement"],
    ["Rough expressive brush display", "Raw artistic Korean influence"],
  ),

  // ─── ADDITIONAL DISPLAY ───

  dafont("Black Ops One", "display",
    ["display", "military", "bold", "heavy", "stencil-like", "strong", "action", "tactical"],
    ["military", "bold", "strong", "tactical"],
    ["action movie", "military branding", "game title", "tactical heading"],
    ["Military-inspired bold display", "Heavy action tactical letterforms"],
  ),

  dafont("Contrail One", "display",
    ["display", "condensed", "aviation", "speed", "dynamic", "modern", "sharp", "racing"],
    ["dynamic", "fast", "modern", "sharp"],
    ["aviation branding", "racing poster", "speed heading", "dynamic display"],
    ["Aviation-inspired condensed display", "Dynamic speed letterforms"],
  ),

  dafont("Michroma", "display",
    ["display", "geometric", "futuristic", "tech", "wide", "modern", "digital", "space"],
    ["futuristic", "tech", "wide", "modern"],
    ["tech branding", "space theme", "futuristic heading", "wide display"],
    ["Wide geometric futuristic display", "Tech space-age letterforms"],
  ),

  dafont("Passero One", "display",
    ["display", "bold", "heavy", "vintage", "advertising", "retro", "warm", "rounded"],
    ["vintage", "warm", "bold", "friendly"],
    ["vintage advertising", "retro poster", "warm heading", "bold display"],
    ["Heavy vintage advertising display", "Warm retro rounded forms"],
  ),

  dafont("Aurora", "display",
    ["display", "futuristic", "sci-fi", "sleek", "modern", "digital", "space", "tech"],
    ["futuristic", "sleek", "modern", "digital"],
    ["sci-fi heading", "tech branding", "futuristic poster", "digital display"],
    ["Sleek futuristic display typeface", "Digital sci-fi inspired design"],
  ),

];

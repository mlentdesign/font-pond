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
    ["deeply eroded letterforms", "ink-splatter textures"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Vtks Distress", "display",
    ["grunge", "distressed", "scratched", "worn", "rough", "textured", "trash", "dirty"],
    ["gritty", "raw", "urban", "aggressive"],
    ["poster", "music flyer", "underground events", "street art"],
    ["heavily scratched surface", "torn paper effect"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("CF Punk Fashion", "display",
    ["grunge", "punk", "torn", "collage", "ransom", "cut-out", "mixed", "anarchic"],
    ["rebellious", "chaotic", "DIY", "confrontational"],
    ["punk flyer", "zine", "protest art", "album cover", "counterculture"],
    ["ransom-note cut-out style", "mixed typeface collage"],
  ),

  dafont("Bleeding Cowboys", "display",
    ["grunge", "western", "distressed", "decorative", "worn", "vintage", "textured", "ornate"],
    ["dramatic", "rugged", "dark", "atmospheric"],
    ["band logo", "tattoo", "western poster", "album art"],
    ["ornamental swashes with distressed texture", "western-grunge hybrid"],
    { designer: "Last Soundtrack" }
  ),


  dafont("Trash Hand", "handwritten",
    ["grunge", "handwritten", "messy", "scrawled", "raw", "marker", "urban", "casual"],
    ["gritty", "authentic", "street", "lo-fi"],
    ["street poster", "DIY zine", "indie music", "skate brand"],
    ["hastily scrawled marker style", "uneven baseline"],
  ),

  dafont("A Damn Mess", "display",
    ["grunge", "messy", "distressed", "punk", "dirty", "chaotic", "rough"],
    ["chaotic", "raw", "anarchic", "unpolished"],
    ["punk flyer", "underground event", "skateboard graphic", "zine"],
    ["intentionally messy letter construction", "anti-design aesthetic"],
  ),

  dafont("Punkboy", "display",
    ["grunge", "punk", "bold", "distressed", "rough", "angular", "aggressive"],
    ["rebellious", "loud", "confrontational", "energetic"],
    ["concert poster", "skateboard deck", "punk merch", "street art"],
    ["angular punk-influenced forms", "heavy ink distortion"],
  ),


  dafont("Angst", "display",
    ["grunge", "dark", "heavy", "distressed", "bold", "angsty", "rough"],
    ["brooding", "intense", "dark", "emotional"],
    ["metal poster", "dark themed events", "album cover", "editorial"],
    ["heavy blackened letterforms", "emotionally charged weight"],
  ),


  dafont("Dirty Headline", "display",
    ["grunge", "headline", "bold", "dirty", "distressed", "heavy", "impactful", "urban"],
    ["loud", "bold", "gritty", "impactful"],
    ["newspaper headline", "protest poster", "bold statement", "editorial"],
    ["thick bold forms with grime overlay", "newspaper distress"],
  ),

  dafont("Capture It", "display",
    ["grunge", "stencil", "rough", "military", "distressed", "urban", "spray"],
    ["rugged", "tactical", "urban", "street"],
    ["military poster", "street art", "urban branding", "action movie"],
    ["stencil with spray-paint bleed", "urban military hybrid"],
  ),


  dafont("Vtks Black", "display",
    ["grunge", "black", "heavy", "bold", "distressed", "dark", "textured", "aggressive"],
    ["dark", "heavy", "ominous", "powerful"],
    ["heavy metal", "dark poster", "gothic event", "extreme branding"],
    ["ultra-heavy weight with grime", "maximum impact letterforms"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Another Danger", "display",
    ["grunge", "brush", "rough", "danger", "aggressive", "textured", "distressed", "edgy"],
    ["dangerous", "edgy", "raw", "intense"],
    ["action movie", "extreme sports", "warning poster", "aggressive branding"],
    ["rough brush strokes", "danger-sign aesthetic"],
  ),

  dafont("Crust Clean", "display",
    ["grunge", "crust", "punk", "rough", "heavy", "angular", "distressed"],
    ["crusty", "raw", "underground", "aggressive"],
    ["crust punk", "DIY show flyer", "underground zine", "noise music"],
    ["heavily degraded crust punk style", "hand-cut stencil look"],
  ),



  dafont("Dirty Ego", "display",
    ["grunge", "modern", "distressed", "urban", "textured", "bold", "edgy"],
    ["urban", "contemporary", "gritty", "bold"],
    ["streetwear", "urban branding", "hip-hop poster", "fashion"],
    ["modern sans with grime overlay", "clean structure + dirty texture"],
  ),

  dafont("28 Days Later", "display",
    ["grunge", "horror", "scratched", "distressed", "dark", "apocalyptic", "rough"],
    ["terrifying", "post-apocalyptic", "tense", "desperate"],
    ["horror movie", "apocalypse theme", "survival game", "dark poster"],
    ["scratched survival-horror letterforms", "infected/degraded feel"],
  ),

  dafont("Neuropol", "display",
    ["grunge", "tech", "futuristic", "angular", "distressed", "sci-fi", "digital"],
    ["technological", "edgy", "futuristic", "digital"],
    ["tech poster", "sci-fi game", "cyber event", "digital art"],
    ["angular tech forms with distress", "cyberpunk grunge hybrid"],
  ),

  dafont("Hacked", "display",
    ["grunge", "digital", "glitch", "tech", "corrupted", "distressed", "cyber"],
    ["corrupted", "digital", "anarchic", "tech-gritty"],
    ["hacking theme", "digital art", "cyberpunk", "tech event"],
    ["digitally corrupted letterforms", "glitch-distress hybrid"],
  ),

  dafont("Guttural", "display",
    ["grunge", "metal", "extreme", "heavy", "aggressive", "dark", "distressed"],
    ["brutal", "extreme", "visceral", "relentless"],
    ["death metal", "extreme music", "horror", "dark poster"],
    ["extreme metal-influenced letterforms", "visceral distortion"],
  ),

  dafont("Eraser", "display",
    ["grunge", "erased", "faded", "distressed", "subtle", "worn", "chalky"],
    ["faded", "ghostly", "worn", "subtle"],
    ["minimal poster", "faded vintage", "artistic branding", "gallery"],
    ["partially erased letterforms", "chalk-on-blackboard texture"],
  ),

  // ─── SCRIPT / FEMININE / HANDWRITTEN (~25) ───



  dafont("Great Vibes", "script",
    ["script", "elegant", "calligraphy", "formal", "flowing", "romantic", "ornate", "classic"],
    ["elegant", "formal", "refined", "graceful"],
    ["wedding", "formal event", "luxury brand", "certificate"],
    ["classical calligraphic script", "generous ascender loops"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Sacramento", "script",
    ["script", "flowing", "casual", "elegant", "feminine", "light", "airy", "handwritten"],
    ["light", "breezy", "casual-elegant", "warm"],
    ["blog", "invitation", "lifestyle brand", "personal site"],
    ["thin flowing script", "light and airy feel"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Alex Brush", "script",
    ["script", "brush", "calligraphy", "elegant", "flowing", "romantic", "formal"],
    ["elegant", "refined", "romantic", "traditional"],
    ["wedding invitation", "formal event", "beauty brand", "greeting card"],
    ["brush-style calligraphic script", "formal yet warm"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Dancing Script", "script",
    ["script", "casual", "bouncy", "friendly", "handwritten", "lively", "fun", "feminine"],
    ["lively", "casual", "cheerful", "friendly"],
    ["greeting card", "casual invitation", "blog", "cafe menu"],
    ["bouncing baseline", "lively casual script"],
    { serifSansCategory: "script" }
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

  dafont("Allura", "script",
    ["script", "formal", "calligraphy", "elegant", "romantic", "flowing", "luxury"],
    ["formal", "graceful", "sophisticated", "romantic"],
    ["wedding", "formal invitation", "luxury brand", "certificate"],
    ["formal calligraphic script", "delicate hairlines"],
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
    { serifSansCategory: "script" }
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

  dafont("Euphoria Script", "script",
    ["script", "joyful", "bouncy", "feminine", "lively", "fun", "calligraphy", "upbeat"],
    ["joyful", "energetic", "celebratory", "playful"],
    ["party invitation", "celebration poster", "fun branding", "festive"],
    ["bouncy joyful script", "celebratory energy"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Milkshake", "script",
    ["script", "thick", "retro", "fun", "bold", "rounded", "casual", "friendly"],
    ["fun", "retro", "friendly", "casual"],
    ["food brand", "retro diner", "fun poster", "casual branding"],
    ["thick retro casual script", "milkshake-era nostalgia"],
    { serifSansCategory: "script" }
  ),


  dafont("Amatic SC", "handwritten",
    ["handwritten", "condensed", "narrow", "quirky", "tall", "simple", "sketchy", "artsy"],
    ["quirky", "artsy", "casual", "hand-drawn"],
    ["indie film", "craft brand", "art poster", "quirky heading"],
    ["tall narrow hand-drawn caps", "sketchy charm"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
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

  dafont("Arizonia", "script",
    ["script", "elegant", "formal", "flowing", "calligraphy", "wedding", "romantic"],
    ["elegant", "romantic", "flowing", "refined"],
    ["wedding", "beauty brand", "elegant heading", "invitation"],
    ["flowing formal calligraphic script", "refined curves"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  // ─── RETRO / VINTAGE (~20) ───

  dafont("Groovy", "display",
    ["retro", "groovy", "70s", "psychedelic", "rounded", "funky", "hippie", "vintage"],
    ["groovy", "funky", "nostalgic", "psychedelic"],
    ["70s party", "retro poster", "vintage shop", "disco event"],
    ["rounded 70s letterforms", "flower-power era styling"],
  ),

  dafont("Lobster", "display",
    ["retro", "script-display", "bold", "connected", "vintage", "warm", "friendly", "classic"],
    ["warm", "friendly", "retro", "approachable"],
    ["restaurant", "food brand", "retro heading", "casual branding"],
    ["bold connected display", "retro sign-painting influence"],
    // Also on Google Fonts
  ),

  dafont("Righteous", "display",
    ["retro", "geometric", "70s", "rounded", "bold", "groovy", "warm", "display"],
    ["groovy", "confident", "retro", "bold"],
    ["70s branding", "retro poster", "music festival", "vintage shop"],
    ["geometric 70s display", "rounded retro forms"],
    // Also on Google Fonts
  ),

  dafont("Bungee Shade", "display",
    ["retro", "3d", "layered", "sign", "bold", "decorative", "vintage", "dimensional"],
    ["bold", "dimensional", "eye-catching", "retro"],
    ["poster", "signage", "display heading", "event branding"],
    ["layered 3D sign-painting style", "multiple design layers"],
    // Also on Google Fonts
  ),

  dafont("Lemon Milk", "display",
    ["retro", "modern", "geometric", "clean", "bold", "rounded", "minimal", "contemporary"],
    ["clean", "modern-retro", "confident", "minimal"],
    ["modern branding", "clean heading", "product packaging", "social media"],
    ["modern geometric with retro nod", "clean rounded forms"],
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


  dafont("Franchise", "display",
    ["retro", "condensed", "tall", "bold", "vintage", "sports", "strong", "masculine"],
    ["strong", "bold", "masculine", "vintage"],
    ["sports branding", "vintage poster", "bold headline", "athletic"],
    ["tall condensed vintage display", "sports-era influence"],
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


  dafont("Henny Penny", "display",
    ["retro", "whimsical", "quirky", "decorative", "storybook", "playful", "charming"],
    ["whimsical", "charming", "storybook", "quirky"],
    ["children's book", "fairy tale", "whimsical brand", "storybook heading"],
    ["whimsical storybook display", "fairy-tale charm"],
    // Also on Google Fonts
  ),

  // ─── GOTHIC / BLACKLETTER (~15) ───



  dafont("Deutsch Gothic", "display",
    ["blackletter", "gothic", "german", "traditional", "heavy", "formal", "dark", "bold"],
    ["formal", "heavy", "traditional", "authoritative"],
    ["gothic branding", "beer label", "traditional heading", "dark poster"],
    ["german-style gothic blackletter", "heavy traditional forms"],
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



  dafont("Quentin Caps", "display",
    ["blackletter", "caps", "modern-gothic", "bold", "dark", "tattoo", "heavy"],
    ["dark", "bold", "modern-gothic", "intense"],
    ["tattoo lettering", "modern gothic brand", "dark poster", "band logo"],
    ["modern blackletter capitals", "tattoo-influenced gothic"],
  ),



  dafont("Diploma", "display",
    ["blackletter", "formal", "certificate", "traditional", "classic", "calligraphy", "official"],
    ["formal", "official", "traditional", "authoritative"],
    ["diploma", "certificate", "formal document", "traditional heading"],
    ["formal blackletter for documents", "official certificate style"],
  ),

  dafont("Teutonic", "display",
    ["blackletter", "teutonic", "german", "angular", "dark", "heavy", "medieval", "stern"],
    ["stern", "dark", "powerful", "imposing"],
    ["dark branding", "medieval event", "heavy-metal", "gothic poster"],
    ["angular teutonic blackletter", "imposing Germanic forms"],
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
  ),



  // ─── CUTE / BUBBLY / KAWAII (~20) ───

  dafont("Bubblegum Sans", "display",
    ["cute", "bubbly", "rounded", "fun", "playful", "friendly", "pop", "soft"],
    ["playful", "fun", "cheerful", "bubbly"],
    ["kids brand", "toy packaging", "fun poster", "party invitation"],
    ["rounded bubbly sans", "bubblegum-pop energy"],
    // Also on Google Fonts
  ),

  dafont("Cookies", "display",
    ["cute", "sweet", "rounded", "friendly", "warm", "bakery", "fun", "soft"],
    ["sweet", "warm", "friendly", "cozy"],
    ["bakery brand", "kids menu", "sweet shop", "cute packaging"],
    ["cookie-sweet rounded display", "warm bakery feel"],
  ),

  dafont("Chewy", "display",
    ["cute", "rounded", "bold", "fun", "cartoon", "friendly", "chunky", "playful"],
    ["fun", "chunky", "playful", "bold"],
    ["children's product", "cartoon show", "fun heading", "toy brand"],
    ["chunky rounded cartoon display", "chewy bold personality"],
    // Also on Google Fonts
  ),

  dafont("Sniglet", "display",
    ["cute", "rounded", "modern", "friendly", "soft", "clean", "approachable", "gentle"],
    ["friendly", "approachable", "soft", "modern"],
    ["app branding", "friendly UI", "modern kids brand", "tech startup"],
    ["modern rounded friendly display", "soft approachable forms"],
  ),

  dafont("Comic Neue", "handwritten",
    ["cute", "comic", "casual", "friendly", "handwritten", "lighthearted", "clean", "fun"],
    ["casual", "lighthearted", "friendly", "unpretentious"],
    ["comic", "casual blog", "friendly branding", "informal heading"],
    ["clean comic-style font", "refined Comic Sans alternative"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
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

  dafont("Fredoka One", "display",
    ["cute", "rounded", "bold", "friendly", "modern", "soft", "approachable", "clean"],
    ["friendly", "bold", "approachable", "warm"],
    ["kids app", "friendly branding", "bold heading", "modern kids brand"],
    ["bold rounded modern display", "approachable weight"],
    // Also on Google Fonts
  ),

  dafont("Baloo", "display",
    ["cute", "rounded", "bold", "indian", "friendly", "chunky", "warm", "multicultural"],
    ["warm", "friendly", "bold", "welcoming"],
    ["indian branding", "warm heading", "multicultural design", "bold poster"],
    ["bold rounded multicultural display", "warm chunky forms"],
    // Also on Google Fonts
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

  dafont("Luckiest Guy", "display",
    ["cute", "bold", "cartoon", "fun", "chunky", "loud", "impactful", "playful"],
    ["loud", "fun", "bold", "cartoon"],
    ["cartoon title", "fun poster", "kids heading", "game branding"],
    ["bold cartoon display", "loud fun personality"],
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

  dafont("Patrick Hand", "handwritten",
    ["cute", "handwritten", "casual", "personal", "friendly", "natural", "simple", "warm"],
    ["personal", "warm", "casual", "authentic"],
    ["personal blog", "casual heading", "friendly branding", "note style"],
    ["natural casual handwriting", "warm personal feel"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Shojumaru", "display",
    ["cute", "japanese", "bold", "rounded", "anime", "asian", "pop", "decorative"],
    ["bold", "japanese-pop", "decorative", "energetic"],
    ["anime poster", "japanese restaurant", "asian branding", "pop heading"],
    ["japanese-influenced rounded bold", "anime-pop energy"],
    // Also on Google Fonts
  ),

  dafont("Bangers", "display",
    ["cute", "comic", "bold", "loud", "impact", "cartoon", "action", "pop-art"],
    ["loud", "bold", "comic", "action-packed"],
    ["comic book", "action poster", "bold heading", "pop-art design"],
    ["bold comic-book display", "action-word styling"],
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

  dafont("Permanent Marker", "handwritten",
    ["brush", "marker", "bold", "casual", "hand-drawn", "thick", "whiteboard", "rough"],
    ["casual", "bold", "rough", "direct"],
    ["whiteboard", "casual heading", "DIY project", "bold note"],
    ["thick marker-style lettering", "whiteboard marker feel"],
    { serifSansCategory: "display" }
    // Also on Google Fonts
  ),

  dafont("Cabin Sketch", "display",
    ["brush", "sketch", "hand-drawn", "outline", "artistic", "double-stroke", "creative"],
    ["sketchy", "artistic", "creative", "hand-drawn"],
    ["creative heading", "art project", "sketch style", "indie brand"],
    ["sketchy double-stroke display", "hand-drawn outline style"],
    // Also on Google Fonts
  ),


  dafont("Chinese Rocks", "display",
    ["brush", "asian-inspired", "bold", "expressive", "inky", "calligraphy", "artistic"],
    ["bold", "expressive", "inky", "artistic"],
    ["asian-themed design", "ink art poster", "artistic heading"],
    ["asian-inspired brush display", "bold ink strokes"],
  ),

  dafont("Yellowtail", "script",
    ["brush", "retro", "script", "sign-painting", "vintage", "flowing", "casual", "warm"],
    ["retro", "warm", "casual", "sign-painted"],
    ["vintage sign", "retro branding", "warm heading", "casual logo"],
    ["retro sign-painter brush script", "vintage warmth"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  dafont("Blacksword", "display",
    ["brush", "bold", "aggressive", "calligraphy", "sharp", "dark", "dramatic", "thick"],
    ["dramatic", "dark", "aggressive", "powerful"],
    ["dark branding", "dramatic poster", "bold logo", "heavy heading"],
    ["bold aggressive brush calligraphy", "sword-like sharp terminals"],
  ),


  dafont("Adrenaline", "display",
    ["brush", "bold", "speed", "dynamic", "sports", "energetic", "fast", "italic"],
    ["energetic", "fast", "dynamic", "powerful"],
    ["sports brand", "extreme sports", "energy poster", "action heading"],
    ["speed-styled brush display", "dynamic athletic energy"],
  ),

  dafont("Vtks Animal 2", "display",
    ["brush", "wild", "organic", "expressive", "artistic", "bold", "natural", "raw"],
    ["wild", "organic", "expressive", "natural"],
    ["nature poster", "wild branding", "organic heading", "art exhibit"],
    ["wild organic brush forms", "animal-energy brush strokes"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Baron Neue", "display",
    ["brush", "modern", "thin", "uppercase", "clean", "elegant", "fashion", "minimal"],
    ["elegant", "modern", "clean", "sophisticated"],
    ["fashion brand", "modern heading", "clean poster", "elegant branding"],
    ["thin modern uppercase display", "fashion-forward elegance"],
  ),

  dafont("Kaushan Script", "script",
    ["brush", "script", "casual", "connected", "flowing", "lively", "modern", "friendly"],
    ["lively", "casual", "friendly", "warm"],
    ["casual brand", "friendly heading", "modern script logo", "social media"],
    ["casual connected brush script", "lively flowing strokes"],
    { serifSansCategory: "script" }
    // Also on Google Fonts
  ),

  // ─── ART DECO / NOUVEAU (~10) ───

  dafont("Metropolis 1920", "display",
    ["art-deco", "1920s", "geometric", "gatsby", "elegant", "vintage", "ornamental", "luxury"],
    ["elegant", "gatsby", "luxurious", "vintage"],
    ["gatsby party", "1920s event", "luxury brand", "art deco poster"],
    ["classic 1920s art deco display", "gatsby-era geometric elegance"],
  ),

  dafont("Poiret One", "display",
    ["art-deco", "thin", "geometric", "elegant", "fashion", "1920s", "refined", "decorative"],
    ["refined", "elegant", "delicate", "artistic"],
    ["fashion brand", "art gallery", "elegant heading", "luxury poster"],
    ["thin art deco geometric display", "fashion-forward elegance"],
    // Also on Google Fonts
  ),

  dafont("Cardo", "serif",
    ["art-deco", "serif", "classic", "elegant", "book", "traditional", "refined", "literary"],
    ["classic", "literary", "refined", "traditional"],
    ["book title", "literary heading", "classic branding", "editorial"],
    ["classic book-style serif", "literary elegance"],
    { serifSansCategory: "serif" }
    // Also on Google Fonts
  ),

  dafont("Vast Shadow", "display",
    ["art-deco", "shadow", "decorative", "bold", "vintage", "dimensional", "poster", "circus"],
    ["bold", "decorative", "dramatic", "vintage"],
    ["poster headline", "vintage circus", "decorative heading", "event"],
    ["bold shadow display type", "vintage poster dimensionality"],
    // Also on Google Fonts
  ),

  dafont("Broadway", "display",
    ["art-deco", "broadway", "theater", "bold", "glamorous", "showtime", "classic", "1930s"],
    ["glamorous", "theatrical", "bold", "show-stopping"],
    ["theater poster", "broadway event", "show heading", "glamour branding"],
    ["classic Broadway theater display", "show-business glamour"],
  ),






  // ─── SCI-FI / FUTURISTIC (~15) ───

  dafont("Orbitron", "display",
    ["sci-fi", "futuristic", "geometric", "space", "tech", "modern", "angular", "digital"],
    ["futuristic", "technological", "precise", "modern"],
    ["sci-fi movie", "tech brand", "space poster", "futuristic UI"],
    ["geometric space-age display", "orbital precision"],
    // Also on Google Fonts
  ),

  dafont("Audiowide", "display",
    ["sci-fi", "futuristic", "wide", "tech", "bold", "modern", "automotive", "racing"],
    ["futuristic", "bold", "tech", "automotive"],
    ["racing game", "tech brand", "automotive poster", "futuristic heading"],
    ["wide futuristic display", "automotive-tech aesthetic"],
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
  ),

  dafont("Starcraft", "display",
    ["sci-fi", "gaming", "futuristic", "bold", "tech", "space", "strategy", "military-sci-fi"],
    ["strategic", "powerful", "futuristic", "commanding"],
    ["strategy game", "sci-fi branding", "space military", "gaming poster"],
    ["military sci-fi display", "space command aesthetic"],
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

  dafont("Zero Hour", "display",
    ["sci-fi", "military", "stencil", "futuristic", "bold", "tactical", "countdown", "tech"],
    ["tactical", "urgent", "military-tech", "commanding"],
    ["military sci-fi", "countdown poster", "tactical game", "tech heading"],
    ["military-futuristic stencil display", "countdown urgency"],
  ),

  dafont("Galaxy", "display",
    ["sci-fi", "space", "glowing", "futuristic", "ethereal", "cosmic", "display", "wide"],
    ["cosmic", "ethereal", "vast", "glowing"],
    ["space poster", "cosmic event", "galaxy theme", "ethereal heading"],
    ["cosmic space display type", "galaxy-scale grandeur"],
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
  ),

  dafont("Kiona", "display",
    ["sci-fi", "modern", "geometric", "clean", "uppercase", "futuristic", "minimal", "sharp"],
    ["modern", "sharp", "clean", "futuristic"],
    ["modern brand", "clean heading", "futuristic poster", "minimal design"],
    ["sharp modern geometric display", "clean futuristic forms"],
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

  dafont("Creepster", "display",
    ["horror", "spooky", "halloween", "creepy", "dripping", "fun-horror", "seasonal", "dark"],
    ["spooky", "creepy", "fun-scary", "halloween"],
    ["halloween poster", "horror movie", "spooky event", "haunted house"],
    ["creepy dripping display", "fun-horror letterforms"],
    // Also on Google Fonts
  ),

  dafont("Nosifer", "display",
    ["horror", "vampire", "dark", "dripping", "blood", "gothic", "extreme", "nocturnal"],
    ["terrifying", "dark", "bloody", "nocturnal"],
    ["vampire movie", "horror poster", "dark event", "gothic heading"],
    ["blood-dripping vampire display", "nosferatu-inspired horror"],
    // Also on Google Fonts
  ),



  dafont("Feast of Flesh BB", "display",
    ["horror", "zombie", "rotting", "gore", "organic", "dark", "extreme", "decomposing"],
    ["gruesome", "decomposing", "visceral", "extreme"],
    ["zombie movie", "horror game", "extreme poster", "gore heading"],
    ["rotting zombie-flesh letterforms", "decomposition aesthetic"],
  ),


  dafont("Bloody", "display",
    ["horror", "blood", "dripping", "red", "dark", "splatter", "visceral", "gore"],
    ["bloody", "visceral", "shocking", "dark"],
    ["horror movie title", "blood-themed event", "dark poster", "gore heading"],
    ["blood-dripping letterforms", "splatter horror style"],
  ),

  dafont("Ghastly Panic", "display",
    ["horror", "panic", "scratchy", "chaotic", "dark", "unsettling", "distorted", "frantic"],
    ["panicked", "chaotic", "frantic", "unsettling"],
    ["horror game", "panic event", "dark heading", "psychological thriller"],
    ["frantic distorted horror display", "psychological terror"],
  ),

  dafont("Zombie Holocaust", "display",
    ["horror", "zombie", "apocalypse", "dark", "heavy", "extreme", "undead", "survival"],
    ["apocalyptic", "extreme", "brutal", "undead"],
    ["zombie game", "apocalypse poster", "survival horror", "dark event"],
    ["extreme zombie-apocalypse display", "undead survival aesthetic"],
  ),

  dafont("Grinched", "display",
    ["horror", "grinch", "christmas-dark", "whimsical", "quirky", "holiday", "mischievous"],
    ["mischievous", "quirky", "darkly-fun", "holiday"],
    ["dark christmas", "quirky holiday", "mischievous heading", "seasonal"],
    ["grinch-inspired quirky display", "dark whimsical holiday"],
  ),

  // ─── STENCIL / MILITARY (~10) ───

  dafont("Stencil", "display",
    ["stencil", "military", "industrial", "bold", "classic", "utilitarian", "army", "blocky"],
    ["military", "utilitarian", "strong", "industrial"],
    ["military poster", "industrial brand", "army heading", "bold statement"],
    ["classic military stencil display", "standard-issue aesthetic"],
  ),

  dafont("Army", "display",
    ["stencil", "military", "bold", "green", "army", "tactical", "heavy", "blocky"],
    ["military", "tactical", "strong", "commanding"],
    ["army branding", "military event", "tactical heading", "veteran"],
    ["army-style bold stencil", "military command presence"],
  ),

  dafont("Gunplay", "display",
    ["stencil", "military", "angular", "aggressive", "tactical", "sharp", "modern", "action"],
    ["aggressive", "tactical", "sharp", "modern-military"],
    ["action movie", "tactical game", "military poster", "aggressive heading"],
    ["angular military-action stencil", "modern tactical sharpness"],
  ),

  dafont("Stardos Stencil", "display",
    ["stencil", "vintage", "elegant", "serif", "classic", "refined", "decorative", "retro"],
    ["refined", "vintage", "elegant", "classic"],
    ["vintage poster", "elegant stencil", "classic heading", "refined brand"],
    ["elegant vintage serif stencil", "refined stencil forms"],
    // Also on Google Fonts
  ),

  dafont("Allerta Stencil", "display",
    ["stencil", "modern", "clean", "sans", "alert", "clear", "functional", "bold"],
    ["alert", "clear", "functional", "modern"],
    ["warning sign", "modern stencil", "clear heading", "functional design"],
    ["modern clean sans stencil", "alert functional clarity"],
    // Also on Google Fonts
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
  ),


  dafont("Over There", "display",
    ["stencil", "military", "vintage", "WWI", "WWII", "historic", "wartime", "propaganda"],
    ["historic", "wartime", "patriotic", "vintage-military"],
    ["wartime poster", "vintage military", "historic event", "propaganda style"],
    ["vintage wartime stencil", "wWI/WWII era military"],
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
  ),

  dafont("Rye", "display",
    ["western", "slab-serif", "vintage", "saloon", "bold", "decorative", "rustic", "frontier"],
    ["rustic", "frontier", "bold", "saloon"],
    ["saloon branding", "western poster", "frontier heading", "rustic event"],
    ["western saloon slab display", "frontier-town character"],
    // Also on Google Fonts
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
  ),


  dafont("Gallow Tree", "display",
    ["western", "dark-western", "horror-western", "grim", "frontier", "bold", "menacing"],
    ["grim", "dark", "menacing", "frontier"],
    ["dark western", "grim poster", "menacing heading", "horror-western"],
    ["dark western display", "gallows frontier darkness"],
  ),

  dafont("Outlaw", "display",
    ["western", "outlaw", "rough", "bold", "rugged", "frontier", "vintage", "lawless"],
    ["lawless", "rugged", "bold", "rough"],
    ["outlaw brand", "rough heading", "western event", "rugged poster"],
    ["rough outlaw western display", "lawless frontier character"],
  ),

  // ─── NEON / 80s (~10) ───

  dafont("Streamster", "script",
    ["neon", "80s", "script", "retro-future", "synthwave", "flowing", "chrome", "glowing"],
    ["retro-future", "synthwave", "glowing", "nostalgic"],
    ["synthwave poster", "80s party", "retro event", "neon heading"],
    ["80s neon script display", "synthwave glow aesthetic"],
    { serifSansCategory: "script" }
  ),

  dafont("Neon", "display",
    ["neon", "glowing", "sign", "bright", "night", "bar", "electric", "urban"],
    ["glowing", "electric", "nightlife", "bright"],
    ["neon sign", "nightclub", "bar branding", "bright poster"],
    ["classic neon tube display", "electric sign glow"],
  ),

  dafont("Outrun Future", "display",
    ["neon", "80s", "synthwave", "retro-future", "bold", "tech", "racing", "chrome"],
    ["retro-future", "fast", "bold", "synthwave"],
    ["synthwave poster", "retro racing", "80s event", "outrun game"],
    ["outrun-style retro future display", "80s racing aesthetic"],
  ),

  dafont("Lazer 84", "display",
    ["neon", "80s", "laser", "retro", "chrome", "angular", "synthwave", "sharp"],
    ["sharp", "80s", "laser", "retro-cool"],
    ["80s party", "laser theme", "retro poster", "synthwave event"],
    ["1984-era laser display", "sharp chrome angles"],
  ),




  dafont("Chrome", "display",
    ["neon", "chrome", "metallic", "80s", "shiny", "reflective", "bold", "heavy"],
    ["shiny", "metallic", "bold", "impressive"],
    ["80s poster", "chrome branding", "metallic heading", "bold event"],
    ["chrome metallic display", "80s shiny metal aesthetic"],
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
  ),

  dafont("Blackout", "display",
    ["display", "bold", "heavy", "block", "solid", "minimal", "modern", "fill"],
    ["bold", "modern", "minimal", "heavy"],
    ["poster", "bold heading", "modern branding", "strong statement"],
    ["ultra-heavy solid block letters", "no-nonsense bold display"],
    { designer: "Tyler Finck" }
  ),

  dafont("Baumans", "display",
    ["display", "geometric", "modern", "tech", "clean", "futuristic", "digital"],
    ["futuristic", "clean", "tech", "modern"],
    ["tech branding", "futuristic poster", "digital display", "modern heading"],
    ["geometric futuristic display", "clean tech letterforms"],
  ),

  dafont("Megrim", "display",
    ["display", "thin", "geometric", "art-deco", "elegant", "angular", "fashion", "modern"],
    ["elegant", "modern", "angular", "refined"],
    ["fashion branding", "art-deco poster", "modern editorial", "elegant heading"],
    ["thin geometric art-deco display", "angular elegant forms"],
  ),

  dafont("Nova Square", "display",
    ["display", "geometric", "square", "modern", "tech", "angular", "digital", "grid"],
    ["modern", "technical", "precise", "digital"],
    ["tech UI", "digital display", "modern branding", "geometric heading"],
    ["square geometric display letterforms", "grid-based digital design"],
  ),

  dafont("Bungee", "display",
    ["display", "bold", "signage", "urban", "layered", "heavy", "vertical", "modern"],
    ["bold", "urban", "energetic", "impactful"],
    ["signage", "urban branding", "bold poster", "vertical display"],
    ["vertical signage display", "urban layered bold design"],
    { designer: "David Jonathan Ross" }
  ),

  // ─── SCRIPT / HANDWRITING (additional) ───

  dafont("Cookie", "handwritten",
    ["script", "casual", "brush", "retro", "friendly", "warm", "vintage", "sign"],
    ["warm", "friendly", "retro", "casual"],
    ["bakery branding", "casual invite", "friendly heading", "vintage sign"],
    ["casual retro brush script", "warm friendly sign-painter feel"],
  ),

  dafont("Clicker Script", "handwritten",
    ["script", "elegant", "formal", "flowing", "calligraphy", "connected", "classic"],
    ["elegant", "formal", "classic", "refined"],
    ["formal invitation", "wedding card", "elegant heading", "classical event"],
    ["formal flowing calligraphic script", "classic connected elegance"],
  ),

  dafont("Italianno", "handwritten",
    ["script", "elegant", "Italian", "flowing", "calligraphy", "thin", "romantic"],
    ["elegant", "romantic", "flowing", "mediterranean"],
    ["italian restaurant", "elegant branding", "romantic heading", "fine dining"],
    ["elegant Italian-inspired calligraphy", "flowing romantic thin script"],
  ),

  dafont("Norican", "handwritten",
    ["script", "brush", "casual", "flowing", "warm", "friendly", "sign-painter"],
    ["warm", "casual", "friendly", "inviting"],
    ["casual branding", "friendly sign", "warm heading", "cafe menu"],
    ["casual sign-painter brush script", "warm flowing letterforms"],
  ),

  dafont("Rouge Script", "handwritten",
    ["script", "elegant", "French", "calligraphy", "thin", "romantic", "classic"],
    ["elegant", "French", "romantic", "refined"],
    ["french branding", "elegant invite", "romantic heading", "bistro menu"],
    ["french-inspired elegant thin script", "classic romantic calligraphy"],
  ),

  dafont("Tangerine", "handwritten",
    ["script", "calligraphy", "elegant", "thin", "formal", "ornate", "wedding"],
    ["elegant", "formal", "delicate", "ornate"],
    ["wedding invitation", "formal card", "elegant certificate", "luxury heading"],
    ["delicate formal calligraphic script", "ornate wedding-style elegance"],
  ),

  dafont("Bromello", "handwritten",
    ["script", "brush", "modern", "feminine", "flowing", "casual", "trendy"],
    ["modern", "feminine", "trendy", "soft"],
    ["fashion brand", "beauty blog", "social media", "modern wedding"],
    ["modern brush script", "trendy feminine flow"],
  ),

  dafont("Mr Dafoe", "handwritten",
    ["script", "brush", "bold", "dramatic", "expressive", "dynamic", "artistic"],
    ["dramatic", "expressive", "bold", "artistic"],
    ["dramatic heading", "artistic branding", "bold statement", "expressive poster"],
    ["bold dramatic brush script", "expressive dynamic strokes"],
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
  ),

  dafont("VT323", "display",
    ["pixel", "retro", "terminal", "monospace", "hacker", "green-screen", "computer", "80s"],
    ["retro", "technical", "hacker", "digital"],
    ["terminal UI", "retro computing", "hacker aesthetic", "vintage screen"],
    ["vT320 terminal pixel font", "vintage green-screen computer feel"],
  ),

  dafont("Share Tech Mono", "display",
    ["pixel", "monospace", "tech", "terminal", "clean", "coding", "digital", "modern"],
    ["technical", "clean", "digital", "precise"],
    ["code display", "tech dashboard", "terminal UI", "developer tool"],
    ["clean tech monospace", "modern terminal-style design"],
    { serifSansCategory: "monospace" }
  ),

  // ─── GOTHIC / BLACKLETTER (additional) ───

  dafont("MedievalSharp", "display",
    ["gothic", "medieval", "sharp", "fantasy", "RPG", "angular", "historical", "dark"],
    ["medieval", "sharp", "dark", "fantasy"],
    ["rPG game", "medieval event", "fantasy poster", "historical heading"],
    ["sharp medieval gothic display", "angular fantasy letterforms"],
  ),

  dafont("Pirata One", "display",
    ["gothic", "pirate", "blackletter", "adventure", "nautical", "bold", "decorative"],
    ["adventurous", "bold", "dramatic", "swashbuckling"],
    ["pirate theme", "adventure game", "nautical branding", "bold gothic heading"],
    ["pirate-inspired blackletter", "adventurous nautical gothic"],
  ),

  dafont("New Rocker", "display",
    ["gothic", "blackletter", "rock", "bold", "metal", "dark", "aggressive", "modern"],
    ["aggressive", "dark", "bold", "rock"],
    ["rock band", "metal poster", "dark branding", "gothic rock heading"],
    ["modern rock-inspired blackletter", "bold aggressive gothic display"],
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
  ),

  dafont("Minster", "display",
    ["gothic", "blackletter", "clean", "modern", "bold", "strong", "dark", "readable"],
    ["strong", "dark", "bold", "commanding"],
    ["heavy metal", "dark branding", "gothic poster", "strong heading"],
    ["bold modern blackletter", "strong commanding gothic forms"],
  ),

  // ─── SANS-SERIF (additional) ───

  dafont("Aldrich", "sans-serif",
    ["sans-serif", "geometric", "tech", "modern", "clean", "digital", "industrial"],
    ["technical", "modern", "clean", "industrial"],
    ["tech branding", "industrial design", "modern UI", "digital heading"],
    ["geometric industrial sans-serif", "clean technical digital design"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Electrolize", "sans-serif",
    ["sans-serif", "tech", "futuristic", "digital", "clean", "modern", "sharp"],
    ["futuristic", "digital", "sharp", "modern"],
    ["tech startup", "futuristic UI", "digital branding", "sharp heading"],
    ["futuristic digital sans-serif", "sharp tech-forward design"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Jura", "sans-serif",
    ["sans-serif", "light", "modern", "clean", "tech", "minimal", "elegant"],
    ["light", "modern", "elegant", "minimal"],
    ["minimal branding", "light heading", "modern UI", "elegant tech"],
    ["light elegant modern sans-serif", "clean minimal letterforms"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Saira", "sans-serif",
    ["sans-serif", "geometric", "modern", "versatile", "clean", "professional", "wide"],
    ["professional", "modern", "versatile", "clean"],
    ["professional branding", "modern heading", "versatile UI", "corporate design"],
    ["versatile geometric sans-serif", "professional modern design"],
    { serifSansCategory: "sans-serif" }
  ),

  dafont("Kanit", "sans-serif",
    ["sans-serif", "modern", "Thai", "geometric", "clean", "versatile", "round"],
    ["modern", "clean", "versatile", "friendly"],
    ["modern branding", "clean heading", "versatile UI", "friendly design"],
    ["modern geometric sans-serif", "thai-Latin versatile design"],
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

  dafont("Playfair Display", "serif",
    ["serif", "elegant", "high-contrast", "display", "modern", "transitional", "stylish", "editorial"],
    ["elegant", "stylish", "modern", "sophisticated"],
    ["fashion magazine", "luxury branding", "elegant heading", "editorial"],
    ["high-contrast transitional display serif", "modern editorial elegance"],
    { serifSansCategory: "serif" }
  ),

  dafont("Cormorant", "serif",
    ["serif", "elegant", "display", "high-contrast", "refined", "Garamond-like", "classical", "literary"],
    ["refined", "classical", "elegant", "literary"],
    ["book cover", "literary magazine", "elegant branding", "classical heading"],
    ["refined Garamond-inspired display serif", "classical literary elegance"],
    { serifSansCategory: "serif" }
  ),

  dafont("Crimson Text", "serif",
    ["serif", "elegant", "readable", "book", "old-style", "warm", "classic", "body"],
    ["elegant", "readable", "warm", "classic"],
    ["body text", "book design", "long-form reading", "elegant content"],
    ["elegant old-style book serif", "warm readable text design"],
    { serifSansCategory: "serif" }
  ),

  // ─── STENCIL / MILITARY (additional) ───

  dafont("Bungee Inline", "display",
    ["stencil", "inline", "bold", "signage", "urban", "layered", "modern", "display"],
    ["bold", "urban", "modern", "graphic"],
    ["urban signage", "modern poster", "bold branding", "inline heading"],
    ["inline signage stencil display", "modern urban layered design"],
    { designer: "David Jonathan Ross" }
  ),

  dafont("Major Mono Display", "display",
    ["stencil", "monospace", "modern", "minimal", "geometric", "experimental", "display"],
    ["experimental", "modern", "minimal", "avant-garde"],
    ["experimental design", "modern branding", "minimal poster", "avant-garde heading"],
    ["experimental monospace stencil display", "minimal geometric construction"],
  ),

  dafont("Saginaw", "display",
    ["stencil", "military", "bold", "industrial", "structured", "utilitarian", "clean"],
    ["military", "structured", "clean", "strong"],
    ["military branding", "industrial heading", "structured poster", "utilitarian design"],
    ["clean military stencil display", "structured bold industrial forms"],
  ),

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

  dafont("Dokdo", "display",
    ["grunge", "brush", "rough", "Asian", "expressive", "artistic", "raw", "bold"],
    ["expressive", "raw", "artistic", "bold"],
    ["artistic poster", "expressive heading", "raw branding", "bold statement"],
    ["rough expressive brush display", "raw artistic Korean influence"],
  ),

  // ─── ADDITIONAL DISPLAY ───

  dafont("Black Ops One", "display",
    ["display", "military", "bold", "heavy", "stencil-like", "strong", "action", "tactical"],
    ["military", "bold", "strong", "tactical"],
    ["action movie", "military branding", "game title", "tactical heading"],
    ["military-inspired bold display", "heavy action tactical letterforms"],
  ),

  dafont("Contrail One", "display",
    ["display", "condensed", "aviation", "speed", "dynamic", "modern", "sharp", "racing"],
    ["dynamic", "fast", "modern", "sharp"],
    ["aviation branding", "racing poster", "speed heading", "dynamic display"],
    ["aviation-inspired condensed display", "dynamic speed letterforms"],
  ),

  dafont("Michroma", "display",
    ["display", "geometric", "futuristic", "tech", "wide", "modern", "digital", "space"],
    ["futuristic", "tech", "wide", "modern"],
    ["tech branding", "space theme", "futuristic heading", "wide display"],
    ["wide geometric futuristic display", "tech space-age letterforms"],
  ),

  dafont("Passero One", "display",
    ["display", "bold", "heavy", "vintage", "advertising", "retro", "warm", "rounded"],
    ["vintage", "warm", "bold", "friendly"],
    ["vintage advertising", "retro poster", "warm heading", "bold display"],
    ["heavy vintage advertising display", "warm retro rounded forms"],
  ),

  // ─── ADDITIONAL DISPLAY FONTS (replacements for Google Fonts overlaps) ───

  dafont("Vtks Giz", "display",
    ["grunge", "rough", "heavy", "distressed", "urban", "textured"],
    ["edgy", "raw", "urban", "bold"],
    ["poster", "band logo", "streetwear", "album art"],
    ["heavily distressed display", "urban grit texture"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Vtks Animal 2", "display",
    ["grunge", "distressed", "rough", "decorative", "aggressive"],
    ["wild", "raw", "aggressive", "fierce"],
    ["concert poster", "punk flyer", "streetwear", "extreme sports"],
    ["wild aggressive distressed forms", "animal-energy rough lettering"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Vtks Bright", "display",
    ["decorative", "bright", "expressive", "fun", "display"],
    ["fun", "bright", "expressive", "cheerful"],
    ["party flyer", "fun poster", "event heading", "celebration"],
    ["bright expressive display", "fun celebratory lettering"],
    { designer: "Douglas Vitkauskas" }
  ),

  dafont("Beyond Wonderland", "display",
    ["fantasy", "whimsical", "decorative", "storybook", "magical", "ornate"],
    ["whimsical", "magical", "dreamy", "enchanting"],
    ["children book", "fantasy theme", "fairy tale", "magical branding"],
    ["whimsical storybook letterforms", "alice-inspired decorative display"],
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

  dafont("Tall Dark And Handsome", "display",
    ["condensed", "tall", "elegant", "narrow", "modern", "fashion"],
    ["elegant", "sophisticated", "modern", "striking"],
    ["fashion editorial", "luxury branding", "tall headline", "magazine"],
    ["ultra-condensed elegant display", "fashion-forward narrow forms"],
  ),

  dafont("Champagne And Limousines", "sans-serif",
    ["thin", "light", "elegant", "minimal", "clean", "modern"],
    ["elegant", "refined", "minimal", "delicate"],
    ["wedding invitation", "luxury branding", "elegant heading", "beauty"],
    ["ultra-thin elegant sans", "refined minimalist letterforms"],
  ),

  dafont("Intro", "sans-serif",
    ["geometric", "modern", "clean", "bold", "display", "structured"],
    ["modern", "bold", "clean", "confident"],
    ["startup branding", "modern heading", "tech display", "bold title"],
    ["geometric modern display sans", "bold structured letterforms"],
  ),

  dafont("Adam", "sans-serif",
    ["geometric", "futuristic", "modern", "sharp", "angular", "tech"],
    ["futuristic", "sharp", "modern", "technical"],
    ["tech branding", "sci-fi poster", "modern heading", "futuristic display"],
    ["sharp angular geometric sans", "futuristic technical display"],
  ),

  dafont("Nexa", "sans-serif",
    ["geometric", "modern", "clean", "versatile", "professional"],
    ["professional", "modern", "clean", "versatile"],
    ["corporate heading", "modern branding", "clean display", "business"],
    ["clean geometric modern sans", "professional versatile display"],
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

  dafont("Valentina", "script",
    ["script", "elegant", "romantic", "calligraphic", "flowing", "wedding"],
    ["romantic", "elegant", "graceful", "feminine"],
    ["wedding invitation", "romantic branding", "beauty label", "love card"],
    ["romantic flowing calligraphic script", "elegant wedding letterforms"],
  ),

  dafont("Streetwear", "display",
    ["urban", "street", "bold", "fashion", "hip-hop", "modern"],
    ["bold", "urban", "trendy", "confident"],
    ["streetwear brand", "hip-hop poster", "urban fashion", "bold heading"],
    ["bold urban streetwear display", "fashion-forward street lettering"],
  ),

  dafont("Playlist", "script",
    ["brush", "casual", "handwritten", "artistic", "dynamic", "flowing"],
    ["casual", "artistic", "dynamic", "fresh"],
    ["lifestyle brand", "casual heading", "art blog", "creative title"],
    ["dynamic brush script", "casual artistic hand-lettering"],
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
  ),

  dafont("Selima", "script",
    ["brush", "natural", "organic", "handwritten", "flowing", "casual"],
    ["natural", "organic", "warm", "personal"],
    ["natural brand", "organic product", "lifestyle blog", "personal brand"],
    ["natural organic brush script", "warm flowing hand-lettering"],
  ),

  dafont("Brittany Signature", "script",
    ["signature", "personal", "elegant", "flowing", "handwritten"],
    ["personal", "elegant", "intimate", "refined"],
    ["personal brand", "signature logo", "fashion label", "luxury card"],
    ["elegant personal signature script", "refined flowing lettering"],
  ),

  dafont("Seaside Resort", "display",
    ["retro", "vintage", "tropical", "fun", "beach", "casual", "summer"],
    ["fun", "tropical", "retro", "cheerful"],
    ["beach resort", "tropical theme", "summer poster", "vacation branding"],
    ["retro tropical beach display", "summer vacation lettering"],
  ),

  dafont("Carbon Block", "display",
    ["heavy", "block", "bold", "industrial", "stencil", "strong"],
    ["industrial", "strong", "heavy", "commanding"],
    ["industrial branding", "heavy headline", "military style", "bold display"],
    ["heavy industrial block display", "strong commanding letterforms"],
  ),

  dafont("Pricedown", "display",
    ["retro", "advertising", "bold", "fun", "signage", "70s"],
    ["fun", "retro", "bold", "playful"],
    ["retro advertising", "game title", "fun heading", "signage"],
    ["retro advertising display", "bold fun signage lettering"],
  ),

  dafont("Vogue", "display",
    ["fashion", "elegant", "thin", "modern", "luxury", "editorial"],
    ["elegant", "luxurious", "modern", "refined"],
    ["fashion magazine", "luxury editorial", "beauty heading", "high-end"],
    ["thin elegant fashion display", "luxury editorial letterforms"],
  ),

  dafont("College", "display",
    ["college", "varsity", "sports", "bold", "block", "american"],
    ["athletic", "bold", "traditional", "energetic"],
    ["sports team", "college branding", "varsity heading", "athletic display"],
    ["classic varsity block display", "american college letterforms"],
  ),

  dafont("Agency FB", "sans-serif",
    ["condensed", "narrow", "modern", "sharp", "professional", "technical"],
    ["professional", "sharp", "modern", "technical"],
    ["agency branding", "corporate heading", "technical display", "modern title"],
    ["condensed professional agency sans", "sharp modern narrow display"],
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

  dafont("Franchise", "display",
    ["bold", "condensed", "industrial", "strong", "modern", "tight"],
    ["bold", "industrial", "strong", "direct"],
    ["movie poster", "industrial heading", "bold display", "strong title"],
    ["bold condensed industrial display", "strong tight letterforms"],
  ),

  dafont("Existence", "sans-serif",
    ["stencil", "modern", "clean", "geometric", "light", "minimal"],
    ["modern", "minimal", "clean", "airy"],
    ["modern branding", "stencil heading", "minimal display", "clean title"],
    ["modern stencil-style sans", "clean geometric light display"],
  ),

  dafont("Baron Neue", "sans-serif",
    ["geometric", "uppercase", "modern", "bold", "display", "structured"],
    ["bold", "modern", "geometric", "architectural"],
    ["architecture branding", "bold heading", "modern display", "structured title"],
    ["bold geometric uppercase display", "architectural modern sans"],
  ),

  dafont("Gobold", "display",
    ["bold", "geometric", "modern", "sharp", "display", "strong"],
    ["bold", "sharp", "modern", "striking"],
    ["sports heading", "bold display", "modern title", "dynamic branding"],
    ["bold sharp geometric display", "modern striking letterforms"],
  ),

  dafont("Bebas Kai", "sans-serif",
    ["condensed", "tall", "modern", "clean", "display", "narrow"],
    ["modern", "clean", "tall", "direct"],
    ["poster heading", "modern display", "tall title", "clean branding"],
    ["tall condensed modern display sans", "clean narrow letterforms"],
  ),

  dafont("Lovelo", "sans-serif",
    ["geometric", "modern", "line", "decorative", "light", "inline"],
    ["modern", "light", "decorative", "stylish"],
    ["fashion branding", "decorative heading", "modern display", "stylish title"],
    ["geometric inline decorative sans", "modern light display letterforms"],
  ),

  dafont("Bukhari Script", "script",
    ["brush", "bold", "casual", "dynamic", "hand-lettered", "thick"],
    ["bold", "dynamic", "casual", "energetic"],
    ["food branding", "casual heading", "hand-lettered logo", "dynamic title"],
    ["bold dynamic brush script", "thick casual hand-lettering"],
  ),

  dafont("Ostrich Sans", "sans-serif",
    ["ultra-thin", "tall", "condensed", "modern", "minimal", "elegant"],
    ["minimal", "elegant", "tall", "delicate"],
    ["fashion heading", "minimal branding", "elegant display", "light title"],
    ["ultra-thin tall condensed sans", "minimal elegant display"],
  ),

  dafont("Brownhill Script", "script",
    ["signature", "elegant", "flowing", "personal", "calligraphic"],
    ["elegant", "personal", "refined", "romantic"],
    ["wedding heading", "personal brand", "elegant card", "signature logo"],
    ["elegant signature calligraphic script", "personal refined lettering"],
  ),

  dafont("Nordic", "display",
    ["runic", "viking", "angular", "bold", "historical", "norse"],
    ["bold", "ancient", "powerful", "mystical"],
    ["viking branding", "nordic game", "historical heading", "mythology"],
    ["bold runic Viking-inspired display", "norse angular letterforms"],
  ),

  dafont("Gidolinya", "script",
    ["elegant", "flowing", "calligraphic", "romantic", "ornate"],
    ["romantic", "elegant", "ornate", "dreamy"],
    ["wedding card", "romantic heading", "elegant invitation", "beauty"],
    ["ornate flowing calligraphic script", "romantic elegant lettering"],
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

  dafont("Streamster", "script",
    ["retro", "casual", "flowing", "vintage", "handwritten", "brush"],
    ["retro", "casual", "fun", "vintage"],
    ["retro branding", "casual heading", "vintage poster", "fun display"],
    ["retro casual flowing script", "vintage brush hand-lettering"],
  ),

  dafont("Gagalin", "display",
    ["rounded", "bold", "fun", "friendly", "playful", "chunky"],
    ["fun", "friendly", "bold", "cheerful"],
    ["kids brand", "fun heading", "game title", "friendly display"],
    ["rounded bold friendly display", "chunky playful letterforms"],
  ),

  dafont("Geared Slab", "display",
    ["slab-serif", "mechanical", "industrial", "strong", "bold"],
    ["industrial", "strong", "mechanical", "robust"],
    ["industrial branding", "mechanical heading", "strong display", "craft beer"],
    ["mechanical industrial slab display", "strong geared letterforms"],
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

  dafont("Baloo Da", "display",
    ["rounded", "chunky", "playful", "friendly", "bold", "warm"],
    ["playful", "friendly", "warm", "bold"],
    ["kids branding", "playful heading", "friendly display", "warm title"],
    ["chunky rounded playful display", "warm friendly bold lettering"],
  ),

  dafont("Timber", "display",
    ["rustic", "wood", "rough", "outdoor", "natural", "western"],
    ["rustic", "natural", "rough", "outdoorsy"],
    ["outdoor brand", "rustic heading", "camping poster", "natural display"],
    ["rustic wood-textured display", "outdoor natural letterforms"],
  ),

  dafont("Typograph Pro", "serif",
    ["elegant", "classic", "editorial", "refined", "traditional"],
    ["elegant", "classic", "refined", "literary"],
    ["editorial heading", "classic branding", "literary magazine", "refined display"],
    ["elegant classic editorial serif", "refined traditional display"],
  ),

  dafont("Metropolis 1920", "display",
    ["art-deco", "1920s", "geometric", "vintage", "glamour", "ornate"],
    ["glamorous", "vintage", "geometric", "luxurious"],
    ["art deco branding", "gatsby theme", "vintage poster", "luxury heading"],
    ["art Deco geometric vintage display", "1920s glamour letterforms"],
  ),

  dafont("Hamurz", "display",
    ["rough", "brush", "bold", "urban", "textured", "handmade"],
    ["rough", "bold", "urban", "authentic"],
    ["urban poster", "rough heading", "bold branding", "textured display"],
    ["rough bold brush display", "urban textured hand-lettering"],
  ),

  dafont("Masterblush", "script",
    ["calligraphy", "ornate", "elegant", "classic", "formal", "swash"],
    ["ornate", "classic", "elegant", "formal"],
    ["formal invitation", "ornate heading", "classic branding", "elegant card"],
    ["ornate formal calligraphic script", "classic swash lettering"],
  ),

  dafont("Anke", "sans-serif",
    ["geometric", "minimal", "modern", "clean", "swiss", "neutral"],
    ["minimal", "clean", "neutral", "modern"],
    ["minimal branding", "clean heading", "modern display", "neutral title"],
    ["clean minimal geometric sans", "swiss-inspired neutral display"],
  ),

  dafont("Bernier", "display",
    ["vintage", "distressed", "label", "retro", "worn", "americana"],
    ["vintage", "worn", "nostalgic", "americana"],
    ["vintage label", "retro heading", "americana branding", "worn display"],
    ["vintage distressed label display", "worn americana letterforms"],
  ),

  dafont("Mosk", "sans-serif",
    ["thin", "modern", "geometric", "clean", "multi-weight", "versatile"],
    ["modern", "clean", "versatile", "elegant"],
    ["modern branding", "clean heading", "versatile display", "elegant title"],
    ["thin modern geometric sans", "clean versatile multi-weight display"],
  ),

  dafont("Nickainley", "script",
    ["monoline", "vintage", "casual", "retro", "hand-lettered"],
    ["vintage", "casual", "retro", "authentic"],
    ["vintage logo", "retro branding", "casual heading", "hand-lettered title"],
    ["monoline vintage casual script", "retro hand-lettered display"],
  ),

  dafont("Perfograma", "display",
    ["dot-matrix", "retro", "technical", "digital", "perforated"],
    ["retro", "technical", "digital", "nostalgic"],
    ["retro tech", "vintage computer", "dot-matrix heading", "technical display"],
    ["dot-matrix perforated display", "retro technical letterforms"],
  ),

  dafont("Silvana", "script",
    ["brush", "bold", "dynamic", "hand-lettered", "energetic"],
    ["dynamic", "bold", "energetic", "expressive"],
    ["dynamic heading", "bold branding", "energetic display", "brush title"],
    ["bold dynamic brush script", "energetic hand-lettered display"],
  ),

  dafont("Reckoner", "sans-serif",
    ["condensed", "modern", "clean", "narrow", "professional"],
    ["professional", "modern", "clean", "structured"],
    ["professional heading", "modern display", "clean branding", "narrow title"],
    ["condensed modern professional sans", "clean narrow structured display"],
  ),

  dafont("Qontra", "display",
    ["futuristic", "angular", "tech", "sharp", "modern", "digital"],
    ["futuristic", "sharp", "digital", "cutting-edge"],
    ["tech heading", "futuristic branding", "digital display", "sci-fi title"],
    ["angular futuristic tech display", "sharp digital letterforms"],
  ),

  dafont("Portico", "display",
    ["condensed", "architectural", "tall", "structured", "modern"],
    ["architectural", "structured", "tall", "modern"],
    ["architecture heading", "structured display", "modern branding", "tall title"],
    ["architectural condensed display", "structured tall letterforms"],
  ),

  dafont("Hagin", "script",
    ["vintage", "ornate", "decorative", "hand-drawn", "retro"],
    ["vintage", "ornate", "decorative", "charming"],
    ["vintage branding", "ornate heading", "retro display", "decorative title"],
    ["vintage ornate hand-drawn script", "decorative retro lettering"],
  ),

  dafont("Summer Hearts", "script",
    ["brush", "casual", "fun", "summer", "handwritten", "warm"],
    ["fun", "warm", "casual", "summery"],
    ["summer branding", "fun heading", "casual display", "warm title"],
    ["casual summer brush script", "warm fun hand-lettering"],
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
  ),

  dafont("Canter", "sans-serif",
    ["bold", "3d", "shadow", "modern", "display", "strong"],
    ["bold", "modern", "strong", "impactful"],
    ["bold heading", "modern branding", "3d display", "strong title"],
    ["bold 3D shadow display sans", "modern strong impactful letterforms"],
  ),

  dafont("Rainwood", "script",
    ["brush", "natural", "organic", "handwritten", "flowing"],
    ["natural", "organic", "calm", "authentic"],
    ["organic brand", "natural heading", "calm display", "earthy title"],
    ["natural organic brush script", "calm flowing hand-lettering"],
  ),

  dafont("Norwester", "sans-serif",
    ["condensed", "bold", "modern", "geometric", "strong", "clean"],
    ["bold", "modern", "strong", "clean"],
    ["bold heading", "modern branding", "strong display", "clean title"],
    ["bold condensed geometric sans", "strong modern clean display"],
  ),

  dafont("Arcon", "sans-serif",
    ["rounded", "modern", "clean", "friendly", "soft", "versatile"],
    ["friendly", "modern", "clean", "approachable"],
    ["friendly branding", "modern heading", "clean display", "soft title"],
    ["rounded modern friendly sans", "clean approachable soft display"],
  ),

  dafont("Modeka", "display",
    ["art-nouveau", "decorative", "vintage", "ornate", "elegant"],
    ["vintage", "ornate", "elegant", "artistic"],
    ["vintage branding", "art-nouveau heading", "ornate display", "elegant title"],
    ["art Nouveau decorative display", "ornate vintage elegant letterforms"],
  ),

  dafont("Notera", "script",
    ["calligraphy", "flowing", "elegant", "personal", "handwritten"],
    ["elegant", "personal", "flowing", "intimate"],
    ["personal branding", "elegant heading", "flowing display", "intimate title"],
    ["elegant flowing calligraphic script", "personal intimate hand-lettering"],
  ),

  dafont("Braxton", "script",
    ["handwritten", "casual", "personal", "natural", "simple"],
    ["casual", "natural", "personal", "relaxed"],
    ["casual brand", "personal heading", "natural display", "simple title"],
    ["casual personal handwritten script", "natural simple hand-lettering"],
  ),

  dafont("Cheddar Gothic", "display",
    ["heavy", "bold", "industrial", "condensed", "strong", "modern"],
    ["bold", "industrial", "strong", "powerful"],
    ["industrial branding", "heavy heading", "strong display", "powerful title"],
    ["heavy industrial condensed display", "bold strong powerful letterforms"],
  ),

  dafont("Debby", "script",
    ["brush", "casual", "fun", "handwritten", "playful", "thick"],
    ["fun", "casual", "playful", "bold"],
    ["fun branding", "casual heading", "playful display", "bold title"],
    ["thick casual brush script", "fun playful hand-lettering"],
  ),

  dafont("Mightype", "script",
    ["brush", "bold", "dynamic", "modern", "handmade"],
    ["dynamic", "bold", "modern", "energetic"],
    ["dynamic heading", "bold branding", "modern display", "energetic title"],
    ["bold dynamic modern brush script", "energetic handmade lettering"],
  ),

  dafont("Alcubierre", "sans-serif",
    ["geometric", "futuristic", "minimal", "space", "thin", "modern"],
    ["futuristic", "minimal", "modern", "clean"],
    ["space branding", "futuristic heading", "minimal display", "modern title"],
    ["geometric futuristic minimal sans", "thin space-age modern display"],
  ),

  dafont("Ailerons", "sans-serif",
    ["aviation", "retro", "art-deco", "geometric", "elegant", "1930s"],
    ["retro", "elegant", "geometric", "aviation"],
    ["aviation branding", "retro heading", "art-deco display", "elegant title"],
    ["aviation-inspired art-deco sans", "retro geometric elegant display"],
  ),

];

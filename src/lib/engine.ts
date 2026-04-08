import { fonts, fontsById } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
import { Font, FontPair, ScoredPair, StyleSignals } from "@/data/types";
import { SYNONYM_MAP } from "@/data/adjective-expansion";
import { SYNONYM_BATCH3 } from "@/data/adjective-batch3";

// Merge synonym maps
const ALL_SYNONYMS: Record<string, string[]> = { ...SYNONYM_MAP, ...SYNONYM_BATCH3 };

// ══════════════════════════════════════════
// TYPO-TOLERANT EDIT DISTANCE
// ══════════════════════════════════════════
// Levenshtein distance — used for fuzzy matching of misspelled keywords and font names
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const curr = [i];
    for (let j = 1; j <= lb; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[lb];
}

// Max allowed edit distance based on word length
function maxTypoDistance(word: string): number {
  if (word.length <= 3) return 0; // too short for typo matching
  if (word.length <= 5) return 1;
  return 2;
}

// ══════════════════════════════════════════
// FUZZY KEYWORD MATCHING
// ══════════════════════════════════════════
// Maps prompt words (including variations/stems) → desired font tags.
// Every plausible form of a word should be here.

const KEYWORD_WANT: Record<string, string[]> = {
  // Grunge / punk / edgy
  grunge: ["grunge", "raw", "edgy", "distressed", "alternative", "punk", "rebellious", "handwritten", "typewriter", "messy"],
  grungy: ["grunge", "raw", "edgy", "distressed", "alternative", "punk", "rebellious", "messy"],
  punk: ["punk", "grunge", "raw", "edgy", "rebellious", "alternative", "bold", "distressed"],
  punky: ["punk", "grunge", "raw", "edgy", "rebellious"],
  edgy: ["edgy", "bold", "grunge", "alternative", "raw", "distinctive", "rebellious", "urban", "dark"],
  alternative: ["alternative", "grunge", "edgy", "raw", "punk", "indie", "distinctive"],
  alt: ["alternative", "grunge", "edgy", "raw", "indie"],
  rebel: ["rebellious", "edgy", "grunge", "punk", "raw", "alternative", "bold"],
  rebellious: ["rebellious", "edgy", "grunge", "punk", "raw", "bold"],
  raw: ["raw", "grunge", "edgy", "handwritten", "distressed", "punk", "alternative"],
  messy: ["raw", "grunge", "distressed", "handwritten", "chaotic", "edgy", "punk"],
  chaotic: ["glitch", "edgy", "bold", "raw", "distressed", "punk", "rebellious", "chaotic"],
  distressed: ["distressed", "grunge", "raw", "vintage", "worn", "typewriter"],
  trashy: ["grunge", "raw", "edgy", "punk", "distressed", "bold"],
  dirty: ["grunge", "raw", "distressed", "edgy", "punk"],

  // Girly / feminine / cute / pop
  girly: ["girly", "feminine", "cute", "playful", "fun", "bubbly", "script", "romantic", "pop"],
  girlypop: ["girly", "feminine", "cute", "playful", "fun", "bubbly", "pop", "bold", "youthful"],
  "girly pop": ["girly", "feminine", "cute", "playful", "fun", "bubbly", "pop", "bold"],
  feminine: ["feminine", "girly", "elegant", "romantic", "delicate", "script", "beauty", "charming"],
  cute: ["cute", "bubbly", "playful", "fun", "girly", "rounded", "friendly", "pop", "kawaii"],
  kawaii: ["kawaii", "cute", "bubbly", "rounded", "playful", "girly", "fun", "japanese"],
  pop: ["pop", "bold", "fun", "bubbly", "playful", "energetic", "vibrant", "girly", "loud"],
  poppy: ["pop", "bold", "fun", "bubbly", "playful", "energetic", "vibrant"],
  bubbly: ["bubbly", "rounded", "fun", "playful", "cute", "pop", "girly", "friendly"],
  pastel: ["soft", "feminine", "delicate", "cute", "girly", "friendly", "light", "romantic"],
  pink: ["feminine", "girly", "cute", "playful", "romantic", "soft"],
  pretty: ["feminine", "elegant", "girly", "delicate", "charming", "romantic"],
  sweet: ["cute", "feminine", "friendly", "soft", "playful", "girly", "romantic"],
  youthful: ["youthful", "fun", "playful", "bold", "energetic", "pop"],

  // Playful / fun / wild
  playful: ["playful", "fun", "bubbly", "energetic", "bold", "friendly", "quirky"],
  fun: ["fun", "playful", "bubbly", "energetic", "bold", "friendly", "pop"],
  wild: ["bold", "edgy", "energetic", "dramatic", "expressive", "raw", "grunge", "chaotic"],
  loud: ["bold", "loud", "impactful", "energetic", "pop", "dramatic"],
  energetic: ["energetic", "bold", "dynamic", "fun", "playful", "vibrant"],
  vibrant: ["vibrant", "bold", "energetic", "colorful", "pop", "fun"],
  colorful: ["vibrant", "bold", "pop", "fun", "playful", "energetic"],
  quirky: ["quirky", "playful", "distinctive", "creative", "fun", "unusual"],

  // Dark / horror / gothic / spooky
  dark: ["dark", "gothic", "moody", "horror", "spooky", "mysterious", "heavy"],
  spooky: ["horror", "dark", "spooky", "gothic", "creepy", "halloween", "mysterious"],
  horror: ["horror", "dark", "spooky", "gothic", "creepy", "dripping", "distressed"],
  scary: ["horror", "dark", "spooky", "gothic", "creepy"],
  creepy: ["horror", "dark", "spooky", "gothic", "creepy", "distressed"],
  halloween: ["horror", "dark", "spooky", "gothic", "creepy", "halloween", "fun"],
  gothic: ["gothic", "dark", "blackletter", "medieval", "ornate", "moody"],
  goth: ["gothic", "dark", "blackletter", "medieval", "moody", "edgy"],
  moody: ["moody", "dark", "gothic", "dramatic", "editorial", "mysterious"],
  mysterious: ["mysterious", "dark", "gothic", "moody", "elegant"],
  occult: ["gothic", "dark", "mysterious", "ornate", "medieval"],
  witchy: ["gothic", "dark", "mystical", "ornate", "vintage", "serif", "moody"],
  vampire: ["gothic", "dark", "horror", "elegant", "dramatic"],

  // Retro / vintage
  retro: ["retro", "vintage", "groovy", "70s", "nostalgia", "fun", "pop"],
  vintage: ["vintage", "retro", "classic", "traditional", "distressed", "typewriter"],
  groovy: ["groovy", "retro", "70s", "fun", "pop", "vintage", "playful"],
  "70s": ["retro", "groovy", "70s", "vintage", "fun", "pop"],
  "80s": ["80s", "neon", "synthwave", "retro", "bold", "futuristic"],
  "90s": ["retro", "grunge", "alternative", "nostalgia", "pop"],
  nostalgia: ["retro", "vintage", "nostalgia", "80s", "pixel", "fun"],
  nostalgic: ["retro", "vintage", "nostalgia", "80s", "pixel"],
  throwback: ["retro", "vintage", "nostalgia", "groovy", "fun"],
  oldschool: ["retro", "vintage", "classic", "traditional"],
  "old school": ["retro", "vintage", "classic", "traditional"],

  // Tech / futuristic / gaming
  gaming: ["gaming", "pixel", "8-bit", "fun", "retro", "bold", "tech", "playful"],
  gamer: ["gaming", "pixel", "8-bit", "bold", "tech", "playful"],
  pixel: ["pixel", "8-bit", "retro", "gaming", "fun", "nostalgia"],
  "8-bit": ["pixel", "8-bit", "retro", "gaming", "nostalgia", "fun"],
  glitch: ["glitch", "chaotic", "edgy", "tech", "distorted", "rebellious", "experimental"],
  glitchy: ["glitch", "chaotic", "edgy", "tech", "distorted", "rebellious"],
  futuristic: ["futuristic", "tech", "geometric", "modern", "sharp", "sci-fi"],
  "sci-fi": ["sci-fi", "futuristic", "tech", "space", "cosmic", "bold"],
  scifi: ["sci-fi", "futuristic", "tech", "space", "cosmic"],
  cyber: ["cyberpunk", "futuristic", "tech", "neon", "edgy", "glitch", "dark"],
  cyberpunk: ["cyberpunk", "futuristic", "tech", "neon", "edgy", "glitch", "dark"],
  neon: ["neon", "80s", "synthwave", "bold", "vibrant", "futuristic", "retro"],
  synthwave: ["synthwave", "neon", "80s", "retro", "futuristic", "bold"],
  space: ["sci-fi", "futuristic", "tech", "space", "cosmic", "bold"],
  cosmic: ["sci-fi", "futuristic", "space", "cosmic", "mysterious"],
  tech: ["tech", "modern", "clean", "futuristic", "digital"],
  digital: ["tech", "modern", "digital", "clean", "futuristic"],

  // Script / handwritten
  handwritten: ["handwritten", "personal", "casual", "raw", "authentic", "human"],
  script: ["script", "feminine", "elegant", "romantic", "flowing", "charming"],
  calligraphy: ["script", "elegant", "flowing", "ornate", "formal", "romantic"],
  cursive: ["script", "flowing", "elegant", "feminine", "romantic"],
  brush: ["brush", "bold", "expressive", "artistic", "painted", "dynamic"],
  painted: ["brush", "painted", "artistic", "expressive", "bold"],

  // Romantic / wedding
  romantic: ["romantic", "feminine", "elegant", "script", "delicate", "charming", "beauty"],
  wedding: ["elegant", "refined", "romantic", "delicate", "script", "feminine"],
  love: ["romantic", "feminine", "script", "delicate", "charming"],

  // Western / rustic
  western: ["western", "rustic", "frontier", "cowboy", "vintage", "rugged"],
  cowboy: ["western", "rustic", "frontier", "cowboy", "vintage"],
  rustic: ["rustic", "western", "organic", "vintage", "earthy", "natural"],
  frontier: ["western", "frontier", "rustic", "vintage", "bold"],

  // Military / stencil
  military: ["stencil", "military", "industrial", "utilitarian", "bold", "structured"],
  stencil: ["stencil", "military", "industrial", "bold", "structured"],
  army: ["stencil", "military", "bold", "structured", "utilitarian"],

  // Industry / context
  saas: ["saas", "product", "ui", "tech", "modern", "clean", "startup"],
  startup: ["startup", "modern", "tech", "product", "bold"],
  product: ["product", "modern", "clean", "ui", "tech"],
  app: ["product", "modern", "clean", "ui", "tech"],
  fintech: ["fintech", "tech", "modern", "corporate", "clean"],
  crypto: ["crypto", "tech", "modern", "futuristic", "bold", "glitch"],
  fashion: ["fashion", "luxury", "elegant", "editorial", "high-contrast", "feminine"],
  beauty: ["beauty", "feminine", "elegant", "premium", "romantic", "girly"],
  restaurant: ["warm", "friendly", "inviting", "lifestyle"],
  cafe: ["warm", "friendly", "inviting", "approachable", "organic"],
  coffee: ["warm", "friendly", "inviting", "organic", "rustic"],
  bakery: ["warm", "friendly", "handwritten", "organic", "cute"],
  hotel: ["luxury", "elegant", "premium", "refined", "sophisticated"],
  portfolio: ["editorial", "modern", "distinctive", "creative"],
  agency: ["bold", "creative", "modern", "impactful", "distinctive", "agency"],
  branding: ["bold", "distinctive", "modern", "confident"],
  magazine: ["editorial", "magazine", "literary", "elegant"],
  blog: ["editorial", "readable", "warm", "literary"],
  music: ["bold", "edgy", "creative", "distinctive", "alternative", "grunge", "fun"],
  band: ["bold", "edgy", "alternative", "grunge", "music", "creative"],
  concert: ["bold", "edgy", "music", "events", "dynamic"],
  festival: ["bold", "fun", "energetic", "events", "pop", "vibrant"],

  // Moods
  bold: ["bold", "impactful", "striking", "confident", "dramatic", "heavy"],
  elegant: ["elegant", "refined", "sophisticated", "luxury", "delicate"],
  classy: ["elegant", "refined", "sophisticated", "luxury", "classic"],
  sophisticated: ["sophisticated", "elegant", "refined", "premium", "editorial"],
  professional: ["professional", "corporate", "reliable", "clean", "trustworthy"],
  corporate: ["corporate", "professional", "clean", "trustworthy", "formal"],
  formal: ["formal", "professional", "corporate", "serif", "traditional"],
  serious: ["professional", "corporate", "authoritative", "serious"],
  friendly: ["friendly", "warm", "approachable", "soft", "inviting"],
  warm: ["warm", "friendly", "approachable", "inviting", "organic"],
  cozy: ["warm", "friendly", "organic", "soft", "inviting"],
  dramatic: ["dramatic", "bold", "editorial", "high-contrast", "impactful"],
  luxury: ["luxury", "premium", "elegant", "sophisticated", "high-contrast"],
  luxurious: ["luxury", "premium", "elegant", "sophisticated", "refined"],
  premium: ["luxury", "premium", "elegant", "sophisticated", "refined"],
  editorial: ["editorial", "literary", "magazine", "high-contrast", "elegant"],
  modern: ["modern", "contemporary", "clean", "tech"],
  contemporary: ["modern", "contemporary", "clean", "tech"],
  minimal: ["minimal", "clean", "modern", "neutral", "restrained"],
  minimalist: ["minimal", "clean", "neutral", "restrained"],
  clean: ["clean", "minimal", "modern", "neutral", "ui"],
  simple: ["clean", "minimal", "simple", "neutral", "restrained"],
  street: ["urban", "bold", "edgy", "grunge", "raw", "alternative"],
  urban: ["urban", "bold", "edgy", "street", "modern"],
  whimsical: ["whimsical", "playful", "soft", "script", "fairy", "delicate"],
  artsy: ["artistic", "creative", "expressive", "distinctive", "editorial", "bold"],
  artistic: ["artistic", "creative", "expressive", "distinctive", "bold"],
  creative: ["creative", "distinctive", "expressive", "bold", "quirky", "artistic"],
  experimental: ["experimental", "creative", "distinctive", "bold", "avant-garde"],
  organic: ["organic", "warm", "natural", "humanist", "friendly"],
  natural: ["natural", "organic", "warm", "earthy", "friendly"],
  earthy: ["earthy", "organic", "warm", "natural", "rustic"],
  literary: ["literary", "editorial", "classic", "serif", "elegant"],
  classic: ["classic", "traditional", "serif", "elegant", "refined"],
  traditional: ["traditional", "classic", "serif", "formal", "authoritative"],
  trustworthy: ["trustworthy", "professional", "reliable", "clean", "corporate"],

  // Aesthetic / subcultural
  cottagecore: ["warm", "organic", "vintage", "handwritten", "natural", "rustic", "soft", "romantic"],
  "dark academia": ["literary", "classic", "serif", "academic", "authoritative", "moody", "vintage"],
  academia: ["literary", "classic", "serif", "academic", "authoritative"],
  y2k: ["retro", "futuristic", "pop", "bubbly", "bold", "playful", "neon"],
  "indie sleaze": ["edgy", "messy", "raw", "fashion", "rebellious", "grunge"],
  "old money": ["classic", "elegant", "serif", "refined", "luxury", "traditional"],
  "clean girl": ["minimal", "clean", "modern", "neutral", "polished"],
  vaporwave: ["retro", "neon", "80s", "synthwave", "pastel", "futuristic", "pop"],
  brutalist: ["raw", "heavy", "bold", "industrial", "minimal", "stark", "grunge"],
  steampunk: ["vintage", "industrial", "ornate", "serif", "mechanical", "retro", "gothic"],
  solarpunk: ["organic", "futuristic", "warm", "friendly", "modern", "rounded"],
  fairycore: ["whimsical", "soft", "romantic", "delicate", "script", "feminine"],
  witchcore: ["dark", "gothic", "mystical", "ornate", "vintage", "moody"],
  royalcore: ["elegant", "luxury", "serif", "ornate", "classic", "refined"],
  goblincore: ["quirky", "organic", "raw", "natural", "earthy", "handwritten"],
  "e-girl": ["edgy", "girly", "punk", "pop", "bold", "alternative", "dark", "playful"],
  "e-boy": ["edgy", "punk", "bold", "alternative", "dark", "grunge"],
  aesthetic: ["distinctive", "artistic", "creative", "editorial", "modern"],
  vibe: ["distinctive", "creative", "modern", "expressive"],
  vibes: ["distinctive", "creative", "modern", "expressive"],
  mood: ["moody", "distinctive", "editorial", "expressive"],
  slay: ["bold", "confident", "fashion", "feminine", "pop"],
  iconic: ["bold", "distinctive", "elegant", "dramatic", "editorial"],

  // ── Extended synonyms for broader matching ──
  // Appearance / visual quality
  sharp: ["sharp", "angular", "geometric", "precise", "modern", "edgy"],
  soft: ["soft", "rounded", "friendly", "feminine", "gentle", "warm"],
  gentle: ["soft", "delicate", "friendly", "warm", "feminine"],
  rough: ["raw", "grunge", "distressed", "edgy", "rough", "textured"],
  textured: ["distressed", "grunge", "raw", "textured", "vintage"],
  smooth: ["clean", "modern", "polished", "minimal", "geometric"],
  polished: ["refined", "elegant", "sophisticated", "clean", "modern"],
  ornate: ["ornate", "decorative", "gothic", "baroque", "detailed"],
  decorative: ["ornate", "decorative", "display", "distinctive", "detailed"],
  heavy: ["bold", "heavy", "impactful", "dark", "strong"],
  light: ["light", "thin", "delicate", "airy", "minimal", "elegant"],
  thin: ["light", "thin", "delicate", "minimal", "elegant"],
  thick: ["bold", "heavy", "strong", "impactful"],
  wide: ["wide", "expanded", "bold", "impactful"],
  narrow: ["condensed", "narrow", "tall", "editorial"],
  condensed: ["condensed", "narrow", "editorial", "impact", "bold"],
  tall: ["condensed", "narrow", "tall", "display"],
  rounded: ["rounded", "friendly", "soft", "bubbly", "cute"],
  angular: ["angular", "sharp", "geometric", "modern", "edgy"],
  blocky: ["bold", "heavy", "pixel", "structured", "impact"],
  curvy: ["flowing", "script", "feminine", "organic", "romantic"],
  irregular: ["raw", "handwritten", "quirky", "grunge", "distinctive"],
  // Emotions / feelings
  happy: ["fun", "playful", "friendly", "bubbly", "bright", "energetic"],
  sad: ["moody", "dark", "melancholy", "serif", "literary"],
  angry: ["bold", "edgy", "punk", "aggressive", "heavy", "grunge"],
  aggressive: ["bold", "edgy", "punk", "heavy", "impact", "grunge"],
  calm: ["minimal", "clean", "soft", "gentle", "zen", "restrained"],
  peaceful: ["minimal", "clean", "soft", "gentle", "zen", "organic"],
  zen: ["minimal", "clean", "calm", "zen", "japanese", "restrained"],
  exciting: ["bold", "energetic", "dynamic", "vibrant", "fun", "pop"],
  confident: ["bold", "confident", "strong", "impactful", "modern"],
  strong: ["bold", "strong", "heavy", "impactful", "confident"],
  powerful: ["bold", "powerful", "heavy", "impactful", "dramatic"],
  delicate: ["delicate", "light", "feminine", "script", "elegant", "thin"],
  airy: ["light", "thin", "delicate", "minimal", "elegant", "airy"],
  dreamy: ["soft", "romantic", "whimsical", "pastel", "feminine", "script"],
  surreal: ["experimental", "artistic", "creative", "distinctive", "unusual"],
  magical: ["whimsical", "fairy", "fantasy", "script", "decorative", "mystical"],
  eerie: ["dark", "horror", "spooky", "gothic", "creepy"],
  haunted: ["horror", "dark", "spooky", "gothic", "creepy", "distressed"],
  enchanted: ["whimsical", "fairy", "fantasy", "romantic", "mystical"],
  // Industries / contexts (expanded)
  healthcare: ["clean", "professional", "trustworthy", "friendly", "modern"],
  finance: ["professional", "corporate", "clean", "trustworthy", "modern"],
  banking: ["professional", "corporate", "traditional", "trustworthy", "serif"],
  insurance: ["professional", "trustworthy", "corporate", "clean"],
  university: ["academic", "literary", "serif", "authoritative", "classic"],
  school: ["friendly", "playful", "readable", "approachable", "education"],
  kids: ["playful", "fun", "bubbly", "cute", "rounded", "friendly"],
  children: ["playful", "fun", "bubbly", "cute", "rounded", "friendly"],
  baby: ["soft", "rounded", "friendly", "cute", "gentle", "warm"],
  event: ["bold", "impactful", "dynamic", "events", "energetic"],
  party: ["fun", "bold", "pop", "energetic", "vibrant", "playful"],
  nightclub: ["bold", "neon", "dark", "edgy", "urban", "80s"],
  club: ["bold", "neon", "dark", "edgy", "urban"],
  bar: ["vintage", "rustic", "warm", "bold", "urban"],
  brewery: ["rustic", "vintage", "bold", "craft", "industrial"],
  winery: ["elegant", "refined", "serif", "classic", "luxury"],
  fitness: ["bold", "strong", "dynamic", "energetic", "modern"],
  gym: ["bold", "strong", "heavy", "impact", "energetic"],
  yoga: ["soft", "organic", "warm", "friendly", "zen", "minimal"],
  spa: ["elegant", "refined", "luxury", "soft", "clean"],
  travel: ["modern", "warm", "editorial", "distinctive", "bold"],
  adventure: ["bold", "rustic", "energetic", "dynamic", "western"],
  outdoor: ["rustic", "organic", "bold", "natural", "earthy"],
  camping: ["rustic", "organic", "earthy", "handwritten", "natural"],
  food: ["warm", "friendly", "organic", "handwritten", "inviting"],
  cooking: ["warm", "friendly", "handwritten", "organic", "rustic"],
  recipe: ["warm", "handwritten", "friendly", "organic"],
  technology: ["modern", "clean", "tech", "futuristic", "geometric"],
  software: ["modern", "clean", "tech", "product", "minimal"],
  hardware: ["bold", "tech", "industrial", "modern", "structured"],
  robotics: ["futuristic", "tech", "geometric", "modern", "sci-fi"],
  photography: ["editorial", "modern", "distinctive", "clean", "artistic"],
  film: ["editorial", "dramatic", "cinematic", "bold", "distinctive"],
  cinema: ["editorial", "dramatic", "cinematic", "bold", "vintage"],
  movie: ["editorial", "dramatic", "bold", "cinematic", "pop"],
  theater: ["dramatic", "elegant", "serif", "editorial", "ornate"],
  theatre: ["dramatic", "elegant", "serif", "editorial", "ornate"],
  dance: ["flowing", "dynamic", "feminine", "elegant", "energetic"],
  architecture: ["geometric", "modern", "structured", "minimal", "clean"],
  interior: ["elegant", "modern", "warm", "refined", "editorial"],
  illustration: ["artistic", "creative", "handwritten", "playful", "distinctive"],
  painting: ["artistic", "brush", "expressive", "creative", "bold"],
  sculpture: ["bold", "artistic", "modern", "geometric", "distinctive"],
  gallery: ["editorial", "artistic", "minimal", "modern", "distinctive"],
  museum: ["editorial", "classic", "serif", "authoritative", "cultural"],
  charity: ["warm", "friendly", "approachable", "trustworthy"],
  government: ["professional", "traditional", "serif", "authoritative", "clean"],
  political: ["bold", "authoritative", "serif", "traditional", "impactful"],
  newspaper: ["editorial", "serif", "literary", "authoritative", "classic"],
  podcast: ["modern", "creative", "bold", "distinctive", "editorial"],
  newsletter: ["editorial", "warm", "friendly", "readable", "clean"],
  shop: ["modern", "clean", "product", "friendly", "inviting"],
  store: ["modern", "clean", "product", "friendly"],
  marketplace: ["modern", "clean", "product", "trustworthy"],
  logo: ["bold", "distinctive", "display", "geometric"],
  identity: ["bold", "distinctive", "modern", "consistent"],
  packaging: ["bold", "distinctive", "display", "creative"],
  poster: ["bold", "display", "impact", "dramatic", "condensed"],
  billboard: ["bold", "display", "impact", "condensed"],
  signage: ["bold", "display", "impact", "urban"],
  flyer: ["bold", "display", "fun", "energetic"],
  invitation: ["elegant", "script", "romantic", "feminine", "refined"],
  resume: ["professional", "clean", "modern", "minimal"],
  presentation: ["professional", "modern", "clean", "bold"],
  documentation: ["clean", "modern", "professional", "readable"],
  // Nature / organic
  botanical: ["organic", "natural", "serif", "elegant", "warm"],
  floral: ["romantic", "feminine", "script", "organic", "delicate"],
  forest: ["organic", "earthy", "natural", "rustic", "dark"],
  ocean: ["flowing", "organic", "cool", "modern"],
  mountain: ["bold", "rustic", "earthy", "natural", "strong"],
  desert: ["warm", "earthy", "rustic", "western", "minimal"],
  tropical: ["fun", "vibrant", "warm", "playful", "organic"],
  garden: ["organic", "warm", "romantic", "natural", "soft"],

  // ── Colors ──
  red: ["bold", "dramatic", "energetic", "vibrant", "impactful", "warm"],
  blue: ["cool", "professional", "clean", "modern", "corporate", "minimal"],
  green: ["organic", "natural", "earthy", "friendly", "warm", "fresh"],
  black: ["dark", "bold", "elegant", "gothic", "dramatic", "heavy"],
  white: ["clean", "minimal", "modern", "light", "neutral", "elegant"],
  gold: ["luxury", "premium", "elegant", "ornate", "refined", "warm"],
  silver: ["modern", "clean", "tech", "futuristic", "cool", "minimal"],
  purple: ["creative", "luxury", "mysterious", "elegant", "bold", "dramatic"],
  orange: ["energetic", "warm", "bold", "vibrant", "fun", "friendly"],
  teal: ["modern", "cool", "clean", "professional", "friendly", "fresh"],
  coral: ["warm", "feminine", "friendly", "soft", "vibrant", "modern"],
  bronze: ["vintage", "warm", "rustic", "earthy", "traditional", "organic"],
  copper: ["vintage", "warm", "rustic", "industrial", "earthy", "organic"],
  chrome: ["futuristic", "tech", "modern", "clean", "bold", "industrial"],
  emerald: ["luxury", "elegant", "bold", "refined", "natural", "rich"],
  ruby: ["bold", "luxury", "elegant", "dramatic", "vibrant", "warm"],
  sapphire: ["elegant", "luxury", "cool", "refined", "premium", "bold"],
  ivory: ["elegant", "soft", "classic", "refined", "light", "traditional"],
  charcoal: ["dark", "moody", "modern", "bold", "editorial", "neutral"],
  navy: ["professional", "corporate", "classic", "traditional", "bold", "clean"],
  maroon: ["traditional", "classic", "warm", "bold", "serif", "vintage"],
  magenta: ["bold", "vibrant", "energetic", "pop", "feminine", "dramatic"],
  turquoise: ["fresh", "modern", "cool", "friendly", "vibrant", "playful"],
  lavender: ["soft", "feminine", "romantic", "delicate", "gentle", "light"],
  mint: ["fresh", "clean", "modern", "friendly", "light", "cool"],
  peach: ["warm", "soft", "feminine", "friendly", "gentle", "romantic"],
  cream: ["soft", "elegant", "warm", "classic", "light", "refined"],
  amber: ["warm", "earthy", "vintage", "organic", "bold", "rustic"],
  indigo: ["deep", "bold", "modern", "cool", "creative", "mysterious"],
  burgundy: ["elegant", "classic", "luxury", "warm", "serif", "refined"],

  // ── Textures / Materials ──
  leather: ["rustic", "vintage", "warm", "western", "bold", "earthy"],
  wood: ["organic", "warm", "rustic", "natural", "earthy", "handwritten"],
  stone: ["heavy", "bold", "rustic", "earthy", "traditional", "strong"],
  metal: ["bold", "industrial", "heavy", "edgy", "dark", "modern"],
  glass: ["clean", "modern", "minimal", "light", "elegant", "futuristic"],
  silk: ["elegant", "feminine", "luxury", "flowing", "refined", "delicate"],
  velvet: ["luxury", "elegant", "rich", "warm", "gothic", "dramatic"],
  marble: ["elegant", "luxury", "classic", "refined", "premium", "serif"],
  concrete: ["industrial", "raw", "bold", "modern", "minimal", "heavy"],
  fabric: ["organic", "warm", "soft", "natural", "friendly", "handwritten"],
  linen: ["organic", "warm", "natural", "soft", "elegant", "minimal"],
  steel: ["industrial", "bold", "modern", "heavy", "tech", "cold"],
  iron: ["industrial", "heavy", "bold", "dark", "gothic", "strong"],
  brass: ["vintage", "warm", "industrial", "luxury", "ornate", "retro"],
  crystal: ["elegant", "luxury", "clean", "light", "refined", "modern"],
  ceramic: ["organic", "warm", "handwritten", "rustic", "earthy", "craft"],
  porcelain: ["elegant", "delicate", "refined", "classic", "light", "feminine"],
  denim: ["casual", "friendly", "bold", "rustic", "warm", "urban"],

  // ── Cultural / Era references ──
  victorian: ["ornate", "serif", "vintage", "elegant", "decorative", "gothic"],
  "art deco": ["geometric", "luxury", "elegant", "bold", "vintage", "display"],
  "art nouveau": ["ornate", "flowing", "organic", "elegant", "vintage", "decorative"],
  bauhaus: ["geometric", "modern", "clean", "minimal", "bold", "sans-serif"],
  swiss: ["clean", "minimal", "geometric", "modern", "professional", "neutral"],
  "mid-century": ["retro", "vintage", "modern", "clean", "geometric", "warm"],
  modernist: ["modern", "clean", "geometric", "minimal", "sans-serif", "bold"],
  postmodern: ["bold", "quirky", "experimental", "creative", "distinctive", "pop"],
  baroque: ["ornate", "decorative", "elegant", "serif", "dramatic", "luxury"],
  renaissance: ["classic", "serif", "elegant", "ornate", "traditional", "refined"],
  medieval: ["gothic", "dark", "ornate", "serif", "traditional", "heavy"],
  ancient: ["classic", "traditional", "serif", "heavy", "bold", "ornate"],
  greek: ["classic", "serif", "traditional", "elegant", "refined", "clean"],
  roman: ["classic", "serif", "traditional", "bold", "authoritative", "elegant"],
  egyptian: ["bold", "display", "geometric", "heavy", "serif", "ornate"],
  japanese: ["minimal", "clean", "organic", "modern", "zen", "elegant"],
  scandinavian: ["clean", "minimal", "modern", "friendly", "warm", "geometric"],
  nordic: ["clean", "minimal", "modern", "cold", "geometric", "bold"],
  french: ["elegant", "refined", "feminine", "serif", "romantic", "luxury"],
  italian: ["elegant", "warm", "luxury", "serif", "classic", "refined"],
  british: ["classic", "traditional", "serif", "elegant", "refined", "authoritative"],
  american: ["bold", "modern", "clean", "friendly", "strong", "versatile"],
  brazilian: ["vibrant", "warm", "bold", "energetic", "fun", "playful"],
  african: ["bold", "vibrant", "warm", "organic", "earthy", "distinctive"],
  asian: ["minimal", "clean", "elegant", "modern", "organic", "zen"],
  bohemian: ["organic", "handwritten", "warm", "vintage", "artistic", "flowing"],
  boho: ["organic", "handwritten", "warm", "vintage", "artistic", "earthy"],
  hippie: ["organic", "handwritten", "retro", "warm", "playful", "vintage"],
  beatnik: ["literary", "vintage", "serif", "editorial", "moody", "artistic"],

  // ── Music genres ──
  jazz: ["elegant", "vintage", "serif", "warm", "flowing", "artistic", "editorial"],
  blues: ["vintage", "warm", "serif", "moody", "earthy", "rustic"],
  rock: ["bold", "edgy", "heavy", "grunge", "alternative", "distressed"],
  "hip-hop": ["bold", "urban", "edgy", "modern", "heavy", "impactful"],
  hiphop: ["bold", "urban", "edgy", "modern", "heavy", "impactful"],
  rap: ["bold", "urban", "edgy", "modern", "heavy", "impactful", "dark"],
  country: ["western", "rustic", "warm", "traditional", "serif", "earthy"],
  folk: ["organic", "handwritten", "warm", "rustic", "vintage", "earthy"],
  classical: ["elegant", "serif", "refined", "traditional", "literary", "ornate"],
  electronic: ["modern", "futuristic", "tech", "bold", "geometric", "neon"],
  techno: ["modern", "futuristic", "bold", "tech", "geometric", "minimal"],
  house: ["modern", "bold", "clean", "energetic", "vibrant", "neon"],
  ambient: ["minimal", "soft", "light", "clean", "modern", "delicate"],
  lofi: ["warm", "vintage", "handwritten", "organic", "soft", "retro"],
  "lo-fi": ["warm", "vintage", "handwritten", "organic", "soft", "retro"],
  reggae: ["warm", "organic", "bold", "vibrant", "fun", "earthy"],
  ska: ["bold", "energetic", "fun", "retro", "vibrant", "playful"],
  soul: ["warm", "elegant", "vintage", "flowing", "serif", "romantic"],
  funk: ["bold", "retro", "groovy", "fun", "vibrant", "energetic"],
  disco: ["retro", "bold", "neon", "fun", "vibrant", "80s", "pop"],
  rnb: ["elegant", "modern", "warm", "bold", "flowing", "feminine"],
  opera: ["elegant", "ornate", "dramatic", "serif", "classic", "refined"],
  orchestral: ["elegant", "serif", "classic", "refined", "traditional", "ornate"],
  acoustic: ["organic", "warm", "handwritten", "natural", "friendly", "soft"],

  // ── Fashion / style ──
  haute: ["luxury", "elegant", "fashion", "refined", "premium", "editorial"],
  couture: ["luxury", "elegant", "fashion", "refined", "premium", "serif"],
  streetwear: ["urban", "bold", "edgy", "modern", "heavy", "alternative"],
  athleisure: ["modern", "clean", "bold", "sporty", "friendly", "dynamic"],
  preppy: ["classic", "clean", "traditional", "serif", "refined", "professional"],
  sporty: ["bold", "dynamic", "energetic", "modern", "clean", "strong"],
  chic: ["elegant", "modern", "refined", "clean", "feminine", "editorial"],
  glam: ["luxury", "bold", "elegant", "dramatic", "feminine", "ornate"],
  glamorous: ["luxury", "bold", "elegant", "dramatic", "feminine", "refined"],
  dapper: ["classic", "elegant", "refined", "serif", "traditional", "clean"],
  casual: ["friendly", "warm", "approachable", "rounded", "handwritten", "fun"],
  workwear: ["professional", "clean", "modern", "minimal", "corporate"],
  loungewear: ["soft", "warm", "friendly", "rounded", "gentle", "minimal"],
  activewear: ["bold", "dynamic", "energetic", "modern", "sporty", "clean"],
  sustainable: ["organic", "natural", "earthy", "warm", "friendly", "clean"],
  ethical: ["organic", "natural", "warm", "friendly", "clean", "professional"],
  handmade: ["handwritten", "organic", "warm", "craft", "rustic", "artistic"],

  // ── Food / drink ──
  wine: ["elegant", "serif", "refined", "classic", "luxury", "warm"],
  beer: ["bold", "rustic", "vintage", "friendly", "warm", "craft"],
  cocktail: ["elegant", "bold", "modern", "luxury", "vibrant", "fun"],
  tea: ["elegant", "soft", "warm", "organic", "delicate", "serif"],
  chocolate: ["warm", "luxury", "rich", "elegant", "organic", "serif"],
  pastry: ["warm", "feminine", "script", "friendly", "soft", "elegant"],
  gourmet: ["elegant", "refined", "serif", "luxury", "premium", "warm"],
  artisanal: ["handwritten", "organic", "craft", "warm", "rustic", "vintage"],
  farmhouse: ["rustic", "organic", "warm", "vintage", "earthy", "handwritten"],
  bistro: ["warm", "friendly", "vintage", "serif", "elegant", "inviting"],
  diner: ["retro", "vintage", "bold", "fun", "friendly", "warm"],
  pizzeria: ["warm", "bold", "friendly", "vintage", "fun", "rustic"],
  sushi: ["minimal", "clean", "modern", "elegant", "japanese", "zen"],
  ramen: ["bold", "warm", "modern", "friendly", "japanese", "fun"],

  // ── Seasons / weather ──
  spring: ["fresh", "light", "organic", "feminine", "soft", "warm"],
  summer: ["vibrant", "bold", "warm", "fun", "energetic", "bright"],
  autumn: ["warm", "earthy", "organic", "rustic", "vintage", "serif"],
  fall: ["warm", "earthy", "organic", "rustic", "vintage", "serif"],
  winter: ["cold", "clean", "minimal", "elegant", "modern", "bold"],
  sunny: ["warm", "bright", "friendly", "fun", "vibrant", "energetic"],
  rainy: ["moody", "soft", "gentle", "cool", "minimal", "serif"],
  stormy: ["dark", "bold", "dramatic", "heavy", "moody", "edgy"],
  snowy: ["clean", "light", "minimal", "soft", "cold", "elegant"],
  cloudy: ["soft", "muted", "gentle", "light", "neutral", "minimal"],
  foggy: ["soft", "muted", "minimal", "light", "moody", "mysterious"],
  misty: ["soft", "light", "gentle", "minimal", "mysterious", "delicate"],
  arctic: ["cold", "clean", "minimal", "bold", "modern", "geometric"],
  humid: ["warm", "organic", "heavy", "earthy", "bold", "lush"],

  // ── Architecture / spaces ──
  loft: ["industrial", "modern", "bold", "urban", "minimal", "raw"],
  studio: ["modern", "clean", "creative", "minimal", "artistic", "bold"],
  warehouse: ["industrial", "raw", "bold", "urban", "modern", "heavy"],
  industrial: ["industrial", "bold", "raw", "modern", "heavy", "urban"],
  brutalism: ["raw", "heavy", "bold", "minimal", "industrial", "geometric"],
  minimalism: ["minimal", "clean", "modern", "light", "neutral", "restrained"],
  cottage: ["warm", "organic", "rustic", "vintage", "friendly", "soft"],
  cabin: ["rustic", "organic", "warm", "earthy", "natural", "western"],
  penthouse: ["luxury", "modern", "elegant", "premium", "clean", "bold"],
  mansion: ["luxury", "elegant", "ornate", "serif", "refined", "classic"],
  castle: ["gothic", "ornate", "serif", "dark", "heavy", "medieval"],
  church: ["traditional", "serif", "gothic", "ornate", "elegant", "classic"],
  temple: ["traditional", "serif", "elegant", "classic", "ornate", "minimal"],
  cathedral: ["gothic", "ornate", "serif", "dramatic", "elegant", "heavy"],
  skyscraper: ["modern", "bold", "geometric", "clean", "futuristic", "tall"],

  // ── Technology concepts ──
  blockchain: ["tech", "modern", "futuristic", "geometric", "bold", "digital"],
  metaverse: ["futuristic", "tech", "bold", "neon", "modern", "digital"],
  augmented: ["futuristic", "tech", "modern", "clean", "geometric", "digital"],
  holographic: ["futuristic", "neon", "bold", "modern", "tech", "vibrant"],
  quantum: ["futuristic", "tech", "modern", "geometric", "clean", "bold"],
  neural: ["tech", "futuristic", "modern", "geometric", "clean", "digital"],
  machine: ["tech", "modern", "geometric", "clean", "futuristic", "monospace"],
  algorithm: ["tech", "monospace", "modern", "geometric", "clean", "digital"],
  cloud: ["modern", "clean", "tech", "light", "friendly", "minimal"],
  streaming: ["modern", "bold", "tech", "dynamic", "energetic", "digital"],
  wireless: ["modern", "clean", "tech", "futuristic", "minimal"],
  mobile: ["modern", "clean", "minimal", "tech", "friendly", "rounded"],
  wearable: ["modern", "minimal", "tech", "clean", "rounded", "futuristic"],
  autonomous: ["futuristic", "tech", "modern", "geometric", "bold", "clean"],

  // ── Animals / nature ──
  wolf: ["bold", "dark", "edgy", "heavy", "gothic", "strong"],
  lion: ["bold", "strong", "heavy", "luxury", "impactful", "dramatic"],
  eagle: ["bold", "strong", "traditional", "serif", "impactful", "clean"],
  dragon: ["bold", "gothic", "dark", "ornate", "dramatic", "fantasy"],
  phoenix: ["bold", "dramatic", "warm", "ornate", "vibrant", "elegant"],
  serpent: ["dark", "gothic", "flowing", "elegant", "mysterious", "ornate"],
  butterfly: ["delicate", "feminine", "light", "flowing", "romantic", "elegant"],
  fox: ["creative", "distinctive", "warm", "modern", "bold", "quirky"],
  bear: ["bold", "heavy", "strong", "rustic", "earthy", "warm"],
  deer: ["elegant", "delicate", "organic", "natural", "soft", "gentle"],
  horse: ["bold", "elegant", "strong", "classic", "western", "dynamic"],
  whale: ["bold", "organic", "flowing", "deep", "modern", "cool"],
  raven: ["dark", "gothic", "moody", "bold", "mysterious", "edgy"],
  owl: ["literary", "vintage", "serif", "classic", "wise", "ornate"],
  hawk: ["bold", "sharp", "strong", "dynamic", "modern", "impactful"],

  // ── Abstract concepts ──
  infinity: ["modern", "geometric", "flowing", "bold", "futuristic", "elegant"],
  cosmos: ["futuristic", "bold", "modern", "dramatic", "dark", "geometric"],
  void: ["dark", "minimal", "bold", "modern", "moody", "cold"],
  chaos: ["edgy", "bold", "raw", "grunge", "distressed", "punk"],
  order: ["clean", "minimal", "geometric", "modern", "professional", "structured"],
  harmony: ["elegant", "flowing", "warm", "organic", "soft", "balanced"],
  balance: ["clean", "modern", "minimal", "geometric", "professional", "neutral"],
  contrast: ["bold", "dramatic", "editorial", "modern", "impactful", "high-contrast"],
  unity: ["clean", "modern", "warm", "friendly", "minimal", "rounded"],
  duality: ["bold", "modern", "geometric", "editorial", "dramatic", "distinctive"],
  paradox: ["experimental", "creative", "bold", "distinctive", "editorial", "quirky"],
  entropy: ["grunge", "raw", "edgy", "distressed", "experimental", "dark"],
  genesis: ["bold", "modern", "clean", "elegant", "serif", "distinctive"],
  evolution: ["modern", "dynamic", "bold", "futuristic", "clean", "geometric"],
  revolution: ["bold", "edgy", "impactful", "heavy", "dramatic", "rebellious"],
  rebellion: ["edgy", "punk", "bold", "raw", "grunge", "rebellious", "alternative"],
  freedom: ["bold", "modern", "clean", "dynamic", "energetic", "friendly"],
  justice: ["bold", "serif", "traditional", "authoritative", "professional", "classic"],
  wisdom: ["serif", "classic", "literary", "elegant", "traditional", "refined"],
  truth: ["bold", "serif", "clean", "professional", "authoritative", "modern"],

  // ── Lifestyle ──
  nomad: ["rustic", "organic", "warm", "handwritten", "bold", "earthy"],
  traveler: ["modern", "warm", "editorial", "bold", "distinctive", "organic"],
  explorer: ["bold", "rustic", "earthy", "modern", "adventurous", "dynamic"],
  adventurer: ["bold", "rustic", "dynamic", "energetic", "warm", "western"],
  athlete: ["bold", "strong", "dynamic", "modern", "energetic", "clean"],
  artist: ["artistic", "creative", "distinctive", "handwritten", "expressive", "bold"],
  musician: ["bold", "creative", "edgy", "distinctive", "alternative", "artistic"],
  writer: ["literary", "serif", "editorial", "classic", "elegant", "warm"],
  creator: ["creative", "bold", "modern", "distinctive", "artistic", "dynamic"],
  maker: ["handwritten", "craft", "organic", "bold", "warm", "rustic"],
  entrepreneur: ["modern", "bold", "clean", "professional", "dynamic", "tech"],
  freelancer: ["modern", "creative", "clean", "friendly", "bold", "minimal"],

  // ── Emotions expanded ──
  melancholy: ["moody", "dark", "serif", "literary", "editorial", "delicate"],
  euphoric: ["bold", "energetic", "vibrant", "fun", "pop", "bright"],
  anxious: ["edgy", "raw", "distressed", "thin", "grunge", "experimental"],
  serene: ["minimal", "soft", "light", "clean", "gentle", "organic"],
  ecstatic: ["bold", "energetic", "vibrant", "pop", "fun", "impactful"],
  contemplative: ["serif", "literary", "minimal", "elegant", "editorial", "classic"],
  introspective: ["serif", "literary", "minimal", "elegant", "editorial", "light"],
  passionate: ["bold", "dramatic", "warm", "script", "expressive", "romantic"],
  fierce: ["bold", "heavy", "edgy", "dramatic", "impactful", "dark"],
  tender: ["soft", "delicate", "feminine", "script", "romantic", "gentle"],
  bittersweet: ["vintage", "serif", "warm", "moody", "literary", "romantic"],
  wistful: ["vintage", "soft", "serif", "literary", "romantic", "delicate"],
  hopeful: ["warm", "friendly", "light", "modern", "soft", "clean"],
  defiant: ["bold", "edgy", "punk", "heavy", "rebellious", "impactful"],
  triumphant: ["bold", "dramatic", "impactful", "heavy", "serif", "strong"],
  somber: ["dark", "moody", "serif", "literary", "heavy", "editorial"],
  jubilant: ["bold", "fun", "energetic", "vibrant", "pop", "playful"],
  restless: ["edgy", "bold", "dynamic", "raw", "energetic", "grunge"],
  tranquil: ["minimal", "soft", "clean", "light", "gentle", "organic"],

  // ── Additional broad coverage ──
  hero: ["bold", "strong", "impactful", "dramatic", "heavy", "display"],
  villain: ["dark", "gothic", "edgy", "bold", "dramatic", "heavy"],
  royal: ["elegant", "luxury", "serif", "ornate", "refined", "classic"],
  regal: ["elegant", "luxury", "serif", "ornate", "refined", "classic"],
  majestic: ["elegant", "bold", "luxury", "serif", "ornate", "dramatic"],
  rugged: ["rustic", "bold", "western", "earthy", "heavy", "distressed"],
  savage: ["bold", "heavy", "edgy", "grunge", "raw", "dark"],
  primal: ["bold", "raw", "heavy", "organic", "earthy", "grunge"],
  futurism: ["futuristic", "tech", "geometric", "modern", "bold", "clean"],
  utopia: ["modern", "clean", "friendly", "futuristic", "light", "elegant"],
  dystopia: ["dark", "grunge", "edgy", "distressed", "industrial", "bold"],
  noir: ["dark", "moody", "editorial", "serif", "elegant", "high-contrast"],
  cinematic: ["dramatic", "bold", "editorial", "serif", "elegant", "display"],
  theatrical: ["dramatic", "ornate", "serif", "elegant", "bold", "display"],
  poetic: ["literary", "serif", "elegant", "flowing", "script", "romantic"],
  lyrical: ["flowing", "script", "elegant", "literary", "feminine", "romantic"],
  narrative: ["literary", "serif", "editorial", "warm", "readable", "classic"],
  epic: ["bold", "dramatic", "heavy", "impactful", "display", "serif"],
  legendary: ["bold", "serif", "classic", "elegant", "ornate", "dramatic"],
  mythical: ["ornate", "serif", "gothic", "fantasy", "decorative", "bold"],
  fantasy: ["ornate", "script", "decorative", "whimsical", "gothic", "distinctive"],
  celestial: ["elegant", "light", "modern", "futuristic", "clean", "flowing"],
  ethereal: ["light", "delicate", "soft", "elegant", "feminine", "flowing"],
  divine: ["elegant", "serif", "ornate", "luxury", "refined", "classic"],
  sacred: ["traditional", "serif", "ornate", "elegant", "gothic", "classic"],
  mystic: ["mysterious", "dark", "ornate", "gothic", "script", "moody"],
  mystical: ["mysterious", "dark", "ornate", "gothic", "vintage", "moody"],
  alchemy: ["vintage", "ornate", "gothic", "serif", "mysterious", "dark"],
  wizard: ["ornate", "gothic", "dark", "script", "fantasy", "vintage"],
  warrior: ["bold", "heavy", "strong", "edgy", "dark", "impactful"],
  knight: ["gothic", "serif", "traditional", "ornate", "bold", "medieval"],
  pirate: ["vintage", "bold", "distressed", "western", "handwritten", "rustic"],
  nautical: ["vintage", "bold", "serif", "classic", "traditional", "clean"],
  maritime: ["vintage", "bold", "serif", "classic", "traditional", "clean"],
  coastal: ["organic", "warm", "friendly", "modern", "light", "clean"],
  island: ["warm", "organic", "friendly", "fun", "vibrant", "tropical"],
  suburban: ["friendly", "warm", "clean", "modern", "approachable", "rounded"],
  rural: ["rustic", "organic", "earthy", "warm", "traditional", "serif"],
  downtown: ["urban", "bold", "modern", "edgy", "industrial", "heavy"],
  underground: ["edgy", "dark", "grunge", "alternative", "raw", "punk"],
  indie: ["alternative", "creative", "distinctive", "handwritten", "vintage", "quirky"],
  mainstream: ["modern", "clean", "bold", "professional", "friendly"],
  exclusive: ["luxury", "premium", "elegant", "refined", "serif", "minimal"],
  boutique: ["elegant", "feminine", "distinctive", "luxury", "refined", "serif"],
  artisan: ["handwritten", "organic", "craft", "warm", "rustic", "vintage"],
  craft: ["handwritten", "organic", "rustic", "vintage", "warm", "distinctive"],
  bespoke: ["elegant", "refined", "luxury", "serif", "distinctive", "premium"],
  curated: ["editorial", "modern", "clean", "distinctive", "elegant", "minimal"],
  timeless: ["classic", "serif", "elegant", "refined", "traditional", "clean"],
  heritage: ["vintage", "serif", "traditional", "classic", "ornate", "refined"],
  legacy: ["serif", "classic", "traditional", "elegant", "refined", "authoritative"],
  pioneer: ["bold", "modern", "futuristic", "clean", "distinctive", "dynamic"],
  visionary: ["bold", "modern", "futuristic", "distinctive", "creative", "clean"],
  innovative: ["modern", "clean", "tech", "bold", "futuristic", "geometric"],
  disruptive: ["bold", "edgy", "modern", "impactful", "heavy", "dynamic"],
  radical: ["bold", "edgy", "punk", "rebellious", "heavy", "raw"],
  progressive: ["modern", "clean", "bold", "geometric", "futuristic"],
  retrogaming: ["pixel", "8-bit", "retro", "gaming", "fun", "nostalgia"],
  arcade: ["pixel", "8-bit", "retro", "fun", "bold", "gaming"],
  console: ["tech", "modern", "bold", "gaming", "clean", "geometric"],
  esports: ["bold", "tech", "modern", "edgy", "heavy", "gaming"],
  streamer: ["bold", "modern", "tech", "fun", "gaming", "energetic"],
  anime: ["bold", "playful", "fun", "japanese", "pop", "energetic"],
  manga: ["bold", "playful", "japanese", "fun", "distinctive", "pop"],
  comic: ["bold", "fun", "playful", "pop", "display", "quirky"],
  superhero: ["bold", "heavy", "impactful", "display", "dramatic", "comic"],
  cartoon: ["fun", "playful", "bold", "rounded", "bubbly", "friendly"],
  animated: ["fun", "playful", "energetic", "rounded", "bold", "friendly"],
  sticker: ["fun", "playful", "bold", "rounded", "cute", "pop"],
  tattoo: ["bold", "gothic", "ornate", "script", "edgy", "dark"],
  graffiti: ["bold", "urban", "edgy", "grunge", "street", "raw"],
  mural: ["bold", "artistic", "vibrant", "urban", "creative", "display"],
  print: ["editorial", "serif", "modern", "bold", "clean", "literary"],
  typographic: ["editorial", "modern", "bold", "display", "clean", "geometric"],
  lettering: ["handwritten", "script", "artistic", "bold", "display", "creative"],
  headline: ["bold", "display", "impactful", "heavy", "condensed", "editorial"],
  subtitle: ["light", "clean", "minimal", "modern", "neutral", "thin"],
  caption: ["light", "clean", "minimal", "modern", "neutral", "small"],
  label: ["clean", "modern", "professional", "minimal", "bold", "condensed"],
  badge: ["bold", "vintage", "display", "condensed", "rustic", "stencil"],
  stamp: ["vintage", "distressed", "bold", "rustic", "stencil", "display"],
  seal: ["ornate", "vintage", "serif", "classic", "bold", "traditional"],
  crest: ["ornate", "serif", "classic", "luxury", "elegant", "traditional"],
  monogram: ["elegant", "serif", "luxury", "classic", "refined", "ornate"],
  emblem: ["bold", "serif", "classic", "display", "ornate", "traditional"],
  symbol: ["geometric", "bold", "modern", "clean", "minimal", "display"],
  gradient: ["modern", "bold", "vibrant", "futuristic", "clean", "dynamic"],
  hologram: ["futuristic", "neon", "bold", "modern", "tech", "vibrant"],
  iridescent: ["modern", "futuristic", "light", "elegant", "vibrant", "feminine"],
  luminous: ["light", "modern", "elegant", "clean", "neon", "vibrant"],
  matte: ["modern", "minimal", "clean", "neutral", "professional", "muted"],
  glossy: ["modern", "clean", "bold", "vibrant", "polished", "premium"],
  transparent: ["modern", "clean", "light", "minimal", "elegant", "thin"],
  opaque: ["bold", "heavy", "dark", "modern", "strong", "impactful"],
  monochrome: ["minimal", "modern", "editorial", "bold", "clean", "neutral"],
  duotone: ["bold", "modern", "editorial", "vibrant", "pop", "graphic"],
  saturated: ["bold", "vibrant", "energetic", "pop", "fun", "warm"],
  noire: ["dark", "moody", "editorial", "serif", "elegant", "dramatic"],
  shadowy: ["dark", "moody", "gothic", "mysterious", "heavy", "dramatic"],
  twilight: ["moody", "dark", "romantic", "soft", "cool", "mysterious"],
  midnight: ["dark", "bold", "moody", "elegant", "gothic", "heavy"],
  dawn: ["warm", "light", "soft", "gentle", "organic", "fresh"],
  dusk: ["warm", "moody", "soft", "dark", "romantic", "vintage"],
  sunrise: ["warm", "bright", "vibrant", "organic", "light", "energetic"],
  sunset: ["warm", "vibrant", "bold", "romantic", "organic", "dramatic"],
  moonlight: ["soft", "elegant", "light", "romantic", "mysterious", "delicate"],
  starlight: ["light", "elegant", "delicate", "modern", "clean", "feminine"],
  electric: ["bold", "neon", "energetic", "modern", "vibrant", "edgy"],
  magnetic: ["bold", "modern", "dynamic", "distinctive", "impactful", "elegant"],
  atomic: ["bold", "retro", "futuristic", "modern", "geometric", "vintage"],
  velocity: ["bold", "dynamic", "modern", "energetic", "futuristic", "condensed"],
  momentum: ["bold", "dynamic", "modern", "energetic", "clean", "geometric"],
  gravity: ["heavy", "bold", "dark", "modern", "impactful", "deep"],
  pulse: ["bold", "modern", "dynamic", "energetic", "tech", "vibrant"],
  rhythm: ["flowing", "dynamic", "modern", "bold", "musical", "energetic"],
  tempo: ["bold", "dynamic", "modern", "energetic", "musical", "clean"],
  sonic: ["bold", "modern", "dynamic", "futuristic", "tech", "energetic"],
  quiet: ["minimal", "soft", "light", "clean", "gentle", "thin"],
  silent: ["minimal", "light", "thin", "clean", "elegant", "modern"],
  whisper: ["light", "thin", "delicate", "soft", "feminine", "minimal"],
  scream: ["bold", "heavy", "edgy", "punk", "grunge", "impactful"],
  roar: ["bold", "heavy", "strong", "impactful", "dramatic", "display"],
  echo: ["light", "modern", "minimal", "futuristic", "clean", "geometric"],
  static: ["tech", "monospace", "grunge", "distressed", "edgy", "raw"],
  signal: ["tech", "modern", "bold", "geometric", "clean", "futuristic"],
  broadcast: ["bold", "modern", "editorial", "display", "tech", "retro"],
  transmission: ["tech", "modern", "futuristic", "geometric", "monospace"],
  decode: ["tech", "monospace", "modern", "futuristic", "geometric", "digital"],
  cipher: ["tech", "monospace", "dark", "mysterious", "futuristic", "gothic"],
  enigma: ["mysterious", "dark", "elegant", "serif", "moody", "ornate"],
  puzzle: ["quirky", "playful", "geometric", "creative", "fun", "distinctive"],
  maze: ["geometric", "bold", "modern", "angular", "creative", "minimal"],
  labyrinth: ["ornate", "mysterious", "dark", "gothic", "flowing", "serif"],
  spiral: ["flowing", "organic", "dynamic", "artistic", "creative", "bold"],
  fractal: ["geometric", "modern", "futuristic", "tech", "creative", "bold"],
  symmetry: ["geometric", "clean", "modern", "elegant", "minimal", "balanced"],
  asymmetry: ["experimental", "creative", "bold", "modern", "quirky", "distinctive"],
  woven: ["organic", "warm", "craft", "distinctive", "earthy", "textured"],
  knit: ["warm", "organic", "soft", "craft", "friendly", "handwritten"],
  stitched: ["craft", "handwritten", "vintage", "organic", "warm", "rustic"],
  sewn: ["craft", "handwritten", "vintage", "organic", "warm", "feminine"],
  embroidered: ["ornate", "craft", "vintage", "feminine", "decorative", "elegant"],
  sketched: ["handwritten", "artistic", "light", "creative", "thin", "raw"],
  drafted: ["geometric", "clean", "modern", "technical", "monospace", "minimal"],
  blueprint: ["geometric", "monospace", "tech", "modern", "clean", "industrial"],
  schematic: ["geometric", "monospace", "tech", "modern", "clean", "minimal"],
  prototype: ["modern", "tech", "clean", "minimal", "geometric", "digital"],
  beta: ["tech", "modern", "clean", "bold", "digital", "minimal"],
  alpha: ["bold", "modern", "tech", "clean", "dynamic", "geometric"],
  omega: ["serif", "classic", "elegant", "bold", "traditional", "ornate"],
  apex: ["bold", "modern", "geometric", "sharp", "angular", "impactful"],
  zenith: ["bold", "elegant", "modern", "clean", "refined", "display"],
  summit: ["bold", "modern", "clean", "impactful", "professional", "strong"],
  peak: ["bold", "modern", "clean", "sharp", "geometric", "impactful"],
  pinnacle: ["elegant", "luxury", "refined", "serif", "bold", "premium"],
  vertex: ["geometric", "modern", "angular", "bold", "tech", "clean"],
  nexus: ["modern", "tech", "bold", "futuristic", "geometric", "clean"],
  flux: ["dynamic", "modern", "bold", "futuristic", "tech", "energetic"],
  nova: ["bold", "futuristic", "vibrant", "modern", "dynamic", "dramatic"],
  aurora: ["light", "vibrant", "modern", "elegant", "feminine", "flowing"],
  nebula: ["futuristic", "dark", "bold", "modern", "mysterious", "dramatic"],
  astral: ["futuristic", "modern", "elegant", "light", "mysterious", "cosmic"],
  stellar: ["bold", "modern", "futuristic", "clean", "dynamic", "elegant"],
  lunar: ["soft", "modern", "elegant", "light", "cool", "minimal"],
  solar: ["warm", "bold", "bright", "modern", "energetic", "vibrant"],
  terra: ["earthy", "organic", "warm", "natural", "rustic", "bold"],
  aqua: ["cool", "modern", "clean", "fresh", "friendly", "light"],
  ignis: ["bold", "warm", "dramatic", "vibrant", "energetic", "fiery"],
  aether: ["light", "elegant", "modern", "futuristic", "delicate", "flowing"],
  prism: ["modern", "geometric", "vibrant", "bold", "clean", "futuristic"],
  spectrum: ["vibrant", "bold", "modern", "colorful", "dynamic", "geometric"],
  catalyst: ["bold", "modern", "dynamic", "tech", "clean", "energetic"],
  synthesis: ["modern", "tech", "clean", "geometric", "futuristic", "bold"],
  fusion: ["bold", "modern", "dynamic", "futuristic", "energetic", "tech"],
  analog: ["vintage", "retro", "warm", "organic", "handwritten", "rustic"],
  vinyl: ["vintage", "retro", "bold", "warm", "groovy", "70s"],
  cassette: ["retro", "vintage", "80s", "fun", "nostalgic", "bold"],
  polaroid: ["vintage", "retro", "warm", "nostalgic", "friendly", "organic"],
  darkroom: ["dark", "moody", "vintage", "editorial", "artistic", "minimal"],
  typewriter: ["monospace", "vintage", "literary", "distressed", "editorial", "retro"],
  telegraph: ["vintage", "monospace", "distressed", "industrial", "bold", "retro"],
  parchment: ["vintage", "serif", "warm", "ornate", "traditional", "organic"],
  manuscript: ["serif", "literary", "vintage", "ornate", "traditional", "elegant"],
  chronicle: ["serif", "literary", "editorial", "classic", "traditional", "elegant"],
  gazette: ["editorial", "serif", "vintage", "literary", "classic", "bold"],
  journal: ["editorial", "literary", "serif", "warm", "personal", "handwritten"],
  memoir: ["literary", "serif", "elegant", "personal", "warm", "classic"],
  opus: ["elegant", "serif", "dramatic", "literary", "classic", "ornate"],
  verse: ["literary", "serif", "elegant", "flowing", "script", "romantic"],
  prose: ["literary", "serif", "editorial", "classic", "warm", "readable"],
  sonnet: ["literary", "serif", "elegant", "classic", "romantic", "flowing"],
  haiku: ["minimal", "clean", "japanese", "zen", "elegant", "light"],
  anthem: ["bold", "dramatic", "impactful", "heavy", "serif", "display"],
  ballad: ["flowing", "romantic", "serif", "literary", "script", "warm"],
  lullaby: ["soft", "gentle", "feminine", "delicate", "script", "warm"],
  serenade: ["romantic", "flowing", "elegant", "script", "feminine", "warm"],
  requiem: ["dark", "moody", "serif", "gothic", "dramatic", "heavy"],
  overture: ["dramatic", "elegant", "serif", "bold", "ornate", "display"],
  crescendo: ["bold", "dramatic", "dynamic", "energetic", "display", "impactful"],
  cadence: ["flowing", "modern", "elegant", "clean", "musical", "dynamic"],
  melody: ["flowing", "script", "feminine", "warm", "elegant", "soft"],
  symphony: ["elegant", "ornate", "serif", "dramatic", "classic", "refined"],
  concerto: ["elegant", "serif", "classic", "ornate", "refined", "dramatic"],
  ensemble: ["warm", "elegant", "serif", "classic", "refined", "harmonious"],

  // ═══════════════════════════════════════════════
  // BATCH 1 — Specific business types & venues
  // ═══════════════════════════════════════════════
  saloon: ["western", "vintage", "rustic", "serif", "distressed", "bold", "earthy"],
  barbershop: ["vintage", "bold", "serif", "retro", "western", "display", "masculine"],
  barber: ["vintage", "bold", "serif", "retro", "display", "masculine"],
  "tattoo parlor": ["gothic", "bold", "ornate", "edgy", "dark", "script", "display"],
  "tattoo shop": ["gothic", "bold", "ornate", "edgy", "dark", "display"],
  florist: ["feminine", "script", "elegant", "romantic", "organic", "delicate", "soft"],
  "flower shop": ["feminine", "script", "romantic", "organic", "warm", "soft"],
  bookstore: ["literary", "serif", "classic", "warm", "editorial", "vintage"],
  bookshop: ["literary", "serif", "classic", "warm", "editorial", "vintage"],
  library: ["literary", "serif", "classic", "traditional", "elegant", "academic"],
  pharmacy: ["clean", "professional", "modern", "trustworthy", "friendly", "minimal"],
  dispensary: ["modern", "clean", "organic", "friendly", "minimal", "bold"],
  "record store": ["vintage", "retro", "bold", "groovy", "fun", "edgy"],
  "vinyl shop": ["vintage", "retro", "bold", "groovy", "warm", "display"],
  thrift: ["vintage", "handwritten", "fun", "quirky", "retro", "rustic"],
  "thrift store": ["vintage", "handwritten", "fun", "quirky", "retro", "eclectic"],
  antique: ["vintage", "serif", "ornate", "traditional", "classic", "elegant"],
  "antique shop": ["vintage", "serif", "ornate", "traditional", "classic", "warm"],
  pawnshop: ["vintage", "bold", "distressed", "retro", "display", "industrial"],
  laundromat: ["retro", "clean", "bold", "fun", "vintage", "friendly"],
  "nail salon": ["feminine", "elegant", "modern", "girly", "script", "beauty"],
  "hair salon": ["feminine", "elegant", "modern", "beauty", "clean", "script"],
  "auto shop": ["bold", "industrial", "vintage", "heavy", "display", "stencil"],
  mechanic: ["bold", "industrial", "heavy", "stencil", "vintage", "display"],
  garage: ["bold", "industrial", "heavy", "vintage", "display", "stencil"],
  bodega: ["bold", "friendly", "vintage", "warm", "urban", "handwritten"],
  deli: ["warm", "friendly", "vintage", "handwritten", "rustic", "bold"],
  butcher: ["bold", "vintage", "rustic", "serif", "heavy", "traditional"],
  fishmonger: ["vintage", "serif", "bold", "rustic", "traditional", "nautical"],
  market: ["friendly", "warm", "organic", "bold", "rustic", "handwritten"],
  "farmers market": ["organic", "handwritten", "rustic", "warm", "earthy", "friendly"],
  apothecary: ["vintage", "serif", "ornate", "gothic", "elegant", "traditional"],
  jeweler: ["elegant", "serif", "luxury", "refined", "delicate", "premium"],
  "jewelry store": ["elegant", "serif", "luxury", "refined", "feminine", "premium"],
  tailor: ["classic", "elegant", "serif", "refined", "traditional", "sophisticated"],
  seamstress: ["feminine", "vintage", "script", "elegant", "delicate", "handwritten"],
  cobbler: ["vintage", "serif", "rustic", "traditional", "craft", "warm"],
  "ice cream": ["fun", "playful", "rounded", "friendly", "bubbly", "cute", "retro"],
  "ice cream shop": ["fun", "playful", "rounded", "friendly", "bubbly", "cute"],
  gelato: ["warm", "friendly", "fun", "modern", "rounded", "playful"],
  donut: ["fun", "playful", "rounded", "bold", "retro", "bubbly", "friendly"],
  "donut shop": ["fun", "playful", "rounded", "bold", "retro", "friendly"],
  juice: ["fresh", "modern", "clean", "organic", "friendly", "bold", "rounded"],
  "juice bar": ["fresh", "modern", "clean", "organic", "friendly", "bold"],
  smoothie: ["fresh", "modern", "friendly", "organic", "rounded", "fun"],
  taqueria: ["bold", "warm", "fun", "vibrant", "rustic", "friendly"],
  taco: ["bold", "warm", "fun", "vibrant", "friendly", "rustic"],
  noodle: ["bold", "warm", "friendly", "modern", "fun", "rounded"],
  pho: ["warm", "modern", "clean", "friendly", "minimal", "organic"],
  dumpling: ["warm", "friendly", "rounded", "fun", "modern", "bold"],
  whiskey: ["bold", "serif", "vintage", "western", "rustic", "warm", "masculine"],
  bourbon: ["bold", "serif", "vintage", "western", "warm", "luxury", "rustic"],
  scotch: ["elegant", "serif", "classic", "refined", "luxury", "warm"],
  gin: ["elegant", "modern", "clean", "botanical", "refined", "serif"],
  vodka: ["clean", "modern", "minimal", "bold", "geometric", "cold"],
  tequila: ["bold", "vibrant", "warm", "fun", "rustic", "display"],
  rum: ["vintage", "bold", "rustic", "warm", "pirate", "display"],
  mezcal: ["rustic", "organic", "bold", "warm", "earthy", "artisanal"],
  distillery: ["vintage", "serif", "bold", "industrial", "craft", "rustic"],
  vineyard: ["elegant", "serif", "organic", "warm", "classic", "refined"],
  pub: ["bold", "vintage", "warm", "rustic", "serif", "friendly"],
  tavern: ["vintage", "serif", "bold", "warm", "rustic", "western"],
  cantina: ["bold", "vintage", "rustic", "warm", "western", "earthy"],
  speakeasy: ["vintage", "elegant", "serif", "luxury", "dark", "ornate", "retro"],
  lounge: ["elegant", "modern", "luxury", "dark", "moody", "serif"],
  rooftop: ["modern", "elegant", "bold", "luxury", "clean", "urban"],
  bowling: ["retro", "fun", "bold", "vintage", "friendly", "display"],
  "escape room": ["dark", "mysterious", "bold", "gothic", "edgy", "fun"],
  casino: ["luxury", "bold", "serif", "ornate", "display", "neon", "dramatic"],
  motel: ["retro", "vintage", "bold", "neon", "distressed", "display"],
  hostel: ["fun", "friendly", "bold", "modern", "playful", "handwritten"],
  "bed and breakfast": ["warm", "friendly", "serif", "vintage", "organic", "script"],
  resort: ["luxury", "elegant", "modern", "serif", "premium", "refined"],
  campground: ["rustic", "organic", "earthy", "bold", "western", "handwritten"],
  marina: ["nautical", "bold", "serif", "classic", "clean", "traditional"],
  dock: ["nautical", "bold", "vintage", "industrial", "serif", "rustic"],
  harbor: ["nautical", "bold", "serif", "traditional", "vintage", "clean"],
  lighthouse: ["nautical", "vintage", "serif", "bold", "classic", "traditional"],
  ranch: ["western", "rustic", "bold", "serif", "earthy", "vintage"],
  farm: ["organic", "rustic", "earthy", "handwritten", "warm", "friendly"],
  orchard: ["organic", "warm", "serif", "vintage", "earthy", "natural"],
  nursery: ["soft", "friendly", "rounded", "warm", "organic", "gentle"],
  greenhouse: ["organic", "modern", "clean", "warm", "natural", "friendly"],
  laundry: ["clean", "modern", "friendly", "retro", "minimal", "bold"],

  // ═══════════════════════════════════════════════
  // BATCH 2 — Occasions, events, milestones
  // ═══════════════════════════════════════════════
  funeral: ["serif", "traditional", "elegant", "dark", "classic", "formal", "somber"],
  memorial: ["serif", "traditional", "elegant", "classic", "formal", "solemn"],
  obituary: ["serif", "traditional", "literary", "classic", "elegant", "formal"],
  baptism: ["elegant", "serif", "traditional", "script", "delicate", "classic"],
  christening: ["elegant", "serif", "script", "traditional", "delicate", "feminine"],
  communion: ["elegant", "traditional", "serif", "classic", "formal", "refined"],
  "bar mitzvah": ["elegant", "serif", "traditional", "ornate", "classic", "formal"],
  "bat mitzvah": ["elegant", "serif", "traditional", "ornate", "feminine", "formal"],
  quinceanera: ["feminine", "elegant", "ornate", "script", "romantic", "luxury"],
  prom: ["elegant", "feminine", "modern", "bold", "fun", "glamorous"],
  homecoming: ["bold", "fun", "modern", "energetic", "display", "friendly"],
  graduation: ["serif", "traditional", "elegant", "classic", "formal", "academic"],
  commencement: ["serif", "traditional", "elegant", "classic", "formal", "academic"],
  diploma: ["serif", "traditional", "formal", "classic", "elegant", "ornate"],
  certificate: ["serif", "formal", "traditional", "clean", "professional", "classic"],
  award: ["serif", "elegant", "bold", "formal", "classic", "display"],
  trophy: ["bold", "display", "impactful", "heavy", "serif", "dramatic"],
  anniversary: ["elegant", "serif", "romantic", "script", "refined", "warm"],
  birthday: ["fun", "playful", "bold", "bubbly", "colorful", "friendly"],
  "baby shower": ["soft", "feminine", "cute", "rounded", "friendly", "playful"],
  shower: ["soft", "feminine", "cute", "friendly", "elegant", "script"],
  engagement: ["elegant", "romantic", "script", "serif", "refined", "feminine"],
  bridal: ["elegant", "romantic", "script", "feminine", "refined", "delicate"],
  bachelorette: ["fun", "feminine", "bold", "girly", "playful", "pop"],
  bachelor: ["bold", "modern", "fun", "masculine", "clean", "display"],
  reception: ["elegant", "serif", "modern", "refined", "warm", "clean"],
  ceremony: ["elegant", "serif", "traditional", "formal", "classic", "refined"],
  gala: ["luxury", "elegant", "serif", "ornate", "refined", "dramatic"],
  banquet: ["elegant", "serif", "traditional", "formal", "classic", "refined"],
  fundraiser: ["professional", "clean", "modern", "friendly", "warm", "serif"],
  auction: ["bold", "serif", "classic", "elegant", "display", "vintage"],
  raffle: ["fun", "bold", "playful", "friendly", "display", "retro"],
  carnival: ["bold", "fun", "retro", "display", "vibrant", "playful", "circus"],
  circus: ["bold", "display", "retro", "fun", "vintage", "playful", "ornate"],
  fair: ["fun", "friendly", "retro", "vintage", "bold", "playful"],
  parade: ["bold", "fun", "display", "vibrant", "energetic", "retro"],
  "haunted house": ["horror", "dark", "gothic", "distressed", "spooky", "bold", "display"],
  hayride: ["rustic", "western", "warm", "handwritten", "earthy", "fun"],
  bonfire: ["warm", "rustic", "bold", "earthy", "organic", "western"],
  cookout: ["warm", "friendly", "bold", "fun", "rustic", "handwritten"],
  barbecue: ["bold", "rustic", "warm", "western", "vintage", "display"],
  bbq: ["bold", "rustic", "warm", "western", "vintage", "display"],
  picnic: ["friendly", "warm", "organic", "handwritten", "fun", "soft"],
  potluck: ["friendly", "warm", "handwritten", "fun", "organic", "casual"],
  brunch: ["warm", "friendly", "modern", "serif", "feminine", "editorial"],
  "happy hour": ["bold", "fun", "retro", "neon", "vintage", "modern"],
  karaoke: ["bold", "fun", "neon", "retro", "display", "pop"],
  trivia: ["fun", "retro", "bold", "friendly", "display", "vintage"],
  "open mic": ["handwritten", "bold", "vintage", "indie", "warm", "casual"],
  recital: ["elegant", "serif", "classic", "traditional", "formal", "refined"],
  exhibit: ["modern", "editorial", "minimal", "clean", "artistic", "gallery"],
  exhibition: ["modern", "editorial", "minimal", "clean", "artistic", "gallery"],
  showcase: ["modern", "bold", "editorial", "clean", "display", "distinctive"],
  premiere: ["bold", "elegant", "dramatic", "display", "serif", "luxury"],
  screening: ["modern", "editorial", "bold", "cinema", "display", "clean"],
  marathon: ["bold", "strong", "dynamic", "energetic", "modern", "display"],
  tournament: ["bold", "display", "heavy", "dynamic", "competitive", "gaming"],
  championship: ["bold", "display", "heavy", "impactful", "dramatic", "serif"],
  playoffs: ["bold", "display", "heavy", "dynamic", "energetic", "dramatic"],
  rally: ["bold", "heavy", "impactful", "display", "edgy", "dynamic"],
  protest: ["bold", "heavy", "edgy", "stencil", "impactful", "raw"],
  march: ["bold", "heavy", "stencil", "impactful", "strong", "display"],
  vigil: ["soft", "serif", "traditional", "gentle", "warm", "somber"],
  retreat: ["soft", "organic", "warm", "friendly", "zen", "minimal"],
  workshop: ["modern", "clean", "friendly", "bold", "professional", "warm"],
  seminar: ["professional", "serif", "clean", "modern", "corporate", "formal"],
  conference: ["professional", "modern", "clean", "corporate", "bold", "serif"],
  symposium: ["serif", "traditional", "academic", "formal", "elegant", "literary"],
  webinar: ["modern", "clean", "tech", "professional", "friendly", "bold"],
  meetup: ["modern", "friendly", "bold", "clean", "casual", "fun"],
  hackathon: ["tech", "bold", "modern", "monospace", "energetic", "display"],

  // ═══════════════════════════════════════════════
  // BATCH 3 — Design deliverables & print items
  // ═══════════════════════════════════════════════
  "business card": ["professional", "clean", "modern", "minimal", "elegant", "serif"],
  letterhead: ["professional", "serif", "clean", "elegant", "formal", "classic"],
  stationery: ["elegant", "serif", "refined", "script", "feminine", "classic"],
  envelope: ["elegant", "serif", "script", "classic", "refined", "formal"],
  notecard: ["elegant", "serif", "script", "warm", "feminine", "delicate"],
  postcard: ["bold", "display", "fun", "vintage", "retro", "friendly"],
  brochure: ["professional", "modern", "clean", "editorial", "serif", "corporate"],
  pamphlet: ["clean", "modern", "professional", "friendly", "serif", "readable"],
  booklet: ["editorial", "serif", "clean", "modern", "readable", "literary"],
  catalog: ["editorial", "clean", "modern", "serif", "professional", "elegant"],
  catalogue: ["editorial", "clean", "modern", "serif", "professional", "elegant"],
  lookbook: ["editorial", "fashion", "elegant", "modern", "bold", "serif"],
  zine: ["raw", "grunge", "edgy", "handwritten", "punk", "alternative", "indie"],
  playbill: ["serif", "classic", "dramatic", "elegant", "ornate", "display"],
  program: ["serif", "classic", "clean", "professional", "formal", "editorial"],
  programme: ["serif", "classic", "clean", "professional", "formal", "editorial"],
  ticket: ["bold", "display", "vintage", "fun", "retro", "condensed"],
  voucher: ["professional", "clean", "bold", "modern", "serif", "display"],
  coupon: ["bold", "display", "fun", "retro", "condensed", "friendly"],
  receipt: ["monospace", "clean", "minimal", "modern", "professional", "tech"],
  invoice: ["professional", "clean", "modern", "monospace", "minimal", "serif"],
  quote: ["professional", "clean", "modern", "serif", "minimal", "elegant"],
  proposal: ["professional", "modern", "clean", "serif", "elegant", "corporate"],
  contract: ["professional", "serif", "formal", "clean", "traditional", "classic"],
  report: ["professional", "serif", "clean", "corporate", "modern", "readable"],
  whitepaper: ["professional", "serif", "clean", "editorial", "modern", "literary"],
  ebook: ["modern", "clean", "serif", "editorial", "readable", "literary"],
  handbook: ["professional", "clean", "modern", "serif", "readable", "friendly"],
  manual: ["clean", "modern", "professional", "monospace", "technical", "readable"],
  guidebook: ["friendly", "warm", "modern", "clean", "serif", "readable"],
  textbook: ["serif", "academic", "clean", "professional", "readable", "literary"],
  workbook: ["clean", "friendly", "modern", "readable", "professional", "rounded"],
  planner: ["clean", "modern", "minimal", "friendly", "serif", "organized"],
  calendar: ["clean", "modern", "bold", "minimal", "display", "friendly"],
  agenda: ["clean", "professional", "modern", "minimal", "serif", "bold"],
  schedule: ["clean", "modern", "professional", "minimal", "monospace", "bold"],
  timetable: ["clean", "monospace", "modern", "professional", "minimal", "bold"],
  "place card": ["elegant", "script", "serif", "formal", "refined", "delicate"],
  "name tag": ["friendly", "bold", "clean", "modern", "display", "rounded"],
  lanyard: ["bold", "modern", "clean", "professional", "display", "condensed"],
  banner: ["bold", "display", "impactful", "heavy", "condensed", "dramatic"],
  pennant: ["bold", "retro", "vintage", "display", "fun", "condensed"],
  flag: ["bold", "display", "impactful", "heavy", "condensed", "serif"],
  bumper: ["bold", "display", "condensed", "fun", "impactful", "retro"],
  "bumper sticker": ["bold", "display", "condensed", "fun", "impactful", "retro"],
  decal: ["bold", "display", "clean", "modern", "condensed", "stencil"],
  patch: ["bold", "vintage", "display", "condensed", "stencil", "retro"],
  pin: ["bold", "display", "condensed", "vintage", "fun", "retro"],
  button: ["bold", "display", "fun", "retro", "condensed", "vintage"],
  coaster: ["vintage", "bold", "display", "retro", "rustic", "fun"],
  napkin: ["elegant", "script", "serif", "vintage", "warm", "friendly"],
  matchbook: ["vintage", "retro", "bold", "display", "rustic", "fun"],
  "gift tag": ["feminine", "script", "elegant", "cute", "handwritten", "delicate"],
  "gift card": ["modern", "clean", "bold", "friendly", "elegant", "fun"],
  "thank you card": ["script", "elegant", "feminine", "warm", "handwritten", "delicate"],
  "greeting card": ["warm", "friendly", "script", "elegant", "handwritten", "fun"],
  "holiday card": ["warm", "elegant", "festive", "serif", "script", "friendly"],
  "christmas card": ["warm", "elegant", "serif", "script", "festive", "traditional"],
  valentine: ["romantic", "script", "feminine", "elegant", "delicate", "warm"],
  valentines: ["romantic", "script", "feminine", "elegant", "delicate", "warm"],

  // ═══════════════════════════════════════════════
  // BATCH 4 — Action verbs & descriptive phrases
  // ═══════════════════════════════════════════════
  announce: ["bold", "display", "serif", "impactful", "dramatic", "heavy"],
  announcing: ["bold", "display", "serif", "impactful", "dramatic", "heavy"],
  celebrate: ["fun", "bold", "playful", "elegant", "vibrant", "display"],
  celebrating: ["fun", "bold", "playful", "elegant", "vibrant", "energetic"],
  invite: ["elegant", "script", "serif", "feminine", "refined", "romantic"],
  inviting: ["warm", "elegant", "script", "serif", "refined", "friendly"],
  promote: ["bold", "modern", "display", "impactful", "clean", "dynamic"],
  promoting: ["bold", "modern", "display", "impactful", "dynamic", "energetic"],
  advertise: ["bold", "display", "impactful", "modern", "heavy", "condensed"],
  launch: ["bold", "modern", "dynamic", "futuristic", "display", "impactful"],
  launching: ["bold", "modern", "dynamic", "futuristic", "display", "energetic"],
  introduce: ["modern", "clean", "elegant", "serif", "professional", "friendly"],
  introducing: ["modern", "elegant", "serif", "bold", "editorial", "display"],
  welcome: ["warm", "friendly", "serif", "elegant", "inviting", "soft"],
  welcoming: ["warm", "friendly", "soft", "inviting", "rounded", "organic"],
  remember: ["serif", "classic", "warm", "vintage", "literary", "elegant"],
  honor: ["serif", "traditional", "elegant", "classic", "formal", "refined"],
  honoring: ["serif", "traditional", "elegant", "classic", "formal", "refined"],
  inspire: ["bold", "modern", "elegant", "display", "dynamic", "creative"],
  inspiring: ["bold", "modern", "elegant", "dynamic", "creative", "warm"],
  empower: ["bold", "modern", "strong", "impactful", "dynamic", "display"],
  transform: ["modern", "bold", "dynamic", "futuristic", "geometric", "clean"],
  discover: ["modern", "bold", "editorial", "warm", "dynamic", "friendly"],
  explore: ["modern", "bold", "warm", "editorial", "dynamic", "friendly"],
  create: ["creative", "bold", "modern", "artistic", "distinctive", "dynamic"],
  build: ["bold", "modern", "strong", "clean", "professional", "geometric"],
  grow: ["organic", "warm", "modern", "friendly", "bold", "dynamic"],
  connect: ["modern", "friendly", "warm", "clean", "rounded", "professional"],
  unite: ["modern", "bold", "warm", "friendly", "clean", "strong"],
  gather: ["warm", "friendly", "organic", "handwritten", "inviting", "soft"],
  curate: ["editorial", "elegant", "modern", "minimal", "refined", "distinctive"],
  design: ["modern", "clean", "creative", "bold", "geometric", "minimal"],
  imagine: ["creative", "distinctive", "modern", "bold", "playful", "artistic"],
  dream: ["soft", "romantic", "feminine", "script", "dreamy", "delicate"],
  savor: ["warm", "elegant", "serif", "luxury", "organic", "refined"],
  indulge: ["luxury", "elegant", "serif", "warm", "premium", "refined"],
  awaken: ["bold", "modern", "dynamic", "fresh", "energetic", "clean"],
  thrive: ["bold", "modern", "dynamic", "energetic", "organic", "warm"],
  hustle: ["bold", "urban", "modern", "edgy", "heavy", "display"],
  grind: ["bold", "heavy", "urban", "edgy", "industrial", "dark"],
  manifest: ["modern", "bold", "clean", "distinctive", "display", "elegant"],

  // ═══════════════════════════════════════════════
  // BATCH 5 — Holidays & seasonal specifics
  // ═══════════════════════════════════════════════
  christmas: ["warm", "traditional", "serif", "ornate", "elegant", "festive", "script"],
  xmas: ["warm", "traditional", "serif", "ornate", "elegant", "festive"],
  hanukkah: ["elegant", "serif", "traditional", "ornate", "classic", "refined"],
  chanukah: ["elegant", "serif", "traditional", "ornate", "classic", "refined"],
  kwanzaa: ["bold", "warm", "vibrant", "earthy", "organic", "traditional"],
  diwali: ["ornate", "elegant", "bold", "vibrant", "warm", "decorative"],
  "lunar new year": ["bold", "ornate", "vibrant", "traditional", "elegant", "decorative"],
  "chinese new year": ["bold", "ornate", "vibrant", "traditional", "elegant", "red"],
  easter: ["soft", "feminine", "script", "pastel", "warm", "friendly", "delicate"],
  passover: ["traditional", "serif", "elegant", "classic", "formal", "refined"],
  ramadan: ["elegant", "ornate", "serif", "traditional", "refined", "warm"],
  eid: ["elegant", "ornate", "bold", "warm", "decorative", "refined"],
  thanksgiving: ["warm", "serif", "traditional", "rustic", "organic", "earthy"],
  "new year": ["bold", "modern", "elegant", "display", "neon", "dramatic"],
  "new years": ["bold", "modern", "elegant", "display", "neon", "dramatic"],
  "nye": ["bold", "modern", "elegant", "neon", "dramatic", "display"],
  "fourth of july": ["bold", "traditional", "display", "vintage", "retro", "stencil"],
  "independence day": ["bold", "serif", "traditional", "display", "stencil", "heavy"],
  "memorial day": ["serif", "traditional", "bold", "formal", "classic", "strong"],
  "veterans day": ["serif", "traditional", "bold", "formal", "classic", "stencil"],
  "labor day": ["bold", "industrial", "serif", "traditional", "heavy", "display"],
  "mothers day": ["feminine", "script", "elegant", "romantic", "soft", "warm"],
  "fathers day": ["serif", "bold", "classic", "traditional", "clean", "strong"],
  "valentines day": ["romantic", "script", "feminine", "elegant", "delicate", "pink"],
  "st patricks": ["bold", "fun", "friendly", "vintage", "display", "serif"],
  "cinco de mayo": ["bold", "vibrant", "fun", "display", "warm", "festive"],
  "day of the dead": ["ornate", "bold", "vibrant", "decorative", "display", "gothic"],
  "dia de los muertos": ["ornate", "bold", "vibrant", "decorative", "display", "gothic"],
  mardi: ["bold", "ornate", "fun", "vibrant", "display", "decorative"],
  "mardi gras": ["bold", "ornate", "fun", "vibrant", "display", "decorative"],
  oktoberfest: ["bold", "vintage", "display", "gothic", "rustic", "traditional"],
  harvest: ["warm", "rustic", "organic", "earthy", "vintage", "serif"],
  solstice: ["organic", "elegant", "mystical", "flowing", "warm", "natural"],
  equinox: ["organic", "modern", "elegant", "balanced", "clean", "natural"],

  // ═══════════════════════════════════════════════
  // BATCH 6 — Professions, roles & personas
  // ═══════════════════════════════════════════════
  lawyer: ["professional", "serif", "traditional", "authoritative", "clean", "formal"],
  attorney: ["professional", "serif", "traditional", "authoritative", "formal", "classic"],
  "law firm": ["professional", "serif", "traditional", "authoritative", "elegant", "formal"],
  doctor: ["professional", "clean", "modern", "trustworthy", "serif", "minimal"],
  dentist: ["clean", "professional", "modern", "friendly", "trustworthy", "minimal"],
  therapist: ["warm", "friendly", "soft", "organic", "clean", "approachable"],
  counselor: ["warm", "friendly", "professional", "soft", "approachable", "clean"],
  psychologist: ["warm", "professional", "clean", "serif", "trustworthy", "modern"],
  veterinarian: ["friendly", "warm", "organic", "clean", "approachable", "modern"],
  vet: ["friendly", "warm", "organic", "clean", "approachable", "playful"],
  nurse: ["clean", "professional", "warm", "friendly", "modern", "approachable"],
  surgeon: ["professional", "clean", "modern", "bold", "serif", "authoritative"],
  architect: ["geometric", "modern", "clean", "minimal", "structured", "bold"],
  engineer: ["modern", "clean", "geometric", "professional", "tech", "structured"],
  scientist: ["clean", "modern", "professional", "monospace", "technical", "minimal"],
  researcher: ["serif", "academic", "clean", "professional", "literary", "modern"],
  professor: ["serif", "academic", "literary", "classic", "authoritative", "traditional"],
  teacher: ["friendly", "warm", "clean", "approachable", "readable", "modern"],
  tutor: ["friendly", "clean", "modern", "approachable", "warm", "readable"],
  coach: ["bold", "modern", "dynamic", "energetic", "strong", "friendly"],
  trainer: ["bold", "modern", "dynamic", "energetic", "strong", "clean"],
  instructor: ["clean", "professional", "friendly", "modern", "bold", "readable"],
  chef: ["warm", "elegant", "serif", "organic", "bold", "artisanal"],
  baker: ["warm", "friendly", "handwritten", "organic", "feminine", "soft"],
  barista: ["warm", "modern", "friendly", "organic", "clean", "handwritten"],
  bartender: ["bold", "vintage", "modern", "warm", "urban", "display"],
  sommelier: ["elegant", "serif", "refined", "luxury", "classic", "warm"],
  photographer: ["editorial", "modern", "distinctive", "clean", "artistic", "bold"],
  videographer: ["modern", "bold", "dynamic", "clean", "cinematic", "editorial"],
  filmmaker: ["editorial", "dramatic", "bold", "cinematic", "distinctive", "serif"],
  animator: ["fun", "playful", "creative", "bold", "modern", "dynamic"],
  illustrator: ["artistic", "creative", "handwritten", "playful", "distinctive", "bold"],
  painter: ["artistic", "brush", "expressive", "creative", "bold", "organic"],
  sculptor: ["bold", "modern", "artistic", "geometric", "distinctive", "heavy"],
  ceramicist: ["organic", "warm", "craft", "handwritten", "earthy", "artistic"],
  potter: ["organic", "warm", "earthy", "craft", "handwritten", "rustic"],
  woodworker: ["rustic", "organic", "craft", "bold", "warm", "earthy"],
  carpenter: ["rustic", "bold", "craft", "vintage", "western", "industrial"],
  blacksmith: ["bold", "heavy", "industrial", "dark", "gothic", "vintage"],
  goldsmith: ["elegant", "luxury", "refined", "serif", "ornate", "premium"],
  weaver: ["organic", "warm", "craft", "handwritten", "earthy", "textile"],
  calligrapher: ["script", "elegant", "flowing", "ornate", "formal", "artistic"],
  typographer: ["editorial", "modern", "geometric", "bold", "clean", "display"],
  journalist: ["editorial", "serif", "literary", "bold", "modern", "authoritative"],
  reporter: ["editorial", "serif", "bold", "modern", "authoritative", "clean"],
  editor: ["editorial", "serif", "literary", "clean", "modern", "elegant"],
  publisher: ["editorial", "serif", "classic", "literary", "elegant", "traditional"],
  author: ["literary", "serif", "editorial", "classic", "elegant", "warm"],
  poet: ["literary", "serif", "elegant", "flowing", "script", "romantic"],
  novelist: ["literary", "serif", "classic", "editorial", "warm", "elegant"],
  playwright: ["dramatic", "serif", "elegant", "literary", "classic", "ornate"],
  screenwriter: ["modern", "clean", "monospace", "editorial", "bold", "minimal"],
  composer: ["elegant", "serif", "classic", "ornate", "refined", "dramatic"],
  producer: ["modern", "bold", "clean", "tech", "dynamic", "professional"],
  dj: ["bold", "modern", "neon", "edgy", "dynamic", "display"],
  rapper: ["bold", "urban", "heavy", "edgy", "modern", "display"],
  singer: ["elegant", "flowing", "modern", "bold", "warm", "script"],
  vocalist: ["elegant", "flowing", "warm", "script", "bold", "modern"],
  dancer: ["flowing", "dynamic", "feminine", "elegant", "modern", "light"],
  choreographer: ["flowing", "modern", "elegant", "dynamic", "bold", "artistic"],
  actor: ["dramatic", "bold", "elegant", "display", "serif", "modern"],
  comedian: ["fun", "bold", "playful", "friendly", "quirky", "display"],
  magician: ["ornate", "dark", "mystical", "display", "vintage", "bold"],
  acrobat: ["dynamic", "bold", "fun", "display", "energetic", "playful"],
  pilot: ["bold", "modern", "clean", "condensed", "stencil", "display"],
  sailor: ["nautical", "bold", "vintage", "serif", "traditional", "rustic"],
  captain: ["bold", "serif", "traditional", "nautical", "authoritative", "display"],
  detective: ["dark", "moody", "serif", "vintage", "editorial", "noir"],
  spy: ["modern", "bold", "dark", "tech", "geometric", "minimal"],
  astronaut: ["futuristic", "bold", "modern", "tech", "geometric", "display"],
  rancher: ["western", "rustic", "bold", "serif", "earthy", "vintage"],
  farmer: ["organic", "rustic", "earthy", "handwritten", "warm", "friendly"],
  gardener: ["organic", "warm", "natural", "friendly", "soft", "handwritten"],
  beekeeper: ["organic", "warm", "natural", "vintage", "earthy", "handwritten"],
  fisherman: ["rustic", "bold", "nautical", "vintage", "serif", "western"],
  hunter: ["bold", "western", "rustic", "heavy", "dark", "stencil"],
  hiker: ["organic", "bold", "earthy", "modern", "dynamic", "rustic"],
  climber: ["bold", "modern", "dynamic", "heavy", "geometric", "condensed"],
  surfer: ["fun", "modern", "bold", "retro", "organic", "friendly"],
  skater: ["edgy", "bold", "urban", "grunge", "alternative", "fun"],
  biker: ["bold", "heavy", "edgy", "vintage", "western", "gothic"],
  cyclist: ["modern", "bold", "dynamic", "clean", "geometric", "condensed"],
  runner: ["bold", "dynamic", "modern", "clean", "energetic", "condensed"],
  swimmer: ["modern", "clean", "dynamic", "flowing", "bold", "minimal"],
  boxer: ["bold", "heavy", "impactful", "edgy", "display", "condensed"],
  wrestler: ["bold", "heavy", "display", "edgy", "impactful", "dark"],
  yogi: ["soft", "organic", "warm", "zen", "minimal", "flowing"],
  monk: ["minimal", "serif", "traditional", "zen", "organic", "elegant"],
  shaman: ["mystical", "organic", "dark", "ornate", "gothic", "earthy"],
  witch: ["gothic", "dark", "mystical", "ornate", "vintage", "moody"],
  druid: ["organic", "gothic", "dark", "ornate", "earthy", "mystical"],

  // ═══════════════════════════════════════════════
  // BATCH 7 — Specific product types & consumer goods
  // ═══════════════════════════════════════════════
  candle: ["warm", "elegant", "organic", "soft", "serif", "luxury"],
  candles: ["warm", "elegant", "organic", "soft", "serif", "luxury"],
  soap: ["organic", "clean", "friendly", "soft", "natural", "warm"],
  skincare: ["clean", "modern", "elegant", "minimal", "feminine", "premium"],
  cosmetics: ["elegant", "modern", "feminine", "luxury", "bold", "beauty"],
  makeup: ["feminine", "modern", "bold", "beauty", "elegant", "girly"],
  perfume: ["elegant", "luxury", "serif", "refined", "feminine", "ornate"],
  fragrance: ["elegant", "luxury", "serif", "refined", "feminine", "ornate"],
  cologne: ["bold", "modern", "serif", "luxury", "masculine", "clean"],
  shampoo: ["clean", "modern", "friendly", "organic", "soft", "rounded"],
  lotion: ["soft", "clean", "organic", "friendly", "feminine", "modern"],
  sunscreen: ["clean", "modern", "friendly", "bold", "organic", "fun"],
  supplement: ["clean", "modern", "bold", "professional", "organic", "trustworthy"],
  vitamin: ["clean", "modern", "bold", "friendly", "organic", "rounded"],
  protein: ["bold", "modern", "heavy", "dynamic", "strong", "clean"],
  sneaker: ["bold", "modern", "urban", "edgy", "dynamic", "display"],
  sneakers: ["bold", "modern", "urban", "edgy", "dynamic", "display"],
  shoe: ["modern", "clean", "bold", "elegant", "fashion", "display"],
  shoes: ["modern", "clean", "bold", "elegant", "fashion", "display"],
  boots: ["bold", "rustic", "western", "vintage", "heavy", "rugged"],
  handbag: ["luxury", "elegant", "feminine", "modern", "refined", "serif"],
  purse: ["feminine", "elegant", "luxury", "modern", "refined", "fashion"],
  wallet: ["modern", "clean", "minimal", "bold", "leather", "masculine"],
  watch: ["elegant", "modern", "bold", "luxury", "refined", "serif"],
  watches: ["elegant", "modern", "bold", "luxury", "refined", "serif"],
  sunglasses: ["bold", "modern", "fashion", "edgy", "retro", "display"],
  eyewear: ["modern", "bold", "clean", "geometric", "fashion", "minimal"],
  glasses: ["modern", "clean", "professional", "minimal", "geometric", "friendly"],
  hat: ["bold", "vintage", "western", "display", "retro", "fun"],
  cap: ["bold", "modern", "urban", "display", "condensed", "sporty"],
  scarf: ["feminine", "elegant", "soft", "flowing", "warm", "organic"],
  blanket: ["warm", "soft", "organic", "friendly", "cozy", "rounded"],
  pillow: ["soft", "warm", "friendly", "rounded", "cute", "gentle"],
  furniture: ["modern", "clean", "minimal", "warm", "elegant", "bold"],
  chair: ["modern", "clean", "minimal", "geometric", "bold", "elegant"],
  table: ["modern", "clean", "warm", "minimal", "bold", "organic"],
  lamp: ["modern", "warm", "clean", "elegant", "minimal", "bold"],
  rug: ["warm", "organic", "bohemian", "earthy", "vintage", "artistic"],
  curtain: ["elegant", "soft", "flowing", "warm", "refined", "feminine"],
  wallpaper: ["ornate", "decorative", "vintage", "elegant", "bold", "artistic"],
  tile: ["geometric", "modern", "clean", "bold", "minimal", "decorative"],
  vase: ["elegant", "modern", "artistic", "organic", "ceramic", "bold"],
  pottery: ["organic", "warm", "earthy", "craft", "handwritten", "rustic"],
  plant: ["organic", "natural", "warm", "friendly", "modern", "green"],
  succulent: ["modern", "organic", "minimal", "natural", "clean", "friendly"],
  flower: ["feminine", "romantic", "organic", "delicate", "soft", "elegant"],
  bouquet: ["feminine", "romantic", "elegant", "organic", "script", "soft"],
  wreath: ["organic", "warm", "vintage", "rustic", "traditional", "elegant"],
  garland: ["organic", "warm", "vintage", "festive", "rustic", "feminine"],
  bicycle: ["vintage", "organic", "friendly", "retro", "modern", "fun"],
  motorcycle: ["bold", "heavy", "edgy", "vintage", "western", "dark"],
  car: ["bold", "modern", "clean", "dynamic", "display", "condensed"],
  truck: ["bold", "heavy", "industrial", "western", "display", "rustic"],
  van: ["bold", "fun", "retro", "vintage", "friendly", "display"],
  boat: ["nautical", "bold", "vintage", "serif", "traditional", "clean"],
  yacht: ["luxury", "elegant", "modern", "serif", "premium", "clean"],
  skateboard: ["edgy", "bold", "urban", "grunge", "fun", "alternative"],
  surfboard: ["fun", "retro", "bold", "organic", "modern", "playful"],
  guitar: ["bold", "creative", "vintage", "edgy", "warm", "artistic"],
  piano: ["elegant", "classic", "serif", "refined", "traditional", "warm"],
  drum: ["bold", "heavy", "dynamic", "energetic", "edgy", "impactful"],
  record: ["vintage", "retro", "bold", "warm", "groovy", "display"],
  camera: ["modern", "editorial", "clean", "bold", "vintage", "artistic"],
  lens: ["modern", "clean", "sharp", "editorial", "bold", "geometric"],
  projector: ["vintage", "retro", "bold", "cinema", "display", "dramatic"],
  telescope: ["futuristic", "modern", "bold", "cosmic", "clean", "geometric"],
  microscope: ["modern", "clean", "technical", "professional", "monospace", "precise"],
  compass: ["vintage", "bold", "nautical", "western", "serif", "adventurous"],
  map: ["vintage", "serif", "editorial", "warm", "bold", "adventurous"],
  globe: ["modern", "bold", "clean", "serif", "traditional", "academic"],
  book: ["literary", "serif", "classic", "editorial", "warm", "elegant"],
  notebook: ["handwritten", "organic", "warm", "friendly", "creative", "minimal"],
  pen: ["elegant", "serif", "classic", "refined", "literary", "script"],
  pencil: ["handwritten", "organic", "creative", "friendly", "sketch", "warm"],
  ink: ["script", "gothic", "handwritten", "dark", "elegant", "flowing"],
  quill: ["script", "vintage", "elegant", "ornate", "serif", "literary"],
  scroll: ["ornate", "vintage", "serif", "medieval", "gothic", "traditional"],
  wax: ["vintage", "elegant", "ornate", "traditional", "serif", "luxury"],
  ribbon: ["feminine", "elegant", "soft", "romantic", "script", "delicate"],
  lace: ["feminine", "delicate", "vintage", "elegant", "ornate", "romantic"],
  satin: ["elegant", "luxury", "feminine", "flowing", "refined", "soft"],
  tweed: ["vintage", "traditional", "classic", "serif", "warm", "british"],
  plaid: ["rustic", "vintage", "warm", "traditional", "western", "earthy"],
  flannel: ["warm", "rustic", "organic", "friendly", "casual", "earthy"],
  corduroy: ["vintage", "warm", "retro", "earthy", "organic", "friendly"],
  suede: ["warm", "luxury", "vintage", "earthy", "organic", "soft"],

  // ═══════════════════════════════════════════════
  // BATCH 8 — More specific moods, scenes & atmospheres
  // ═══════════════════════════════════════════════
  abandoned: ["distressed", "dark", "grunge", "moody", "industrial", "raw"],
  desolate: ["dark", "minimal", "moody", "cold", "distressed", "heavy"],
  overgrown: ["organic", "vintage", "earthy", "natural", "warm", "rustic"],
  pristine: ["clean", "minimal", "modern", "elegant", "light", "refined"],
  immaculate: ["clean", "minimal", "modern", "elegant", "refined", "professional"],
  chateau: ["elegant", "serif", "luxury", "french", "refined", "vintage"],
  manor: ["elegant", "serif", "traditional", "luxury", "ornate", "classic"],
  palace: ["luxury", "ornate", "elegant", "serif", "dramatic", "refined"],
  fortress: ["bold", "heavy", "dark", "gothic", "medieval", "strong"],
  dungeon: ["dark", "gothic", "heavy", "medieval", "horror", "distressed"],
  crypt: ["dark", "gothic", "horror", "ornate", "serif", "medieval"],
  graveyard: ["dark", "gothic", "horror", "distressed", "serif", "spooky"],
  cemetery: ["serif", "traditional", "elegant", "dark", "formal", "gothic"],
  swamp: ["dark", "organic", "earthy", "moody", "distressed", "horror"],
  jungle: ["bold", "organic", "vibrant", "earthy", "dynamic", "tropical"],
  rainforest: ["organic", "lush", "vibrant", "earthy", "warm", "bold"],
  savanna: ["warm", "earthy", "organic", "bold", "natural", "golden"],
  tundra: ["cold", "minimal", "clean", "stark", "modern", "bold"],
  glacier: ["cold", "clean", "minimal", "modern", "bold", "futuristic"],
  volcano: ["bold", "dramatic", "heavy", "warm", "dark", "impactful"],
  canyon: ["bold", "rustic", "western", "earthy", "warm", "dramatic"],
  cliff: ["bold", "dramatic", "heavy", "rustic", "strong", "display"],
  waterfall: ["flowing", "organic", "natural", "dynamic", "elegant", "cool"],
  meadow: ["soft", "organic", "warm", "friendly", "natural", "gentle"],
  prairie: ["organic", "warm", "western", "rustic", "earthy", "serif"],
  oasis: ["warm", "organic", "elegant", "modern", "clean", "fresh"],
  lagoon: ["organic", "modern", "cool", "clean", "friendly", "flowing"],
  cove: ["organic", "warm", "friendly", "nautical", "modern", "clean"],
  reef: ["vibrant", "organic", "bold", "modern", "cool", "dynamic"],
  pier: ["nautical", "vintage", "bold", "rustic", "warm", "serif"],
  boardwalk: ["retro", "fun", "vintage", "bold", "warm", "friendly"],
  promenade: ["elegant", "serif", "modern", "clean", "european", "refined"],
  boulevard: ["elegant", "modern", "serif", "urban", "clean", "bold"],
  alley: ["dark", "urban", "edgy", "moody", "grunge", "raw"],
  backstreet: ["urban", "edgy", "dark", "raw", "grunge", "vintage"],
  basement: ["dark", "raw", "edgy", "industrial", "grunge", "moody"],
  attic: ["vintage", "warm", "dusty", "serif", "literary", "moody"],
  parlor: ["vintage", "elegant", "serif", "ornate", "traditional", "warm"],
  den: ["warm", "dark", "vintage", "rustic", "serif", "masculine"],
  study: ["literary", "serif", "traditional", "elegant", "warm", "classic"],
  conservatory: ["elegant", "organic", "serif", "classic", "traditional", "warm"],
  ballroom: ["elegant", "ornate", "luxury", "serif", "dramatic", "display"],
  throne: ["luxury", "ornate", "serif", "bold", "gothic", "dramatic"],
  sanctuary: ["elegant", "serif", "organic", "warm", "spiritual", "traditional"],
  chapel: ["traditional", "serif", "elegant", "gothic", "ornate", "classic"],
  altar: ["traditional", "serif", "ornate", "elegant", "gothic", "formal"],
  shrine: ["traditional", "ornate", "serif", "gothic", "mystical", "elegant"],
  grotto: ["dark", "organic", "mystical", "gothic", "moody", "ornate"],
  cavern: ["dark", "bold", "heavy", "gothic", "mysterious", "dramatic"],
  mine: ["industrial", "bold", "heavy", "dark", "rustic", "western"],
  quarry: ["industrial", "bold", "heavy", "rustic", "raw", "geometric"],
  forge: ["bold", "heavy", "industrial", "dark", "vintage", "strong"],
  foundry: ["bold", "industrial", "heavy", "vintage", "display", "dark"],
  mill: ["rustic", "industrial", "vintage", "organic", "serif", "traditional"],
  windmill: ["rustic", "organic", "vintage", "earthy", "warm", "traditional"],
  clocktower: ["vintage", "gothic", "serif", "ornate", "traditional", "bold"],
  observatory: ["modern", "futuristic", "clean", "bold", "cosmic", "geometric"],
  planetarium: ["futuristic", "modern", "bold", "cosmic", "clean", "dark"],
  aquarium: ["modern", "clean", "cool", "friendly", "organic", "flowing"],
  terrarium: ["organic", "modern", "minimal", "natural", "warm", "friendly"],
  aviary: ["organic", "elegant", "light", "flowing", "natural", "soft"],
  zoo: ["fun", "friendly", "bold", "playful", "rounded", "modern"],
  safari: ["bold", "earthy", "organic", "warm", "adventurous", "rustic"],
  expedition: ["bold", "rustic", "adventurous", "serif", "dynamic", "western"],
  voyage: ["bold", "nautical", "vintage", "serif", "adventurous", "elegant"],
  odyssey: ["bold", "serif", "dramatic", "classic", "literary", "epic"],
  pilgrimage: ["serif", "traditional", "spiritual", "elegant", "warm", "organic"],
  quest: ["bold", "serif", "dramatic", "fantasy", "ornate", "display"],
  crusade: ["bold", "serif", "gothic", "medieval", "heavy", "dramatic"],

  // ═══════════════════════════════════════════════
  // BATCH 9 — Cuisine, food culture & dining
  // ═══════════════════════════════════════════════
  tapas: ["warm", "bold", "modern", "friendly", "vibrant", "serif"],
  mezze: ["warm", "organic", "friendly", "earthy", "modern", "bold"],
  charcuterie: ["elegant", "serif", "luxury", "warm", "vintage", "artisanal"],
  fondue: ["warm", "vintage", "friendly", "elegant", "serif", "fun"],
  paella: ["warm", "vibrant", "bold", "rustic", "organic", "friendly"],
  curry: ["warm", "bold", "vibrant", "earthy", "modern", "organic"],
  steak: ["bold", "serif", "luxury", "heavy", "masculine", "vintage"],
  steakhouse: ["bold", "serif", "luxury", "heavy", "vintage", "display"],
  seafood: ["nautical", "modern", "clean", "bold", "serif", "fresh"],
  oyster: ["elegant", "serif", "nautical", "luxury", "refined", "cool"],
  lobster: ["luxury", "elegant", "serif", "bold", "nautical", "premium"],
  smokehouse: ["bold", "rustic", "vintage", "western", "warm", "heavy"],
  "soul food": ["warm", "bold", "vintage", "friendly", "handwritten", "serif"],
  comfort: ["warm", "friendly", "soft", "organic", "rounded", "serif"],
  "comfort food": ["warm", "friendly", "handwritten", "organic", "soft", "rustic"],
  vegan: ["organic", "modern", "clean", "friendly", "natural", "minimal"],
  vegetarian: ["organic", "modern", "clean", "friendly", "natural", "warm"],
  "plant based": ["organic", "modern", "clean", "natural", "friendly", "minimal"],
  "gluten free": ["clean", "modern", "friendly", "organic", "minimal", "rounded"],
  "farm to table": ["organic", "rustic", "warm", "earthy", "serif", "handwritten"],
  "farm to fork": ["organic", "rustic", "warm", "earthy", "serif", "handwritten"],
  "nose to tail": ["bold", "rustic", "vintage", "serif", "heavy", "artisanal"],
  sourdough: ["organic", "rustic", "warm", "handwritten", "earthy", "craft"],
  croissant: ["elegant", "feminine", "french", "warm", "serif", "delicate"],
  macaron: ["feminine", "elegant", "pastel", "delicate", "soft", "cute"],
  cupcake: ["cute", "feminine", "fun", "playful", "rounded", "girly"],
  cake: ["feminine", "elegant", "script", "romantic", "soft", "warm"],
  pie: ["warm", "rustic", "friendly", "vintage", "handwritten", "organic"],
  cookie: ["warm", "friendly", "rounded", "fun", "playful", "cute"],
  brownie: ["warm", "bold", "friendly", "rich", "organic", "handwritten"],
  waffle: ["warm", "friendly", "fun", "retro", "bold", "rounded"],
  pancake: ["warm", "friendly", "rounded", "fun", "playful", "retro"],
  bagel: ["bold", "friendly", "warm", "urban", "vintage", "fun"],
  pretzel: ["bold", "vintage", "retro", "fun", "display", "warm"],
  popcorn: ["fun", "retro", "bold", "playful", "vintage", "display"],
  candy: ["fun", "bubbly", "colorful", "playful", "cute", "bold"],
  caramel: ["warm", "rich", "organic", "elegant", "soft", "golden"],
  vanilla: ["soft", "warm", "cream", "elegant", "gentle", "organic"],
  cinnamon: ["warm", "earthy", "organic", "rustic", "vintage", "spicy"],
  honey: ["warm", "organic", "golden", "soft", "natural", "friendly"],
  maple: ["warm", "organic", "rustic", "earthy", "vintage", "friendly"],
  rose: ["romantic", "feminine", "elegant", "delicate", "soft", "vintage"],
  jasmine: ["elegant", "feminine", "delicate", "exotic", "warm", "soft"],
  matcha: ["modern", "organic", "clean", "japanese", "minimal", "green"],
  chai: ["warm", "earthy", "organic", "spicy", "vintage", "friendly"],
  espresso: ["bold", "modern", "warm", "rich", "italian", "display"],
  latte: ["warm", "modern", "friendly", "soft", "organic", "clean"],
  cappuccino: ["warm", "modern", "friendly", "italian", "organic", "serif"],
  americano: ["bold", "modern", "clean", "strong", "minimal", "display"],
  kombucha: ["organic", "modern", "friendly", "natural", "fun", "rounded"],
  cider: ["warm", "rustic", "vintage", "organic", "earthy", "autumn"],
  mead: ["medieval", "gothic", "vintage", "bold", "rustic", "serif"],
  sake: ["minimal", "clean", "japanese", "elegant", "modern", "zen"],
  absinthe: ["dark", "gothic", "vintage", "ornate", "mysterious", "elegant"],
  moonshine: ["rustic", "western", "bold", "distressed", "vintage", "handwritten"],

  // ═══════════════════════════════════════════════
  // BATCH 10 — More verbs, descriptive phrases & search terms
  // ═══════════════════════════════════════════════
  highlight: ["bold", "modern", "display", "vibrant", "impactful", "editorial"],
  feature: ["bold", "editorial", "modern", "display", "clean", "serif"],
  spotlight: ["bold", "display", "dramatic", "modern", "editorial", "neon"],
  amplify: ["bold", "heavy", "modern", "impactful", "dynamic", "display"],
  elevate: ["elegant", "modern", "bold", "refined", "luxury", "clean"],
  refine: ["elegant", "serif", "refined", "clean", "modern", "minimal"],
  polish: ["clean", "modern", "elegant", "refined", "professional", "serif"],
  simplify: ["clean", "minimal", "modern", "friendly", "light", "rounded"],
  streamline: ["modern", "clean", "minimal", "geometric", "bold", "condensed"],
  accelerate: ["bold", "modern", "dynamic", "futuristic", "condensed", "display"],
  ignite: ["bold", "dramatic", "warm", "energetic", "vibrant", "display"],
  spark: ["bold", "modern", "energetic", "vibrant", "dynamic", "warm"],
  bloom: ["organic", "feminine", "soft", "warm", "romantic", "flowing"],
  blossom: ["feminine", "organic", "soft", "romantic", "warm", "delicate"],
  flourish: ["elegant", "ornate", "flowing", "script", "organic", "serif"],
  wilt: ["moody", "dark", "delicate", "soft", "vintage", "gothic"],
  decay: ["dark", "distressed", "grunge", "gothic", "horror", "raw"],
  corrode: ["dark", "distressed", "grunge", "industrial", "raw", "heavy"],
  rust: ["distressed", "vintage", "rustic", "warm", "earthy", "industrial"],
  patina: ["vintage", "organic", "warm", "earthy", "rustic", "aged"],
  age: ["vintage", "serif", "distressed", "classic", "traditional", "warm"],
  aged: ["vintage", "distressed", "serif", "classic", "warm", "rustic"],
  weathered: ["distressed", "vintage", "rustic", "worn", "earthy", "western"],
  worn: ["distressed", "vintage", "rustic", "grunge", "handwritten", "raw"],
  faded: ["vintage", "soft", "muted", "retro", "light", "distressed"],
  bleached: ["light", "minimal", "vintage", "soft", "faded", "clean"],
  saturate: ["bold", "vibrant", "energetic", "pop", "warm", "rich"],
  desaturate: ["muted", "minimal", "soft", "neutral", "vintage", "clean"],
  muted: ["soft", "neutral", "minimal", "muted", "vintage", "gentle"],
  shout: ["bold", "heavy", "display", "impactful", "edgy", "loud"],
  demand: ["bold", "heavy", "display", "impactful", "serif", "authoritative"],
  command: ["bold", "serif", "authoritative", "display", "heavy", "impactful"],
  dominate: ["bold", "heavy", "display", "impactful", "dark", "dramatic"],
  conquer: ["bold", "heavy", "serif", "dramatic", "display", "impactful"],
  resist: ["bold", "edgy", "punk", "stencil", "heavy", "raw"],
  disrupt: ["bold", "modern", "edgy", "heavy", "dynamic", "display"],
  provoke: ["bold", "edgy", "dramatic", "display", "impactful", "raw"],
  seduce: ["elegant", "serif", "feminine", "luxury", "flowing", "script"],
  enchant: ["whimsical", "script", "flowing", "mystical", "feminine", "elegant"],
  bewitch: ["dark", "gothic", "mystical", "ornate", "script", "moody"],
  mesmerize: ["bold", "elegant", "modern", "distinctive", "display", "dramatic"],
  captivate: ["bold", "elegant", "modern", "dramatic", "editorial", "display"],
  enthrall: ["dramatic", "bold", "serif", "ornate", "gothic", "dark"],
  liberate: ["bold", "modern", "dynamic", "clean", "energetic", "display"],
  transcend: ["modern", "elegant", "bold", "futuristic", "clean", "flowing"],
  ascend: ["modern", "bold", "elegant", "light", "futuristic", "clean"],
  descend: ["dark", "heavy", "dramatic", "bold", "gothic", "moody"],
  emerge: ["modern", "bold", "dynamic", "clean", "organic", "display"],
  vanish: ["light", "thin", "minimal", "delicate", "modern", "elegant"],
  dissolve: ["light", "soft", "minimal", "delicate", "modern", "flowing"],
  shatter: ["bold", "edgy", "dramatic", "display", "heavy", "grunge"],
  fracture: ["edgy", "bold", "geometric", "modern", "experimental", "angular"],
  collide: ["bold", "edgy", "dynamic", "heavy", "modern", "display"],
  merge: ["modern", "clean", "flowing", "dynamic", "bold", "geometric"],
  converge: ["modern", "geometric", "bold", "clean", "dynamic", "minimal"],
  diverge: ["modern", "bold", "geometric", "dynamic", "clean", "angular"],
  wander: ["organic", "handwritten", "warm", "flowing", "vintage", "friendly"],
  drift: ["soft", "light", "flowing", "organic", "minimal", "modern"],
  soar: ["bold", "dynamic", "light", "modern", "elegant", "display"],
  plunge: ["bold", "dramatic", "heavy", "dark", "dynamic", "display"],
  dive: ["bold", "dynamic", "modern", "clean", "deep", "display"],
  surface: ["modern", "clean", "light", "minimal", "fresh", "friendly"],
  anchor: ["bold", "nautical", "serif", "traditional", "heavy", "stable"],
  ground: ["earthy", "organic", "warm", "rustic", "natural", "bold"],
  root: ["organic", "earthy", "warm", "natural", "rustic", "bold"],
  branch: ["organic", "natural", "flowing", "warm", "modern", "friendly"],
  leaf: ["organic", "natural", "modern", "clean", "fresh", "green"],
  petal: ["feminine", "delicate", "soft", "romantic", "organic", "flowing"],
  thorn: ["edgy", "gothic", "dark", "sharp", "angular", "bold"],
  seed: ["organic", "modern", "clean", "minimal", "natural", "friendly"],
  sprout: ["organic", "modern", "fresh", "friendly", "natural", "rounded"],
  reap: ["bold", "rustic", "serif", "western", "heavy", "vintage"],
  sow: ["organic", "earthy", "warm", "rustic", "natural", "handwritten"],
  cultivate: ["organic", "modern", "warm", "clean", "professional", "serif"],
  nurture: ["warm", "soft", "organic", "friendly", "gentle", "rounded"],
  nourish: ["warm", "organic", "friendly", "soft", "clean", "natural"],
  sustain: ["modern", "clean", "organic", "professional", "bold", "green"],
  preserve: ["vintage", "serif", "traditional", "classic", "elegant", "warm"],
  restore: ["vintage", "serif", "warm", "classic", "elegant", "organic"],
  renew: ["modern", "clean", "fresh", "dynamic", "bold", "light"],
  revive: ["bold", "modern", "dynamic", "vibrant", "warm", "energetic"],
  resurrect: ["dark", "bold", "gothic", "dramatic", "heavy", "serif"],
  haunt: ["dark", "gothic", "horror", "moody", "spooky", "distressed"],
  lurk: ["dark", "gothic", "horror", "moody", "edgy", "heavy"],
  creep: ["dark", "horror", "gothic", "distressed", "spooky", "edgy"],
  stalk: ["dark", "edgy", "bold", "gothic", "horror", "heavy"],
  prowl: ["dark", "bold", "edgy", "modern", "dynamic", "predatory"],
  hunt: ["bold", "western", "dark", "heavy", "display", "rustic"],
  chase: ["bold", "dynamic", "modern", "energetic", "condensed", "display"],
  race: ["bold", "dynamic", "condensed", "modern", "display", "energetic"],
  dash: ["bold", "modern", "dynamic", "condensed", "energetic", "display"],
  sprint: ["bold", "dynamic", "modern", "condensed", "energetic", "display"],
  leap: ["bold", "dynamic", "modern", "energetic", "fun", "display"],
  bounce: ["fun", "playful", "rounded", "bubbly", "energetic", "bold"],
  swing: ["retro", "fun", "vintage", "groovy", "dynamic", "bold"],
  sway: ["flowing", "organic", "soft", "gentle", "feminine", "script"],
  spin: ["dynamic", "bold", "modern", "geometric", "fun", "energetic"],
  twist: ["bold", "dynamic", "quirky", "modern", "display", "fun"],
  curl: ["feminine", "script", "flowing", "ornate", "elegant", "decorative"],
  weave: ["organic", "craft", "warm", "flowing", "earthy", "artistic"],
  knot: ["nautical", "bold", "organic", "craft", "vintage", "celtic"],
  bind: ["bold", "serif", "heavy", "traditional", "dark", "strong"],
  wrap: ["warm", "organic", "soft", "friendly", "rounded", "flowing"],
  unfold: ["modern", "elegant", "clean", "editorial", "light", "flowing"],
  reveal: ["bold", "dramatic", "modern", "elegant", "display", "editorial"],
  conceal: ["dark", "mysterious", "modern", "minimal", "moody", "elegant"],
  mask: ["dark", "mysterious", "bold", "gothic", "ornate", "dramatic"],
  unveil: ["elegant", "dramatic", "bold", "display", "serif", "luxury"],
};

// Tags that PENALIZE a pair when this prompt word appears
const KEYWORD_PENALIZE: Record<string, string[]> = {
  grunge: ["clean", "minimal", "neutral", "corporate", "professional", "polished"],
  grungy: ["clean", "minimal", "neutral", "corporate", "professional", "polished"],
  punk: ["clean", "minimal", "neutral", "corporate", "professional", "elegant"],
  edgy: ["clean", "minimal", "neutral", "corporate", "professional", "gentle"],
  girly: ["corporate", "serious", "technical", "developer", "authoritative"],
  pop: ["corporate", "serious", "minimal", "restrained", "professional"],
  cute: ["corporate", "serious", "authoritative", "professional", "technical"],
  kawaii: ["corporate", "serious", "professional", "technical", "formal"],
  wild: ["minimal", "restrained", "corporate", "neutral", "clean"],
  messy: ["clean", "polished", "refined", "minimal", "corporate"],
  dark: ["clean", "bright", "minimal", "friendly", "cute", "bubbly"],
  horror: ["clean", "friendly", "cute", "professional", "minimal", "bubbly"],
  spooky: ["clean", "friendly", "cute", "professional", "minimal"],
  gothic: ["clean", "modern", "minimal", "friendly", "cute"],
  luxury: ["casual", "grunge", "raw", "punk", "fun", "playful"],
  elegant: ["grunge", "raw", "punk", "edgy", "urban", "street"],
  professional: ["grunge", "punk", "raw", "edgy", "fun", "playful", "bubbly"],
  minimalist: ["bold", "dramatic", "grunge", "raw", "edgy", "loud"],
  minimal: ["bold", "dramatic", "grunge", "raw", "edgy", "loud"],
  clean: ["grunge", "raw", "distressed", "punk", "edgy"],
  corporate: ["grunge", "punk", "playful", "fun", "edgy", "rebellious"],
  retro: ["minimal", "clean", "corporate", "professional"],
  futuristic: ["vintage", "retro", "traditional", "classic"],
  romantic: ["edgy", "grunge", "punk", "bold", "technical"],
  western: ["modern", "minimal", "tech", "futuristic"],
};

// ══════════════════════════════════════════
// STYLIZED PROMPT DETECTION
// ══════════════════════════════════════════

function isStylizedPrompt(words: string[]): boolean {
  const markers = new Set([
    "grunge", "grungy", "punk", "punky", "edgy", "girly", "girlypop", "pop", "poppy",
    "cute", "kawaii", "bubbly", "wild", "messy", "chaotic", "rebellious", "raw",
    "gothic", "goth", "horror", "spooky", "scary", "creepy", "halloween", "dark",
    "neon", "retro", "vintage", "groovy", "pixel", "gaming", "gamer", "glitch", "glitchy",
    "vaporwave", "synthwave", "cyberpunk", "steampunk", "cottagecore", "fairycore",
    "witchcore", "witchy", "y2k", "indie", "alternative", "alt", "street", "urban",
    "trashy", "dirty", "aesthetic", "vibe", "vibes", "mood", "slay", "iconic",
    "pastel", "sweet", "pink", "cosmic", "occult", "vampire", "dramatic",
    "artistic", "artsy", "experimental", "whimsical", "quirky",
  ]);
  return words.some((w) => markers.has(w));
}

// Pre-compute keyword keys once (avoids Object.keys() on every call)
const KEYWORD_KEYS: string[] = Object.keys(KEYWORD_WANT);

// Caches for expensive lookups (persist across searches)
const keywordMatchCache = new Map<string, string[] | null>();
const pairTagCache = new Map<string, Set<string>>();

// ══════════════════════════════════════════
// SCORING
// ══════════════════════════════════════════

function getAllPairTags(pair: FontPair, hf: Font, bf: Font): Set<string> {
  // Cache by pair ID — tags never change between searches
  const cached = pairTagCache.get(pair.id);
  if (cached) return cached;
  const tags = new Set([
    ...pair.tags, ...pair.useCases,
    ...hf.tags, ...hf.toneDescriptors, ...hf.useCases,
    ...bf.tags, ...bf.toneDescriptors, ...bf.useCases,
  ].map((t) => t.toLowerCase()));
  pairTagCache.set(pair.id, tags);
  return tags;
}

function extractPromptWords(query: string): string[] {
  const stop = new Set(["the", "and", "for", "with", "that", "this", "but", "not", "are", "was", "has", "its", "our", "your", "like", "want", "need", "something", "looking", "feel", "kind", "type", "sort", "think", "maybe", "really", "very", "more", "most", "also", "just", "get", "some", "lot", "bit", "about", "than", "into"]);
  return query.toLowerCase()
    .split(/[\s,.\-—–/]+/)
    .filter((w) => w.length > 1 && !stop.has(w));
}

// ── Stem / fuzzy normalization ──
// Strips common suffixes to find the root, so "grungy" → "grung", "playful" → "play", etc.
// Then checks if KEYWORD_WANT has a key that starts with that root.
function findKeywordMatch(word: string): string[] | null {
  // Check cache first — same word always maps to the same keywords
  const cached = keywordMatchCache.get(word);
  if (cached !== undefined) return cached;

  let result: string[] | null = null;

  // 1. Exact match
  if (KEYWORD_WANT[word]) { result = KEYWORD_WANT[word]; }

  // 2. Try common suffix stripping
  if (!result) {
    const suffixes = ["y", "ish", "ey", "ie", "ful", "ous", "ive", "ly", "ed", "ing", "er", "est", "ic", "al", "ness", "ity", "esque", "like", "ical", "ated"];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        const stem = word.slice(0, -suffix.length);
        for (const key of KEYWORD_KEYS) {
          if (key.startsWith(stem) || stem.startsWith(key)) {
            result = KEYWORD_WANT[key]; break;
          }
        }
        if (result) break;
      }
    }
  }

  // 3. Try prefix matching (word is the start of a keyword)
  if (!result) {
    for (const key of KEYWORD_KEYS) {
      if (key.startsWith(word) && word.length >= 3) { result = KEYWORD_WANT[key]; break; }
      if (word.startsWith(key) && key.length >= 3) { result = KEYWORD_WANT[key]; break; }
    }
  }

  // 4. Try synonym map — expand the word to known synonyms, then check those
  if (!result) {
    const synonyms = ALL_SYNONYMS[word];
    if (synonyms) {
      const combined: string[] = [];
      for (const syn of synonyms) {
        if (KEYWORD_WANT[syn]) combined.push(...KEYWORD_WANT[syn]);
        else combined.push(syn);
      }
      if (combined.length > 0) result = [...new Set(combined)];
    }
  }

  // 5. Typo tolerance — find nearest keyword by edit distance
  if (!result) {
    const maxDist = maxTypoDistance(word);
    if (maxDist > 0) {
      let bestKey: string | null = null;
      let bestDist = maxDist + 1;
      for (const key of KEYWORD_KEYS) {
        if (Math.abs(key.length - word.length) > maxDist) continue;
        const d = editDistance(word, key);
        if (d < bestDist) { bestDist = d; bestKey = key; }
      }
      if (bestKey) result = KEYWORD_WANT[bestKey];
    }
  }

  keywordMatchCache.set(word, result);
  return result;
}

// Score how well a pair matches a single prompt word
function scoreWordMatch(word: string, tagSet: Set<string>): number {
  // 1. Direct or fuzzy keyword lookup
  const wants = findKeywordMatch(word);
  if (wants) {
    let hits = 0;
    for (const w of wants) if (tagSet.has(w)) hits++;
    return (hits / wants.length) * 30;
  }

  // 2. Exact tag match
  if (tagSet.has(word)) return 20;

  // 3. Fuzzy: check if any tag contains this word or vice versa (min 3 chars)
  if (word.length >= 3) {
    for (const tag of tagSet) {
      if (tag.includes(word) || word.includes(tag)) return 12;
    }
  }

  return 0;
}

// Score penalty for mismatched tags
function scorePenalties(promptWords: string[], tagSet: Set<string>): number {
  let penalty = 0;
  for (const w of promptWords) {
    const penalizes = KEYWORD_PENALIZE[w];
    if (penalizes) {
      for (const p of penalizes) {
        if (tagSet.has(p)) penalty += 5;
      }
    }
  }
  return penalty;
}

// Header expressiveness bonus
function headerBonus(hf: Font): number {
  let bonus = 0;
  if (hf.classification === "display") bonus += 6;
  if (hf.classification === "handwritten") bonus += 6;
  if (hf.classification === "script") bonus += 5;
  if (!hf.isBodySuitable) bonus += 4;
  if (hf.tags.includes("distinctive")) bonus += 3;
  // Source diversity bonus — Fontshare and DaFont fonts are underrepresented
  if (hf.source === "fontshare") bonus += 8;
  if (hf.source === "other") bonus += 6; // DaFont
  // Variable fonts are extra valuable
  if (hf.variableFont) bonus += 3;
  return bonus;
}

// Utility score (readability, practicality)
function scoreUtility(pair: FontPair, bf: Font): number {
  let s = 0;
  s += (pair.bodyLegibilityScore / 10) * 25;
  s += (pair.hierarchyStrength / 10) * 15;
  s += (pair.practicalityScore / 10) * 15;
  if (bf.bodyLegibilityScore && bf.bodyLegibilityScore >= 8) s += 10;
  if (pair.sourceConfidence === "high") s += 5;
  // Variable body fonts are extra valuable (Fontshare fonts are all variable)
  if (bf.variableFont) s += 5;
  if (bf.source === "fontshare") s += 5;
  return s;
}

// Specificity score (how well this pair matches THIS prompt)
function scoreSpecificity(
  pair: FontPair, hf: Font, bf: Font, promptWords: string[]
): number {
  const tagSet = getAllPairTags(pair, hf, bf);
  let score = 0;

  // Per-word match scoring
  let matchedWords = 0;
  for (const word of promptWords) {
    const wordScore = scoreWordMatch(word, tagSet);
    score += wordScore;
    if (wordScore > 5) matchedWords++;
  }

  // Bonus for matching MOST prompt words (not just one)
  if (promptWords.length > 0) {
    const matchRatio = matchedWords / promptWords.length;
    score += matchRatio * 20; // up to 20 bonus for matching all words
  }

  // Penalties
  score -= scorePenalties(promptWords, tagSet);

  // Header expressiveness
  score += headerBonus(hf);

  // Anti-generic penalty
  const genericTags = ["clean", "modern", "versatile", "neutral", "professional"];
  let genericCount = 0;
  for (const t of genericTags) if (tagSet.has(t)) genericCount++;
  if (genericCount >= 3) score -= 8;

  return Math.max(0, score);
}

// ══════════════════════════════════════════
// FIT REASON GENERATOR
// ══════════════════════════════════════════

function generateFitReason(
  pair: FontPair, hf: Font, bf: Font, promptWords: string[], query: string
): string {
  if (promptWords.length === 0) return pair.shortExplanation;

  const promptPhrase = query.trim();
  const headerTrait = hf.distinctiveTraits[0] || hf.toneDescriptors[0] || "distinctive character";
  const headerTone = hf.toneDescriptors.slice(0, 2).join(" and ") || "expressive";

  // Find which user words this pair connects to
  const tagSet = getAllPairTags(pair, hf, bf);
  const connections: string[] = [];
  for (const word of promptWords) {
    const wants = KEYWORD_WANT[word];
    if (wants) {
      for (const w of wants) {
        if (tagSet.has(w) && w !== word) { connections.push(w); break; }
      }
    }
    if (tagSet.has(word)) connections.push(word);
  }
  const uniqueConns = [...new Set(connections)].slice(0, 3);

  const parts: string[] = [];

  const short = promptPhrase.length <= 45 ? promptPhrase : promptPhrase.split(/[,.\-—]/).filter(s => s.trim().length > 3)[0]?.trim() || promptPhrase.slice(0, 40);
  const toneCap = headerTone.charAt(0).toUpperCase() + headerTone.slice(1);
  parts.push(`For "${short}" — ${hf.name} brings ${toneCap.toLowerCase()} energy with its ${headerTrait}`);

  if (uniqueConns.length > 0) {
    parts.push(`captures the ${uniqueConns.join(", ")} feel`);
  }

  parts.push(`${bf.name} anchors the body text`);

  return parts.join(". ") + ".";
}

// ══════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════

export function parseStyleSignals(_text: string): StyleSignals {
  return { modern: 0, warm: 0, playful: 0, editorial: 0, luxurious: 0, geometric: 0, technical: 0, minimal: 0 };
}

// Check if query contains a font name — returns matched font IDs with match strength
// "full" = exact name match, "partial" = one word of a multi-word name matched
function findFontNamesInQuery(query: string): Map<string, "full" | "partial"> {
  const lower = query.toLowerCase().trim();
  const matched = new Map<string, "full" | "partial">();
  const queryWords = lower.split(/[\s,.\-—–/]+/).filter(w => w.length > 0);

  for (const [, font] of fontsById) {
    const fontNameLower = font.name.toLowerCase();
    // Check if the query contains the full font name
    if (lower.includes(fontNameLower)) {
      matched.set(font.id, "full");
      continue;
    }
    // Also check slug form (e.g. "playfair-display")
    if (lower.includes(font.slug)) {
      matched.set(font.id, "full");
      continue;
    }

    // Typo-tolerant: check if query words fuzzy-match font name words
    const fontWords = fontNameLower.split(/\s+/);
    if (fontWords.length === 1 && fontWords[0].length >= 4) {
      // Single-word font name: check each query word — this is a full match
      for (const qw of queryWords) {
        if (qw.length >= 4 && editDistance(qw, fontWords[0]) <= maxTypoDistance(fontWords[0])) {
          matched.set(font.id, "full");
          break;
        }
      }
    } else if (fontWords.length >= 2) {
      // Multi-word font name: partial match — if ANY significant font word
      // matches a query word, include the font (e.g. "playfair" → "Playfair Display")
      for (const fw of fontWords) {
        if (fw.length < 4) continue; // skip short words like "of", "the", "pro"
        for (const qw of queryWords) {
          if (qw.length >= 4 && editDistance(qw, fw) <= maxTypoDistance(fw)) {
            matched.set(font.id, "partial");
            break;
          }
        }
        if (matched.has(font.id)) break;
      }
    }
  }

  return matched;
}

export function rankPairs(
  query: string,
  options?: { limit?: number; offset?: number }
): ScoredPair[] {
  const promptWords = extractPromptWords(query);
  const hasQuery = query.trim().length > 0;
  const stylized = hasQuery && isStylizedPrompt(promptWords);

  // Detect font names in the query for direct matching
  const matchedFontIds = hasQuery ? findFontNamesInQuery(query) : new Map<string, "full" | "partial">();
  const hasFontNameMatch = matchedFontIds.size > 0;

  const scored: ScoredPair[] = [];

  for (const pair of fontPairs) {
    const hf = fontsById.get(pair.headerFontId);
    const bf = fontsById.get(pair.bodyFontId);
    if (!hf || !bf) continue;

    let totalScore: number;

    if (hasQuery) {
      // If the query contains a font name, boost pairs using that font
      // Full match (exact name) = massive boost; partial (one word) = moderate boost to mix in
      let fontNameBonus = 0;
      if (hasFontNameMatch) {
        const hMatch = matchedFontIds.get(hf.id);
        const bMatch = matchedFontIds.get(bf.id);
        if (hMatch === "full") fontNameBonus += 200;
        else if (hMatch === "partial") fontNameBonus += 60;
        if (bMatch === "full") fontNameBonus += 200;
        else if (bMatch === "partial") fontNameBonus += 60;
      }

      const utility = scoreUtility(pair, bf);
      const specificity = scoreSpecificity(pair, hf, bf, promptWords);

      if (fontNameBonus > 0) {
        // Font name match dominates — still add some utility/specificity for ordering
        totalScore = fontNameBonus + (0.3 * utility) + (0.3 * specificity);
      } else if (stylized) {
        totalScore = (0.20 * utility) + (0.80 * specificity);
      } else {
        totalScore = (0.45 * utility) + (0.55 * specificity);
      }
    } else {
      totalScore = pair.overallScore;
      if (hf.classification === "display") totalScore += 5;
      if (!hf.isBodySuitable) totalScore += 3;
    }

    // Defer fit reason generation — just score for now
    scored.push({
      ...pair,
      relevanceScore: totalScore,
      promptFitReason: "", // filled in after sort/dedup
      headerFont: hf,
      bodyFont: bf,
    });
  }

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // When there's a query, filter out pairs with very low relevance
  let filtered = scored;
  if (hasQuery && scored.length > 0) {
    const topScore = scored[0].relevanceScore;
    const threshold = topScore * 0.4;
    filtered = scored.filter((p) => p.relevanceScore >= threshold);
    if (filtered.length < 30) filtered = scored.slice(0, Math.max(30, filtered.length));
  }

  // Deduplicate: no repeated header font in top 3, and limit any header to
  // appearing at most once per 4 consecutive results throughout the list.
  const deduped: ScoredPair[] = [];
  const skipped: ScoredPair[] = [];
  const headerCount = new Map<string, number>();

  for (const pair of filtered) {
    const hCount = headerCount.get(pair.headerFontId) || 0;

    if (deduped.length < 3) {
      // Top 3: completely unique headers and bodies
      const usedH = new Set(deduped.map(p => p.headerFontId));
      const usedB = new Set(deduped.map(p => p.bodyFontId));
      if (usedH.has(pair.headerFontId) || usedB.has(pair.bodyFontId)) {
        skipped.push(pair);
        continue;
      }
    } else {
      // After top 3: same header can't appear more than once per 4 results
      const recentHeaders = deduped.slice(-3).map(p => p.headerFontId);
      if (recentHeaders.includes(pair.headerFontId)) {
        skipped.push(pair);
        continue;
      }
    }

    headerCount.set(pair.headerFontId, hCount + 1);
    deduped.push(pair);
  }

  // Append skipped pairs at the end so they're still accessible
  deduped.push(...skipped);

  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? deduped.length;
  const finalResults = deduped.slice(offset, offset + limit);

  // Generate fit reasons only for the final results (not every scored pair)
  for (const sp of finalResults) {
    if (hasQuery && hasFontNameMatch && (matchedFontIds.has(sp.headerFontId) || matchedFontIds.has(sp.bodyFontId))) {
      // Font name was detected in query — mention which font matched and still connect to the query
      const hf = sp.headerFont;
      const bf = sp.bodyFont;
      const headerTrait = hf.distinctiveTraits[0] || hf.toneDescriptors[0] || "distinctive character";
      const headerTone = hf.toneDescriptors.slice(0, 2).join(" and ") || "expressive";
      const promptPhrase = query.trim();
      const short = promptPhrase.length <= 45 ? promptPhrase : promptPhrase.split(/[,.\-—]/).filter(s => s.trim().length > 3)[0]?.trim() || promptPhrase.slice(0, 40);

      // Build connections to the query like generateFitReason does
      const tagSet = getAllPairTags(sp as unknown as FontPair, hf, bf);
      const connections: string[] = [];
      for (const word of promptWords) {
        const wants = KEYWORD_WANT[word];
        if (wants) {
          for (const w of wants) {
            if (tagSet.has(w) && w !== word) { connections.push(w); break; }
          }
        }
        if (tagSet.has(word)) connections.push(word);
      }
      const uniqueConns = [...new Set(connections)].slice(0, 3);

      const parts: string[] = [];
      parts.push(`For "${short}" — this pair uses ${hf.name}, which brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
      if (uniqueConns.length > 0) {
        parts.push(`captures the ${uniqueConns.join(", ")} feel`);
      }
      parts.push(`${bf.name} anchors the body text`);
      sp.promptFitReason = parts.join(". ") + ".";
    } else if (hasQuery) {
      sp.promptFitReason = generateFitReason(sp, sp.headerFont, sp.bodyFont, promptWords, query);
    } else {
      sp.promptFitReason = sp.shortExplanation;
    }
  }

  return finalResults;
}

export function getRelatedPairs(pairId: string, limit = 4): ScoredPair[] {
  const pair = fontPairs.find((p) => p.id === pairId || p.slug === pairId);
  if (!pair) return [];
  const hf = fontsById.get(pair.headerFontId);
  const bf = fontsById.get(pair.bodyFontId);
  if (!hf || !bf) return [];
  const pairTags = new Set(pair.tags);
  return fontPairs
    .filter((p) => p.id !== pair.id)
    .map((p) => {
      const h = fontsById.get(p.headerFontId);
      const b = fontsById.get(p.bodyFontId);
      if (!h || !b) return null;
      let sim = 0;
      for (const tag of p.tags) if (pairTags.has(tag)) sim += 5;
      if (p.headerFontId === pair.headerFontId || p.bodyFontId === pair.bodyFontId) sim += 10;
      if (hf.similarFonts.includes(p.headerFontId)) sim += 8;
      if (bf.similarFonts.includes(p.bodyFontId)) sim += 8;
      sim += p.useCases.filter((uc) => pair.useCases.includes(uc)).length * 3;
      return { ...p, relevanceScore: sim, promptFitReason: p.shortExplanation, headerFont: h, bodyFont: b } as ScoredPair;
    })
    .filter(Boolean)
    .sort((a, b) => b!.relevanceScore - a!.relevanceScore)
    .slice(0, limit) as ScoredPair[];
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function explorePairs(): ScoredPair[] {
  const all: ScoredPair[] = [];
  for (const pair of fontPairs) {
    const hf = fontsById.get(pair.headerFontId);
    const bf = fontsById.get(pair.bodyFontId);
    if (!hf || !bf) continue;
    all.push({
      ...pair,
      relevanceScore: 0,
      promptFitReason: pair.shortExplanation,
      headerFont: hf,
      bodyFont: bf,
    });
  }

  // True random shuffle using Math.random — completely different order every call
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all;
}

export function getPairsWithFont(fontId: string): ScoredPair[] {
  return fontPairs
    .filter((p) => p.headerFontId === fontId || p.bodyFontId === fontId)
    .map((p) => {
      const h = fontsById.get(p.headerFontId);
      const b = fontsById.get(p.bodyFontId);
      if (!h || !b) return null;
      return { ...p, relevanceScore: p.overallScore, promptFitReason: p.shortExplanation, headerFont: h, bodyFont: b } as ScoredPair;
    })
    .filter(Boolean) as ScoredPair[];
}

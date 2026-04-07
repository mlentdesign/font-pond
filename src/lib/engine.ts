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

// Check if query contains a font name — returns matched font IDs
function findFontNamesInQuery(query: string): Set<string> {
  const lower = query.toLowerCase().trim();
  const matched = new Set<string>();
  const queryWords = lower.split(/[\s,.\-—–/]+/).filter(w => w.length > 0);

  for (const [, font] of fontsById) {
    const fontNameLower = font.name.toLowerCase();
    // Check if the query contains the full font name
    if (lower.includes(fontNameLower)) {
      matched.add(font.id);
      continue;
    }
    // Also check slug form (e.g. "playfair-display")
    if (lower.includes(font.slug)) {
      matched.add(font.id);
      continue;
    }

    // Typo-tolerant: check if query words fuzzy-match font name words
    const fontWords = fontNameLower.split(/\s+/);
    if (fontWords.length === 1 && fontWords[0].length >= 4) {
      // Single-word font name: check each query word
      for (const qw of queryWords) {
        if (qw.length >= 4 && editDistance(qw, fontWords[0]) <= maxTypoDistance(fontWords[0])) {
          matched.add(font.id);
          break;
        }
      }
    } else if (fontWords.length >= 2) {
      // Multi-word font name: check if all font words have a fuzzy match in query words
      let allMatched = true;
      for (const fw of fontWords) {
        if (fw.length < 3) continue; // skip very short words
        let wordFound = false;
        for (const qw of queryWords) {
          if (editDistance(qw, fw) <= maxTypoDistance(fw)) { wordFound = true; break; }
        }
        if (!wordFound) { allMatched = false; break; }
      }
      if (allMatched) matched.add(font.id);
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
  const matchedFontIds = hasQuery ? findFontNamesInQuery(query) : new Set<string>();
  const hasFontNameMatch = matchedFontIds.size > 0;

  const scored: ScoredPair[] = [];

  for (const pair of fontPairs) {
    const hf = fontsById.get(pair.headerFontId);
    const bf = fontsById.get(pair.bodyFontId);
    if (!hf || !bf) continue;

    let totalScore: number;

    if (hasQuery) {
      // If the query contains a font name, give massive boost to pairs using that font
      let fontNameBonus = 0;
      if (hasFontNameMatch) {
        if (matchedFontIds.has(hf.id)) fontNameBonus += 200;
        if (matchedFontIds.has(bf.id)) fontNameBonus += 200;
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
      const matchedNames: string[] = [];
      if (matchedFontIds.has(sp.headerFontId)) matchedNames.push(sp.headerFont.name);
      if (matchedFontIds.has(sp.bodyFontId)) matchedNames.push(sp.bodyFont.name);
      const headerTrait = sp.headerFont.distinctiveTraits[0] || sp.headerFont.toneDescriptors[0] || "distinctive character";
      sp.promptFitReason = `This pair features ${matchedNames.join(" and ")}. ${sp.headerFont.name}'s ${headerTrait} creates strong headlines while ${sp.bodyFont.name} provides reliable body text.`;
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

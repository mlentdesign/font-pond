import { fonts, fontsById } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
import { Font, FontPair, ScoredPair, StyleSignals } from "@/data/types";
import { SYNONYM_MAP } from "@/data/adjective-expansion";
import { SYNONYM_BATCH3 } from "@/data/adjective-batch3";

// Merge synonym maps
const ALL_SYNONYMS: Record<string, string[]> = { ...SYNONYM_MAP, ...SYNONYM_BATCH3 };

// Personality type descriptions for search result fit reasons
const PERSONALITY_DESCRIPTIONS: Record<string, { label: string; traits: string }> = {
  // MBTI
  "intj": { label: "INTJ", traits: "strategic precision and minimal clarity" },
  "intp": { label: "INTP", traits: "analytical curiosity and unconventional thinking" },
  "entj": { label: "ENTJ", traits: "commanding confidence and structured authority" },
  "entp": { label: "ENTP", traits: "inventive energy and clever dynamism" },
  "infj": { label: "INFJ", traits: "thoughtful idealism and quiet refinement" },
  "infp": { label: "INFP", traits: "creative authenticity and gentle warmth" },
  "enfj": { label: "ENFJ", traits: "inspiring warmth and charismatic approachability" },
  "enfp": { label: "ENFP", traits: "enthusiastic creativity and free-spirited energy" },
  "istj": { label: "ISTJ", traits: "dependable tradition and methodical structure" },
  "isfj": { label: "ISFJ", traits: "loyal warmth and quiet reliability" },
  "estj": { label: "ESTJ", traits: "organized directness and professional authority" },
  "esfj": { label: "ESFJ", traits: "caring harmony and social warmth" },
  "istp": { label: "ISTP", traits: "practical precision and hands-on utility" },
  "isfp": { label: "ISFP", traits: "artistic sensitivity and organic beauty" },
  "estp": { label: "ESTP", traits: "bold directness and energetic impact" },
  "esfp": { label: "ESFP", traits: "spontaneous fun and expressive personality" },
  // Enneagram
  "enneagram-1": { label: "Type 1", traits: "principled precision and orderly clarity" },
  "enneagram-2": { label: "Type 2", traits: "generous warmth and caring approachability" },
  "enneagram-3": { label: "Type 3", traits: "polished ambition and image-conscious sleekness" },
  "enneagram-4": { label: "Type 4", traits: "expressive individuality and authentic distinction" },
  "enneagram-5": { label: "Type 5", traits: "analytical depth and minimal intellectual clarity" },
  "enneagram-6": { label: "Type 6", traits: "loyal reliability and trustworthy stability" },
  "enneagram-7": { label: "Type 7", traits: "adventurous optimism and playful energy" },
  "enneagram-8": { label: "Type 8", traits: "powerful decisiveness and commanding presence" },
  "enneagram-9": { label: "Type 9", traits: "peaceful harmony and easygoing balance" },
  "1w9": { label: "1w9", traits: "reserved precision and calm principled clarity" },
  "1w2": { label: "1w2", traits: "warm precision and helpful structured care" },
  "2w1": { label: "2w1", traits: "organized warmth and structured friendliness" },
  "2w3": { label: "2w3", traits: "polished warmth and professional approachability" },
  "3w2": { label: "3w2", traits: "charismatic polish and warm confidence" },
  "3w4": { label: "3w4", traits: "unique ambition and distinctive editorial polish" },
  "4w3": { label: "4w3", traits: "artistic polish and expressive elegance" },
  "4w5": { label: "4w5", traits: "introspective depth and intellectual individuality" },
  "5w4": { label: "5w4", traits: "creative analysis and experimental precision" },
  "5w6": { label: "5w6", traits: "systematic rigor and methodical clarity" },
  "6w5": { label: "6w5", traits: "analytical reliability and structured trust" },
  "6w7": { label: "6w7", traits: "warm reliability and friendly dependability" },
  "7w6": { label: "7w6", traits: "responsible playfulness and grounded energy" },
  "7w8": { label: "7w8", traits: "bold enthusiasm and impactful fun" },
  "8w7": { label: "8w7", traits: "energetic power and dynamic command" },
  "8w9": { label: "8w9", traits: "calm authority and grounded strength" },
  "9w8": { label: "9w8", traits: "grounded peace and quiet strength" },
  "9w1": { label: "9w1", traits: "principled calm and structured harmony" },
  // DISC
  "disc-d": { label: "DISC D (Dominance)", traits: "direct authority and results-driven boldness" },
  "disc-i": { label: "DISC I (Influence)", traits: "enthusiastic warmth and collaborative energy" },
  "disc-s": { label: "DISC S (Steadiness)", traits: "patient reliability and consistent trust" },
  "disc-c": { label: "DISC C (Conscientiousness)", traits: "analytical precision and systematic rigor" },
  "disc-di": { label: "DISC DI", traits: "bold charisma and confident warmth" },
  "disc-id": { label: "DISC ID", traits: "enthusiastic confidence and warm authority" },
  "disc-dc": { label: "DISC DC", traits: "decisive precision and commanding clarity" },
  "disc-cd": { label: "DISC CD", traits: "precise authority and analytical command" },
  "disc-is": { label: "DISC IS", traits: "warm reliability and friendly steadiness" },
  "disc-si": { label: "DISC SI", traits: "steady warmth and reliable friendliness" },
  "disc-sc": { label: "DISC SC", traits: "reliable precision and steady analytical care" },
  "disc-cs": { label: "DISC CS", traits: "systematic reliability and precise consistency" },
  "disc-ds": { label: "DISC DS", traits: "bold reliability and commanding groundedness" },
  "disc-sd": { label: "DISC SD", traits: "grounded authority and calm decisiveness" },
  "disc-ic": { label: "DISC IC", traits: "friendly precision and warm analytical clarity" },
  "disc-ci": { label: "DISC CI", traits: "analytical warmth and precise approachability" },
  // Brand Archetypes (Jungian)
  "innocent": { label: "The Innocent", traits: "pure optimism and simple, honest clarity" },
  "explorer": { label: "The Explorer", traits: "adventurous independence and rugged freedom" },
  "sage": { label: "The Sage", traits: "wise authority and thoughtful intellectual depth" },
  "hero": { label: "The Hero", traits: "courageous boldness and determined strength" },
  "outlaw": { label: "The Outlaw", traits: "rebellious disruption and raw, edgy defiance" },
  "rebel": { label: "The Rebel", traits: "rebellious disruption and raw, edgy defiance" },
  "magician": { label: "The Magician", traits: "visionary transformation and imaginative wonder" },
  "everyman": { label: "The Everyman", traits: "honest relatability and grounded approachability" },
  "lover": { label: "The Lover", traits: "passionate intimacy and sensual warmth" },
  "jester": { label: "The Jester", traits: "playful humor and lighthearted energy" },
  "caregiver": { label: "The Caregiver", traits: "nurturing generosity and protective warmth" },
  "creator": { label: "The Creator", traits: "innovative artistry and expressive originality" },
  "ruler": { label: "The Ruler", traits: "commanding authority and premium sophistication" },
  // Western Zodiac
  "aries": { label: "Aries", traits: "bold competitive fire and fearless energy" },
  "taurus": { label: "Taurus", traits: "grounded sensuality and reliable luxury" },
  "gemini": { label: "Gemini", traits: "versatile curiosity and communicative wit" },
  "cancer": { label: "Cancer", traits: "nurturing warmth and protective softness" },
  "leo": { label: "Leo", traits: "dramatic confidence and magnetic presence" },
  "virgo": { label: "Virgo", traits: "meticulous refinement and analytical precision" },
  "libra": { label: "Libra", traits: "balanced beauty and harmonious elegance" },
  "scorpio": { label: "Scorpio", traits: "intense mystery and powerful depth" },
  "sagittarius": { label: "Sagittarius", traits: "adventurous optimism and bold freedom" },
  "capricorn": { label: "Capricorn", traits: "disciplined ambition and traditional authority" },
  "aquarius": { label: "Aquarius", traits: "innovative vision and unconventional intellect" },
  "pisces": { label: "Pisces", traits: "dreamy creativity and flowing intuition" },
  // Chinese Zodiac
  "rat": { label: "Year of the Rat", traits: "resourceful cleverness and adaptive versatility" },
  "ox": { label: "Year of the Ox", traits: "steadfast strength and patient reliability" },
  "tiger": { label: "Year of the Tiger", traits: "brave boldness and fierce competitive spirit" },
  "rabbit": { label: "Year of the Rabbit", traits: "gentle elegance and refined grace" },
  "dragon": { label: "Year of the Dragon", traits: "powerful ambition and commanding presence" },
  "snake": { label: "Year of the Snake", traits: "wise sophistication and mysterious elegance" },
  "horse": { label: "Year of the Horse", traits: "free-spirited energy and adventurous dynamism" },
  "goat": { label: "Year of the Goat", traits: "creative gentleness and artistic warmth" },
  "monkey": { label: "Year of the Monkey", traits: "playful inventiveness and clever experimentation" },
  "rooster": { label: "Year of the Rooster", traits: "confident structure and hardworking polish" },
  "dog": { label: "Year of the Dog", traits: "loyal warmth and honest approachability" },
  "pig": { label: "Year of the Pig", traits: "generous warmth and comfortable ease" },
};

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

  // Aesthetic / subcultural — comprehensive list from Aesthetics Wiki + internet culture
  cottagecore: ["warm", "organic", "vintage", "handwritten", "natural", "rustic", "soft", "romantic"],
  "dark academia": ["literary", "classic", "serif", "academic", "authoritative", "moody", "vintage"],
  "light academia": ["literary", "classic", "serif", "warm", "refined", "elegant", "soft"],
  academia: ["literary", "classic", "serif", "academic", "authoritative"],
  y2k: ["retro", "futuristic", "pop", "bubbly", "bold", "playful", "neon"],
  "indie sleaze": ["edgy", "messy", "raw", "fashion", "rebellious", "grunge"],
  "old money": ["classic", "elegant", "serif", "refined", "luxury", "traditional"],
  "quiet luxury": ["refined", "minimal", "elegant", "serif", "luxury", "understated", "clean"],
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

  // Core aesthetics
  dreamcore: ["surreal", "soft", "mysterious", "pastel", "whimsical", "dreamy"],
  weirdcore: ["surreal", "glitch", "distorted", "mysterious", "experimental", "chaotic"],
  kidcore: ["playful", "bold", "colorful", "fun", "rounded", "pop", "bubbly", "cute"],
  angelcore: ["soft", "feminine", "delicate", "romantic", "elegant", "ethereal", "white"],
  devilcore: ["dark", "gothic", "edgy", "bold", "dramatic", "rebellious"],
  clowncore: ["bold", "chaotic", "colorful", "fun", "playful", "pop", "loud"],
  cloudcore: ["soft", "minimal", "dreamy", "pastel", "delicate", "airy"],
  darkcore: ["dark", "gothic", "heavy", "moody", "edgy", "dramatic"],
  forestcore: ["organic", "natural", "earthy", "warm", "rustic", "green"],
  oceancore: ["cool", "flowing", "natural", "soft", "organic", "blue"],
  spacecore: ["futuristic", "cosmic", "sci-fi", "bold", "dark", "tech"],
  starcore: ["cosmic", "sparkle", "whimsical", "bold", "pop"],
  mooncore: ["mysterious", "soft", "dark", "ethereal", "elegant"],
  suncore: ["warm", "bold", "energetic", "friendly", "bright"],
  stonecore: ["earthy", "natural", "rustic", "heavy", "organic", "minimal"],
  mosscore: ["organic", "natural", "earthy", "soft", "green", "rustic"],
  mushcore: ["organic", "quirky", "earthy", "natural", "whimsical"],
  flowercore: ["romantic", "soft", "feminine", "natural", "delicate", "organic"],
  gardencore: ["organic", "warm", "natural", "vintage", "romantic", "rustic"],
  lovecore: ["romantic", "feminine", "soft", "pink", "delicate", "script"],
  softcore: ["soft", "pastel", "feminine", "delicate", "minimal", "romantic"],
  hardcorecore: ["bold", "heavy", "edgy", "punk", "raw", "aggressive"],
  normcore: ["minimal", "clean", "neutral", "simple", "modern", "restrained"],
  gorpcore: ["outdoor", "utilitarian", "bold", "rugged", "natural", "modern"],
  regencycore: ["elegant", "classic", "serif", "ornate", "romantic", "refined", "literary"],
  balletcore: ["delicate", "feminine", "soft", "elegant", "romantic", "minimal"],
  coquette: ["feminine", "romantic", "delicate", "soft", "girly", "elegant", "script"],
  "coquette aesthetic": ["feminine", "romantic", "delicate", "soft", "girly", "script"],

  // Punk aesthetics
  dieselpunk: ["retro", "industrial", "heavy", "vintage", "bold", "mechanical"],
  atompunk: ["retro", "futuristic", "bold", "vintage", "atomic", "50s"],
  clockpunk: ["vintage", "ornate", "mechanical", "serif", "industrial"],
  biopunk: ["organic", "futuristic", "edgy", "experimental", "tech", "dark"],
  cassettepunk: ["retro", "80s", "vintage", "lo-fi", "analog", "bold"],
  decopunk: ["art-deco", "luxury", "elegant", "retro", "geometric", "bold"],

  // Wave aesthetics
  darkwave: ["dark", "gothic", "synthwave", "moody", "80s", "edgy"],
  chillwave: ["soft", "retro", "pastel", "relaxed", "dreamy", "lo-fi"],
  seapunk: ["neon", "retro", "aquatic", "bold", "pop", "futuristic", "playful"],
  webpunk: ["tech", "retro", "digital", "glitch", "chaotic", "bold"],

  // Era & style aesthetics
  "art deco": ["art-deco", "luxury", "elegant", "geometric", "retro", "glamorous", "bold"],
  "art nouveau": ["organic", "ornate", "elegant", "flowing", "decorative", "vintage"],
  baroque: ["ornate", "luxury", "dramatic", "elegant", "serif", "classic"],
  rococo: ["ornate", "delicate", "elegant", "romantic", "decorative", "feminine"],
  victorian: ["vintage", "ornate", "serif", "elegant", "gothic", "classic", "literary"],
  edwardian: ["elegant", "classic", "serif", "refined", "vintage", "literary"],
  medieval: ["gothic", "blackletter", "ornate", "vintage", "dark", "serif"],
  "mid-century": ["retro", "geometric", "clean", "modern", "vintage", "minimal"],
  "mid century modern": ["retro", "geometric", "clean", "modern", "vintage"],
  "art brut": ["raw", "expressive", "handwritten", "artistic", "bold", "organic"],

  // Culture & lifestyle aesthetics
  bohemian: ["organic", "warm", "eclectic", "artistic", "handwritten", "vintage", "romantic"],
  boho: ["organic", "warm", "eclectic", "artistic", "vintage", "romantic"],
  hippie: ["organic", "retro", "warm", "groovy", "handwritten", "vintage"],
  beatnik: ["literary", "classic", "vintage", "alternative", "typewriter"],
  "dark romantic": ["gothic", "romantic", "elegant", "moody", "serif", "dark", "literary"],
  romanticism: ["romantic", "serif", "literary", "elegant", "classic", "ornate"],
  grandmacore: ["vintage", "warm", "soft", "organic", "friendly", "handwritten"],
  "grandpa core": ["vintage", "warm", "rustic", "classic", "traditional", "serif"],
  "coastal grandmother": ["warm", "neutral", "classic", "elegant", "soft", "refined"],
  "coastal cowgirl": ["warm", "western", "feminine", "rustic", "vintage", "fun"],
  "clean aesthetic": ["minimal", "clean", "modern", "neutral", "white", "polished"],
  "that girl": ["minimal", "clean", "modern", "polished", "neutral", "feminine"],
  "mob wife": ["luxury", "bold", "glamorous", "dramatic", "elegant", "fashion"],
  "office siren": ["professional", "elegant", "bold", "fashion", "sophisticated", "modern"],
  blokette: ["feminine", "sporty", "bold", "playful", "modern", "pop"],
  tomboy: ["bold", "sporty", "clean", "modern", "utilitarian", "casual"],
  preppy: ["classic", "clean", "polished", "serif", "traditional", "refined"],
  "ivy league": ["classic", "academic", "serif", "refined", "traditional", "elegant"],
  nautical: ["classic", "clean", "bold", "stripe", "traditional", "blue"],

  // Nature & landscape aesthetics
  forestpunk: ["organic", "dark", "natural", "edgy", "earthy", "rustic"],
  desertwave: ["warm", "earthy", "minimal", "natural", "muted", "organic"],
  arcticcore: ["cool", "minimal", "clean", "white", "modern", "stark"],
  tropicalcore: ["warm", "bold", "vibrant", "fun", "colorful", "organic"],
  junglecore: ["organic", "bold", "natural", "earthy", "vibrant", "wild"],
  mountaincore: ["rugged", "natural", "earthy", "bold", "rustic", "organic"],
  beachcore: ["warm", "relaxed", "friendly", "soft", "natural", "fun"],
  rainy: ["moody", "soft", "cool", "cozy", "dark", "literary"],

  // Tech & digital aesthetics
  webcore: ["retro", "digital", "pixel", "tech", "nostalgia", "chaotic"],
  "frutiger aero": ["clean", "modern", "rounded", "friendly", "tech", "glossy", "bubbly"],
  "frutiger metro": ["clean", "minimal", "modern", "flat", "tech", "neutral"],
  "flat design": ["clean", "minimal", "modern", "geometric", "flat", "bold"],
  skeuomorphic: ["realistic", "detailed", "vintage", "glossy", "ornate"],
  glitchcore: ["glitch", "chaotic", "edgy", "distorted", "tech", "bold"],
  datacore: ["tech", "systematic", "modern", "digital", "precise", "monospace"],
  hackerman: ["tech", "monospace", "dark", "digital", "hacker", "green"],
  matrix: ["tech", "monospace", "dark", "digital", "futuristic", "green"],

  // Music & subculture aesthetics
  grungey: ["grunge", "raw", "edgy", "distressed", "alternative", "messy"],
  metalcore: ["heavy", "dark", "bold", "edgy", "gothic", "aggressive"],
  "heavy metal": ["heavy", "dark", "bold", "gothic", "aggressive", "blackletter"],
  emo: ["dark", "edgy", "emotional", "punk", "alternative", "moody"],
  scene: ["bold", "colorful", "edgy", "pop", "punk", "playful", "loud"],
  "indie aesthetic": ["alternative", "distinctive", "artistic", "vintage", "creative"],
  indie: ["alternative", "distinctive", "artistic", "vintage", "creative", "indie"],
  lofi: ["warm", "vintage", "relaxed", "soft", "organic", "handwritten", "retro"],
  "lo-fi": ["warm", "vintage", "relaxed", "soft", "organic", "handwritten"],
  jazzy: ["warm", "elegant", "retro", "flowing", "classic", "sophisticated"],
  disco: ["retro", "glamorous", "bold", "70s", "fun", "pop", "neon"],
  rave: ["bold", "neon", "chaotic", "edgy", "pop", "energetic", "futuristic"],
  hiphop: ["urban", "bold", "edgy", "street", "modern", "confident"],
  "hip hop": ["urban", "bold", "edgy", "street", "modern", "confident"],
  kpop: ["pop", "bold", "modern", "playful", "bubbly", "colorful", "girly"],

  // Food & drink adjacent
  cafecore: ["warm", "cozy", "organic", "friendly", "vintage", "soft"],
  teacore: ["warm", "soft", "delicate", "organic", "cozy", "vintage"],
  winecore: ["luxury", "elegant", "warm", "serif", "refined", "romantic"],

  // Fashion aesthetics
  streetwear: ["urban", "bold", "edgy", "modern", "street", "confident"],
  athleisure: ["modern", "clean", "sporty", "bold", "minimal"],
  "dark fashion": ["dark", "gothic", "fashion", "edgy", "elegant", "moody"],
  avantgarde: ["experimental", "bold", "creative", "distinctive", "avant-garde"],
  "avant-garde": ["experimental", "bold", "creative", "distinctive", "avant-garde"],
  maximalist: ["bold", "ornate", "colorful", "dramatic", "expressive", "loud"],
  maximalism: ["bold", "ornate", "colorful", "dramatic", "expressive"],

  // Misc popular aesthetics
  liminal: ["mysterious", "surreal", "stark", "minimal", "moody", "empty"],
  "liminal space": ["mysterious", "surreal", "stark", "minimal", "moody"],
  nostalgiacore: ["retro", "vintage", "warm", "nostalgia", "soft", "80s"],
  traumacore: ["raw", "dark", "distressed", "emotional", "chaotic", "edgy"],
  sanrio: ["cute", "kawaii", "girly", "playful", "bubbly", "pop", "pink"],
  "hello kitty": ["cute", "kawaii", "girly", "playful", "bubbly", "pop"],
  anime: ["bold", "pop", "playful", "japanese", "colorful", "energetic"],
  manga: ["bold", "pop", "japanese", "dynamic", "expressive"],
  "studio ghibli": ["warm", "organic", "whimsical", "soft", "natural", "hand-drawn"],
  ethereal: ["soft", "dreamy", "delicate", "elegant", "feminine", "flowing"],
  celestial: ["cosmic", "elegant", "mysterious", "dark", "sparkle", "ethereal"],
  "dark fantasy": ["gothic", "dark", "ornate", "dramatic", "fantasy", "serif"],
  "high fantasy": ["ornate", "serif", "medieval", "classic", "dramatic", "elegant"],
  enchanted: ["whimsical", "fantasy", "ornate", "romantic", "magical", "soft"],
  magical: ["whimsical", "fantasy", "sparkle", "playful", "feminine", "script"],
  mystical: ["mysterious", "dark", "gothic", "ornate", "elegant", "moody"],
  zen: ["minimal", "clean", "calm", "soft", "organic", "japanese", "restrained"],
  wabi: ["organic", "minimal", "imperfect", "natural", "warm", "japanese"],
  "wabi-sabi": ["organic", "minimal", "imperfect", "natural", "warm", "earthy"],
  japandi: ["minimal", "clean", "warm", "organic", "modern", "japanese", "restrained"],
  scandinavian: ["minimal", "clean", "modern", "warm", "functional", "neutral"],
  hygge: ["warm", "cozy", "friendly", "organic", "soft", "inviting"],
  lagom: ["balanced", "minimal", "clean", "modern", "neutral", "restrained"],
  "italian summer": ["warm", "elegant", "vintage", "romantic", "serif", "classic"],
  "french girl": ["elegant", "feminine", "classic", "effortless", "serif", "refined"],
  parisian: ["elegant", "feminine", "classic", "fashion", "serif", "refined"],
  mediterranean: ["warm", "organic", "earthy", "classic", "friendly", "vintage"],
  tropical: ["warm", "bold", "vibrant", "fun", "colorful", "organic"],
  "beach house": ["warm", "relaxed", "friendly", "soft", "natural", "organic"],
  "pool party": ["fun", "bold", "pop", "playful", "colorful", "summer"],
  summery: ["warm", "bright", "fun", "friendly", "vibrant", "playful"],
  autumnal: ["warm", "earthy", "organic", "vintage", "cozy", "rustic"],
  wintery: ["cool", "minimal", "clean", "stark", "elegant", "serif"],

  // Extended aesthetics — comprehensive coverage from Aesthetics Wiki
  acidwave: ["neon", "bold", "psychedelic", "edgy", "vibrant", "glitch"],
  "acid pixie": ["neon", "whimsical", "bold", "psychedelic", "playful", "edgy"],
  adventurecore: ["rugged", "natural", "bold", "outdoor", "earthy", "rustic"],
  afrohemian: ["organic", "warm", "eclectic", "artistic", "bold", "earthy"],
  androgynous: ["minimal", "clean", "modern", "neutral", "bold", "restrained"],
  anemoiacore: ["nostalgic", "warm", "soft", "vintage", "dreamy", "retro"],
  "anglo gothic": ["gothic", "dark", "ornate", "serif", "medieval", "elegant"],
  "angura kei": ["dark", "theatrical", "gothic", "dramatic", "edgy", "bold"],
  "art academia": ["artistic", "literary", "classic", "creative", "serif", "editorial"],
  "art hoe": ["artistic", "creative", "colorful", "expressive", "bold", "eclectic"],
  babycore: ["soft", "pastel", "cute", "rounded", "feminine", "playful"],
  bardcore: ["medieval", "vintage", "ornate", "serif", "historical", "literary"],
  baddie: ["bold", "confident", "fashion", "edgy", "modern", "glamorous"],
  "ballet academia": ["delicate", "feminine", "elegant", "classic", "soft", "refined"],
  barbiecore: ["pink", "bold", "feminine", "pop", "fun", "girly", "playful"],
  bastardcore: ["eclectic", "chaotic", "quirky", "raw", "bold", "fun"],
  bloomcore: ["organic", "natural", "soft", "romantic", "floral", "warm"],
  "bubble goth": ["dark", "bubbly", "gothic", "pop", "playful", "bold"],
  "bubblegum witch": ["feminine", "dark", "playful", "pop", "edgy", "magical"],
  bunnycore: ["cute", "soft", "feminine", "playful", "pastel", "kawaii"],
  cabincore: ["rustic", "warm", "cozy", "natural", "organic", "vintage"],
  campcore: ["outdoor", "rugged", "natural", "vintage", "earthy", "warm"],
  candycore: ["colorful", "sweet", "pop", "playful", "bold", "fun", "bubbly"],
  caninecore: ["natural", "earthy", "warm", "organic", "friendly"],
  cartooncore: ["bold", "playful", "colorful", "fun", "pop", "rounded"],
  changelingcore: ["mystical", "dark", "whimsical", "fantasy", "ornate"],
  "chic modernist": ["minimal", "modern", "clean", "elegant", "refined", "polished"],
  christcore: ["ornate", "traditional", "serif", "classic", "elegant", "warm"],
  "chaotic academia": ["literary", "chaotic", "vintage", "eclectic", "serif", "creative"],
  "city pop": ["retro", "80s", "pop", "colorful", "fun", "japanese", "bold"],
  "classic academia": ["literary", "classic", "serif", "traditional", "refined", "academic"],
  cleancore: ["minimal", "clean", "white", "modern", "stark", "neutral"],
  "classic lolita": ["ornate", "elegant", "feminine", "vintage", "romantic", "decorative"],
  cozycore: ["warm", "soft", "cozy", "friendly", "organic", "inviting"],
  cottagegore: ["rustic", "dark", "vintage", "organic", "gothic", "natural"],
  craftcore: ["handmade", "organic", "warm", "vintage", "handwritten", "rustic"],
  cripplepunk: ["punk", "bold", "edgy", "rebellious", "raw", "alternative"],
  crowcore: ["dark", "gothic", "mysterious", "natural", "moody"],
  "cryptid academia": ["mysterious", "literary", "dark", "academic", "vintage", "moody"],
  cryptidcore: ["mysterious", "dark", "natural", "moody", "quirky", "earthy"],
  crystalcore: ["sparkle", "ethereal", "delicate", "elegant", "feminine", "soft"],
  cultcore: ["dark", "mysterious", "edgy", "gothic", "moody", "bold"],
  "cult party kei": ["feminine", "whimsical", "vintage", "romantic", "decorative", "eclectic"],
  cyberdelic: ["psychedelic", "futuristic", "neon", "bold", "vibrant", "tech"],
  cybergoth: ["dark", "futuristic", "neon", "gothic", "edgy", "bold"],
  cybergrunge: ["grunge", "futuristic", "tech", "edgy", "dark", "glitch"],
  cyberpop: ["pop", "futuristic", "bold", "neon", "playful", "tech"],
  "dark naturalism": ["dark", "natural", "moody", "organic", "earthy", "gothic"],
  "dark nautical": ["dark", "nautical", "bold", "moody", "vintage", "traditional"],
  dazecore: ["soft", "dreamy", "pastel", "hazy", "retro", "feminine"],
  decora: ["colorful", "bold", "playful", "japanese", "pop", "kawaii", "loud"],
  decorapunk: ["colorful", "bold", "punk", "playful", "chaotic", "pop"],
  dinocore: ["playful", "bold", "fun", "retro", "earthy", "quirky"],
  "dolly kei": ["vintage", "ornate", "eclectic", "feminine", "romantic", "decorative"],
  dollcore: ["feminine", "cute", "vintage", "pink", "delicate", "girly"],
  dragoncore: ["fantasy", "bold", "dramatic", "dark", "ornate", "medieval"],
  dullcore: ["muted", "minimal", "soft", "neutral", "restrained", "quiet"],
  "fairy academia": ["whimsical", "literary", "feminine", "soft", "romantic", "elegant"],
  "fairy kei": ["pastel", "colorful", "cute", "playful", "japanese", "kawaii"],
  "fairy tale": ["whimsical", "romantic", "ornate", "feminine", "fantasy", "elegant"],
  fantasy: ["ornate", "dramatic", "serif", "medieval", "bold", "decorative"],
  farmcore: ["rustic", "organic", "warm", "natural", "vintage", "earthy"],
  fawncore: ["soft", "natural", "warm", "delicate", "organic", "feminine"],
  "ghost academia": ["dark", "literary", "moody", "vintage", "serif", "mysterious"],
  ghostcore: ["dark", "mysterious", "ethereal", "soft", "moody", "pale"],
  gloomcore: ["dark", "moody", "muted", "minimal", "soft", "melancholy"],
  glowwave: ["neon", "soft", "dreamy", "pastel", "futuristic", "warm"],
  gorecore: ["dark", "horror", "edgy", "bold", "raw", "aggressive"],
  "gothic academia": ["gothic", "literary", "dark", "serif", "academic", "ornate"],
  gothcore: ["gothic", "dark", "edgy", "bold", "dramatic", "heavy"],
  gurokawa: ["cute", "dark", "edgy", "kawaii", "horror", "playful"],
  happycore: ["bright", "fun", "colorful", "playful", "bold", "pop", "energetic"],
  "health goth": ["dark", "modern", "sporty", "minimal", "bold", "edgy"],
  herbcore: ["organic", "natural", "warm", "earthy", "rustic", "vintage"],
  hikecore: ["outdoor", "natural", "rugged", "earthy", "bold", "rustic"],
  holosexual: ["sparkle", "iridescent", "bold", "pop", "futuristic", "colorful"],
  honeycore: ["warm", "golden", "organic", "soft", "cozy", "natural"],
  "horror academia": ["dark", "literary", "gothic", "horror", "serif", "moody"],
  jamcore: ["eclectic", "colorful", "fun", "playful", "bold", "retro"],
  "kuro kawaii": ["dark", "cute", "kawaii", "gothic", "feminine", "edgy"],
  librarycore: ["literary", "classic", "serif", "warm", "academic", "vintage"],
  "librarian core": ["literary", "classic", "serif", "warm", "vintage", "refined"],
  lightning: ["bold", "energetic", "dynamic", "electric", "striking", "dramatic"],
  lolita: ["ornate", "feminine", "elegant", "decorative", "vintage", "romantic"],
  lunarpunk: ["dark", "organic", "mystical", "futuristic", "natural", "ethereal"],
  medicalcore: ["clinical", "clean", "modern", "stark", "minimal", "technical"],
  "mori kei": ["natural", "organic", "earthy", "soft", "vintage", "feminine"],
  naturecore: ["natural", "organic", "earthy", "warm", "green", "rustic"],
  neko: ["cute", "playful", "kawaii", "girly", "fun", "japanese"],
  "party kei": ["colorful", "fun", "playful", "bold", "pop", "eclectic"],
  "pastel academia": ["pastel", "literary", "soft", "feminine", "classic", "refined"],
  "pastel goth": ["dark", "pastel", "gothic", "feminine", "edgy", "soft"],
  "pastel punk": ["pastel", "punk", "edgy", "feminine", "bold", "playful"],
  peachy: ["warm", "soft", "friendly", "feminine", "organic", "cute"],
  pigeoncore: ["urban", "quirky", "natural", "earthy", "indie"],
  plaguecore: ["dark", "gothic", "vintage", "horror", "distressed", "medieval"],
  "plant mom": ["organic", "natural", "warm", "friendly", "green", "soft"],
  poetcore: ["literary", "romantic", "serif", "classic", "elegant", "warm"],
  princecore: ["elegant", "luxury", "ornate", "refined", "masculine", "classic"],
  princesscore: ["feminine", "elegant", "pink", "romantic", "ornate", "luxury"],
  psychedelic: ["bold", "colorful", "vibrant", "retro", "groovy", "trippy", "expressive"],
  "rainy day": ["moody", "soft", "cozy", "cool", "literary", "grey"],
  ratcore: ["quirky", "earthy", "raw", "organic", "natural", "grunge"],
  ravencore: ["dark", "gothic", "mysterious", "elegant", "moody", "natural"],
  retrocore: ["retro", "vintage", "nostalgic", "fun", "bold", "pop"],
  "romantic academia": ["romantic", "literary", "serif", "elegant", "classic", "warm"],
  "shabby chic": ["vintage", "feminine", "romantic", "soft", "distressed", "organic"],
  snailcore: ["organic", "natural", "soft", "earthy", "quirky", "slow"],
  "soft girl": ["soft", "feminine", "pastel", "cute", "girly", "friendly"],
  softie: ["soft", "cute", "friendly", "pastel", "feminine", "gentle"],
  spiritcore: ["mystical", "natural", "ethereal", "spiritual", "organic", "soft"],
  stoner: ["relaxed", "retro", "organic", "groovy", "warm", "vintage"],
  teethcore: ["horror", "edgy", "dark", "raw", "bold", "aggressive"],
  "theatre kid": ["theatrical", "dramatic", "bold", "expressive", "fun", "creative"],
  trashcore: ["raw", "grunge", "chaotic", "edgy", "distressed", "punk"],
  "vamp romantic": ["gothic", "romantic", "dark", "elegant", "dramatic", "serif"],
  vampirecore: ["gothic", "dark", "elegant", "dramatic", "horror", "vintage"],
  "vintage academia": ["vintage", "literary", "classic", "serif", "academic", "warm"],
  vintagecore: ["vintage", "retro", "nostalgic", "warm", "organic", "classic"],
  "vulture culture": ["dark", "natural", "earthy", "gothic", "organic", "raw"],
  "woodland goth": ["dark", "natural", "gothic", "organic", "earthy", "vintage"],
  wormcore: ["earthy", "organic", "quirky", "natural", "raw", "dark"],
  "yami kawaii": ["dark", "cute", "kawaii", "edgy", "pastel", "pop"],
  cluttercore: ["eclectic", "colorful", "bold", "chaotic", "vintage", "maximalist"],
  antiquecore: ["vintage", "ornate", "warm", "classic", "serif", "traditional"],
  bridgertoncore: ["elegant", "classic", "romantic", "ornate", "serif", "refined"],
  "neo deco": ["art-deco", "modern", "geometric", "luxury", "elegant", "bold"],
  glamorotti: ["luxury", "glamorous", "bold", "fashion", "elegant", "dramatic"],
  "fun haus": ["bold", "colorful", "fun", "playful", "modern", "pop"],
  countrycore: ["rustic", "western", "warm", "organic", "vintage", "earthy"],
  wilderkind: ["natural", "organic", "earthy", "rustic", "wild", "outdoor"],
  "extra celestial": ["cosmic", "sparkle", "ethereal", "mystical", "bold", "dark"],
  mysticcore: ["mystical", "dark", "ethereal", "gothic", "ornate", "moody"],
  coquettecore: ["feminine", "romantic", "delicate", "girly", "soft", "elegant"],
  "dark cottagecore": ["dark", "rustic", "organic", "vintage", "moody", "gothic"],
  auroracore: ["ethereal", "colorful", "dreamy", "soft", "cosmic", "vibrant"],
  bosozoku: ["bold", "rebellious", "japanese", "edgy", "dramatic", "punk"],
  bronzepunk: ["vintage", "industrial", "metallic", "bold", "warm", "retro"],

  // General aesthetic terms
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
  exciting: ["bold", "energetic", "dynamic", "vibrant", "fun", "pop"],
  confident: ["bold", "confident", "strong", "impactful", "modern"],
  strong: ["bold", "strong", "heavy", "impactful", "confident"],
  powerful: ["bold", "powerful", "heavy", "impactful", "dramatic"],
  delicate: ["delicate", "light", "feminine", "script", "elegant", "thin"],
  airy: ["light", "thin", "delicate", "minimal", "elegant", "airy"],
  dreamy: ["soft", "romantic", "whimsical", "pastel", "feminine", "script"],
  surreal: ["experimental", "artistic", "creative", "distinctive", "unusual"],
  eerie: ["dark", "horror", "spooky", "gothic", "creepy"],
  haunted: ["horror", "dark", "spooky", "gothic", "creepy", "distressed"],
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
  bauhaus: ["geometric", "modern", "clean", "minimal", "bold", "sans-serif"],
  swiss: ["clean", "minimal", "geometric", "modern", "professional", "neutral"],
  modernist: ["modern", "clean", "geometric", "minimal", "sans-serif", "bold"],
  postmodern: ["bold", "quirky", "experimental", "creative", "distinctive", "pop"],
  renaissance: ["classic", "serif", "elegant", "ornate", "traditional", "refined"],
  ancient: ["classic", "traditional", "serif", "heavy", "bold", "ornate"],
  greek: ["classic", "serif", "traditional", "elegant", "refined", "clean"],
  roman: ["classic", "serif", "traditional", "bold", "authoritative", "elegant"],
  egyptian: ["bold", "display", "geometric", "heavy", "serif", "ornate"],
  japanese: ["minimal", "clean", "organic", "modern", "zen", "elegant"],
  nordic: ["clean", "minimal", "modern", "cold", "geometric", "bold"],
  french: ["elegant", "refined", "feminine", "serif", "romantic", "luxury"],
  italian: ["elegant", "warm", "luxury", "serif", "classic", "refined"],
  british: ["classic", "traditional", "serif", "elegant", "refined", "authoritative"],
  american: ["bold", "modern", "clean", "friendly", "strong", "versatile"],
  brazilian: ["vibrant", "warm", "bold", "energetic", "fun", "playful"],
  african: ["bold", "vibrant", "warm", "organic", "earthy", "distinctive"],
  asian: ["minimal", "clean", "elegant", "modern", "organic", "zen"],

  // ── Music genres ──
  jazz: ["elegant", "vintage", "serif", "warm", "flowing", "artistic", "editorial"],
  blues: ["vintage", "warm", "serif", "moody", "earthy", "rustic"],
  rock: ["bold", "edgy", "heavy", "grunge", "alternative", "distressed"],
  "hip-hop": ["bold", "urban", "edgy", "modern", "heavy", "impactful"],
  rap: ["bold", "urban", "edgy", "modern", "heavy", "impactful", "dark"],
  country: ["western", "rustic", "warm", "traditional", "serif", "earthy"],
  folk: ["organic", "handwritten", "warm", "rustic", "vintage", "earthy"],
  classical: ["elegant", "serif", "refined", "traditional", "literary", "ornate"],
  electronic: ["modern", "futuristic", "tech", "bold", "geometric", "neon"],
  techno: ["modern", "futuristic", "bold", "tech", "geometric", "minimal"],
  house: ["modern", "bold", "clean", "energetic", "vibrant", "neon"],
  ambient: ["minimal", "soft", "light", "clean", "modern", "delicate"],
  reggae: ["warm", "organic", "bold", "vibrant", "fun", "earthy"],
  ska: ["bold", "energetic", "fun", "retro", "vibrant", "playful"],
  soul: ["warm", "elegant", "vintage", "flowing", "serif", "romantic"],
  funk: ["bold", "retro", "groovy", "fun", "vibrant", "energetic"],
  rnb: ["elegant", "modern", "warm", "bold", "flowing", "feminine"],
  opera: ["elegant", "ornate", "dramatic", "serif", "classic", "refined"],
  orchestral: ["elegant", "serif", "classic", "refined", "traditional", "ornate"],
  acoustic: ["organic", "warm", "handwritten", "natural", "friendly", "soft"],

  // ── Fashion / style ──
  haute: ["luxury", "elegant", "fashion", "refined", "premium", "editorial"],
  couture: ["luxury", "elegant", "fashion", "refined", "premium", "serif"],
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
  divine: ["elegant", "serif", "ornate", "luxury", "refined", "classic"],
  sacred: ["traditional", "serif", "ornate", "elegant", "gothic", "classic"],
  mystic: ["mysterious", "dark", "ornate", "gothic", "script", "moody"],
  alchemy: ["vintage", "ornate", "gothic", "serif", "mysterious", "dark"],
  wizard: ["ornate", "gothic", "dark", "script", "fantasy", "vintage"],
  warrior: ["bold", "heavy", "strong", "edgy", "dark", "impactful"],
  knight: ["gothic", "serif", "traditional", "ornate", "bold", "medieval"],
  pirate: ["vintage", "bold", "distressed", "western", "handwritten", "rustic"],
  maritime: ["vintage", "bold", "serif", "classic", "traditional", "clean"],
  coastal: ["organic", "warm", "friendly", "modern", "light", "clean"],
  island: ["warm", "organic", "friendly", "fun", "vibrant", "tropical"],
  suburban: ["friendly", "warm", "clean", "modern", "approachable", "rounded"],
  rural: ["rustic", "organic", "earthy", "warm", "traditional", "serif"],
  downtown: ["urban", "bold", "modern", "edgy", "industrial", "heavy"],
  underground: ["edgy", "dark", "grunge", "alternative", "raw", "punk"],
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

  // ═══════════════════════════════════════════════
  // BATCH 11 — Sports, fitness & outdoor activities
  // ═══════════════════════════════════════════════
  football: ["bold", "heavy", "display", "condensed", "impactful", "sporty"],
  soccer: ["bold", "modern", "dynamic", "display", "energetic", "clean"],
  basketball: ["bold", "urban", "heavy", "display", "dynamic", "modern"],
  baseball: ["vintage", "bold", "retro", "serif", "display", "traditional"],
  hockey: ["bold", "heavy", "edgy", "display", "condensed", "cold"],
  tennis: ["clean", "modern", "elegant", "serif", "refined", "classic"],
  golf: ["elegant", "serif", "classic", "refined", "traditional", "clean"],
  swimming: ["modern", "clean", "dynamic", "flowing", "bold", "minimal"],
  volleyball: ["bold", "modern", "fun", "dynamic", "energetic", "display"],
  lacrosse: ["bold", "modern", "dynamic", "heavy", "display", "condensed"],
  rugby: ["bold", "heavy", "impactful", "display", "strong", "rustic"],
  cricket: ["classic", "serif", "traditional", "elegant", "british", "clean"],
  rowing: ["bold", "clean", "traditional", "serif", "strong", "classic"],
  fencing: ["elegant", "serif", "sharp", "classic", "refined", "bold"],
  archery: ["bold", "medieval", "serif", "sharp", "western", "display"],
  equestrian: ["elegant", "serif", "classic", "refined", "traditional", "luxury"],
  polo: ["luxury", "elegant", "serif", "classic", "refined", "preppy"],
  skating: ["modern", "bold", "dynamic", "fun", "edgy", "display"],
  skiing: ["bold", "modern", "dynamic", "condensed", "cold", "display"],
  snowboarding: ["bold", "edgy", "dynamic", "modern", "display", "grunge"],
  mountaineering: ["bold", "rustic", "heavy", "display", "western", "condensed"],
  kayaking: ["bold", "organic", "dynamic", "modern", "adventurous", "display"],
  sailing: ["nautical", "bold", "serif", "classic", "traditional", "clean"],
  diving: ["modern", "bold", "dynamic", "clean", "display", "cool"],
  crossfit: ["bold", "heavy", "modern", "impactful", "condensed", "display"],
  pilates: ["modern", "feminine", "clean", "minimal", "elegant", "soft"],
  barre: ["feminine", "elegant", "modern", "clean", "delicate", "minimal"],
  spinning: ["bold", "modern", "dynamic", "energetic", "display", "heavy"],
  weightlifting: ["bold", "heavy", "impactful", "display", "condensed", "strong"],
  bodybuilding: ["bold", "heavy", "impactful", "display", "condensed", "masculine"],
  boxing: ["bold", "heavy", "impactful", "edgy", "display", "condensed"],
  "martial arts": ["bold", "heavy", "dynamic", "japanese", "edgy", "display"],
  karate: ["bold", "heavy", "japanese", "dynamic", "clean", "display"],
  judo: ["bold", "heavy", "japanese", "dynamic", "clean", "modern"],
  taekwondo: ["bold", "heavy", "dynamic", "modern", "display", "energetic"],
  "muay thai": ["bold", "heavy", "edgy", "display", "dynamic", "exotic"],
  parkour: ["bold", "urban", "dynamic", "edgy", "modern", "display"],
  calisthenics: ["bold", "modern", "clean", "dynamic", "geometric", "display"],
  triathlon: ["bold", "dynamic", "modern", "condensed", "energetic", "display"],
  obstacle: ["bold", "heavy", "edgy", "display", "grunge", "dynamic"],
  endurance: ["bold", "modern", "dynamic", "condensed", "heavy", "display"],
  league: ["bold", "modern", "display", "heavy", "condensed", "serif"],
  varsity: ["bold", "vintage", "serif", "display", "traditional", "retro"],
  intramural: ["friendly", "bold", "fun", "modern", "rounded", "display"],
  recreation: ["friendly", "modern", "fun", "bold", "rounded", "clean"],
  playground: ["fun", "playful", "rounded", "bold", "bubbly", "friendly"],
  trampoline: ["fun", "bold", "playful", "energetic", "rounded", "display"],
  skatepark: ["edgy", "bold", "urban", "grunge", "display", "alternative"],

  // ═══════════════════════════════════════════════
  // BATCH 12 — Fashion, beauty & personal care specifics
  // ═══════════════════════════════════════════════
  "bridal gown": ["elegant", "script", "romantic", "feminine", "luxury", "serif"],
  tuxedo: ["elegant", "serif", "bold", "luxury", "formal", "classic"],
  suit: ["professional", "serif", "classic", "elegant", "modern", "clean"],
  dress: ["feminine", "elegant", "script", "romantic", "modern", "flowing"],
  gown: ["elegant", "luxury", "serif", "dramatic", "feminine", "ornate"],
  kimono: ["japanese", "elegant", "minimal", "traditional", "flowing", "organic"],
  sari: ["ornate", "elegant", "vibrant", "warm", "feminine", "traditional"],
  lingerie: ["feminine", "elegant", "serif", "luxury", "delicate", "romantic"],
  swimwear: ["bold", "modern", "fun", "vibrant", "dynamic", "clean"],
  bikini: ["bold", "modern", "fun", "feminine", "vibrant", "display"],
  runway: ["bold", "fashion", "editorial", "modern", "display", "elegant"],
  catwalk: ["bold", "fashion", "editorial", "modern", "display", "elegant"],
  capsule: ["minimal", "modern", "clean", "editorial", "serif", "refined"],
  wardrobe: ["classic", "elegant", "serif", "modern", "clean", "refined"],
  closet: ["modern", "clean", "friendly", "minimal", "warm", "organized"],
  accessory: ["elegant", "modern", "feminine", "bold", "clean", "refined"],
  jewelry: ["elegant", "serif", "luxury", "refined", "feminine", "delicate"],
  necklace: ["elegant", "feminine", "serif", "delicate", "luxury", "refined"],
  bracelet: ["feminine", "elegant", "modern", "bold", "delicate", "clean"],
  earring: ["feminine", "elegant", "modern", "delicate", "bold", "display"],
  ring: ["elegant", "serif", "luxury", "bold", "modern", "refined"],
  tiara: ["luxury", "ornate", "elegant", "feminine", "serif", "display"],
  crown: ["luxury", "ornate", "bold", "gothic", "serif", "dramatic"],
  piercing: ["edgy", "bold", "modern", "dark", "urban", "alternative"],
  manicure: ["feminine", "modern", "elegant", "clean", "girly", "beauty"],
  pedicure: ["feminine", "modern", "elegant", "clean", "soft", "beauty"],
  facial: ["clean", "modern", "feminine", "soft", "elegant", "beauty"],
  massage: ["soft", "warm", "organic", "zen", "gentle", "clean"],
  sauna: ["minimal", "warm", "modern", "zen", "clean", "organic"],
  botox: ["modern", "clean", "minimal", "bold", "elegant", "serif"],
  lash: ["feminine", "modern", "bold", "beauty", "elegant", "girly"],
  brow: ["modern", "feminine", "bold", "clean", "beauty", "minimal"],
  beard: ["bold", "masculine", "vintage", "serif", "rustic", "western"],
  mustache: ["vintage", "bold", "retro", "masculine", "serif", "display"],
  pomade: ["vintage", "retro", "bold", "masculine", "serif", "display"],
  grooming: ["modern", "clean", "masculine", "bold", "vintage", "serif"],

  // ═══════════════════════════════════════════════
  // BATCH 13 — Home, living & domestic spaces
  // ═══════════════════════════════════════════════
  kitchen: ["warm", "friendly", "organic", "modern", "clean", "serif"],
  bathroom: ["clean", "modern", "minimal", "elegant", "light", "serif"],
  bedroom: ["soft", "warm", "elegant", "modern", "feminine", "serif"],
  "living room": ["warm", "modern", "elegant", "friendly", "clean", "serif"],
  "dining room": ["elegant", "warm", "serif", "refined", "traditional", "modern"],
  patio: ["warm", "organic", "friendly", "modern", "rustic", "outdoor"],
  deck: ["warm", "organic", "rustic", "bold", "modern", "outdoor"],
  porch: ["warm", "friendly", "rustic", "vintage", "organic", "serif"],
  gazebo: ["elegant", "organic", "vintage", "romantic", "serif", "ornate"],
  pergola: ["organic", "warm", "modern", "elegant", "outdoor", "clean"],
  terrace: ["elegant", "modern", "warm", "luxury", "clean", "serif"],
  veranda: ["elegant", "vintage", "warm", "serif", "traditional", "organic"],
  sunroom: ["warm", "light", "organic", "friendly", "modern", "clean"],
  mudroom: ["rustic", "friendly", "warm", "organic", "handwritten", "bold"],
  pantry: ["warm", "friendly", "vintage", "handwritten", "organic", "serif"],
  cellar: ["vintage", "dark", "serif", "rustic", "traditional", "moody"],
  "wine cellar": ["luxury", "serif", "vintage", "elegant", "dark", "refined"],
  shed: ["rustic", "organic", "earthy", "bold", "vintage", "handwritten"],
  treehouse: ["fun", "organic", "playful", "rustic", "handwritten", "friendly"],
  playroom: ["fun", "playful", "bold", "rounded", "bubbly", "friendly"],
  crib: ["soft", "gentle", "friendly", "rounded", "warm", "cute"],
  bassinet: ["soft", "delicate", "feminine", "gentle", "elegant", "warm"],
  dollhouse: ["cute", "feminine", "vintage", "playful", "miniature", "fun"],
  fireplace: ["warm", "rustic", "vintage", "cozy", "serif", "traditional"],
  chimney: ["rustic", "vintage", "bold", "traditional", "heavy", "serif"],
  mantle: ["elegant", "warm", "serif", "traditional", "vintage", "refined"],
  hearth: ["warm", "rustic", "organic", "vintage", "serif", "traditional"],
  chandelier: ["luxury", "ornate", "elegant", "serif", "dramatic", "vintage"],
  sconce: ["vintage", "elegant", "warm", "serif", "ornate", "traditional"],
  vanity: ["feminine", "elegant", "vintage", "luxury", "serif", "ornate"],
  dresser: ["vintage", "elegant", "feminine", "warm", "serif", "traditional"],
  armoire: ["vintage", "elegant", "ornate", "serif", "traditional", "luxury"],
  bookshelf: ["literary", "serif", "vintage", "warm", "classic", "organized"],
  hammock: ["organic", "warm", "fun", "relaxed", "friendly", "soft"],
  rocking: ["vintage", "warm", "organic", "rustic", "traditional", "gentle"],

  // ═══════════════════════════════════════════════
  // BATCH 14 — More multi-word searches people actually type
  // ═══════════════════════════════════════════════
  "coffee shop": ["warm", "friendly", "organic", "handwritten", "modern", "inviting"],
  "pet store": ["friendly", "fun", "playful", "rounded", "bold", "cute"],
  "pet shop": ["friendly", "fun", "playful", "rounded", "bold", "cute"],
  "dog groomer": ["friendly", "fun", "playful", "rounded", "bold", "cute"],
  "cat cafe": ["cute", "friendly", "playful", "warm", "rounded", "fun"],
  "yoga studio": ["soft", "organic", "warm", "zen", "minimal", "flowing"],
  "dance studio": ["flowing", "dynamic", "feminine", "elegant", "modern", "bold"],
  "art studio": ["creative", "modern", "artistic", "bold", "distinctive", "clean"],
  "music studio": ["bold", "modern", "creative", "edgy", "dynamic", "display"],
  "recording studio": ["bold", "modern", "edgy", "tech", "dark", "display"],
  "photo studio": ["modern", "editorial", "clean", "bold", "minimal", "artistic"],
  "coworking space": ["modern", "clean", "friendly", "bold", "minimal", "tech"],
  "co-working": ["modern", "clean", "friendly", "bold", "minimal", "tech"],
  "real estate": ["professional", "serif", "modern", "clean", "trustworthy", "elegant"],
  "home decor": ["warm", "modern", "elegant", "organic", "serif", "clean"],
  "interior design": ["elegant", "modern", "clean", "warm", "refined", "serif"],
  "graphic design": ["modern", "bold", "creative", "clean", "geometric", "display"],
  "web design": ["modern", "clean", "tech", "bold", "minimal", "geometric"],
  "ui design": ["modern", "clean", "minimal", "tech", "geometric", "friendly"],
  "brand identity": ["bold", "distinctive", "modern", "clean", "display", "confident"],
  "personal brand": ["modern", "bold", "distinctive", "clean", "friendly", "editorial"],
  "social media": ["bold", "modern", "fun", "vibrant", "pop", "friendly"],
  "content creator": ["modern", "bold", "creative", "fun", "distinctive", "dynamic"],
  influencer: ["modern", "bold", "pop", "girly", "fun", "vibrant"],
  "meal prep": ["clean", "modern", "friendly", "organic", "bold", "healthy"],
  "meal kit": ["modern", "clean", "friendly", "bold", "organic", "rounded"],
  "food truck": ["bold", "fun", "retro", "vintage", "display", "rustic"],
  "pop-up": ["bold", "modern", "fun", "edgy", "display", "vibrant"],
  popup: ["bold", "modern", "fun", "edgy", "display", "vibrant"],
  "pop up shop": ["bold", "modern", "fun", "display", "vibrant", "edgy"],
  "sample sale": ["bold", "modern", "fashion", "display", "edgy", "condensed"],
  "flash sale": ["bold", "display", "impactful", "heavy", "condensed", "modern"],
  "grand opening": ["bold", "display", "dramatic", "serif", "impactful", "elegant"],
  "coming soon": ["modern", "bold", "display", "clean", "minimal", "teaser"],
  "save the date": ["elegant", "script", "romantic", "serif", "feminine", "refined"],
  "rsvp": ["elegant", "serif", "script", "refined", "formal", "feminine"],
  "thank you": ["script", "elegant", "feminine", "warm", "handwritten", "delicate"],
  congratulations: ["elegant", "script", "bold", "display", "serif", "warm"],
  congrats: ["fun", "bold", "modern", "display", "friendly", "energetic"],
  "well done": ["serif", "bold", "warm", "elegant", "display", "friendly"],
  "happy birthday": ["fun", "playful", "bold", "bubbly", "colorful", "friendly"],
  "merry christmas": ["warm", "traditional", "serif", "script", "elegant", "festive"],
  "happy holidays": ["warm", "friendly", "serif", "modern", "elegant", "festive"],
  "trick or treat": ["horror", "fun", "bold", "display", "spooky", "dark"],
  "witches brew": ["gothic", "dark", "ornate", "vintage", "mystical", "script"],
  "potion": ["gothic", "dark", "ornate", "vintage", "mystical", "script"],
  "spell": ["gothic", "mystical", "ornate", "dark", "script", "vintage"],
  "curse": ["dark", "gothic", "horror", "ornate", "heavy", "distressed"],
  "hex": ["dark", "gothic", "edgy", "bold", "angular", "mystical"],
  "wanted poster": ["western", "vintage", "distressed", "serif", "bold", "display"],
  "wanted": ["western", "vintage", "distressed", "serif", "bold", "display"],
  "missing": ["bold", "display", "serif", "stencil", "heavy", "condensed"],
  "reward": ["bold", "vintage", "serif", "display", "western", "traditional"],
  "notice": ["professional", "serif", "bold", "clean", "formal", "display"],
  "warning": ["bold", "heavy", "display", "condensed", "stencil", "impactful"],
  "caution": ["bold", "heavy", "display", "condensed", "stencil", "industrial"],
  "danger": ["bold", "heavy", "edgy", "display", "dark", "impactful"],
  "keep out": ["bold", "heavy", "stencil", "display", "industrial", "dark"],
  "no trespassing": ["bold", "heavy", "stencil", "display", "industrial", "dark"],
  "private": ["serif", "bold", "elegant", "formal", "display", "traditional"],
  "limited edition": ["luxury", "bold", "serif", "display", "premium", "elegant"],
  "handcrafted": ["handwritten", "organic", "craft", "warm", "rustic", "artisanal"],
  "small batch": ["craft", "organic", "handwritten", "vintage", "rustic", "artisanal"],
  "locally sourced": ["organic", "warm", "friendly", "earthy", "rustic", "handwritten"],
  "farm fresh": ["organic", "rustic", "warm", "earthy", "handwritten", "friendly"],
  "homemade": ["warm", "handwritten", "organic", "friendly", "rustic", "vintage"],
  "homegrown": ["organic", "warm", "rustic", "earthy", "handwritten", "friendly"],
  "freshly baked": ["warm", "handwritten", "organic", "friendly", "rustic", "vintage"],
  "daily special": ["bold", "display", "vintage", "retro", "friendly", "handwritten"],
  "brunch menu": ["warm", "modern", "serif", "feminine", "editorial", "elegant"],
  "cocktail menu": ["elegant", "bold", "modern", "luxury", "serif", "refined"],
  "wine list": ["elegant", "serif", "refined", "classic", "luxury", "warm"],
  "beer menu": ["bold", "rustic", "vintage", "friendly", "craft", "display"],
  "tasting menu": ["elegant", "serif", "luxury", "refined", "editorial", "warm"],
  "prix fixe": ["elegant", "serif", "french", "luxury", "refined", "traditional"],
  "omakase": ["minimal", "japanese", "clean", "elegant", "modern", "zen"],
  "chef's table": ["elegant", "luxury", "serif", "refined", "warm", "editorial"],
  "supper club": ["vintage", "elegant", "serif", "warm", "luxury", "moody"],
  "dinner party": ["elegant", "warm", "serif", "refined", "modern", "inviting"],

  // ═══════════════════════════════════════════════
  // BATCH 15 — Technology, apps & digital products
  // ═══════════════════════════════════════════════
  dashboard: ["modern", "clean", "tech", "minimal", "professional", "geometric"],
  analytics: ["modern", "clean", "tech", "professional", "minimal", "geometric"],
  interface: ["modern", "clean", "tech", "minimal", "geometric", "professional"],
  widget: ["modern", "clean", "tech", "friendly", "rounded", "minimal"],
  notification: ["modern", "clean", "bold", "minimal", "tech", "friendly"],
  onboarding: ["modern", "friendly", "clean", "bold", "rounded", "warm"],
  checkout: ["modern", "clean", "professional", "minimal", "trustworthy", "bold"],
  "landing page": ["modern", "bold", "clean", "display", "impactful", "dynamic"],
  homepage: ["modern", "bold", "clean", "display", "editorial", "friendly"],
  splash: ["bold", "display", "modern", "dynamic", "impactful", "clean"],
  modal: ["modern", "clean", "minimal", "tech", "light", "professional"],
  tooltip: ["modern", "clean", "minimal", "tech", "light", "friendly"],
  dropdown: ["modern", "clean", "minimal", "tech", "professional", "geometric"],
  sidebar: ["modern", "clean", "minimal", "tech", "professional", "geometric"],
  navbar: ["modern", "clean", "bold", "tech", "minimal", "geometric"],
  footer: ["modern", "clean", "minimal", "professional", "tech", "light"],
  header: ["bold", "modern", "clean", "display", "minimal", "impactful"],
  carousel: ["modern", "clean", "dynamic", "bold", "friendly", "minimal"],
  grid: ["modern", "clean", "geometric", "minimal", "tech", "structured"],
  feed: ["modern", "clean", "minimal", "friendly", "tech", "dynamic"],
  timeline: ["modern", "clean", "editorial", "minimal", "professional", "serif"],
  chatbot: ["modern", "friendly", "tech", "clean", "rounded", "bold"],
  assistant: ["modern", "friendly", "clean", "tech", "rounded", "warm"],
  automation: ["modern", "tech", "clean", "geometric", "bold", "futuristic"],
  workflow: ["modern", "clean", "professional", "tech", "geometric", "minimal"],
  pipeline: ["modern", "tech", "clean", "bold", "geometric", "professional"],
  integration: ["modern", "tech", "clean", "professional", "bold", "geometric"],
  plugin: ["modern", "tech", "clean", "bold", "geometric", "minimal"],
  extension: ["modern", "tech", "clean", "bold", "minimal", "geometric"],
  update: ["modern", "clean", "bold", "tech", "dynamic", "friendly"],
  upgrade: ["modern", "bold", "tech", "clean", "dynamic", "display"],
  download: ["modern", "bold", "clean", "tech", "display", "dynamic"],
  upload: ["modern", "clean", "tech", "bold", "minimal", "dynamic"],
  sync: ["modern", "clean", "tech", "minimal", "geometric", "bold"],
  backup: ["modern", "clean", "tech", "professional", "minimal", "trustworthy"],
  security: ["professional", "modern", "clean", "bold", "tech", "trustworthy"],
  privacy: ["professional", "clean", "modern", "serif", "trustworthy", "minimal"],
  encryption: ["tech", "modern", "dark", "bold", "monospace", "geometric"],
  firewall: ["bold", "modern", "tech", "dark", "geometric", "heavy"],
  vpn: ["modern", "tech", "clean", "bold", "geometric", "professional"],
  hosting: ["modern", "tech", "clean", "professional", "bold", "minimal"],
  server: ["tech", "modern", "monospace", "clean", "geometric", "bold"],
  database: ["tech", "modern", "monospace", "clean", "geometric", "minimal"],
  api: ["tech", "modern", "monospace", "clean", "geometric", "minimal"],
  devops: ["tech", "modern", "bold", "monospace", "geometric", "clean"],
  frontend: ["modern", "clean", "tech", "friendly", "minimal", "geometric"],
  backend: ["tech", "modern", "monospace", "clean", "geometric", "bold"],
  fullstack: ["tech", "modern", "bold", "clean", "geometric", "monospace"],
  deploy: ["tech", "modern", "bold", "clean", "dynamic", "geometric"],
  release: ["modern", "bold", "clean", "display", "tech", "dynamic"],
  changelog: ["modern", "clean", "monospace", "tech", "minimal", "editorial"],
  readme: ["modern", "clean", "monospace", "tech", "minimal", "professional"],
  tutorial: ["friendly", "modern", "clean", "warm", "readable", "bold"],
  course: ["professional", "modern", "clean", "friendly", "bold", "serif"],
  bootcamp: ["bold", "modern", "tech", "dynamic", "display", "energetic"],
  masterclass: ["elegant", "serif", "bold", "luxury", "display", "editorial"],
  certification: ["professional", "serif", "formal", "clean", "traditional", "classic"],

  // ═══════════════════════════════════════════════
  // BATCH 16 — Multi-word phrases people search
  // ═══════════════════════════════════════════════
  "vintage poster": ["vintage", "bold", "display", "retro", "distressed", "condensed"],
  "movie poster": ["bold", "display", "dramatic", "cinematic", "heavy", "condensed"],
  "concert poster": ["bold", "edgy", "display", "grunge", "heavy", "vintage"],
  "event poster": ["bold", "display", "impactful", "condensed", "modern", "dynamic"],
  "gig poster": ["bold", "edgy", "grunge", "display", "vintage", "distressed"],
  "band poster": ["bold", "edgy", "grunge", "display", "alternative", "vintage"],
  "luxury brand": ["luxury", "elegant", "serif", "refined", "premium", "minimal"],
  "tech startup": ["modern", "clean", "bold", "tech", "geometric", "minimal"],
  "boho wedding": ["organic", "handwritten", "warm", "vintage", "bohemian", "script"],
  "rustic wedding": ["rustic", "organic", "handwritten", "warm", "vintage", "earthy"],
  "modern wedding": ["modern", "clean", "elegant", "minimal", "serif", "refined"],
  "beach wedding": ["organic", "warm", "flowing", "light", "friendly", "script"],
  "garden party": ["organic", "feminine", "warm", "elegant", "script", "romantic"],
  "rooftop party": ["modern", "bold", "elegant", "urban", "luxury", "display"],
  "block party": ["bold", "fun", "retro", "display", "friendly", "vintage"],
  "house party": ["bold", "fun", "modern", "edgy", "display", "urban"],
  "game night": ["fun", "bold", "retro", "playful", "display", "friendly"],
  "movie night": ["bold", "modern", "cinematic", "display", "fun", "retro"],
  "book club": ["literary", "serif", "warm", "classic", "editorial", "elegant"],
  "wine tasting": ["elegant", "serif", "luxury", "warm", "refined", "vintage"],
  "beer tasting": ["bold", "rustic", "vintage", "craft", "friendly", "display"],
  "whiskey tasting": ["bold", "serif", "vintage", "western", "luxury", "warm"],
  "art show": ["modern", "editorial", "artistic", "bold", "clean", "distinctive"],
  "art fair": ["modern", "editorial", "bold", "clean", "artistic", "minimal"],
  "craft fair": ["handwritten", "organic", "warm", "rustic", "friendly", "vintage"],
  "flea market": ["vintage", "retro", "rustic", "handwritten", "fun", "eclectic"],
  "trunk show": ["elegant", "fashion", "serif", "bold", "luxury", "display"],
  "fashion show": ["bold", "fashion", "editorial", "modern", "display", "elegant"],
  "fashion week": ["bold", "fashion", "editorial", "modern", "display", "luxury"],
  "open house": ["professional", "modern", "clean", "friendly", "serif", "warm"],
  "soft launch": ["modern", "clean", "minimal", "friendly", "soft", "light"],
  "hard launch": ["bold", "modern", "impactful", "display", "heavy", "dynamic"],
  "beta launch": ["modern", "tech", "clean", "bold", "minimal", "geometric"],
  "product launch": ["modern", "bold", "clean", "display", "dynamic", "impactful"],
  "album release": ["bold", "modern", "edgy", "display", "creative", "dynamic"],
  "book launch": ["literary", "serif", "editorial", "elegant", "bold", "classic"],
  "press release": ["professional", "serif", "clean", "modern", "editorial", "formal"],
  "media kit": ["modern", "clean", "professional", "bold", "editorial", "minimal"],
  "pitch deck": ["modern", "clean", "bold", "professional", "minimal", "geometric"],
  "business plan": ["professional", "serif", "clean", "modern", "corporate", "formal"],
  "annual report": ["professional", "serif", "editorial", "clean", "corporate", "modern"],
  "case study": ["modern", "clean", "professional", "editorial", "serif", "minimal"],
  "white paper": ["professional", "serif", "clean", "editorial", "modern", "literary"],
  "style guide": ["modern", "clean", "minimal", "editorial", "professional", "geometric"],
  "brand book": ["modern", "bold", "clean", "editorial", "distinctive", "display"],
  "mood board": ["editorial", "modern", "creative", "artistic", "bold", "distinctive"],
  "vision board": ["modern", "creative", "bold", "warm", "inspiring", "editorial"],
  "dream board": ["soft", "feminine", "creative", "romantic", "warm", "script"],
  "bucket list": ["handwritten", "fun", "bold", "friendly", "adventurous", "warm"],
  "wish list": ["feminine", "script", "elegant", "warm", "soft", "friendly"],
  "guest list": ["elegant", "serif", "formal", "clean", "refined", "modern"],
  "hit list": ["bold", "edgy", "dark", "heavy", "display", "stencil"],
  "playlist": ["modern", "bold", "fun", "creative", "dynamic", "edgy"],
  "setlist": ["bold", "modern", "edgy", "display", "music", "condensed"],
  "tracklist": ["modern", "bold", "clean", "tech", "monospace", "editorial"],
  "liner notes": ["literary", "serif", "vintage", "editorial", "warm", "classic"],

  // ═══════════════════════════════════════════════
  // BATCH 17 — Regional, cultural & cuisine specifics
  // ═══════════════════════════════════════════════
  tuscan: ["warm", "earthy", "organic", "serif", "rustic", "vintage"],
  provencal: ["warm", "elegant", "feminine", "organic", "serif", "romantic"],
  venetian: ["ornate", "elegant", "serif", "luxury", "vintage", "romantic"],
  moroccan: ["ornate", "warm", "vibrant", "decorative", "earthy", "exotic"],
  turkish: ["ornate", "warm", "vibrant", "decorative", "earthy", "bold"],
  persian: ["ornate", "elegant", "serif", "decorative", "luxury", "flowing"],
  arabic: ["ornate", "elegant", "flowing", "decorative", "traditional", "bold"],
  indian: ["ornate", "vibrant", "warm", "decorative", "bold", "earthy"],
  thai: ["warm", "organic", "modern", "friendly", "clean", "bold"],
  vietnamese: ["warm", "modern", "friendly", "clean", "organic", "bold"],
  korean: ["modern", "clean", "minimal", "bold", "geometric", "friendly"],
  chinese: ["bold", "traditional", "ornate", "vibrant", "elegant", "red"],
  mexican: ["bold", "vibrant", "warm", "rustic", "display", "fun"],
  cuban: ["vintage", "bold", "warm", "vibrant", "retro", "display"],
  caribbean: ["vibrant", "warm", "fun", "bold", "tropical", "organic"],
  jamaican: ["bold", "vibrant", "warm", "organic", "reggae", "earthy"],
  hawaiian: ["warm", "organic", "fun", "tropical", "friendly", "bold"],
  polynesian: ["bold", "organic", "tribal", "warm", "earthy", "display"],
  cajun: ["bold", "warm", "rustic", "vintage", "earthy", "friendly"],
  creole: ["warm", "ornate", "vintage", "bold", "serif", "earthy"],
  texan: ["bold", "western", "rustic", "serif", "heavy", "display"],
  southern: ["warm", "serif", "traditional", "friendly", "vintage", "rustic"],
  "new england": ["classic", "serif", "traditional", "nautical", "vintage", "clean"],
  midwest: ["warm", "friendly", "clean", "modern", "professional", "approachable"],
  pacific: ["modern", "clean", "organic", "cool", "bold", "fresh"],
  alpine: ["bold", "rustic", "clean", "modern", "cold", "condensed"],
  bavarian: ["bold", "gothic", "vintage", "traditional", "display", "ornate"],
  celtic: ["ornate", "gothic", "flowing", "serif", "medieval", "decorative"],
  gaelic: ["ornate", "gothic", "serif", "traditional", "flowing", "celtic"],
  viking: ["bold", "heavy", "gothic", "medieval", "dark", "rugged"],
  norse: ["bold", "heavy", "gothic", "medieval", "dark", "angular"],
  samurai: ["bold", "japanese", "sharp", "heavy", "traditional", "display"],
  ninja: ["bold", "dark", "edgy", "japanese", "sharp", "modern"],
  "wabi sabi": ["minimal", "organic", "imperfect", "warm", "earthy", "handwritten"],
  kinfolk: ["minimal", "editorial", "warm", "organic", "clean", "modern"],
  ikigai: ["minimal", "organic", "warm", "japanese", "modern", "purposeful"],
  ubuntu: ["warm", "organic", "friendly", "bold", "earthy", "african"],
  aloha: ["warm", "friendly", "organic", "tropical", "fun", "flowing"],
  namaste: ["soft", "organic", "zen", "warm", "spiritual", "flowing"],

  // ═══════════════════════════════════════════════
  // BATCH 18 — Niche industries & modern verticals
  // ═══════════════════════════════════════════════
  cannabis: ["organic", "modern", "bold", "earthy", "friendly", "green"],
  marijuana: ["organic", "modern", "bold", "earthy", "friendly", "green"],
  cbd: ["modern", "clean", "organic", "friendly", "minimal", "rounded"],
  hemp: ["organic", "earthy", "rustic", "natural", "warm", "friendly"],
  "head shop": ["bold", "psychedelic", "retro", "fun", "vibrant", "display"],
  vape: ["modern", "bold", "tech", "clean", "neon", "display"],
  hookah: ["ornate", "exotic", "warm", "vintage", "decorative", "bold"],
  cigar: ["luxury", "serif", "vintage", "bold", "masculine", "warm"],
  tobacco: ["vintage", "serif", "bold", "rustic", "western", "traditional"],
  nft: ["modern", "bold", "tech", "futuristic", "geometric", "neon"],
  "web3": ["modern", "bold", "tech", "futuristic", "geometric", "dark"],
  defi: ["modern", "tech", "bold", "futuristic", "geometric", "clean"],
  token: ["modern", "tech", "bold", "geometric", "futuristic", "clean"],
  airdrop: ["modern", "tech", "bold", "futuristic", "display", "dynamic"],
  dao: ["modern", "tech", "bold", "geometric", "futuristic", "minimal"],
  "smart contract": ["tech", "modern", "monospace", "bold", "geometric", "clean"],
  crowdfunding: ["modern", "friendly", "bold", "warm", "dynamic", "clean"],
  kickstarter: ["modern", "bold", "friendly", "creative", "dynamic", "fun"],
  patreon: ["modern", "creative", "warm", "friendly", "bold", "clean"],
  subscription: ["modern", "clean", "professional", "bold", "friendly", "minimal"],
  membership: ["professional", "modern", "clean", "serif", "elegant", "bold"],
  "loyalty program": ["modern", "friendly", "bold", "warm", "professional", "clean"],
  rewards: ["modern", "bold", "fun", "friendly", "warm", "vibrant"],
  dropshipping: ["modern", "bold", "clean", "tech", "dynamic", "display"],
  ecommerce: ["modern", "clean", "bold", "professional", "minimal", "friendly"],
  "e-commerce": ["modern", "clean", "bold", "professional", "minimal", "friendly"],
  storefront: ["modern", "clean", "friendly", "bold", "warm", "inviting"],
  showroom: ["modern", "elegant", "bold", "luxury", "clean", "display"],
  flagship: ["luxury", "bold", "modern", "elegant", "display", "premium"],
  kiosk: ["modern", "bold", "clean", "display", "condensed", "friendly"],
  vending: ["retro", "bold", "fun", "display", "vintage", "modern"],
  delivery: ["modern", "bold", "friendly", "clean", "dynamic", "rounded"],
  courier: ["modern", "bold", "clean", "dynamic", "condensed", "professional"],
  logistics: ["modern", "professional", "bold", "clean", "geometric", "condensed"],
  fulfillment: ["modern", "clean", "professional", "bold", "geometric", "condensed"],
  wholesale: ["professional", "bold", "clean", "serif", "modern", "condensed"],
  retail: ["modern", "clean", "bold", "friendly", "professional", "minimal"],
  consignment: ["vintage", "elegant", "serif", "warm", "feminine", "rustic"],
  resale: ["modern", "bold", "vintage", "fun", "urban", "display"],
  secondhand: ["vintage", "organic", "warm", "handwritten", "rustic", "friendly"],
  upcycle: ["organic", "creative", "warm", "modern", "friendly", "bold"],
  recycle: ["organic", "modern", "clean", "friendly", "green", "bold"],
  compost: ["organic", "earthy", "warm", "natural", "rustic", "friendly"],
  renewable: ["modern", "clean", "organic", "bold", "green", "friendly"],
  "clean energy": ["modern", "clean", "bold", "green", "geometric", "minimal"],
  hybrid: ["modern", "clean", "bold", "tech", "geometric", "dynamic"],
  tesla: ["modern", "bold", "futuristic", "clean", "geometric", "minimal"],
  incubator: ["modern", "tech", "clean", "bold", "friendly", "warm"],
  accelerator: ["modern", "bold", "tech", "dynamic", "display", "geometric"],
  venture: ["modern", "bold", "professional", "serif", "clean", "dynamic"],
  "venture capital": ["professional", "serif", "bold", "modern", "clean", "elegant"],
  angel: ["elegant", "light", "soft", "serif", "delicate", "warm"],
  ipo: ["professional", "serif", "bold", "modern", "clean", "corporate"],
  merger: ["professional", "serif", "bold", "corporate", "clean", "modern"],
  acquisition: ["professional", "serif", "bold", "corporate", "modern", "clean"],
  pivot: ["modern", "bold", "dynamic", "clean", "tech", "geometric"],
  scale: ["modern", "bold", "clean", "dynamic", "tech", "professional"],
  growth: ["modern", "bold", "organic", "dynamic", "clean", "warm"],
  traction: ["modern", "bold", "dynamic", "clean", "tech", "display"],
  disruption: ["bold", "edgy", "modern", "impactful", "heavy", "dynamic"],
  innovation: ["modern", "clean", "bold", "tech", "futuristic", "geometric"],

  // ═══════════════════════════════════════════════
  // BATCH 19 — Aesthetic movements & subcultures expanded
  // ═══════════════════════════════════════════════
  "new money": ["bold", "modern", "luxury", "display", "flashy", "vibrant"],
  "vanilla girl": ["soft", "minimal", "clean", "cream", "feminine", "gentle"],
  tomato: ["bold", "warm", "vibrant", "fun", "modern", "friendly"],
  "tomato girl": ["warm", "vibrant", "organic", "bold", "fun", "mediterranean"],
  "it girl": ["bold", "modern", "fashion", "editorial", "elegant", "display"],
  "quiet storm": ["elegant", "dark", "moody", "serif", "minimal", "cool"],
  "dark romance": ["dark", "gothic", "romantic", "serif", "ornate", "moody"],
  "light feminine": ["soft", "feminine", "delicate", "light", "script", "romantic"],
  "dark feminine": ["dark", "elegant", "bold", "gothic", "serif", "dramatic"],
  "soft grunge": ["grunge", "soft", "pastel", "edgy", "vintage", "alternative"],
  "nu goth": ["gothic", "modern", "dark", "minimal", "edgy", "bold"],
  "romantic goth": ["gothic", "ornate", "romantic", "dark", "serif", "flowing"],
  liminalcore: ["minimal", "cold", "modern", "eerie", "clean", "geometric"],
  "feral girl": ["bold", "raw", "edgy", "grunge", "alternative", "fun"],
  "goblin mode": ["raw", "quirky", "handwritten", "grunge", "fun", "alternative"],
  wabisabi: ["organic", "minimal", "imperfect", "warm", "earthy", "handwritten"],
  biophilic: ["organic", "natural", "warm", "green", "modern", "friendly"],
  "lo fi": ["warm", "vintage", "handwritten", "organic", "soft", "retro"],

  // ═══════════════════════════════════════════════
  // BATCH 20 — Adjective combos, moods & descriptive pairs
  // ═══════════════════════════════════════════════
  "dark and moody": ["dark", "moody", "editorial", "serif", "gothic", "dramatic"],
  "light and airy": ["light", "thin", "minimal", "clean", "elegant", "soft"],
  "bold and modern": ["bold", "modern", "clean", "geometric", "display", "impactful"],
  "clean and minimal": ["clean", "minimal", "modern", "light", "geometric", "neutral"],
  "warm and inviting": ["warm", "friendly", "organic", "inviting", "serif", "soft"],
  "dark and edgy": ["dark", "edgy", "bold", "grunge", "gothic", "heavy"],
  "bright and cheerful": ["bright", "fun", "vibrant", "playful", "friendly", "bubbly"],
  "rich and luxurious": ["luxury", "rich", "elegant", "serif", "premium", "ornate"],
  "crisp and clean": ["clean", "modern", "minimal", "crisp", "geometric", "professional"],
  "rough and rugged": ["rustic", "bold", "distressed", "western", "heavy", "earthy"],
  "soft and delicate": ["soft", "delicate", "feminine", "light", "script", "romantic"],
  "sharp and angular": ["sharp", "angular", "geometric", "modern", "edgy", "bold"],
  "smooth and sleek": ["clean", "modern", "polished", "minimal", "geometric", "elegant"],
  "raw and unfiltered": ["raw", "grunge", "handwritten", "distressed", "edgy", "punk"],
  "timeless and elegant": ["classic", "serif", "elegant", "refined", "traditional", "luxury"],
  "playful and fun": ["playful", "fun", "bubbly", "rounded", "bold", "friendly"],
  "serious and professional": ["professional", "serif", "clean", "corporate", "formal", "modern"],
  "quirky and unique": ["quirky", "distinctive", "creative", "playful", "fun", "bold"],
  "sleek and modern": ["modern", "clean", "minimal", "geometric", "bold", "professional"],
  "vintage and retro": ["vintage", "retro", "serif", "warm", "display", "distressed"],
  "earthy and organic": ["earthy", "organic", "warm", "natural", "rustic", "handwritten"],
  "feminine and romantic": ["feminine", "romantic", "script", "elegant", "delicate", "soft"],
  "masculine and strong": ["bold", "heavy", "strong", "serif", "display", "masculine"],
  "whimsical and magical": ["whimsical", "script", "flowing", "fairy", "playful", "ornate"],
  "industrial and raw": ["industrial", "raw", "bold", "heavy", "urban", "stencil"],
  "tropical and vibrant": ["tropical", "vibrant", "bold", "warm", "fun", "organic"],
  "cozy and warm": ["warm", "cozy", "organic", "soft", "friendly", "rounded"],
  "cold and stark": ["cold", "minimal", "modern", "bold", "clean", "geometric"],
  "mystical and enchanting": ["mystical", "ornate", "gothic", "flowing", "dark", "script"],
  "futuristic and sleek": ["futuristic", "modern", "clean", "bold", "geometric", "tech"],
  "nostalgic and sentimental": ["vintage", "retro", "warm", "serif", "soft", "handwritten"],
  "gritty and urban": ["grunge", "urban", "bold", "edgy", "raw", "heavy"],
  "polished and refined": ["refined", "elegant", "clean", "serif", "modern", "luxury"],
  "eclectic and bohemian": ["eclectic", "bohemian", "organic", "vintage", "warm", "handwritten"],
  "zen and peaceful": ["zen", "minimal", "clean", "soft", "organic", "gentle"],
  "loud and proud": ["bold", "heavy", "display", "impactful", "pop", "vibrant"],
  "understated elegance": ["elegant", "minimal", "clean", "serif", "refined", "restrained"],
  "quiet confidence": ["clean", "serif", "modern", "elegant", "minimal", "professional"],
  "controlled chaos": ["edgy", "bold", "creative", "experimental", "dynamic", "quirky"],
  "organized chaos": ["eclectic", "bold", "creative", "fun", "quirky", "dynamic"],
  "beautiful mess": ["handwritten", "organic", "raw", "feminine", "creative", "warm"],
  "perfectly imperfect": ["handwritten", "organic", "warm", "imperfect", "rustic", "vintage"],

  // ═══════════════════════════════════════════════
  // BATCH 21 — Animals, pets & wildlife expanded
  // ═══════════════════════════════════════════════
  puppy: ["cute", "friendly", "playful", "rounded", "warm", "fun"],
  kitten: ["cute", "soft", "playful", "feminine", "rounded", "warm"],
  bunny: ["cute", "soft", "playful", "feminine", "rounded", "friendly"],
  hamster: ["cute", "playful", "fun", "rounded", "friendly", "small"],
  goldfish: ["fun", "friendly", "rounded", "playful", "retro", "warm"],
  parrot: ["vibrant", "bold", "fun", "tropical", "colorful", "playful"],
  flamingo: ["feminine", "bold", "fun", "tropical", "vibrant", "display"],
  peacock: ["ornate", "elegant", "vibrant", "bold", "decorative", "luxury"],
  swan: ["elegant", "feminine", "flowing", "delicate", "serif", "classic"],
  dove: ["soft", "gentle", "light", "elegant", "serif", "peaceful"],
  hummingbird: ["delicate", "vibrant", "modern", "light", "elegant", "dynamic"],
  robin: ["warm", "friendly", "organic", "soft", "natural", "rounded"],
  sparrow: ["warm", "friendly", "organic", "small", "handwritten", "vintage"],
  crow: ["dark", "bold", "gothic", "edgy", "moody", "heavy"],
  falcon: ["bold", "sharp", "dynamic", "modern", "display", "impactful"],
  panther: ["dark", "bold", "edgy", "sleek", "modern", "heavy"],
  jaguar: ["bold", "luxury", "elegant", "dark", "dynamic", "display"],
  leopard: ["bold", "fashion", "exotic", "display", "vibrant", "edgy"],
  tiger: ["bold", "heavy", "dramatic", "display", "vibrant", "dynamic"],
  cheetah: ["bold", "dynamic", "modern", "condensed", "display", "fast"],
  gorilla: ["bold", "heavy", "strong", "dark", "impactful", "display"],
  monkey: ["fun", "playful", "bold", "quirky", "friendly", "display"],
  panda: ["friendly", "rounded", "cute", "modern", "bold", "fun"],
  koala: ["friendly", "cute", "soft", "rounded", "warm", "organic"],
  penguin: ["friendly", "fun", "modern", "bold", "cute", "rounded"],
  turtle: ["organic", "gentle", "slow", "warm", "vintage", "friendly"],
  octopus: ["bold", "flowing", "creative", "dark", "artistic", "distinctive"],
  jellyfish: ["flowing", "organic", "soft", "light", "modern", "ethereal"],
  starfish: ["organic", "fun", "friendly", "warm", "nautical", "playful"],
  seahorse: ["organic", "flowing", "delicate", "feminine", "elegant", "nautical"],
  dolphin: ["modern", "flowing", "friendly", "dynamic", "organic", "cool"],
  shark: ["bold", "heavy", "dark", "edgy", "modern", "display"],
  orca: ["bold", "heavy", "dark", "modern", "display", "striking"],
  manta: ["flowing", "elegant", "organic", "modern", "dark", "cool"],
  crab: ["bold", "fun", "rustic", "nautical", "vintage", "display"],
  bee: ["warm", "organic", "friendly", "bold", "golden", "hardworking"],
  wasp: ["sharp", "edgy", "bold", "angular", "dark", "modern"],
  dragonfly: ["delicate", "elegant", "light", "flowing", "organic", "modern"],
  moth: ["dark", "moody", "delicate", "gothic", "organic", "vintage"],
  firefly: ["warm", "soft", "light", "organic", "gentle", "magical"],
  spider: ["dark", "gothic", "edgy", "creepy", "horror", "ornate"],
  scorpion: ["dark", "bold", "edgy", "gothic", "heavy", "sharp"],
  snake: ["dark", "gothic", "flowing", "elegant", "mysterious", "ornate"],
  lizard: ["bold", "modern", "earthy", "organic", "dynamic", "display"],
  chameleon: ["colorful", "creative", "bold", "vibrant", "modern", "dynamic"],
  frog: ["fun", "friendly", "green", "organic", "playful", "rounded"],
  toad: ["rustic", "organic", "earthy", "fun", "quirky", "vintage"],
  mushroom: ["organic", "earthy", "whimsical", "vintage", "natural", "mystical"],
  cactus: ["bold", "modern", "organic", "earthy", "western", "minimal"],
  bamboo: ["organic", "minimal", "clean", "japanese", "zen", "natural"],
  moss: ["organic", "earthy", "soft", "natural", "vintage", "green"],
  fern: ["organic", "natural", "elegant", "modern", "green", "flowing"],
  ivy: ["organic", "gothic", "vintage", "flowing", "dark", "elegant"],
  willow: ["flowing", "organic", "soft", "gentle", "feminine", "elegant"],
  oak: ["bold", "traditional", "serif", "strong", "classic", "earthy"],
  pine: ["rustic", "organic", "earthy", "western", "bold", "natural"],
  birch: ["light", "modern", "organic", "clean", "minimal", "elegant"],
  cherry: ["feminine", "soft", "warm", "japanese", "organic", "delicate"],
  "cherry blossom": ["feminine", "delicate", "japanese", "soft", "romantic", "flowing"],

  // ═══════════════════════════════════════════════
  // BATCH 22 — Interior design, architecture & decor styles
  // ═══════════════════════════════════════════════
  "modern farmhouse": ["rustic", "modern", "warm", "clean", "organic", "friendly"],
  eclectic: ["eclectic", "bold", "vibrant", "creative", "fun", "distinctive"],
  transitional: ["warm", "elegant", "serif", "modern", "clean", "balanced"],
  colonial: ["traditional", "serif", "classic", "elegant", "ornate", "formal"],
  georgian: ["classic", "serif", "traditional", "elegant", "formal", "refined"],
  tudor: ["gothic", "ornate", "traditional", "heavy", "serif", "vintage"],
  craftsman: ["rustic", "warm", "organic", "traditional", "serif", "earthy"],
  bungalow: ["warm", "rustic", "friendly", "organic", "vintage", "cozy"],
  brownstone: ["urban", "vintage", "serif", "elegant", "classic", "traditional"],
  townhouse: ["elegant", "urban", "serif", "modern", "clean", "refined"],
  villa: ["luxury", "elegant", "warm", "serif", "mediterranean", "refined"],
  hacienda: ["warm", "rustic", "western", "earthy", "bold", "vintage"],
  adobe: ["warm", "earthy", "rustic", "organic", "western", "natural"],
  "tiny house": ["modern", "minimal", "friendly", "clean", "organic", "small"],
  houseboat: ["nautical", "vintage", "organic", "friendly", "rustic", "bold"],
  yurt: ["organic", "earthy", "warm", "rustic", "bohemian", "natural"],
  tipi: ["organic", "earthy", "western", "bold", "rustic", "natural"],
  glamping: ["organic", "luxury", "modern", "warm", "friendly", "elegant"],
  "tiny home": ["modern", "minimal", "friendly", "clean", "organic", "small"],
  renovation: ["modern", "bold", "clean", "warm", "professional", "dynamic"],
  remodel: ["modern", "bold", "clean", "warm", "professional", "friendly"],
  restoration: ["vintage", "serif", "traditional", "elegant", "warm", "classic"],
  demolition: ["bold", "heavy", "industrial", "display", "impactful", "raw"],
  floorplan: ["modern", "clean", "geometric", "technical", "monospace", "minimal"],
  elevation: ["modern", "clean", "geometric", "architectural", "bold", "minimal"],
  rendering: ["modern", "clean", "tech", "bold", "futuristic", "geometric"],
  model: ["modern", "clean", "bold", "elegant", "fashion", "geometric"],
  maquette: ["artistic", "modern", "clean", "geometric", "bold", "minimal"],
  proportion: ["geometric", "modern", "clean", "elegant", "balanced", "serif"],
  texture: ["organic", "warm", "rustic", "earthy", "vintage", "distressed"],
  grain: ["organic", "warm", "rustic", "earthy", "vintage", "natural"],

  // ═══════════════════════════════════════════════
  // BATCH 23 — Music, entertainment & media expanded
  // ═══════════════════════════════════════════════
  "album cover": ["bold", "creative", "artistic", "distinctive", "display", "edgy"],
  "album art": ["bold", "creative", "artistic", "distinctive", "display", "edgy"],
  "cover art": ["bold", "creative", "artistic", "distinctive", "display", "edgy"],
  mixtape: ["bold", "edgy", "retro", "urban", "handwritten", "grunge"],
  remix: ["bold", "modern", "dynamic", "edgy", "neon", "tech"],
  collab: ["modern", "bold", "creative", "fun", "dynamic", "friendly"],
  collaboration: ["modern", "bold", "creative", "clean", "professional", "dynamic"],
  duet: ["elegant", "flowing", "warm", "romantic", "serif", "harmonious"],
  solo: ["bold", "modern", "distinctive", "display", "clean", "dramatic"],
  unplugged: ["organic", "warm", "handwritten", "vintage", "intimate", "soft"],
  "live music": ["bold", "edgy", "dynamic", "display", "energetic", "raw"],
  venue: ["bold", "modern", "display", "urban", "edgy", "dark"],
  amphitheater: ["bold", "serif", "dramatic", "classical", "display", "elegant"],
  auditorium: ["professional", "serif", "clean", "formal", "elegant", "modern"],
  stage: ["bold", "dramatic", "display", "heavy", "impactful", "theatrical"],
  backstage: ["edgy", "bold", "raw", "dark", "urban", "industrial"],
  greenroom: ["warm", "friendly", "modern", "clean", "soft", "inviting"],
  encore: ["bold", "dramatic", "display", "impactful", "serif", "elegant"],
  intermission: ["clean", "serif", "modern", "professional", "formal", "elegant"],
  matinee: ["vintage", "serif", "elegant", "warm", "retro", "classic"],
  blockbuster: ["bold", "heavy", "display", "dramatic", "impactful", "cinematic"],
  "indie film": ["editorial", "distinctive", "modern", "creative", "handwritten", "minimal"],
  documentary: ["editorial", "serif", "clean", "modern", "literary", "professional"],
  "short film": ["modern", "editorial", "creative", "distinctive", "clean", "artistic"],
  animation: ["fun", "playful", "modern", "creative", "bold", "rounded"],
  "motion graphics": ["modern", "bold", "geometric", "dynamic", "tech", "display"],
  "visual effects": ["futuristic", "modern", "bold", "tech", "display", "dynamic"],
  vodcast: ["modern", "bold", "creative", "dynamic", "editorial", "tech"],
  livestream: ["modern", "bold", "dynamic", "tech", "display", "energetic"],
  webcast: ["modern", "professional", "clean", "tech", "bold", "editorial"],
  newscast: ["bold", "serif", "professional", "editorial", "authoritative", "clean"],
  sitcom: ["fun", "friendly", "bold", "retro", "playful", "modern"],
  drama: ["dramatic", "serif", "elegant", "editorial", "bold", "moody"],
  comedy: ["fun", "bold", "playful", "friendly", "quirky", "display"],
  thriller: ["dark", "bold", "edgy", "dramatic", "heavy", "modern"],
  romance: ["romantic", "script", "feminine", "elegant", "flowing", "serif"],
  "sci fi": ["futuristic", "bold", "tech", "modern", "geometric", "display"],
  heist: ["bold", "modern", "edgy", "display", "dark", "dynamic"],
  mystery: ["dark", "serif", "moody", "editorial", "elegant", "mysterious"],
  whodunit: ["serif", "vintage", "editorial", "dark", "literary", "mysterious"],
  espionage: ["dark", "modern", "bold", "tech", "geometric", "edgy"],
  apocalypse: ["dark", "heavy", "distressed", "grunge", "bold", "gothic"],
  "post apocalyptic": ["distressed", "dark", "grunge", "heavy", "bold", "industrial"],
  zombie: ["horror", "dark", "distressed", "grunge", "bold", "heavy"],
  alien: ["futuristic", "tech", "bold", "modern", "geometric", "display"],
  ufo: ["retro", "futuristic", "bold", "display", "vintage", "fun"],
  cryptid: ["dark", "mysterious", "horror", "vintage", "distressed", "edgy"],
  bigfoot: ["rustic", "bold", "vintage", "western", "display", "fun"],
  mothman: ["dark", "edgy", "gothic", "vintage", "mysterious", "bold"],
  folklore: ["vintage", "serif", "traditional", "ornate", "warm", "literary"],
  fairytale: ["whimsical", "script", "ornate", "feminine", "flowing", "fantasy"],
  fable: ["literary", "serif", "vintage", "ornate", "warm", "classic"],
  legend: ["bold", "serif", "dramatic", "display", "ornate", "classic"],
  myth: ["ornate", "serif", "gothic", "classic", "bold", "dark"],
  saga: ["bold", "serif", "dramatic", "epic", "display", "classic"],
  shanty: ["bold", "vintage", "nautical", "rustic", "display", "fun"],
  lament: ["dark", "moody", "serif", "literary", "gothic", "flowing"],
  dirge: ["dark", "heavy", "serif", "gothic", "somber", "traditional"],

  // ═══════════════════════════════════════════════
  // BATCH 24 — Transportation, vehicles & travel
  // ═══════════════════════════════════════════════
  airplane: ["modern", "bold", "clean", "display", "condensed", "dynamic"],
  airline: ["modern", "clean", "professional", "bold", "condensed", "serif"],
  airport: ["modern", "clean", "bold", "condensed", "display", "professional"],
  helicopter: ["bold", "modern", "dynamic", "display", "condensed", "heavy"],
  "hot air balloon": ["vintage", "fun", "warm", "whimsical", "organic", "retro"],
  train: ["vintage", "bold", "industrial", "display", "retro", "serif"],
  railway: ["vintage", "serif", "industrial", "traditional", "bold", "display"],
  locomotive: ["vintage", "bold", "heavy", "industrial", "display", "serif"],
  subway: ["modern", "bold", "urban", "condensed", "geometric", "display"],
  metro: ["modern", "bold", "clean", "geometric", "condensed", "urban"],
  trolley: ["vintage", "retro", "fun", "bold", "display", "friendly"],
  streetcar: ["vintage", "retro", "display", "bold", "urban", "serif"],
  bus: ["bold", "modern", "display", "condensed", "urban", "friendly"],
  taxi: ["bold", "display", "urban", "retro", "condensed", "modern"],
  cab: ["bold", "urban", "vintage", "display", "retro", "condensed"],
  rideshare: ["modern", "clean", "friendly", "bold", "tech", "rounded"],
  scooter: ["modern", "fun", "bold", "friendly", "rounded", "urban"],
  moped: ["retro", "fun", "vintage", "bold", "friendly", "european"],
  vespa: ["retro", "vintage", "fun", "italian", "bold", "friendly"],
  rickshaw: ["vintage", "bold", "exotic", "warm", "earthy", "display"],
  canoe: ["organic", "rustic", "bold", "natural", "western", "warm"],
  kayak: ["bold", "modern", "dynamic", "organic", "adventurous", "display"],
  raft: ["bold", "rustic", "organic", "adventurous", "fun", "display"],
  ferry: ["nautical", "bold", "clean", "serif", "traditional", "modern"],
  cruise: ["luxury", "bold", "modern", "elegant", "serif", "display"],
  "cruise ship": ["luxury", "bold", "elegant", "modern", "serif", "premium"],
  submarine: ["dark", "bold", "tech", "industrial", "modern", "heavy"],
  spaceship: ["futuristic", "bold", "tech", "modern", "geometric", "display"],
  rocket: ["bold", "futuristic", "display", "dynamic", "heavy", "retro"],
  satellite: ["modern", "tech", "clean", "futuristic", "geometric", "minimal"],
  rover: ["bold", "modern", "tech", "display", "futuristic", "condensed"],
  backpacking: ["organic", "bold", "handwritten", "adventurous", "rustic", "earthy"],
  airbnb: ["modern", "friendly", "clean", "warm", "bold", "rounded"],
  overlanding: ["bold", "rustic", "heavy", "western", "display", "earthy"],
  vanlife: ["organic", "bold", "modern", "handwritten", "adventurous", "fun"],
  roadtrip: ["bold", "fun", "retro", "vintage", "display", "adventurous"],
  "road trip": ["bold", "fun", "retro", "vintage", "display", "adventurous"],
  wanderlust: ["organic", "handwritten", "warm", "flowing", "vintage", "adventurous"],
  jetset: ["luxury", "modern", "bold", "elegant", "display", "serif"],
  "jet set": ["luxury", "modern", "bold", "elegant", "display", "serif"],
  globetrotter: ["bold", "vintage", "adventurous", "serif", "display", "retro"],
  nomadic: ["organic", "handwritten", "warm", "rustic", "earthy", "bold"],
  migration: ["organic", "flowing", "modern", "dynamic", "bold", "natural"],
  passport: ["bold", "serif", "stencil", "traditional", "condensed", "display"],
  visa: ["professional", "serif", "clean", "formal", "modern", "condensed"],
  customs: ["bold", "serif", "stencil", "formal", "condensed", "display"],
  immigration: ["professional", "serif", "clean", "formal", "modern", "bold"],
  embassy: ["professional", "serif", "formal", "traditional", "elegant", "classic"],
  consulate: ["professional", "serif", "formal", "traditional", "elegant", "clean"],
  diplomat: ["elegant", "serif", "formal", "refined", "classic", "traditional"],

  // ═══════════════════════════════════════════════
  // BATCH 25 — Education, academic & learning
  // ═══════════════════════════════════════════════
  kindergarten: ["fun", "playful", "rounded", "bubbly", "friendly", "cute"],
  preschool: ["fun", "playful", "rounded", "bubbly", "friendly", "cute"],
  elementary: ["friendly", "clean", "readable", "warm", "approachable", "rounded"],
  "middle school": ["friendly", "modern", "clean", "bold", "readable", "fun"],
  "high school": ["bold", "modern", "clean", "display", "friendly", "strong"],
  college: ["bold", "serif", "traditional", "academic", "modern", "display"],
  grad: ["serif", "academic", "modern", "clean", "professional", "elegant"],
  "grad school": ["serif", "academic", "professional", "clean", "modern", "elegant"],
  phd: ["serif", "academic", "literary", "authoritative", "classic", "elegant"],
  thesis: ["serif", "academic", "literary", "formal", "classic", "editorial"],
  dissertation: ["serif", "academic", "literary", "formal", "classic", "elegant"],
  lecture: ["serif", "academic", "professional", "clean", "literary", "modern"],
  syllabus: ["clean", "professional", "serif", "modern", "readable", "academic"],
  curriculum: ["professional", "clean", "serif", "academic", "modern", "readable"],
  transcript: ["professional", "clean", "serif", "formal", "monospace", "modern"],
  dean: ["serif", "academic", "authoritative", "traditional", "elegant", "formal"],
  provost: ["serif", "academic", "authoritative", "traditional", "formal", "classic"],
  alumni: ["serif", "traditional", "elegant", "classic", "academic", "warm"],
  yearbook: ["bold", "fun", "retro", "vintage", "friendly", "display"],
  pep: ["bold", "fun", "energetic", "display", "dynamic", "friendly"],
  "pep rally": ["bold", "fun", "energetic", "display", "dynamic", "vibrant"],
  mascot: ["bold", "fun", "display", "playful", "vintage", "retro"],
  spirit: ["bold", "fun", "energetic", "display", "dynamic", "warm"],
  "school spirit": ["bold", "fun", "display", "retro", "vintage", "energetic"],
  valedictorian: ["elegant", "serif", "academic", "formal", "classic", "refined"],
  salutatorian: ["elegant", "serif", "academic", "formal", "classic", "refined"],
  scholarship: ["serif", "academic", "professional", "formal", "elegant", "clean"],
  fellowship: ["serif", "academic", "professional", "warm", "elegant", "classic"],
  internship: ["modern", "clean", "professional", "friendly", "bold", "minimal"],
  apprentice: ["vintage", "craft", "bold", "rustic", "serif", "traditional"],
  mentorship: ["warm", "professional", "serif", "friendly", "modern", "clean"],
  tutoring: ["friendly", "clean", "modern", "approachable", "warm", "readable"],
  "study group": ["friendly", "modern", "clean", "warm", "casual", "readable"],
  "study abroad": ["modern", "warm", "bold", "adventurous", "editorial", "friendly"],
  exchange: ["modern", "bold", "clean", "professional", "friendly", "dynamic"],
  immersion: ["modern", "warm", "bold", "organic", "friendly", "dynamic"],
  literacy: ["serif", "literary", "warm", "readable", "friendly", "clean"],
  stem: ["modern", "clean", "bold", "tech", "geometric", "professional"],
  steam: ["modern", "creative", "bold", "clean", "warm", "dynamic"],
  montessori: ["warm", "organic", "friendly", "natural", "rounded", "clean"],
  waldorf: ["organic", "warm", "handwritten", "natural", "soft", "earthy"],
  homeschool: ["warm", "friendly", "organic", "handwritten", "approachable", "clean"],
  "sunday school": ["warm", "traditional", "friendly", "serif", "gentle", "classic"],
  seminary: ["serif", "traditional", "literary", "classic", "formal", "elegant"],
  monastery: ["serif", "traditional", "gothic", "ornate", "classic", "minimal"],
  convent: ["serif", "traditional", "elegant", "classic", "gothic", "formal"],
  academy: ["serif", "academic", "bold", "traditional", "display", "classic"],
  institute: ["professional", "serif", "modern", "clean", "academic", "bold"],
  laboratory: ["modern", "clean", "monospace", "tech", "professional", "minimal"],
  research: ["professional", "serif", "clean", "modern", "academic", "minimal"],
  experiment: ["modern", "bold", "tech", "creative", "monospace", "dynamic"],
  hypothesis: ["serif", "academic", "literary", "modern", "clean", "professional"],
  discovery: ["bold", "modern", "dynamic", "warm", "editorial", "display"],
  breakthrough: ["bold", "modern", "impactful", "display", "dynamic", "dramatic"],
  eureka: ["bold", "display", "dramatic", "fun", "vintage", "impactful"],

  // ═══════════════════════════════════════════════
  // BATCH 26 — Health, wellness & self-care
  // ═══════════════════════════════════════════════
  meditation: ["soft", "minimal", "zen", "organic", "warm", "gentle"],
  mindfulness: ["soft", "minimal", "zen", "organic", "warm", "clean"],
  breathwork: ["soft", "organic", "minimal", "flowing", "zen", "gentle"],
  wellness: ["clean", "modern", "organic", "warm", "friendly", "soft"],
  "self care": ["warm", "feminine", "soft", "organic", "modern", "friendly"],
  "self love": ["feminine", "warm", "script", "soft", "romantic", "friendly"],
  healing: ["warm", "organic", "soft", "gentle", "spiritual", "flowing"],
  holistic: ["organic", "warm", "natural", "soft", "friendly", "earthy"],
  ayurveda: ["organic", "warm", "earthy", "traditional", "natural", "ornate"],
  acupuncture: ["clean", "modern", "organic", "minimal", "asian", "professional"],
  reiki: ["soft", "organic", "warm", "spiritual", "flowing", "gentle"],
  aromatherapy: ["organic", "warm", "soft", "feminine", "natural", "elegant"],
  herbalist: ["organic", "vintage", "earthy", "warm", "handwritten", "natural"],
  naturopath: ["organic", "clean", "warm", "natural", "professional", "friendly"],
  chiropractor: ["clean", "professional", "modern", "bold", "trustworthy", "friendly"],
  physiotherapy: ["clean", "modern", "professional", "bold", "friendly", "dynamic"],
  rehab: ["clean", "professional", "modern", "bold", "friendly", "warm"],
  recovery: ["warm", "clean", "modern", "friendly", "professional", "soft"],
  sobriety: ["clean", "serif", "modern", "warm", "professional", "strong"],
  detox: ["clean", "modern", "organic", "bold", "fresh", "minimal"],
  cleanse: ["clean", "modern", "organic", "light", "fresh", "minimal"],
  fasting: ["clean", "modern", "minimal", "bold", "professional", "serif"],
  nutrition: ["clean", "modern", "organic", "friendly", "professional", "bold"],
  dietitian: ["clean", "modern", "professional", "friendly", "organic", "warm"],
  mindset: ["modern", "bold", "clean", "motivational", "dynamic", "display"],
  motivation: ["bold", "modern", "dynamic", "impactful", "display", "energetic"],
  affirmation: ["warm", "soft", "script", "feminine", "gentle", "friendly"],
  gratitude: ["warm", "soft", "script", "organic", "handwritten", "gentle"],
  journaling: ["handwritten", "warm", "literary", "personal", "organic", "feminine"],
  diary: ["handwritten", "personal", "vintage", "feminine", "warm", "script"],
  "bullet journal": ["minimal", "modern", "clean", "monospace", "organized", "friendly"],
  "bujo": ["minimal", "modern", "clean", "organized", "friendly", "handwritten"],
  tracker: ["modern", "clean", "minimal", "tech", "organized", "monospace"],
  habit: ["modern", "clean", "friendly", "bold", "minimal", "rounded"],
  routine: ["modern", "clean", "minimal", "professional", "organized", "friendly"],
  ritual: ["vintage", "ornate", "serif", "traditional", "mystical", "warm"],
  mantra: ["serif", "traditional", "spiritual", "minimal", "warm", "zen"],
  intention: ["modern", "warm", "clean", "soft", "friendly", "serif"],
  manifestation: ["modern", "bold", "clean", "display", "distinctive", "warm"],

  // ═══════════════════════════════════════════════
  // BATCH 27 — Weather, celestial & natural phenomena
  // ═══════════════════════════════════════════════
  thunder: ["bold", "heavy", "dramatic", "dark", "display", "impactful"],
  tornado: ["bold", "dynamic", "heavy", "dramatic", "display", "chaotic"],
  hurricane: ["bold", "heavy", "dramatic", "dynamic", "display", "impactful"],
  tsunami: ["bold", "heavy", "dramatic", "dynamic", "display", "impactful"],
  earthquake: ["bold", "heavy", "dramatic", "distressed", "display", "raw"],
  avalanche: ["bold", "cold", "heavy", "dynamic", "display", "dramatic"],
  blizzard: ["cold", "bold", "heavy", "dynamic", "display", "dramatic"],
  flood: ["bold", "heavy", "dynamic", "flowing", "display", "dramatic"],
  drought: ["warm", "earthy", "rustic", "distressed", "heavy", "western"],
  rainbow: ["vibrant", "fun", "playful", "bold", "colorful", "friendly"],
  rain: ["moody", "soft", "gentle", "cool", "minimal", "serif"],
  drizzle: ["soft", "light", "gentle", "delicate", "cool", "minimal"],
  downpour: ["bold", "heavy", "dramatic", "dynamic", "moody", "dark"],
  hail: ["bold", "cold", "heavy", "angular", "harsh", "display"],
  frost: ["cold", "clean", "minimal", "delicate", "elegant", "light"],
  ice: ["cold", "clean", "minimal", "bold", "modern", "geometric"],
  snow: ["clean", "light", "minimal", "soft", "cold", "elegant"],
  sleet: ["cold", "minimal", "clean", "modern", "muted", "light"],
  mist: ["soft", "light", "gentle", "minimal", "mysterious", "delicate"],
  fog: ["soft", "muted", "minimal", "light", "moody", "mysterious"],
  haze: ["soft", "warm", "muted", "light", "dreamy", "minimal"],
  smog: ["dark", "industrial", "heavy", "muted", "urban", "moody"],
  dust: ["earthy", "warm", "rustic", "distressed", "western", "vintage"],
  sand: ["warm", "earthy", "organic", "natural", "rustic", "western"],
  wave: ["flowing", "organic", "dynamic", "modern", "bold", "cool"],
  tide: ["flowing", "organic", "modern", "cool", "dynamic", "nautical"],
  current: ["flowing", "dynamic", "modern", "bold", "clean", "cool"],
  whirlpool: ["dynamic", "bold", "flowing", "dramatic", "dark", "display"],
  geyser: ["bold", "dynamic", "dramatic", "display", "natural", "impactful"],
  creek: ["organic", "warm", "flowing", "rustic", "natural", "gentle"],
  stream: ["flowing", "organic", "gentle", "modern", "clean", "natural"],
  river: ["flowing", "bold", "organic", "natural", "dynamic", "cool"],
  lake: ["calm", "organic", "clean", "modern", "cool", "minimal"],
  pond: ["calm", "organic", "friendly", "warm", "natural", "gentle"],
  marsh: ["organic", "earthy", "dark", "moody", "natural", "vintage"],
  wetland: ["organic", "earthy", "natural", "warm", "rustic", "green"],
  estuary: ["organic", "flowing", "cool", "modern", "natural", "clean"],
  delta: ["modern", "geometric", "bold", "dynamic", "clean", "display"],
  archipelago: ["modern", "organic", "flowing", "bold", "elegant", "cool"],
  peninsula: ["modern", "bold", "organic", "clean", "dynamic", "warm"],
  isthmus: ["modern", "geometric", "bold", "clean", "minimal", "academic"],
  atoll: ["organic", "warm", "tropical", "modern", "friendly", "cool"],
  eclipse: ["dark", "dramatic", "bold", "modern", "cosmic", "display"],
  comet: ["bold", "dynamic", "futuristic", "display", "modern", "cosmic"],
  meteor: ["bold", "dynamic", "futuristic", "dramatic", "display", "cosmic"],
  asteroid: ["bold", "modern", "futuristic", "heavy", "display", "cosmic"],
  constellation: ["elegant", "modern", "delicate", "cosmic", "light", "flowing"],
  galaxy: ["bold", "futuristic", "modern", "cosmic", "dramatic", "display"],
  supernova: ["bold", "dramatic", "vibrant", "futuristic", "display", "cosmic"],
  "black hole": ["dark", "bold", "modern", "heavy", "cosmic", "dramatic"],
  "northern lights": ["vibrant", "flowing", "organic", "modern", "light", "cosmic"],
  borealis: ["vibrant", "flowing", "elegant", "modern", "light", "cosmic"],

  // ═══════════════════════════════════════════════
  // BATCH 28 — Gemstones, minerals & precious materials
  // ═══════════════════════════════════════════════
  diamond: ["luxury", "elegant", "bold", "clean", "modern", "premium"],
  amethyst: ["elegant", "mystical", "purple", "luxury", "feminine", "ornate"],
  opal: ["elegant", "iridescent", "feminine", "light", "modern", "delicate"],
  pearl: ["elegant", "feminine", "delicate", "luxury", "soft", "classic"],
  jade: ["elegant", "organic", "natural", "zen", "refined", "green"],
  topaz: ["warm", "elegant", "bold", "luxury", "golden", "vintage"],
  garnet: ["dark", "bold", "warm", "rich", "vintage", "dramatic"],
  onyx: ["dark", "bold", "elegant", "modern", "luxury", "heavy"],
  obsidian: ["dark", "bold", "heavy", "gothic", "modern", "volcanic"],
  quartz: ["clean", "modern", "light", "minimal", "elegant", "crystal"],
  agate: ["organic", "warm", "earthy", "bold", "natural", "flowing"],
  jasper: ["earthy", "warm", "organic", "rustic", "bold", "natural"],
  moonstone: ["elegant", "mystical", "light", "feminine", "cosmic", "soft"],
  sandstone: ["warm", "earthy", "rustic", "natural", "organic", "bold"],
  limestone: ["warm", "earthy", "classic", "organic", "natural", "serif"],
  granite: ["bold", "heavy", "strong", "earthy", "industrial", "modern"],
  slate: ["dark", "modern", "minimal", "cool", "clean", "bold"],
  cobalt: ["bold", "modern", "cool", "deep", "vibrant", "dynamic"],
  titanium: ["bold", "modern", "futuristic", "heavy", "tech", "strong"],
  platinum: ["luxury", "elegant", "modern", "premium", "cool", "refined"],
  palladium: ["modern", "clean", "luxury", "premium", "cool", "minimal"],
  rhodium: ["luxury", "modern", "premium", "elegant", "clean", "minimal"],
  sterling: ["elegant", "luxury", "classic", "serif", "refined", "cool"],
  pewter: ["vintage", "rustic", "traditional", "muted", "warm", "earthy"],
  enamel: ["bold", "vibrant", "vintage", "decorative", "ornate", "display"],
  lacquer: ["elegant", "modern", "bold", "luxury", "glossy", "asian"],
  resin: ["modern", "organic", "bold", "creative", "artistic", "transparent"],

  // ═══════════════════════════════════════════════
  // BATCH 29 — Games, toys & recreation
  // ═══════════════════════════════════════════════
  "board game": ["fun", "retro", "bold", "playful", "vintage", "friendly"],
  "card game": ["fun", "bold", "retro", "playful", "display", "vintage"],
  "video game": ["bold", "tech", "modern", "display", "gaming", "dynamic"],
  rpg: ["bold", "gothic", "ornate", "fantasy", "dark", "serif"],
  "role playing": ["bold", "gothic", "ornate", "fantasy", "display", "serif"],
  "dungeons and dragons": ["gothic", "ornate", "medieval", "fantasy", "serif", "dark"],
  dnd: ["gothic", "ornate", "medieval", "fantasy", "serif", "dark"],
  tabletop: ["bold", "retro", "vintage", "display", "fun", "serif"],
  wargame: ["bold", "heavy", "stencil", "display", "military", "dark"],
  miniature: ["ornate", "detailed", "vintage", "serif", "craft", "small"],
  collectible: ["vintage", "bold", "display", "retro", "serif", "ornate"],
  figurine: ["ornate", "vintage", "detailed", "serif", "craft", "display"],
  action: ["bold", "heavy", "dynamic", "display", "condensed", "impactful"],
  "action figure": ["bold", "heavy", "retro", "display", "fun", "vintage"],
  lego: ["bold", "modern", "fun", "rounded", "friendly", "playful"],
  jigsaw: ["fun", "playful", "quirky", "vintage", "retro", "friendly"],
  crossword: ["serif", "literary", "vintage", "clean", "monospace", "editorial"],
  sudoku: ["clean", "minimal", "modern", "monospace", "geometric", "professional"],
  chess: ["classic", "serif", "elegant", "strategic", "bold", "traditional"],
  checkers: ["retro", "fun", "friendly", "bold", "vintage", "simple"],
  poker: ["bold", "vintage", "serif", "luxury", "dark", "display"],
  blackjack: ["bold", "vintage", "luxury", "dark", "serif", "display"],
  roulette: ["luxury", "bold", "elegant", "display", "vintage", "dramatic"],
  dice: ["bold", "fun", "retro", "display", "geometric", "vintage"],
  domino: ["bold", "geometric", "retro", "display", "vintage", "fun"],
  pinball: ["retro", "bold", "fun", "neon", "vintage", "display"],
  foosball: ["retro", "fun", "bold", "vintage", "friendly", "display"],
  "ping pong": ["fun", "bold", "retro", "friendly", "display", "dynamic"],
  darts: ["bold", "vintage", "retro", "display", "pub", "fun"],
  billiards: ["elegant", "vintage", "serif", "luxury", "dark", "refined"],
  pool: ["bold", "vintage", "fun", "display", "retro", "friendly"],
  bingo: ["retro", "fun", "bold", "friendly", "vintage", "display"],
  lottery: ["bold", "display", "fun", "retro", "vintage", "friendly"],
  jackpot: ["bold", "display", "dramatic", "neon", "vintage", "impactful"],
  slot: ["bold", "neon", "retro", "display", "vintage", "fun"],
  "slot machine": ["bold", "retro", "neon", "vintage", "display", "fun"],
  sandbox: ["fun", "playful", "warm", "organic", "friendly", "rounded"],
  slide: ["fun", "playful", "bold", "modern", "dynamic", "rounded"],
  seesaw: ["fun", "playful", "balanced", "retro", "friendly", "rounded"],
  merry: ["fun", "warm", "festive", "friendly", "playful", "vintage"],
  "merry go round": ["retro", "fun", "vintage", "ornate", "playful", "whimsical"],
  ferris: ["vintage", "fun", "retro", "whimsical", "display", "bold"],
  "ferris wheel": ["vintage", "fun", "retro", "whimsical", "display", "romantic"],
  roller: ["bold", "dynamic", "display", "fun", "retro", "heavy"],
  "roller coaster": ["bold", "dynamic", "fun", "display", "retro", "dramatic"],
  "bumper cars": ["bold", "retro", "fun", "vintage", "display", "neon"],
  funhouse: ["fun", "quirky", "bold", "retro", "display", "playful"],

  // ═══════════════════════════════════════════════
  // BATCH 30 — Senses, textures & sensory experiences
  // ═══════════════════════════════════════════════
  crisp: ["clean", "modern", "sharp", "minimal", "professional", "bold"],
  velvety: ["luxury", "soft", "warm", "rich", "elegant", "flowing"],
  silky: ["elegant", "feminine", "flowing", "soft", "luxury", "refined"],
  grainy: ["vintage", "distressed", "organic", "film", "warm", "raw"],
  gritty: ["grunge", "raw", "edgy", "urban", "distressed", "bold"],
  dusty: ["vintage", "warm", "muted", "rustic", "earthy", "distressed"],
  chalky: ["muted", "soft", "earthy", "organic", "vintage", "minimal"],
  smoky: ["dark", "moody", "warm", "vintage", "bold", "edgy"],
  dewy: ["fresh", "light", "organic", "feminine", "modern", "clean"],
  frosty: ["cold", "clean", "minimal", "modern", "light", "sharp"],
  icy: ["cold", "clean", "minimal", "bold", "modern", "sharp"],
  fiery: ["bold", "warm", "dramatic", "vibrant", "energetic", "display"],
  blazing: ["bold", "warm", "dramatic", "heavy", "display", "impactful"],
  scorching: ["bold", "warm", "heavy", "dramatic", "display", "edgy"],
  sizzling: ["bold", "warm", "dynamic", "energetic", "fun", "display"],
  sparkling: ["elegant", "light", "vibrant", "modern", "luxury", "feminine"],
  shimmering: ["elegant", "light", "modern", "flowing", "luxury", "delicate"],
  glowing: ["warm", "light", "soft", "modern", "neon", "vibrant"],
  radiant: ["warm", "bold", "vibrant", "modern", "elegant", "light"],
  dim: ["dark", "moody", "muted", "soft", "minimal", "vintage"],
  murky: ["dark", "moody", "heavy", "vintage", "distressed", "gothic"],
  translucent: ["light", "modern", "delicate", "clean", "minimal", "elegant"],
  pearlescent: ["elegant", "light", "feminine", "luxury", "soft", "modern"],
  metallic: ["modern", "bold", "industrial", "futuristic", "heavy", "display"],
  buttery: ["warm", "soft", "rich", "organic", "luxury", "elegant"],
  creamy: ["warm", "soft", "organic", "feminine", "gentle", "elegant"],
  crunchy: ["bold", "edgy", "raw", "fun", "grunge", "textured"],
  chewy: ["fun", "bold", "rounded", "playful", "friendly", "organic"],
  tangy: ["bold", "vibrant", "fun", "energetic", "modern", "sharp"],
  zesty: ["bold", "vibrant", "fun", "energetic", "modern", "fresh"],
  savory: ["warm", "rich", "bold", "serif", "organic", "earthy"],
  umami: ["warm", "rich", "organic", "japanese", "modern", "bold"],
  bitter: ["dark", "bold", "moody", "serif", "editorial", "heavy"],
  tart: ["bold", "modern", "sharp", "vibrant", "fun", "fresh"],
  acidic: ["bold", "edgy", "modern", "sharp", "vibrant", "neon"],
  pungent: ["bold", "dark", "earthy", "heavy", "rustic", "organic"],
  aromatic: ["warm", "organic", "elegant", "serif", "earthy", "natural"],
  fragrant: ["feminine", "elegant", "soft", "organic", "delicate", "warm"],
  herbal: ["organic", "earthy", "natural", "warm", "friendly", "green"],
  woody: ["warm", "rustic", "organic", "earthy", "bold", "natural"],
  smokey: ["dark", "moody", "warm", "vintage", "bold", "rustic"],
  musky: ["dark", "warm", "bold", "vintage", "masculine", "earthy"],
  fresh: ["clean", "modern", "light", "friendly", "organic", "green"],
  pure: ["clean", "light", "minimal", "modern", "elegant", "white"],
  unfiltered: ["raw", "handwritten", "grunge", "authentic", "bold", "organic"],
  authentic: ["organic", "warm", "handwritten", "vintage", "honest", "bold"],
  genuine: ["warm", "serif", "honest", "traditional", "organic", "friendly"],
  honest: ["clean", "modern", "warm", "serif", "friendly", "professional"],

  // ═══════════════════════════════════════════════
  // BATCH 31 — Relationships, social & community
  // ═══════════════════════════════════════════════
  family: ["warm", "friendly", "serif", "organic", "approachable", "soft"],
  "family reunion": ["warm", "friendly", "vintage", "handwritten", "fun", "serif"],
  siblings: ["warm", "fun", "friendly", "playful", "bold", "modern"],
  parents: ["warm", "serif", "traditional", "friendly", "soft", "clean"],
  grandparents: ["warm", "traditional", "serif", "vintage", "elegant", "classic"],
  newborn: ["soft", "gentle", "delicate", "feminine", "rounded", "warm"],
  toddler: ["fun", "playful", "rounded", "bubbly", "friendly", "cute"],
  teenager: ["bold", "modern", "edgy", "fun", "pop", "dynamic"],
  adult: ["modern", "clean", "professional", "serif", "bold", "minimal"],
  elder: ["serif", "traditional", "elegant", "warm", "classic", "refined"],
  couple: ["romantic", "elegant", "script", "warm", "serif", "modern"],
  soulmate: ["romantic", "script", "flowing", "elegant", "feminine", "warm"],
  bestie: ["fun", "playful", "girly", "bold", "pop", "friendly"],
  "best friend": ["fun", "warm", "friendly", "playful", "handwritten", "bold"],
  friendship: ["warm", "friendly", "handwritten", "organic", "fun", "playful"],
  sisterhood: ["feminine", "warm", "bold", "friendly", "script", "elegant"],
  brotherhood: ["bold", "serif", "traditional", "strong", "heavy", "display"],
  community: ["warm", "friendly", "modern", "organic", "clean", "approachable"],
  neighborhood: ["warm", "friendly", "vintage", "organic", "handwritten", "fun"],
  tribe: ["bold", "organic", "earthy", "warm", "tribal", "display"],
  collective: ["modern", "bold", "creative", "clean", "distinctive", "geometric"],
  guild: ["gothic", "ornate", "serif", "vintage", "traditional", "bold"],
  union: ["bold", "serif", "strong", "traditional", "heavy", "display"],
  alliance: ["bold", "serif", "modern", "professional", "strong", "display"],
  coalition: ["bold", "professional", "serif", "modern", "clean", "strong"],
  congregation: ["traditional", "serif", "warm", "formal", "classic", "elegant"],
  circle: ["modern", "geometric", "clean", "organic", "friendly", "rounded"],
  squad: ["bold", "modern", "fun", "urban", "edgy", "display"],
  crew: ["bold", "urban", "modern", "edgy", "fun", "display"],
  gang: ["bold", "edgy", "urban", "heavy", "grunge", "dark"],
  posse: ["western", "vintage", "bold", "rustic", "display", "retro"],
  clan: ["gothic", "bold", "dark", "heavy", "ornate", "medieval"],
  dynasty: ["bold", "serif", "luxury", "ornate", "elegant", "dramatic"],
  empire: ["bold", "serif", "luxury", "dramatic", "heavy", "display"],
  kingdom: ["ornate", "serif", "gothic", "luxury", "bold", "medieval"],
  realm: ["gothic", "ornate", "serif", "fantasy", "dark", "bold"],
  domain: ["modern", "bold", "tech", "clean", "professional", "geometric"],
  territory: ["bold", "western", "rustic", "heavy", "display", "serif"],
  colony: ["serif", "traditional", "vintage", "colonial", "classic", "formal"],
  settlement: ["rustic", "serif", "vintage", "western", "traditional", "earthy"],
  outpost: ["rustic", "bold", "western", "vintage", "stencil", "display"],
  haven: ["warm", "friendly", "organic", "soft", "modern", "clean"],
  refuge: ["warm", "serif", "traditional", "gentle", "organic", "classic"],
  asylum: ["dark", "gothic", "heavy", "serif", "horror", "distressed"],
  paradise: ["warm", "tropical", "vibrant", "organic", "fun", "bold"],
  nirvana: ["minimal", "zen", "organic", "spiritual", "warm", "flowing"],
  eden: ["organic", "warm", "natural", "romantic", "feminine", "lush"],

  // ═══════════════════════════════════════════════
  // BATCH 32 — Clothing, fabric & textile terms
  // ═══════════════════════════════════════════════
  cotton: ["organic", "warm", "friendly", "soft", "natural", "clean"],
  wool: ["warm", "organic", "cozy", "rustic", "earthy", "natural"],
  cashmere: ["luxury", "soft", "elegant", "warm", "refined", "premium"],
  mohair: ["warm", "organic", "textured", "luxury", "soft", "vintage"],
  chiffon: ["feminine", "delicate", "light", "flowing", "elegant", "soft"],
  tulle: ["feminine", "delicate", "romantic", "soft", "bridal", "light"],
  organza: ["feminine", "delicate", "elegant", "light", "luxury", "formal"],
  taffeta: ["elegant", "luxury", "formal", "feminine", "bold", "dramatic"],
  brocade: ["ornate", "luxury", "vintage", "decorative", "elegant", "rich"],
  damask: ["ornate", "elegant", "vintage", "luxury", "decorative", "traditional"],
  jacquard: ["ornate", "elegant", "luxury", "decorative", "vintage", "rich"],
  paisley: ["ornate", "bohemian", "vintage", "decorative", "warm", "earthy"],
  tartan: ["traditional", "vintage", "bold", "british", "classic", "warm"],
  houndstooth: ["classic", "vintage", "elegant", "bold", "british", "fashion"],
  herringbone: ["classic", "vintage", "elegant", "traditional", "warm", "serif"],
  chevron: ["geometric", "bold", "modern", "dynamic", "clean", "display"],
  stripe: ["bold", "clean", "modern", "display", "geometric", "nautical"],
  polka: ["retro", "fun", "feminine", "playful", "vintage", "cute"],
  "polka dot": ["retro", "fun", "feminine", "playful", "vintage", "cute"],
  gingham: ["vintage", "friendly", "warm", "rustic", "feminine", "country"],
  seersucker: ["vintage", "warm", "southern", "preppy", "classic", "friendly"],
  chambray: ["casual", "warm", "friendly", "organic", "modern", "clean"],
  nylon: ["modern", "bold", "sporty", "tech", "clean", "dynamic"],
  polyester: ["modern", "bold", "clean", "sporty", "bright", "display"],
  spandex: ["bold", "modern", "sporty", "dynamic", "energetic", "display"],
  lycra: ["bold", "modern", "sporty", "dynamic", "clean", "energetic"],
  mesh: ["modern", "edgy", "bold", "sporty", "urban", "tech"],
  crochet: ["handwritten", "organic", "craft", "warm", "vintage", "feminine"],
  macrame: ["bohemian", "organic", "warm", "craft", "earthy", "vintage"],
  embroidery: ["ornate", "craft", "vintage", "feminine", "decorative", "elegant"],
  quilting: ["warm", "vintage", "craft", "organic", "traditional", "homey"],
  patchwork: ["eclectic", "vintage", "warm", "craft", "colorful", "fun"],
  tapestry: ["ornate", "vintage", "decorative", "warm", "rich", "artistic"],
  weaving: ["organic", "craft", "warm", "earthy", "artistic", "flowing"],
  dyeing: ["organic", "vibrant", "artistic", "bold", "warm", "craft"],
  batik: ["organic", "earthy", "vibrant", "artistic", "warm", "exotic"],
  "tie dye": ["retro", "fun", "vibrant", "hippie", "bold", "psychedelic"],
  shibori: ["organic", "japanese", "minimal", "indigo", "artistic", "zen"],
  printing: ["bold", "modern", "editorial", "display", "clean", "tech"],
  screen: ["bold", "modern", "display", "clean", "graphic", "pop"],
  "screen printing": ["bold", "vintage", "display", "retro", "graphic", "pop"],
  letterpress: ["vintage", "serif", "elegant", "traditional", "craft", "editorial"],
  engraving: ["ornate", "elegant", "serif", "vintage", "traditional", "luxury"],
  etching: ["vintage", "ornate", "detailed", "serif", "artistic", "dark"],
  woodcut: ["vintage", "bold", "rustic", "artistic", "heavy", "display"],
  linocut: ["bold", "vintage", "artistic", "display", "graphic", "rustic"],
  lithograph: ["vintage", "artistic", "editorial", "serif", "elegant", "display"],
  risograph: ["bold", "modern", "retro", "fun", "graphic", "pop"],

  // ═══════════════════════════════════════════════
  // BATCH 33 — Time periods, decades & eras
  // ═══════════════════════════════════════════════
  prehistoric: ["bold", "heavy", "rustic", "primitive", "earthy", "display"],
  "bronze age": ["bold", "earthy", "traditional", "heavy", "serif", "ancient"],
  "iron age": ["bold", "heavy", "dark", "traditional", "serif", "industrial"],
  hellenistic: ["elegant", "serif", "ornate", "classic", "refined", "traditional"],
  byzantine: ["ornate", "decorative", "gold", "serif", "traditional", "luxury"],
  romanesque: ["heavy", "serif", "traditional", "ornate", "bold", "medieval"],
  "dark ages": ["gothic", "dark", "heavy", "medieval", "serif", "ornate"],
  crusades: ["bold", "serif", "gothic", "medieval", "heavy", "dramatic"],
  elizabethan: ["ornate", "serif", "elegant", "traditional", "decorative", "literary"],
  jacobean: ["ornate", "serif", "traditional", "elegant", "heavy", "decorative"],
  neoclassical: ["classic", "serif", "elegant", "refined", "traditional", "clean"],
  regency: ["elegant", "serif", "refined", "traditional", "feminine", "classic"],
  "industrial revolution": ["industrial", "bold", "heavy", "serif", "vintage", "stencil"],
  gilded: ["luxury", "ornate", "gold", "elegant", "serif", "dramatic"],
  "gilded age": ["luxury", "ornate", "elegant", "serif", "gold", "vintage"],
  "belle epoque": ["elegant", "ornate", "serif", "luxury", "feminine", "vintage"],
  prohibition: ["vintage", "bold", "serif", "retro", "dark", "display"],
  "roaring 20s": ["vintage", "bold", "ornate", "display", "luxury", "retro"],
  "roaring twenties": ["vintage", "bold", "ornate", "display", "luxury", "retro"],
  "great depression": ["distressed", "vintage", "serif", "heavy", "dark", "bold"],
  wartime: ["bold", "stencil", "heavy", "vintage", "serif", "military"],
  postwar: ["retro", "vintage", "modern", "clean", "bold", "optimistic"],
  "1950s": ["retro", "vintage", "bold", "clean", "friendly", "display"],
  fifties: ["retro", "vintage", "bold", "clean", "friendly", "display"],
  "1960s": ["retro", "bold", "mod", "vibrant", "fun", "geometric"],
  sixties: ["retro", "bold", "mod", "vibrant", "fun", "geometric"],
  "1970s": ["retro", "groovy", "vintage", "fun", "warm", "earthy"],
  seventies: ["retro", "groovy", "vintage", "fun", "warm", "earthy"],
  "1980s": ["neon", "retro", "bold", "synthwave", "vibrant", "display"],
  eighties: ["neon", "retro", "bold", "synthwave", "vibrant", "display"],
  "1990s": ["retro", "grunge", "alternative", "pop", "bold", "nostalgic"],
  nineties: ["retro", "grunge", "alternative", "pop", "bold", "nostalgic"],
  "2000s": ["modern", "pop", "bold", "clean", "tech", "bubbly"],
  "2010s": ["modern", "clean", "minimal", "bold", "tech", "geometric"],
  "2020s": ["modern", "clean", "bold", "minimal", "geometric", "futuristic"],
  future: ["futuristic", "modern", "bold", "tech", "geometric", "clean"],
  past: ["vintage", "retro", "serif", "traditional", "warm", "classic"],
  present: ["modern", "clean", "bold", "minimal", "friendly", "contemporary"],
  yesterday: ["vintage", "retro", "warm", "nostalgic", "serif", "soft"],
  today: ["modern", "clean", "bold", "minimal", "fresh", "friendly"],
  tomorrow: ["futuristic", "modern", "bold", "clean", "dynamic", "tech"],
  forever: ["bold", "serif", "elegant", "classic", "display", "dramatic"],
  eternal: ["serif", "elegant", "classic", "ornate", "bold", "gothic"],
  infinite: ["modern", "geometric", "flowing", "bold", "futuristic", "elegant"],
  fleeting: ["light", "thin", "delicate", "modern", "minimal", "flowing"],
  ephemeral: ["light", "delicate", "modern", "minimal", "flowing", "thin"],
  momentary: ["light", "modern", "minimal", "delicate", "clean", "soft"],
  lasting: ["bold", "serif", "classic", "strong", "traditional", "elegant"],
  enduring: ["bold", "serif", "traditional", "classic", "strong", "elegant"],
  permanent: ["bold", "serif", "heavy", "traditional", "strong", "display"],
  temporary: ["light", "modern", "minimal", "clean", "friendly", "rounded"],
  transient: ["light", "modern", "minimal", "flowing", "thin", "clean"],

  // ── Myers-Briggs (direct KEYWORD_WANT for strong scoring) ──
  intj: ["geometric", "minimal", "technical", "monospace", "precise", "clean"],
  intp: ["monospace", "experimental", "technical", "geometric", "code", "quirky"],
  entj: ["bold", "condensed", "display", "headline", "commanding", "strong"],
  entp: ["experimental", "playful", "bold", "quirky", "distinctive", "dynamic"],
  infj: ["serif", "elegant", "editorial", "literary", "refined", "classic"],
  infp: ["handwritten", "script", "organic", "soft", "flowing", "personal"],
  enfj: ["rounded", "friendly", "bold", "warm", "approachable", "clean"],
  enfp: ["rounded", "playful", "colorful", "bubbly", "fun", "bold"],
  istj: ["serif", "traditional", "classic", "readable", "neutral", "professional"],
  isfj: ["rounded", "serif", "warm", "readable", "soft", "friendly"],
  estj: ["sans-serif", "bold", "professional", "condensed", "headline", "structured"],
  esfj: ["rounded", "friendly", "warm", "soft", "approachable", "readable"],
  istp: ["monospace", "technical", "code", "precise", "industrial", "minimal"],
  isfp: ["script", "serif", "elegant", "flowing", "artistic", "warm"],
  estp: ["condensed", "bold", "display", "impactful", "headline", "strong"],
  esfp: ["display", "playful", "bold", "fun", "decorative", "bubbly"],

  // ── Enneagram (direct KEYWORD_WANT) ──
  "enneagram-1": ["serif", "clean", "traditional", "precise", "structured", "readable"],
  "enneagram-2": ["rounded", "warm", "friendly", "soft", "script", "approachable"],
  "enneagram-3": ["modern", "sleek", "sans-serif", "professional", "clean", "bold"],
  "enneagram-4": ["display", "experimental", "editorial", "script", "distinctive", "artistic"],
  "enneagram-5": ["monospace", "technical", "minimal", "geometric", "code", "clean"],
  "enneagram-6": ["serif", "traditional", "readable", "classic", "neutral", "professional"],
  "enneagram-7": ["display", "playful", "bold", "rounded", "fun", "colorful"],
  "enneagram-8": ["condensed", "bold", "display", "heavy", "impactful", "headline"],
  "enneagram-9": ["sans-serif", "clean", "readable", "neutral", "rounded", "soft"],
  "1w9": ["serif", "clean", "minimal", "precise", "calm", "structured"],
  "1w2": ["serif", "warm", "readable", "friendly", "structured", "approachable"],
  "2w1": ["rounded", "warm", "clean", "readable", "friendly", "serif"],
  "2w3": ["rounded", "modern", "warm", "professional", "clean", "friendly"],
  "3w2": ["modern", "elegant", "bold", "warm", "sleek", "professional"],
  "3w4": ["editorial", "modern", "distinctive", "display", "elegant", "bold"],
  "4w3": ["editorial", "elegant", "display", "artistic", "bold", "distinctive"],
  "4w5": ["minimal", "experimental", "serif", "literary", "editorial", "distinctive"],
  "5w4": ["monospace", "experimental", "technical", "editorial", "minimal", "precise"],
  "5w6": ["monospace", "technical", "serif", "structured", "clean", "readable"],
  "6w5": ["serif", "traditional", "structured", "clean", "readable", "neutral"],
  "6w7": ["rounded", "serif", "warm", "readable", "friendly", "approachable"],
  "7w6": ["rounded", "playful", "friendly", "bold", "fun", "clean"],
  "7w8": ["bold", "display", "playful", "impactful", "condensed", "fun"],
  "8w7": ["bold", "condensed", "display", "impactful", "heavy", "dynamic"],
  "8w9": ["bold", "clean", "condensed", "serif", "strong", "structured"],
  "9w8": ["sans-serif", "clean", "neutral", "readable", "bold", "strong"],
  "9w1": ["sans-serif", "serif", "clean", "structured", "neutral", "readable"],

  // ── Brand Archetypes (new entries only — others already exist above) ──
  sage: ["serif", "editorial", "literary", "classic", "readable", "refined"],
  everyman: ["sans-serif", "neutral", "readable", "clean", "friendly", "modern"],
  lover: ["script", "elegant", "serif", "flowing", "romantic", "feminine"],
  jester: ["rounded", "playful", "fun", "bold", "bubbly", "display"],
  caregiver: ["rounded", "warm", "friendly", "soft", "readable", "serif"],
  ruler: ["serif", "bold", "elegant", "display", "premium", "headline"],
  outlaw: ["grunge", "distressed", "edgy", "bold", "raw", "experimental"],

  // ── Western Zodiac ──
  aries: ["bold", "condensed", "display", "impactful", "headline", "fierce"],
  taurus: ["serif", "elegant", "traditional", "warm", "premium", "classic"],
  gemini: ["modern", "versatile", "sans-serif", "clean", "dynamic", "editorial"],
  cancer: ["rounded", "warm", "soft", "friendly", "serif", "readable"],
  leo: ["display", "bold", "elegant", "serif", "dramatic", "headline"],
  virgo: ["geometric", "clean", "minimal", "sans-serif", "precise", "modern"],
  libra: ["elegant", "serif", "modern", "refined", "clean", "editorial"],
  scorpio: ["serif", "bold", "dark", "display", "editorial", "dramatic"],
  sagittarius: ["bold", "display", "playful", "condensed", "fun", "dynamic"],
  capricorn: ["serif", "traditional", "bold", "professional", "headline", "classic"],
  aquarius: ["geometric", "experimental", "monospace", "modern", "minimal", "technical"],
  pisces: ["script", "flowing", "soft", "elegant", "handwritten", "organic"],

  // ── Chinese Zodiac (new entries — others already exist above) ──
  rat: ["modern", "clean", "sans-serif", "sleek", "minimal", "sharp"],
  ox: ["slab", "bold", "serif", "heavy", "strong", "traditional"],
  rabbit: ["serif", "elegant", "delicate", "light", "refined", "soft"],
  goat: ["script", "handwritten", "warm", "organic", "artistic", "soft"],
  rooster: ["sans-serif", "bold", "geometric", "clean", "modern", "professional"],
  dog: ["rounded", "friendly", "warm", "readable", "sans-serif", "approachable"],
  pig: ["rounded", "soft", "warm", "friendly", "readable", "casual"],
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

// Utility score (readability, practicality, anatomy-informed quality)
function scoreUtility(pair: FontPair, bf: Font): number {
  let s = 0;
  s += (pair.bodyLegibilityScore / 10) * 20;
  s += (pair.hierarchyStrength / 10) * 10;
  s += (pair.practicalityScore / 10) * 10;
  if (bf.bodyLegibilityScore && bf.bodyLegibilityScore >= 8) s += 8;
  if (pair.sourceConfidence === "high") s += 3;
  if (bf.variableFont) s += 3;
  if (bf.source === "fontshare") s += 3;

  // Anatomy-informed scoring (new dimensions from typography research)
  s += ((pair.roleFitness ?? 7) / 10) * 12;          // how well each font fits its role
  s += ((pair.xHeightHarmony ?? 7) / 10) * 10;       // visual cohesion through x-height alignment
  s += ((pair.personalityContrast ?? 6) / 10) * 8;   // complementary personality contrast

  // Body font anatomy bonuses
  if (bf.apertureOpenness === "open") s += 4;   // open apertures = better body legibility
  if (bf.xHeightRatio === "high") s += 3;       // tall x-height = better small-size reading
  if (bf.strokeContrast === "high") s -= 3;     // high contrast hurts body readability
  if (bf.letterSpacing === "generous") s += 2;  // generous spacing aids legibility

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

function bodyCloser(bf: Font, idx: number): string {
  const t0 = bf.toneDescriptors[0] || "clean";
  const t1 = bf.toneDescriptors[1] || "readable";
  const closers = [
    `${bf.name} keeps everything readable`,
    `${bf.name} grounds the layout with ${t0} composure`,
    `${bf.name} carries the longer passages`,
    `${bf.name} provides a ${t0} foundation`,
    `${bf.name} rounds out the system`,
    `${bf.name} handles the rest with ease`,
    `${bf.name} supports with ${t0} reliability`,
    `${bf.name} balances things out underneath`,
    `${bf.name} takes over where the headline ends`,
    `${bf.name} fills in with ${t0} comfort`,
    `${bf.name} does the quiet work of readability`,
    `${bf.name} steadies the page`,
    `${bf.name} picks up from there with ${t1} ease`,
    `${bf.name} holds everything together`,
    `${bf.name} gives the eye somewhere comfortable to land`,
    `${bf.name} lets the content breathe`,
    `${bf.name} makes the reading experience effortless`,
    `${bf.name} stays out of the way — in the best sense`,
    `${bf.name} settles into the background gracefully`,
    `${bf.name} brings ${t0} consistency to everything else`,
    `${bf.name} completes the pairing with understated clarity`,
    `${bf.name} is the workhorse of this combination`,
    `${bf.name} ensures nothing fights for attention`,
    `${bf.name} adds ${t0} structure without weight`,
    `${bf.name} provides the legibility this pair needs`,
    `${bf.name} supports without stealing the show`,
    `${bf.name} smooths out the reading experience`,
    `${bf.name} is a natural fit for the supporting role`,
    `${bf.name} makes long-form content feel approachable`,
    `${bf.name} follows through with ${t0} dependability`,
    `${bf.name} finishes what the headline starts`,
    `${bf.name} delivers where it matters most — in the reading`,
    `${bf.name} keeps the pace even and comfortable`,
    `${bf.name} creates a ${t0} runway for content`,
    `${bf.name} eases the transition from headline to paragraph`,
    `${bf.name} lends ${t1} support throughout`,
    `${bf.name} is right at home in the supporting role`,
    `${bf.name} sustains the tone with ${t0} forms`,
    `${bf.name} stays composed at every size`,
    `${bf.name} is built for the long stretches`,
    `${bf.name} carries the weight of the content`,
    `${bf.name} quietly does its job`,
    `${bf.name} fills the page with ${t0} confidence`,
    `${bf.name} extends the design language into paragraphs`,
    `${bf.name} makes everything after the headline feel intentional`,
    `${bf.name} lays a ${t0} track for the reader`,
    `${bf.name} bridges the gap between style and substance`,
    `${bf.name} takes care of the details`,
    `${bf.name} wraps the content in ${t0} legibility`,
    `${bf.name} is the steady hand in this pairing`,
  ];
  return closers[Math.abs(idx) % closers.length];
}

const ZODIAC_SIGNS = new Set(["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]);
const CHINESE_ZODIAC = new Set(["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"]);

interface PersonalityMatch { label: string; traits: string }

function detectPersonalityTypes(words: string[], query: string): PersonalityMatch[] {
  const found: PersonalityMatch[] = [];
  const lower = query.toLowerCase();

  // ── Zodiac sun/moon/rising placements ──
  // Detect patterns like "aries sun", "pisces moon", "libra rising/ascendant"
  const placements: { sign: string; placement: string }[] = [];
  const placementRegex = /(\w+)\s+(sun|moon|rising|ascendant)/gi;
  let pm;
  while ((pm = placementRegex.exec(lower)) !== null) {
    const sign = pm[1].toLowerCase();
    const placement = pm[2].toLowerCase() === "ascendant" ? "rising" : pm[2].toLowerCase();
    if (ZODIAC_SIGNS.has(sign)) {
      placements.push({ sign, placement });
    }
  }

  if (placements.length > 0) {
    // Build a combined description from all placements
    const parts: string[] = [];
    for (const { sign, placement } of placements) {
      const desc = PERSONALITY_DESCRIPTIONS[sign];
      if (!desc) continue;
      if (placement === "sun") parts.push(`${desc.label} sun's ${desc.traits} as core identity`);
      else if (placement === "moon") parts.push(`${desc.label} moon's ${desc.traits} as emotional undertone`);
      else if (placement === "rising") parts.push(`${desc.label} rising's ${desc.traits} as first impression`);
    }
    if (parts.length > 0) {
      const labels = placements.map(p => {
        const cap = p.sign.charAt(0).toUpperCase() + p.sign.slice(1);
        return `${cap} ${p.placement}`;
      });
      found.push({
        label: labels.join(", "),
        traits: parts.join(", blended with "),
      });
    }
  }

  // ── Standard personality type matching ──
  for (const word of words) {
    // Skip zodiac signs if already handled as placements
    if (placements.length > 0 && (ZODIAC_SIGNS.has(word) || ["sun","moon","rising","ascendant"].includes(word))) continue;
    if (PERSONALITY_DESCRIPTIONS[word] && !found.some(f => f.label === PERSONALITY_DESCRIPTIONS[word].label)) {
      found.push(PERSONALITY_DESCRIPTIONS[word]);
    }
  }

  // Check for "enneagram N" or "type N" patterns
  const enneagramMatch = lower.match(/(?:enneagram|type)\s*(\d)(?:w(\d))?/);
  if (enneagramMatch) {
    const wing = enneagramMatch[2] ? `${enneagramMatch[1]}w${enneagramMatch[2]}` : `enneagram-${enneagramMatch[1]}`;
    if (PERSONALITY_DESCRIPTIONS[wing] && !found.some(f => f.label === PERSONALITY_DESCRIPTIONS[wing].label)) {
      found.push(PERSONALITY_DESCRIPTIONS[wing]);
    }
  }

  // Check for "disc" prefix patterns (single or two-letter: "disc D", "disc DI", "disc-SC")
  const discMatch = lower.match(/disc[\s-]?([disc]{1,2})/i);
  if (discMatch) {
    const key = `disc-${discMatch[1].toLowerCase()}`;
    if (PERSONALITY_DESCRIPTIONS[key] && !found.some(f => f.label === PERSONALITY_DESCRIPTIONS[key].label)) {
      found.push(PERSONALITY_DESCRIPTIONS[key]);
    }
  }

  return found;
}

function generateFitReason(
  pair: FontPair, hf: Font, bf: Font, promptWords: string[], query: string
): string {
  if (promptWords.length === 0) return pair.shortExplanation;

  const promptPhrase = query.trim();
  const headerTrait = hf.distinctiveTraits[0] || hf.toneDescriptors[0] || "distinctive character";
  const headerTone = hf.toneDescriptors.slice(0, 2).join(" and ") || "expressive";

  // Detect personality types in the query
  const personalities = detectPersonalityTypes(promptWords, query);

  // Find which user words this pair connects to
  const tagSet = getAllPairTags(pair, hf, bf);
  const connections: string[] = [];
  for (const word of promptWords) {
    if (PERSONALITY_DESCRIPTIONS[word]) continue; // skip personality keywords from tag matching
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

  if (personalities.length > 0) {
    // Personality-aware description — combine all detected types
    if (personalities.length === 1) {
      const p = personalities[0];
      parts.push(`Echoing ${p.label}'s ${p.traits} — ${hf.name} brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
    } else {
      const combined = personalities.map(p => `${p.label}'s ${p.traits}`).join(" and ");
      parts.push(`Blending ${combined} — ${hf.name} brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
    }
    if (uniqueConns.length > 0) {
      parts.push(`reflecting the ${uniqueConns.join(", ")} qualities`);
    }
  } else {
    // Standard description
    const short = promptPhrase.length <= 45 ? promptPhrase : promptPhrase.split(/[,.\-—]/).filter(s => s.trim().length > 3)[0]?.trim() || promptPhrase.slice(0, 40);
    parts.push(`For "${short}" — ${hf.name} brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
    if (uniqueConns.length > 0) {
      parts.push(`captures the ${uniqueConns.join(", ")} feel`);
    }
  }

  const hash = (hf.id + bf.id).split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  parts.push(bodyCloser(bf, hash));

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
  for (const s of skipped) deduped.push(s);

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

      const personalities = detectPersonalityTypes(promptWords, query);
      const parts: string[] = [];
      if (personalities.length > 0) {
        if (personalities.length === 1) {
          const p = personalities[0];
          parts.push(`Echoing ${p.label}'s ${p.traits} — this pair uses ${hf.name}, which brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
        } else {
          const combined = personalities.map(p => `${p.label}'s ${p.traits}`).join(" and ");
          parts.push(`Blending ${combined} — this pair uses ${hf.name}, which brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
        }
      } else {
        parts.push(`For "${short}" — this pair uses ${hf.name}, which brings ${headerTone.toLowerCase()} energy with its ${headerTrait}`);
      }
      if (uniqueConns.length > 0) {
        parts.push(personalities.length > 0 ? `reflecting the ${uniqueConns.join(", ")} qualities` : `captures the ${uniqueConns.join(", ")} feel`);
      }
      const closerHash = (hf.id + bf.id).split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      parts.push(bodyCloser(bf, closerHash));
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
    .sort((a, b) => b!.relevanceScore - a!.relevanceScore || b!.overallScore - a!.overallScore)
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

  // Sort by quality first, with random variance within similar scores
  // so it doesn't look identical every time but best pairs surface first
  all.sort((a, b) => {
    const scoreDiff = b.overallScore - a.overallScore;
    if (Math.abs(scoreDiff) > 2) return scoreDiff;
    return Math.random() - 0.5; // randomize within ±2 score points
  });

  return all;
}

export function getPairsWithFont(fontId: string): ScoredPair[] {
  const results = fontPairs
    .filter((p) => p.headerFontId === fontId || p.bodyFontId === fontId)
    .map((p) => {
      const h = fontsById.get(p.headerFontId);
      const b = fontsById.get(p.bodyFontId);
      if (!h || !b) return null;
      return { ...p, relevanceScore: p.overallScore, promptFitReason: p.shortExplanation, headerFont: h, bodyFont: b } as ScoredPair;
    })
    .filter(Boolean) as ScoredPair[];
  results.sort((a, b) => b.overallScore - a.overallScore);
  return results;
}

// Shared project-type table. ONE source for two jobs:
//   1. the search ranks pairs against it (resume, tech resume, invitation ...)
//   2. the pair-description script reads each pair's assigned types from it
// Fit rules use only data every font has (class, body legibility, weight range, anatomy,
// mood, tag words), so a pair is never described as good for a project the search would hide it from.
// Bump PROJECT_TYPES_VERSION whenever a rule changes; descriptions store the version they were built from.

export const PROJECT_TYPES_VERSION = 1;

export type Kind = "serif" | "sans" | "slab" | "mono" | "display" | "script" | "hand";

export interface FontLite {
  id: string; cls: string; sub?: string | null; mood?: string | null;
  leg?: number | null; xh?: string; ap?: string; sc?: string; ls?: string;
  weights?: number[]; tags?: string[]; tone?: string[]; use?: string[];
}
export interface PairLite { id: string; leg: number; h: FontLite; b: FontLite }

export interface ProjectType {
  id: string;
  label: string;              // sentence case, shown to people
  group: "document" | "digital" | "brand" | "creative" | "event" | "fun";
  words: string[];            // what people type when they mean this
  /** Hard rules: a pair that fails any of these can never be assigned or ranked as this type. */
  h: Kind[];                  // allowed heading kinds
  b: Kind[];                  // allowed body kinds
  minBodyLeg?: number;        // body font legibility floor
  engineering?: boolean;      // heading must be engineering-precise (mono or workhorse sans)
  moodsNot?: string[];        // heading moods that rule it out
  /** Soft signals: words in either font's tags, tone or uses add to the score. */
  signals: string[];
  heading?: Kind[];           // preferred heading kinds (small bonus)
}

const KIND: Record<string, Kind> = {
  serif: "serif", "sans-serif": "sans", "slab-serif": "slab", monospace: "mono",
  display: "display", script: "script", handwritten: "hand",
};
export const kindOf = (f: FontLite): Kind => KIND[f.cls] ?? "sans";

export const wordsOf = (f: FontLite): Set<string> =>
  new Set([...(f.tags ?? []), ...(f.tone ?? []), ...(f.use ?? []), f.mood ?? ""].flatMap((s) => s.toLowerCase().split(/[\s/]+/)).filter(Boolean));

/** Engineering-precise: monospace, or a sans with a real weight range, open and even strokes, good legibility. */
export function isEngineering(f: FontLite): boolean {
  const k = kindOf(f);
  if (k === "mono") return (f.leg ?? 0) >= 7;
  if (k !== "sans") return false;
  return (f.weights?.length ?? 0) >= 5 && (f.leg ?? 0) >= 8 && f.ap === "open" && (f.sc === "none" || f.sc === "low") && f.mood !== "warm" && f.mood !== "playful";
}

/** Sci-fi sense of "tech": futuristic display faces, pixel faces, neon and cyber looks. */
export function isSciFi(f: FontLite): boolean {
  const w = wordsOf(f);
  return ["futuristic", "sci-fi", "cyberpunk", "pixel", "cyber", "neon", "retro-tech", "8-bit", "cosmic", "digital"].some((x) => w.has(x));
}

const NOVELTY: Kind[] = ["display", "script", "hand"];
const TEXT: Kind[] = ["serif", "sans", "slab"];
const ANY: Kind[] = ["serif", "sans", "slab", "mono", "display", "script", "hand"];

export const PROJECT_TYPES: ProjectType[] = [
  // ── Documents: restrained headings, readable body ──
  { id: "resume", label: "Resume or CV", group: "document", words: ["resume", "cv", "curriculum vitae", "cover letter", "job application", "career", "hiring"],
    h: TEXT, b: TEXT, minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["professional", "clean", "readable", "corporate", "neutral", "business-like", "refined"] },
  { id: "tech-resume", label: "Tech resume", group: "document", words: ["tech resume", "technical resume", "developer resume", "engineer resume", "software resume", "engineering cv", "programmer"],
    h: ["sans", "mono"], b: ["sans", "serif", "slab"], minBodyLeg: 8, engineering: true, moodsNot: ["playful", "experimental"], signals: ["technical", "precise", "clean", "systematic", "functional", "developer", "code"] },
  { id: "report", label: "Report or proposal", group: "document", words: ["report", "annual report", "white paper", "proposal", "case study", "business plan", "pitch document", "memo"],
    h: TEXT, b: TEXT, minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["authoritative", "professional", "dignified", "corporate", "executive", "classic", "structured"] },
  { id: "docs", label: "Documentation", group: "document", words: ["documentation", "docs", "developer docs", "readme", "knowledge base", "help center", "manual", "technical writing", "api docs"],
    h: ["sans", "mono", "serif", "slab"], b: ["sans", "mono", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["readable", "functional", "technical", "developer", "code", "clean", "precise"] },
  { id: "longform", label: "Long-form blog or essay", group: "document", words: ["blog", "essay", "long-form", "article", "newsletter", "substack", "writing", "personal blog", "reading"],
    h: ["serif", "sans", "slab", "display"], b: ["serif", "sans"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["literary", "bookish", "long-form", "editorial", "readable", "comfortable", "journalistic"] },
  { id: "editorial", label: "Magazine or editorial", group: "document", words: ["magazine", "editorial", "feature", "journal", "publication", "newspaper", "press", "cover story"],
    h: ["serif", "display", "sans"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["playful"], signals: ["editorial", "journalistic", "literary", "cover-story", "elegant", "refined", "feature-length", "high-contrast"], heading: ["serif", "display"] },
  { id: "book", label: "Book or publishing", group: "document", words: ["book", "book cover", "novel", "publishing", "author", "ebook", "poetry", "literary"],
    h: ["serif", "display", "script", "hand"], b: ["serif"], minBodyLeg: 7, signals: ["literary", "bookish", "classic", "scholarly", "page-turner", "timeless", "storied"] },
  { id: "academic", label: "Academic or research", group: "document", words: ["academic", "research", "thesis", "paper", "journal article", "university", "scholarly", "course", "syllabus"],
    h: ["serif", "sans", "slab"], b: ["serif", "sans"], minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["scholarly", "academic", "traditional", "dignified", "classic", "readable", "authoritative"] },

  // ── Digital product ──
  { id: "saas", label: "SaaS or startup site", group: "digital", words: ["saas", "startup", "software", "app", "product landing page", "platform", "tool", "b2b"],
    h: ["sans", "display", "mono"], b: ["sans"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["modern", "clean", "innovative", "contemporary", "progressive", "streamlined", "ui"], heading: ["sans"] },
  { id: "dashboard", label: "Dashboard or app interface", group: "digital", words: ["dashboard", "app interface", "ui", "admin", "analytics", "data", "interface", "web app", "product design"],
    h: ["sans", "mono"], b: ["sans", "mono"], minBodyLeg: 9, engineering: true, moodsNot: ["playful", "experimental"], signals: ["functional", "readable", "precise", "ui", "systematic", "neutral", "screen-friendly"] },
  { id: "devtool", label: "Developer tool or terminal", group: "digital", words: ["developer tool", "cli", "terminal", "code editor", "open source", "hackathon", "api", "devops", "code"],
    h: ["mono", "sans", "display"], b: ["mono", "sans"], minBodyLeg: 7, signals: ["code", "developer", "technical", "monospace", "terminal", "digital", "systematic"], heading: ["mono"] },
  { id: "fintech", label: "Finance or fintech", group: "digital", words: ["finance", "fintech", "bank", "banking", "investing", "insurance", "crypto", "trading", "accounting"],
    h: ["sans", "serif", "slab", "mono"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["trustworthy", "professional", "corporate", "authoritative", "precise", "dignified", "business-like"] },
  { id: "ai", label: "AI or deep tech", group: "digital", words: ["ai", "artificial intelligence", "machine learning", "robotics", "deep tech", "research lab", "futuristic app"],
    h: ["sans", "display", "mono"], b: ["sans", "mono"], minBodyLeg: 7, signals: ["futuristic", "innovative", "cutting-edge", "geometric", "minimal", "technical", "precise"] },
  { id: "ecommerce", label: "Online shop", group: "digital", words: ["shop", "store", "ecommerce", "online store", "product page", "retail", "marketplace"],
    h: ["sans", "serif", "display", "slab"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["approachable", "friendly", "clean", "inviting", "contemporary", "versatile"] },

  // ── Brand identities ──
  { id: "corporate", label: "Corporate or consulting", group: "brand", words: ["corporate", "consulting", "law firm", "legal", "professional services", "enterprise", "business", "executive", "agency"],
    h: TEXT, b: TEXT, minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["corporate", "executive", "boardroom", "business-like", "authoritative", "dignified", "professional", "trustworthy"] },
  { id: "health", label: "Health or wellness", group: "brand", words: ["health", "wellness", "clinic", "medical", "therapy", "mindfulness", "yoga", "spa", "care", "healthcare"],
    h: ["sans", "serif", "hand", "display"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["warm", "gentle", "approachable", "welcoming", "friendly", "soft", "calm", "organic", "inviting"] },
  { id: "nonprofit", label: "Nonprofit or community", group: "brand", words: ["nonprofit", "charity", "community", "foundation", "volunteer", "campaign", "cause", "civic"],
    h: ["sans", "serif", "slab", "hand", "display"], b: ["sans", "serif"], minBodyLeg: 8, signals: ["heartfelt", "welcoming", "warm-hearted", "inviting", "personal", "approachable", "friendly"] },
  { id: "education", label: "Education or kids", group: "brand", words: ["education", "school", "kids", "children", "learning", "classroom", "tutoring", "preschool", "children's book"],
    h: ["sans", "display", "hand", "serif"], b: ["sans", "serif"], minBodyLeg: 8, signals: ["playful", "friendly", "fun", "cheerful", "bubbly", "welcoming", "casual", "approachable"], heading: ["hand", "display"] },
  { id: "luxury", label: "Luxury or fashion", group: "brand", words: ["luxury", "fashion", "boutique", "jewelry", "high-end", "couture", "premium", "beauty", "cosmetics", "perfume"],
    h: ["serif", "display", "script", "sans"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["playful"], signals: ["elegant", "refined", "luxurious", "sophisticated", "graceful", "glamorous", "high-contrast", "stately"], heading: ["serif", "display", "script"] },
  { id: "realestate", label: "Architecture or real estate", group: "brand", words: ["architecture", "real estate", "interior design", "property", "construction", "home", "studio"],
    h: ["sans", "serif", "display"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["minimal", "modern", "clean", "refined", "geometric", "understated", "structured"] },
  { id: "food", label: "Restaurant or cafe", group: "brand", words: ["restaurant", "cafe", "coffee", "bakery", "menu", "food", "bar", "catering", "kitchen"],
    h: ["serif", "display", "hand", "script", "slab", "sans"], b: ["sans", "serif"], minBodyLeg: 7, signals: ["warm", "cozy", "rustic", "inviting", "vintage", "casual", "menus", "restaurants", "food"], heading: ["hand", "serif", "display"] },
  { id: "craft", label: "Craft shop or handmade", group: "brand", words: ["craft", "handmade", "etsy", "artisan", "pottery", "candles", "small shop", "maker", "local shop"],
    h: ["hand", "script", "serif", "display"], b: ["sans", "serif"], minBodyLeg: 7, signals: ["handwritten", "personal", "warm", "authentic", "cozy", "organic", "rustic", "imperfect"], heading: ["hand", "script"] },
  { id: "outdoors", label: "Outdoors or heritage brand", group: "brand", words: ["outdoors", "camping", "brewery", "craft beer", "barber", "workwear", "western", "heritage brand", "whiskey", "workshop"],
    h: ["slab", "display", "serif", "sans"], b: ["sans", "serif", "slab"], minBodyLeg: 7, signals: ["rugged", "vintage", "heritage", "sturdy", "frontier", "industrial", "old-world", "rustic", "heavy"], heading: ["slab", "display"] },

  // ── Creative work ──
  { id: "portfolio", label: "Portfolio", group: "creative", words: ["portfolio", "designer portfolio", "personal site", "creative portfolio", "freelance", "showcase", "photographer", "case studies"],
    h: ["sans", "serif", "display", "mono"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful"], signals: ["modern", "contemporary", "distinctive", "minimal", "clean", "refined", "neutral", "creative"] },
  { id: "photography", label: "Photography or gallery", group: "creative", words: ["photography", "gallery", "art gallery", "museum", "exhibition", "artist", "fine art", "film photography"],
    h: ["sans", "serif", "display", "script"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful"], signals: ["minimal", "understated", "elegant", "refined", "graceful", "gallery", "artistic"] },
  { id: "logo", label: "Logo or wordmark", group: "creative", words: ["logo", "wordmark", "brand mark", "identity", "branding", "logotype", "monogram", "badge"],
    h: ["display", "sans", "serif", "script", "hand", "slab"], b: ANY, signals: ["distinctive", "statement-making", "branding", "bold", "headline-ready", "striking", "branding"], heading: ["display", "script"] },
  { id: "poster", label: "Poster or flyer", group: "creative", words: ["poster", "flyer", "print poster", "show poster", "announcement", "banner", "signage", "billboard"],
    h: ["display", "slab", "sans", "hand"], b: ["sans", "serif", "slab"], minBodyLeg: 6, signals: ["eye-catching", "attention-grabbing", "show-stopping", "headline-ready", "posters", "poster", "punchy", "larger-than-life"], heading: ["display"] },
  { id: "social", label: "Social media post", group: "creative", words: ["social media", "instagram", "carousel", "story", "tiktok", "youtube thumbnail", "post", "reels", "linkedin post"],
    h: ["display", "sans", "hand", "script", "slab"], b: ["sans", "serif"], minBodyLeg: 7, signals: ["eye-catching", "punchy", "casual", "fun", "expressive", "social", "bold", "trendy"], heading: ["display", "hand"] },
  { id: "film", label: "Film or title design", group: "creative", words: ["film", "movie", "movie poster", "title design", "trailer", "documentary", "streaming", "podcast cover", "series"],
    h: ["display", "serif", "sans", "slab"], b: ["sans", "serif"], minBodyLeg: 6, signals: ["theatrical", "dramatic", "commanding", "cinematic", "action movie", "dark poster", "intense", "show-stopping"], heading: ["display"] },

  // ── Events and moments ──
  { id: "wedding", label: "Wedding or invitation", group: "event", words: ["wedding", "invitation", "save the date", "rsvp", "bridal", "engagement", "formal invitation", "greeting card", "baby shower"],
    h: ["script", "serif", "hand", "display"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["bold"], signals: ["romantic", "graceful", "elegant", "calligraphic", "flowing", "flourished", "lyrical", "invitations", "weddings"], heading: ["script", "serif"] },
  { id: "music", label: "Music or festival", group: "event", words: ["music", "festival", "concert", "band", "dj", "album cover", "club night", "tour", "record label"],
    h: ["display", "hand", "slab", "sans"], b: ["sans", "serif", "mono"], minBodyLeg: 6, signals: ["music", "loud", "expressive", "unapologetic", "edgy", "punk", "street art", "underground event", "energetic"], heading: ["display", "hand"] },
  { id: "sports", label: "Sports or fitness", group: "event", words: ["sports", "fitness", "gym", "team", "athletic", "running", "club", "league", "training"],
    h: ["display", "sans", "slab"], b: ["sans"], minBodyLeg: 7, signals: ["bold", "dynamic", "energetic", "powerful", "assertive", "decisive", "hard-hitting", "sporty", "sports"], heading: ["display"] },
  { id: "conference", label: "Conference or meetup", group: "event", words: ["conference", "meetup", "summit", "workshop", "webinar", "event page", "hackathon", "talk", "agenda"],
    h: ["sans", "display", "serif", "mono"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful"], signals: ["modern", "professional", "contemporary", "commanding", "clean", "events", "approachable"] },

  // ── Fun and themed ──
  { id: "gaming", label: "Gaming or sci-fi", group: "fun", words: ["gaming", "game", "esports", "sci-fi", "pixel art", "retro game", "cyberpunk", "futuristic", "space", "arcade", "8-bit"],
    h: ["display", "mono", "sans"], b: ["sans", "mono"], minBodyLeg: 5, signals: ["futuristic", "sci-fi", "pixel", "cyberpunk", "gaming", "neon", "cosmic", "retro-tech", "game"], heading: ["display"] },
  { id: "retro", label: "Retro or vintage", group: "fun", words: ["retro", "vintage", "nostalgic", "70s", "art deco", "diner", "old school", "classic americana", "throwback"],
    h: ["display", "script", "slab", "serif", "hand"], b: ["sans", "serif", "slab"], minBodyLeg: 6, signals: ["retro", "vintage", "nostalgic", "art", "deco", "heritage", "old-world", "retro poster", "vintage branding"], heading: ["display", "script"] },
  { id: "spooky", label: "Spooky or gothic", group: "fun", words: ["halloween", "horror", "gothic", "spooky", "dark", "metal", "occult", "medieval", "fantasy", "dark academia"],
    h: ["display", "script", "serif"], b: ["serif", "sans"], minBodyLeg: 6, signals: ["gothic", "horror", "dark", "medieval", "halloween", "fantasy", "mysterious", "metal", "dark academia"], heading: ["display"] },
  { id: "playful", label: "Playful or party", group: "fun", words: ["party", "birthday", "fun", "playful", "whimsical", "kids party", "celebration", "cute", "quirky", "cartoon", "comic"],
    h: ["display", "hand", "script", "sans"], b: ["sans", "serif"], minBodyLeg: 6, signals: ["playful", "fun", "whimsical", "cheerful", "bubbly", "cute", "quirky", "comic", "groovy"], heading: ["display", "hand"] },
  { id: "travel", label: "Travel or personal journal", group: "fun", words: ["travel", "journal", "diary", "trip", "scrapbook", "personal blog", "memoir", "notes", "adventure"],
    h: ["hand", "script", "serif", "display"], b: ["serif", "sans"], minBodyLeg: 7, signals: ["handwritten", "personal", "casual", "adventurous", "journals", "authentic", "spontaneous", "jotted", "notes"], heading: ["hand", "script"] },
];

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };

/** How much a signal word tells us. Words on a large share of fonts are class-wide filler and count for nothing. */
export type WordWeight = (w: string) => number;
export function buildWordWeight(pairs: PairLite[]): WordWeight {
  const fonts = new Map<string, FontLite>();
  for (const p of pairs) { fonts.set(p.h.id, p.h); fonts.set(p.b.id, p.b); }
  const df = new Map<string, number>();
  for (const f of fonts.values()) for (const w of wordsOf(f)) df.set(w, (df.get(w) ?? 0) + 1);
  const F = fonts.size, cut = F * 0.14;
  return (w) => { const d = df.get(w) ?? 0; if (d === 0 || d >= cut) return 0; return (3 * Math.log2(F / d)) / Math.log2(F); };
}

/** Hard rules first. Returns the evidence score when the pair is eligible, otherwise null.
 *  Brand, creative, event and fun types also need at least one real signal word, not only a matching font class. */
export function fitScore(t: ProjectType, pair: PairLite, weight: WordWeight = () => 1): number | null {
  const hk = kindOf(pair.h), bk = kindOf(pair.b);
  if (!t.h.includes(hk) || !t.b.includes(bk)) return null;
  if (t.minBodyLeg && (pair.b.leg ?? 0) < t.minBodyLeg) return null;
  if (t.moodsNot && pair.h.mood && t.moodsNot.includes(pair.h.mood)) return null;
  if (t.engineering && !isEngineering(pair.h)) return null;
  if (t.id === "gaming" && !(isSciFi(pair.h) || hk === "mono")) return null;
  if (t.id === "tech-resume" && isSciFi(pair.h)) return null;
  if (t.id === "ai" && !(isSciFi(pair.h) || isEngineering(pair.h))) return null;
  const hw = wordsOf(pair.h), bw = wordsOf(pair.b);
  let sig = 0;
  for (const w of t.signals) { const x = weight(w); if (hw.has(w)) sig += 2 * x; if (bw.has(w)) sig += x; }
  const kindFit = !!t.heading?.includes(hk);
  // A type whose signal words are all class-wide filler is decided by its font-class rules alone.
  const usable = t.signals.some((w) => weight(w) > 0);
  const needsEvidence = usable && t.group !== "document" && t.group !== "digital";
  if (needsEvidence && sig < 2 && !kindFit) return null;
  let s = sig;
  if (kindFit) s += 2;
  s += Math.max(0, pair.leg - 6) * 0.25;
  return s;
}

const hashKey = (pairId: string, typeId: string) => hash(pairId + "|" + typeId);

/** Assigns every pair its best project types. Rarer types get a boost so specific fits beat generic ones, and
 *  near-equal scores break by a stable hash so same-class pairs spread out. Same input always gives the same output. */
export function assignAll(pairs: PairLite[], n = 2): Record<string, { id: string; score: number }[]> {
  const eligible: Record<string, number> = {};
  const weight = buildWordWeight(pairs);
  const cache = new Map<string, Map<string, number>>();
  for (const p of pairs) {
    const m = new Map<string, number>();
    for (const t of PROJECT_TYPES) { const s = fitScore(t, p, weight); if (s !== null) { m.set(t.id, s); eligible[t.id] = (eligible[t.id] ?? 0) + 1; } }
    cache.set(p.id, m);
  }
  const N = pairs.length, out: Record<string, { id: string; score: number }[]> = {};
  for (const p of pairs) {
    const rows = [...cache.get(p.id)!].map(([id, score]) => ({ id, score, key: score + 1.2 * Math.log2(N / eligible[id]) + hashKey(p.id, id) * 3 }));
    out[p.id] = rows.sort((a, b) => b.key - a.key).slice(0, n).map(({ id, score }) => ({ id, score }));
  }
  return out;
}

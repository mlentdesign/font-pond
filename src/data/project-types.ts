// Shared project-type table. ONE source for two jobs:
//   1. the search ranks pairs against it (resume, tech resume, invitation ...)
//   2. the pair-description script reads each pair's assigned types from it
// Fit rules use only data every font has (class, body legibility, weight range, anatomy,
// mood, tag words), so a pair is never described as good for a project the search would hide it from.
// Bump PROJECT_TYPES_VERSION whenever a rule changes; descriptions store the version they were built from.

export const PROJECT_TYPES_VERSION = 2;

export type Kind = "serif" | "sans" | "slab" | "mono" | "display" | "script" | "hand";

export interface FontLite {
  id: string; cls: string; sub?: string | null; mood?: string | null;
  leg?: number | null; xh?: string; ap?: string; sc?: string; ls?: string;
  weights?: number[]; tags?: string[]; tone?: string[]; use?: string[];
}
export interface PairLite { id: string; leg: number; h: FontLite; b: FontLite }

export type FamilyId = "professional-docs" | "reading" | "product" | "services" | "showcase" | "loud" | "occasions" | "themed" | "everyday";

/** A family is a kind of job a pair does. It carries the default fit rules. Each project belongs to one family and
 *  only states what differs. A project may also name a `parent` project it narrows (tech resume narrows resume). */
export interface Family {
  id: FamilyId; label: string;
  h: Kind[]; b: Kind[]; minBodyLeg: number; moodsNot?: string[];
}
export const FAMILIES: Family[] = [
  { id: "professional-docs", label: "Professional documents", h: ["serif", "sans", "slab"], b: ["serif", "sans", "slab"], minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"] },
  { id: "reading", label: "Reading and publishing", h: ["serif", "sans", "slab", "display"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["experimental"] },
  { id: "product", label: "Digital products", h: ["sans", "mono", "display"], b: ["sans", "mono"], minBodyLeg: 8, moodsNot: ["playful", "experimental"] },
  { id: "services", label: "Businesses and services", h: ["sans", "serif", "slab", "hand", "display"], b: ["sans", "serif"], minBodyLeg: 7 },
  { id: "showcase", label: "Showcase and identity", h: ["sans", "serif", "display", "script", "mono"], b: ["sans", "serif"], minBodyLeg: 7 },
  { id: "loud", label: "Loud print and screen", h: ["display", "slab", "sans", "hand"], b: ["sans", "serif", "slab"], minBodyLeg: 6 },
  { id: "occasions", label: "Occasions and personal", h: ["script", "serif", "hand", "display"], b: ["serif", "sans"], minBodyLeg: 7 },
  { id: "everyday", label: "Everyday and general", h: ["serif", "sans", "slab", "mono", "display", "script", "hand"], b: ["serif", "sans", "slab"], minBodyLeg: 7 },
  { id: "themed", label: "Themed and playful", h: ["display", "mono", "script", "serif", "hand", "slab", "sans"], b: ["sans", "serif", "mono", "slab"], minBodyLeg: 5 },
];

export interface ProjectType {
  id: string;
  family: FamilyId;
  parent?: string;            // a narrower kind of another project (tech resume -> resume)
  label: string;              // sentence case, shown to people
  group: "document" | "digital" | "brand" | "creative" | "event" | "fun";
  words: string[];            // what people type when they mean this
  /** Hard rules: a pair that fails any of these can never be assigned or ranked as this type. */
  h: Kind[];                  // allowed heading kinds
  b: Kind[];                  // allowed body kinds
  minBodyLeg?: number;        // body font legibility floor
  engineering?: boolean;      // heading must be engineering-precise (mono or workhorse sans)
  moodsNot?: string[];        // heading moods that rule it out
  loose?: boolean;            // decided by font-class rules alone; no signal-word evidence required
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
  // ── professional-docs ──
  { id: "resume", family: "professional-docs", label: "Resume or CV", group: "document", words: ["resume", "cv", "curriculum vitae", "cover letter", "job application", "career", "hiring"],
    h: TEXT, b: TEXT, minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["professional", "clean", "readable", "corporate", "neutral", "business-like", "refined"] },
  { id: "tech-resume", family: "professional-docs", parent: "resume", label: "Tech resume", group: "document", words: ["tech resume", "technical resume", "developer resume", "engineer resume", "software resume", "engineering cv", "programmer"],
    h: ["sans", "mono"], b: ["sans", "serif", "slab"], minBodyLeg: 8, engineering: true, moodsNot: ["playful", "experimental"], signals: ["technical", "precise", "clean", "systematic", "functional", "developer", "code"] },
  { id: "report", family: "professional-docs", label: "Report or proposal", group: "document", words: ["report", "annual report", "white paper", "proposal", "case study", "business plan", "pitch document", "memo"],
    h: TEXT, b: TEXT, minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["authoritative", "professional", "dignified", "corporate", "executive", "classic", "structured"] },
  { id: "academic", family: "professional-docs", label: "Academic or research", group: "document", words: ["academic", "research", "thesis", "paper", "journal article", "university", "scholarly", "course", "syllabus"],
    h: ["serif", "sans", "slab"], b: ["serif", "sans"], minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["scholarly", "academic", "traditional", "dignified", "classic", "readable", "authoritative"] },
  { id: "corporate", family: "professional-docs", label: "Corporate or consulting", loose: true, group: "brand", words: ["corporate", "consulting", "law firm", "professional services", "enterprise", "business", "executive", "agency"],
    h: TEXT, b: TEXT, minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["corporate", "executive", "boardroom", "business-like", "authoritative", "dignified", "professional", "trustworthy"] },
  { id: "fintech", family: "professional-docs", label: "Finance or fintech", group: "digital", words: ["finance", "fintech", "bank", "banking", "investing", "insurance", "crypto", "trading", "accounting"],
    h: ["sans", "serif", "slab", "mono"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["trustworthy", "professional", "corporate", "authoritative", "precise", "dignified", "business-like"] },
  { id: "presentation", family: "professional-docs", label: "Presentation or pitch deck", group: "digital", words: ["presentation", "pitch deck", "slides", "keynote", "powerpoint", "investor deck", "slide deck", "google slides"],
    h: ["sans", "serif", "slab", "display"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["modern", "professional", "clean", "commanding", "confident", "contemporary", "headline-ready"], heading: ["sans", "display"] },
  { id: "forms", family: "professional-docs", label: "Forms, contracts or official notices", group: "document", words: ["form", "contract", "legal", "legal document", "invoice", "government", "official", "notice", "terms", "policy", "letter", "paperwork"],
    h: ["serif", "sans", "slab"], b: ["serif", "sans", "slab"], minBodyLeg: 9, moodsNot: ["playful", "experimental", "bold"], signals: ["traditional", "authoritative", "dignified", "readable", "neutral", "classic", "formal", "legal"] },
  { id: "stationery", family: "professional-docs", label: "Business card, letterhead or certificate", group: "document", words: ["business card", "letterhead", "stationery", "certificate", "diploma", "thank you card", "award", "name tag"],
    h: ["serif", "sans", "slab", "script"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["playful", "experimental"], signals: ["elegant", "refined", "classic", "formal", "professional", "graceful", "dignified"], heading: ["serif", "script"] },
  // ── reading ──
  { id: "articles", family: "reading", label: "Blog, article or magazine", group: "document", words: ["blog", "essay", "long-form", "article", "newsletter", "substack", "magazine", "editorial", "feature", "newspaper", "press", "publication", "cover story", "personal blog", "reading"],
    h: ["serif", "sans", "slab", "display"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["experimental"], signals: ["literary", "bookish", "long-form", "editorial", "readable", "comfortable", "journalistic", "cover-story", "elegant", "refined", "feature-length", "high-contrast"], heading: ["serif", "display"] },
  { id: "book", family: "reading", label: "Book or publishing", group: "document", words: ["book", "book cover", "novel", "publishing", "author", "ebook", "poetry", "literary"],
    h: ["serif", "display", "script", "hand"], b: ["serif"], minBodyLeg: 7, signals: ["literary", "bookish", "classic", "scholarly", "page-turner", "timeless", "storied"] },
  // ── product ──
  { id: "software", family: "product", label: "Software, startup or AI product", group: "digital", words: ["saas", "startup", "software", "app", "product landing page", "platform", "tool", "b2b", "ai", "artificial intelligence", "machine learning", "robotics", "deep tech", "research lab"],
    h: ["sans", "display", "mono"], b: ["sans", "mono"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["modern", "clean", "innovative", "contemporary", "progressive", "streamlined", "ui", "futuristic", "cutting-edge", "geometric", "minimal", "technical", "precise"], heading: ["sans"] },
  { id: "dashboard", family: "product", label: "Dashboard or app interface", group: "digital", words: ["dashboard", "app interface", "ui", "admin", "analytics", "data", "interface", "web app", "product design"],
    h: ["sans", "mono"], b: ["sans", "mono"], minBodyLeg: 8, engineering: true, moodsNot: ["playful", "experimental"], signals: ["functional", "readable", "precise", "ui", "systematic", "neutral", "screen-friendly"] },
  { id: "devtool", family: "product", label: "Developer tool or terminal", group: "digital", words: ["developer tool", "cli", "terminal", "code editor", "open source", "hackathon", "api", "devops", "code"],
    h: ["mono", "sans", "display"], b: ["mono", "sans"], minBodyLeg: 7, signals: ["code", "developer", "technical", "monospace", "terminal", "digital", "systematic"], heading: ["mono"] },
  { id: "docs", family: "product", label: "Documentation", group: "document", words: ["documentation", "docs", "developer docs", "readme", "knowledge base", "help center", "manual", "technical writing", "api docs"],
    h: ["sans", "mono", "serif", "slab"], b: ["sans", "mono", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental", "bold"], signals: ["readable", "functional", "technical", "developer", "code", "clean", "precise"] },
  { id: "ecommerce", family: "product", label: "Online shop", group: "digital", words: ["shop", "store", "ecommerce", "online store", "product page", "retail", "marketplace"],
    h: ["sans", "serif", "display", "slab"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["approachable", "friendly", "clean", "inviting", "contemporary", "versatile"] },
  { id: "conference", family: "product", label: "Conference or meetup", loose: true, group: "event", words: ["conference", "meetup", "summit", "workshop", "webinar", "event page", "hackathon", "talk", "agenda"],
    h: ["sans", "display", "serif", "mono"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful"], signals: ["modern", "professional", "contemporary", "commanding", "clean", "events", "approachable"] },
  // ── services ──
  { id: "health", family: "services", label: "Health or wellness", loose: true, group: "brand", words: ["health", "wellness", "clinic", "medical", "therapy", "mindfulness", "yoga", "spa", "care", "healthcare"],
    h: ["sans", "serif", "hand", "display"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["warm", "gentle", "approachable", "welcoming", "friendly", "soft", "calm", "organic", "inviting"] },
  { id: "nonprofit", family: "services", label: "Nonprofit or community", group: "brand", words: ["nonprofit", "charity", "community", "foundation", "volunteer", "campaign", "cause", "civic"],
    h: ["sans", "serif", "slab", "hand", "display"], b: ["sans", "serif"], minBodyLeg: 8, signals: ["heartfelt", "welcoming", "warm-hearted", "inviting", "personal", "approachable", "friendly"] },
  { id: "education", family: "services", label: "Education or school", group: "brand", words: ["education", "school", "learning", "classroom", "tutoring", "e-learning", "online course", "lesson", "curriculum", "college"],
    h: ["sans", "serif", "slab", "display", "hand"], b: ["sans", "serif"], minBodyLeg: 8, signals: ["friendly", "approachable", "readable", "welcoming", "clear", "encouraging", "cheerful", "casual"], heading: ["sans", "serif"] },
  { id: "realestate", family: "services", label: "Architecture or real estate", group: "brand", words: ["architecture", "real estate", "interior design", "property", "construction", "home", "studio"],
    h: ["sans", "serif", "display"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["minimal", "modern", "clean", "refined", "geometric", "understated", "structured"] },
  { id: "food", family: "services", label: "Restaurant or cafe", group: "brand", words: ["restaurant", "cafe", "coffee", "bakery", "menu", "food", "bar", "catering", "kitchen"],
    h: ["serif", "display", "hand", "script", "slab", "sans"], b: ["sans", "serif"], minBodyLeg: 7, signals: ["warm", "cozy", "rustic", "inviting", "vintage", "casual", "menus", "restaurants", "food"], heading: ["hand", "serif", "display"] },
  { id: "craft", family: "services", label: "Craft shop or handmade", group: "brand", words: ["craft", "handmade", "etsy", "artisan", "pottery", "candles", "small shop", "maker", "local shop"],
    h: ["hand", "script", "serif", "display"], b: ["sans", "serif"], minBodyLeg: 7, signals: ["handwritten", "personal", "warm", "authentic", "cozy", "organic", "rustic", "imperfect"], heading: ["hand", "script"] },
  { id: "outdoors", family: "services", label: "Outdoors or heritage brand", group: "brand", words: ["outdoors", "camping", "brewery", "craft beer", "barber", "workwear", "western", "heritage brand", "whiskey", "workshop"],
    h: ["slab", "display", "serif", "sans"], b: ["sans", "serif", "slab"], minBodyLeg: 7, signals: ["rugged", "vintage", "heritage", "sturdy", "frontier", "industrial", "old-world", "rustic", "heavy"], heading: ["slab", "display"] },
  { id: "industrial", family: "services", label: "Trades, industrial or automotive", loose: true, group: "brand", words: ["trades", "contractor", "plumber", "electrician", "auto repair", "mechanic", "logistics", "trucking", "manufacturing", "hardware", "industrial", "roofing", "landscaping", "cleaning service", "handyman"],
    h: ["slab", "sans", "display"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful", "experimental"], signals: ["sturdy", "industrial", "rugged", "heavy", "strong", "dependable", "trustworthy", "assertive", "utilitarian"], heading: ["slab", "sans"] },
  { id: "hospitality", family: "services", label: "Hotel, travel or hospitality brand", group: "brand", words: ["hotel", "resort", "tourism", "travel agency", "airbnb", "vacation rental", "bed and breakfast", "hospitality", "tour", "getaway", "lodge", "destination", "boutique hotel", "travel brand", "travel"],
    h: ["serif", "sans", "script", "display"], b: ["sans", "serif"], minBodyLeg: 7, moodsNot: ["experimental"], signals: ["elegant", "warm", "inviting", "welcoming", "refined", "relaxed", "graceful", "sophisticated", "adventurous"], heading: ["serif", "script"] },
  { id: "faith", family: "services", label: "Faith or spiritual community", loose: true, group: "brand", words: ["church", "faith", "spiritual", "religious", "ministry", "meditation", "temple", "mosque", "synagogue", "prayer", "devotional", "retreat", "sermon"],
    h: ["serif", "sans", "script", "display"], b: ["serif", "sans"], minBodyLeg: 8, moodsNot: ["experimental"], signals: ["warm", "gentle", "reverent", "dignified", "graceful", "classic", "traditional", "calm", "welcoming", "timeless"], heading: ["serif", "script"] },
  // ── showcase ──
  { id: "portfolio", family: "showcase", label: "Portfolio", loose: true, group: "creative", words: ["portfolio", "designer portfolio", "personal site", "creative portfolio", "freelance", "showcase", "photographer", "case studies"],
    h: ["sans", "serif", "display", "mono"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful"], signals: ["modern", "contemporary", "distinctive", "minimal", "clean", "refined", "neutral", "creative"] },
  { id: "gallery", family: "showcase", label: "Photography, gallery or art", group: "creative", words: ["photography", "gallery", "art gallery", "museum", "exhibition", "exhibit", "artist", "fine art", "film photography", "art show"],
    h: ["sans", "serif", "display", "script"], b: ["sans", "serif"], minBodyLeg: 8, moodsNot: ["playful"], signals: ["minimal", "understated", "elegant", "refined", "graceful", "gallery", "artistic"] },
  { id: "logo", family: "showcase", label: "Logo or wordmark", group: "creative", words: ["logo", "wordmark", "brand mark", "identity", "branding", "logotype", "monogram", "badge"],
    h: ["display", "sans", "serif", "script", "hand", "slab"], b: ANY, signals: ["distinctive", "statement-making", "branding", "bold", "headline-ready", "striking", "branding"], heading: ["display", "script"] },
  { id: "luxury", family: "showcase", label: "Luxury or fashion", group: "brand", words: ["luxury", "fashion", "boutique", "jewelry", "high-end", "couture", "premium", "beauty", "cosmetics", "perfume"],
    h: ["serif", "display", "script", "sans"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["playful"], signals: ["elegant", "refined", "luxurious", "sophisticated", "graceful", "glamorous", "high-contrast", "stately"], heading: ["serif", "display", "script"] },
  { id: "packaging", family: "showcase", label: "Packaging or product label", group: "creative", words: ["packaging", "label", "product label", "bottle", "box", "wrapper", "tag", "soap", "skincare", "jar", "can design"],
    h: ["display", "serif", "sans", "script", "hand", "slab"], b: ["sans", "serif"], minBodyLeg: 6, signals: ["distinctive", "bold", "elegant", "artisan", "vintage", "handcrafted", "premium", "branding", "organic", "craft"], heading: ["display", "serif"] },
  // ── loud ──
  { id: "poster", family: "loud", label: "Poster or flyer", group: "creative", words: ["poster", "flyer", "print poster", "show poster", "announcement", "event poster", "gig poster"],
    h: ["display", "slab", "sans", "hand"], b: ["sans", "serif", "slab"], minBodyLeg: 6, signals: ["eye-catching", "attention-grabbing", "show-stopping", "headline-ready", "posters", "poster", "punchy", "larger-than-life"], heading: ["display"] },
  { id: "social", family: "loud", label: "Social media post", group: "creative", words: ["social media", "instagram", "carousel", "story", "tiktok", "youtube thumbnail", "post", "reels", "linkedin post"],
    h: ["display", "sans", "hand", "script", "slab"], b: ["sans", "serif"], minBodyLeg: 7, signals: ["eye-catching", "punchy", "casual", "fun", "expressive", "social", "bold", "trendy"], heading: ["display", "hand"] },
  { id: "film", family: "loud", label: "Film or title design", group: "creative", words: ["film", "movie", "movie poster", "title design", "trailer", "documentary", "streaming", "podcast", "podcast cover", "series", "video", "youtube video"],
    h: ["display", "serif", "sans", "slab"], b: ["sans", "serif"], minBodyLeg: 6, signals: ["theatrical", "dramatic", "commanding", "cinematic", "action movie", "dark poster", "intense", "show-stopping"], heading: ["display"] },
  { id: "music", family: "loud", label: "Music or festival", group: "event", words: ["music", "festival", "concert", "band", "dj", "album cover", "club night", "tour", "record label"],
    h: ["display", "hand", "slab", "sans"], b: ["sans", "serif", "mono"], minBodyLeg: 6, signals: ["music", "loud", "expressive", "unapologetic", "edgy", "punk", "street art", "underground event", "energetic"], heading: ["display", "hand"] },
  { id: "sports", family: "loud", label: "Sports or fitness", group: "event", words: ["sports", "fitness", "gym", "team", "athletic", "running", "club", "league", "training"],
    h: ["display", "sans", "slab"], b: ["sans"], minBodyLeg: 7, signals: ["bold", "dynamic", "energetic", "powerful", "assertive", "decisive", "hard-hitting", "sporty", "sports"], heading: ["display"] },
  { id: "signage", family: "loud", label: "Signage or wayfinding", loose: true, group: "creative", words: ["sign", "signage", "wayfinding", "storefront sign", "banner", "billboard", "shop sign", "menu board", "a-frame", "directory", "door sign", "trade show"],
    h: ["sans", "slab", "display"], b: ["sans"], minBodyLeg: 8, moodsNot: ["experimental", "playful"], signals: ["bold", "readable", "sturdy", "commanding", "headline-ready", "clear", "legible"], heading: ["sans", "slab"] },
  { id: "merch", family: "loud", label: "Merch, t-shirt or sticker", group: "creative", words: ["merch", "t-shirt", "tshirt", "sticker", "tote", "hoodie", "apparel", "patch", "band merch", "screen print", "tee design", "mug"],
    h: ["display", "hand", "slab", "script", "sans"], b: ["sans"], minBodyLeg: 5, signals: ["bold", "punchy", "expressive", "street art", "vintage", "retro", "edgy", "quirky", "badge", "eye-catching"], heading: ["display", "hand"] },
  // ── occasions ──
  { id: "wedding", family: "occasions", label: "Wedding or invitation", group: "event", words: ["wedding", "invitation", "save the date", "rsvp", "bridal", "engagement", "formal invitation", "greeting card", "baby shower"],
    h: ["script", "serif", "hand", "display"], b: ["serif", "sans"], minBodyLeg: 7, moodsNot: ["bold"], signals: ["romantic", "graceful", "elegant", "calligraphic", "flowing", "flourished", "lyrical", "invitations", "weddings"], heading: ["script", "serif"] },
  { id: "journal", family: "occasions", label: "Journal, diary or scrapbook", group: "fun", words: ["journal", "diary", "scrapbook", "memoir", "notes", "travel journal", "travel diary", "personal blog", "keepsake"],
    h: ["hand", "script", "serif", "display"], b: ["serif", "sans"], minBodyLeg: 7, signals: ["handwritten", "personal", "casual", "adventurous", "journals", "authentic", "spontaneous", "jotted", "notes"], heading: ["hand", "script"] },
  { id: "printables", family: "occasions", label: "Planner, printable or worksheet", loose: true, group: "event", words: ["planner", "printable", "worksheet", "calendar", "checklist", "template", "journal page", "study guide", "to-do", "habit tracker", "recipe card", "sticker sheet", "bullet journal"],
    h: ["sans", "hand", "serif", "display", "script"], b: ["sans", "serif", "hand"], minBodyLeg: 7, signals: ["friendly", "handwritten", "casual", "cheerful", "clean", "organized", "approachable", "personal"], heading: ["hand", "sans"] },
  // ── themed ──
  { id: "gaming", family: "themed", label: "Gaming or sci-fi", group: "fun", words: ["gaming", "game", "esports", "sci-fi", "pixel art", "retro game", "cyberpunk", "futuristic", "space", "arcade", "8-bit"],
    h: ["display", "mono", "sans"], b: ["sans", "mono"], minBodyLeg: 5, signals: ["futuristic", "sci-fi", "pixel", "cyberpunk", "gaming", "neon", "cosmic", "retro-tech", "game"], heading: ["display"] },
  { id: "retro", family: "themed", label: "Retro or vintage", group: "fun", words: ["retro", "vintage", "nostalgic", "70s", "art deco", "diner", "old school", "classic americana", "throwback"],
    h: ["display", "script", "slab", "serif", "hand"], b: ["sans", "serif", "slab"], minBodyLeg: 6, signals: ["retro", "vintage", "nostalgic", "art", "deco", "heritage", "old-world", "retro poster", "vintage branding"], heading: ["display", "script"] },
  { id: "spooky", family: "themed", label: "Spooky or gothic", group: "fun", words: ["halloween", "horror", "gothic", "spooky", "dark", "metal", "occult", "medieval", "fantasy", "dark academia"],
    h: ["display", "script", "serif"], b: ["serif", "sans"], minBodyLeg: 6, signals: ["gothic", "horror", "dark", "medieval", "halloween", "fantasy", "mysterious", "metal", "dark academia"], heading: ["display"] },
  { id: "playful", family: "themed", label: "Playful or party", group: "fun", words: ["party", "birthday", "fun", "playful", "whimsical", "kids party", "celebration", "cute", "quirky"],
    h: ["display", "hand", "script", "sans"], b: ["sans", "serif"], minBodyLeg: 6, signals: ["playful", "fun", "whimsical", "cheerful", "bubbly", "cute", "quirky", "comic", "groovy"], heading: ["display", "hand"] },
  { id: "kids", family: "themed", label: "Kids' brand or children's book", group: "fun", words: ["kids", "children", "children's book", "picture book", "toy", "nursery", "baby", "preschool", "storybook", "kids brand"],
    h: ["display", "hand", "sans", "script", "serif"], b: ["sans", "serif"], minBodyLeg: 8, signals: ["playful", "friendly", "fun", "cheerful", "bubbly", "whimsical", "cute", "gentle", "rounded"], heading: ["hand", "display"] },
  { id: "comics", family: "themed", label: "Comic, zine or graphic novel", group: "fun", words: ["comic", "comic book", "zine", "graphic novel", "manga", "webcomic", "fan art", "fanzine", "cartoon", "speech bubble", "lettering"],
    h: ["display", "hand", "script", "sans"], b: ["hand", "sans", "serif"], minBodyLeg: 5, signals: ["comic", "playful", "hand-lettered", "quirky", "expressive", "cartoon", "casual", "groovy", "bold"], heading: ["hand", "display"] },
  // ── everyday ──
  { id: "general", family: "everyday", label: "General purpose", loose: true, group: "document", words: [],
    h: ["serif", "sans", "slab", "mono", "display", "script", "hand"], b: ["serif", "sans", "slab"], minBodyLeg: 7, signals: ["versatile", "readable", "clean", "friendly", "approachable"] },
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
  const hw = wordsOf(pair.h), bw = wordsOf(pair.b);
  let sig = 0;
  for (const w of t.signals) { const x = weight(w); if (hw.has(w)) sig += 2 * x; if (bw.has(w)) sig += x; }
  const kindFit = !!t.heading?.includes(hk);
  // A type whose signal words are all class-wide filler is decided by its font-class rules alone.
  const usable = t.signals.some((w) => weight(w) > 0);
  const needsEvidence = usable && !t.loose && t.group !== "document" && t.group !== "digital";
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
  // Balance: a type that qualifies but never wins a slot (broad types lose to narrow ones) gets its strongest-fitting
  // pairs. It only takes a second or third slot from a type that is over-represented; a pair's best fit never changes.
  const cnt: Record<string, number> = {};
  for (const rows of Object.values(out)) for (const r of rows) cnt[r.id] = (cnt[r.id] ?? 0) + 1;
  const cap = 0.9 * ((n * N) / PROJECT_TYPES.length);
  const floorOf = (id: string) => Math.min(400, 0.5 * (eligible[id] ?? 0));
  const under = PROJECT_TYPES.filter((t) => (cnt[t.id] ?? 0) < floorOf(t.id)).sort((a, b) => (cnt[a.id] ?? 0) / floorOf(a.id) - (cnt[b.id] ?? 0) / floorOf(b.id));
  for (const t of under) {
    const cands = pairs
      .filter((p) => cache.get(p.id)!.has(t.id) && !out[p.id].some((r) => r.id === t.id))
      .map((p) => ({ p, k: cache.get(p.id)!.get(t.id)! + hashKey(p.id, t.id) * 0.5 }))
      .sort((a, b) => b.k - a.k);
    for (const { p } of cands) {
      if ((cnt[t.id] ?? 0) >= floorOf(t.id)) break;
      const rows = out[p.id], score = cache.get(p.id)!.get(t.id)!;
      if (rows.length < n) { rows.push({ id: t.id, score }); cnt[t.id] = (cnt[t.id] ?? 0) + 1; continue; }
      for (let i = rows.length - 1; i >= 1; i--) {
        if ((cnt[rows[i].id] ?? 0) > cap) { cnt[rows[i].id]--; rows[i] = { id: t.id, score }; cnt[t.id] = (cnt[t.id] ?? 0) + 1; break; }
      }
    }
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════
// ADJECTIVE EXPANSION — Batch 1 of 3
// Additional keys and expanded adjectives to reach ~15,000 total
// This file is merged into the enrichment system at runtime
// ═══════════════════════════════════════════════════════════════

export const ADJECTIVE_EXPANSION: Record<string, string[]> = {

  // ── NEW KEYS: Music genres ──
  "synthpop": ["electronic", "retro-futuristic", "polished", "neon-lit", "machine-made", "danceable", "glossy", "pulsing", "sequenced", "melodic", "new-wave", "synth-driven", "crystalline", "programmed", "cold-wave", "digital-pop", "stadium-ready", "hook-laden", "atmospheric", "nocturnal"],
  "shoegaze": ["dreamy", "layered", "ethereal", "hazy", "reverb-drenched", "wall-of-sound", "floating", "hypnotic", "gauzy", "shimmering", "blurred", "immersive", "washed-out", "celestial", "noise-kissed", "textured", "swirling", "introspective", "sonic", "enveloping"],
  "grindcore": ["abrasive", "extreme", "raw", "blast-beat", "visceral", "uncompromising", "relentless", "chaotic", "aggressive", "lo-fi", "distorted", "frenetic", "underground", "punk-rooted", "brutal", "noisy", "intense", "confrontational", "short-burst", "angry"],
  "lounge": ["smooth", "sophisticated", "relaxed", "cocktail-hour", "velvet", "mellow", "suave", "easy-listening", "ambient", "jazzy", "breezy", "cosmopolitan", "classy", "understated", "warm-toned", "intimate", "refined", "conversational", "plush", "unhurried"],
  "trip-hop": ["downtempo", "atmospheric", "moody", "cinematic", "beat-driven", "nocturnal", "smoky", "layered", "sample-heavy", "brooding", "urban-chill", "experimental", "dark-groove", "introspective", "bass-heavy", "film-noir", "abstract", "lo-fi-luxe", "melancholic", "hypnotic"],

  // ── NEW KEYS: Fashion ──
  "haute-couture": ["bespoke", "handcrafted", "runway-ready", "one-of-a-kind", "meticulous", "atelier", "custom-fitted", "artisanal", "high-fashion", "masterful", "tailored", "exclusive", "couturier", "hand-sewn", "luxury-grade", "editorial-worthy", "show-stopping", "impeccable", "fashion-forward", "rarefied"],
  "avant-garde": ["experimental", "boundary-pushing", "unconventional", "radical", "provocative", "deconstructed", "conceptual", "progressive", "non-conformist", "visionary", "subversive", "cerebral", "forward-thinking", "rule-breaking", "innovative", "challenging", "abstract", "thought-provoking", "pioneering", "daring"],
  "deconstructed": ["raw-edged", "exposed", "unfinished", "inside-out", "fragmented", "reimagined", "stripped-back", "asymmetric", "undone", "rebuilt", "dismantled", "reassembled", "broken-apart", "exploded-view", "layered", "transparent", "structural", "architectural", "post-modern", "deliberate"],
  "tailored": ["precise", "fitted", "structured", "sharp", "clean-cut", "measured", "bespoke", "well-made", "crisp", "polished", "intentional", "proportioned", "considered", "refined", "custom", "meticulous", "disciplined", "crafted", "professional", "immaculate"],

  // ── NEW KEYS: Architecture ──
  "neo-classical": ["columned", "symmetrical", "grand", "proportioned", "marbled", "monumental", "stately", "ordered", "pediment", "classical-revival", "formal", "dignified", "balanced", "ornate", "greco-roman", "institutional", "timeless", "imposing", "civic", "ceremonial"],
  "post-industrial": ["converted", "raw-brick", "exposed-beam", "warehouse", "adaptive-reuse", "loft-style", "urban-renewal", "repurposed", "gritty-chic", "factory-floor", "open-plan", "steel-frame", "concrete", "utilitarian", "rough-luxe", "artist-studio", "maker-space", "reclaimed", "honest-material", "stripped-back"],
  "high-rise": ["towering", "vertical", "skyline", "glass-curtain", "elevator", "penthouse", "panoramic", "urban-density", "sky-high", "corporate-tower", "steel-and-glass", "cloud-piercing", "metropolitan", "aspirational", "commanding", "sleek-facade", "modern-monument", "city-crown", "ambitious", "engineering-marvel"],

  // ── NEW KEYS: Emotions ──
  "euphoric": ["elated", "ecstatic", "blissful", "rapturous", "exhilarated", "peak-experience", "overjoyed", "transcendent", "jubilant", "soaring", "uplifted", "effervescent", "radiant", "triumphant", "cloud-nine", "intoxicating", "boundless", "electric", "elevated", "rhapsodic"],
  "melancholic": ["wistful", "bittersweet", "longing", "pensive", "autumnal", "twilight", "somber", "reflective", "aching", "tender-sad", "blue-toned", "elegiac", "nostalgic-ache", "rain-soaked", "fading", "gentle-sorrow", "contemplative", "dusky", "muted-grief", "quiet-ache"],
  "bittersweet": ["poignant", "tender", "mixed-emotion", "sweet-sorrow", "nostalgic", "touching", "heart-rending", "lovely-sad", "precious", "fleeting", "ambivalent", "emotional-complexity", "layered-feeling", "sunrise-sunset", "growth-pain", "farewell", "coming-of-age", "memory-laden", "seasoned", "wisdom-earned"],
  "restless": ["unsettled", "searching", "kinetic", "nomadic", "itinerant", "driven", "edgy-energy", "can't-sit-still", "wandering", "questioning", "seeking", "dynamic-tension", "electric-unease", "forward-leaning", "anticipatory", "on-the-move", "unresolved", "hungry", "restive", "questing"],

  // ── NEW KEYS: Textures ──
  "grainy": ["textured", "film-grain", "speckled", "gritty", "sandpaper", "rough-surface", "analog", "imperfect", "tactile", "lo-fi-texture", "noise-layered", "organic-surface", "raw-finish", "unpolished", "hand-made-feel", "authentic-wear", "photographic", "darkroom", "vintage-print", "stippled"],
  "glossy": ["high-shine", "lacquered", "polished", "reflective", "magazine-finish", "wet-look", "slick", "mirror-like", "glass-smooth", "patent", "chrome", "candy-coat", "pristine-surface", "photo-finish", "premium-sheen", "showroom", "varnished", "lustrous", "gleaming", "immaculate"],
  "matte": ["flat-finish", "non-reflective", "chalky", "understated", "powder-coat", "velvet-touch", "subtle-surface", "soft-finish", "museum-quality", "anti-glare", "paper-texture", "ceramic-smooth", "eggshell", "satin-adjacent", "dignified", "quiet-luxury", "tactile-softness", "mineral", "earthy-finish", "contemplative"],
  "brushed": ["directional", "metal-finish", "swept", "linear-texture", "industrial-polish", "satin-metal", "hand-finished", "stroke-marked", "refined-rough", "tool-marked", "craftsman", "machine-touched", "steel-grain", "aluminum", "warm-metal", "contemporary-finish", "sophisticated-texture", "functional-beauty", "honest-process", "revealed-method"],
  "etched": ["engraved", "incised", "carved", "acid-washed", "line-work", "intaglio", "precision-cut", "detailed", "fine-line", "glass-art", "memorial", "permanent", "deliberate-mark", "crafted-line", "artisan-detail", "plate-pressed", "hand-etched", "copper-plate", "woodcut-inspired", "mark-making"],

  // ── NEW KEYS: Time periods ──
  "atomic-age": ["space-race", "mid-century-futurism", "sputnik", "boomerang", "ray-gun", "optimistic-future", "nuclear-era", "googie", "jet-age", "populuxe", "chrome-and-fin", "rocket-shaped", "starburst", "atomic-motif", "retro-science", "tomorrowland", "expo", "world-of-tomorrow", "isotope", "orbit"],
  "space-age": ["lunar", "zero-gravity", "capsule", "orbital", "mission-control", "nasa-inspired", "astronaut", "futuristic-60s", "silver-suit", "countdown", "rocket-propelled", "interstellar", "cosmic-era", "space-station", "module", "apollo", "frontier", "void", "starbound", "explorer"],
  "gilded-age": ["opulent", "robber-baron", "grand-mansion", "gold-leaf", "victorian-excess", "chandelier", "ballroom", "tycoon", "ornamental", "nouveau-riche", "extravagant", "mahogany", "velvet-draped", "gas-lamp", "high-society", "palatial", "indulgent", "Beaux-Arts", "monogrammed", "establishment"],

  // ── NEW KEYS: Cultural ──
  "afro-futurist": ["african-diaspora", "tech-heritage", "cosmic-africa", "vibranium", "sun-ra", "wakanda-inspired", "ancestral-future", "afro-cosmic", "pan-african", "black-speculative", "techno-traditional", "ubuntu-digital", "motherland-modern", "future-ancestry", "rhythm-tech", "diaspora-digital", "african-space", "heritage-forward", "kente-meets-chrome", "tradition-innovation"],
  "celtic": ["knotwork", "interlaced", "gaelic", "illuminated-manuscript", "spiral", "druidic", "emerald", "highland", "mythological", "runic-adjacent", "stone-carved", "ancient-british", "insular", "claddagh", "bardic", "folklore", "misty-isle", "sacred-geometry", "oak-and-ivy", "hero-saga"],
  "persian": ["arabesque", "geometric-garden", "tile-work", "calligraphic", "miniature-painting", "silk-road", "paradise-garden", "turquoise", "saffron", "rosewater", "domed", "pointed-arch", "carpet-woven", "lyrical", "rubaiyat", "bazaar", "filigree", "lapis", "poetry-garden", "thousand-and-one"],
  "polynesian": ["tapa-cloth", "ocean-voyager", "tattoo-art", "wave-pattern", "island-carved", "tiki", "outrigger", "star-navigator", "coral", "volcanic", "tropical-sacred", "wayfinder", "mahogany-carved", "palm-frond", "atoll", "pacific", "ancestral-ocean", "reef-pattern", "creation-myth", "island-chain"],

  // ── NEW KEYS: Nature ──
  "alpine": ["mountain-peak", "snow-capped", "crisp-air", "evergreen", "chalet", "summit", "glacial-fed", "high-altitude", "treeline", "panoramic-vista", "edelweiss", "rocky", "pristine", "wilderness", "trail-blazing", "breathtaking", "rugged-beauty", "thin-air", "crystal-clear", "majestic"],
  "coastal": ["salt-air", "sea-breeze", "tide-washed", "driftwood", "shore-line", "beach-worn", "sand-dollar", "maritime", "wave-shaped", "ocean-view", "weathered", "sun-bleached", "harbor", "lighthouse", "seashell", "reef", "bay", "cape", "inlet", "horizon-line"],
  "volcanic": ["igneous", "molten", "basalt", "obsidian", "eruption", "crater", "lava-flow", "sulfuric", "primordial", "tectonic", "pumice", "ash-cloud", "magma", "geothermal", "hot-spring", "caldera", "black-sand", "fire-born", "earth-core", "elemental-force"],
  "glacial": ["ice-blue", "frozen", "slow-moving", "ancient-ice", "crevasse", "moraine", "pristine-cold", "crystalline", "retreat", "meltwater", "polar", "permafrost", "ice-field", "translucent-blue", "compressed", "millennia-old", "quiet-power", "inevitable", "patient", "monumental-slow"],

  // ── NEW KEYS: Food & beverage ──
  "farm-to-table": ["locally-sourced", "seasonal", "fresh-picked", "artisan-prepared", "hand-gathered", "small-batch", "terroir", "harvest", "garden-to-plate", "homestead", "rustic-refined", "ingredient-forward", "whole-food", "sustainable-dining", "field-fresh", "pasture-raised", "orchard", "root-to-stem", "community-supported", "chef-driven"],
  "speakeasy": ["prohibition-era", "hidden-door", "password-entry", "dimly-lit", "craft-cocktail", "jazz-filled", "velvet-rope", "underground", "intimate-bar", "vintage-spirits", "barrel-aged", "mustachioed", "art-deco-bar", "secret-society", "gatsby-adjacent", "bootlegger", "low-key-luxe", "candlelit", "leather-booth", "old-fashioned"],

  // ── NEW KEYS: Technology ──
  "ai": ["machine-intelligence", "neural-network", "algorithmic", "generative", "predictive", "autonomous", "data-driven", "smart-system", "cognitive", "silicon-mind", "deep-learning", "pattern-recognition", "adaptive", "automated", "intelligent-design", "future-tech", "compute", "inference", "model-trained", "synthetic-thought"],
  "web3": ["decentralized", "blockchain-native", "token-gated", "permissionless", "trustless", "on-chain", "crypto-native", "dao-governed", "peer-to-peer", "consensus", "smart-contract", "wallet-connected", "composable", "interoperable", "open-protocol", "community-owned", "transparent-ledger", "digital-sovereignty", "nft-adjacent", "metaverse-ready"],

  // ── NEW KEYS: Sports ──
  "olympian": ["gold-medal", "world-class", "peak-performance", "record-breaking", "podium", "athletic-excellence", "five-rings", "champion", "training-dedication", "personal-best", "qualifying", "medal-ceremony", "torch-bearer", "spirit-of-sport", "opening-ceremony", "national-pride", "sportsmanship", "elite-athlete", "legendary", "once-in-a-lifetime"],
  "marathon": ["endurance", "long-distance", "26-miles", "pace-yourself", "finish-line", "hydration", "second-wind", "wall-breaker", "personal-record", "course-map", "mile-marker", "running-community", "steady-stride", "determination", "early-morning", "crowd-support", "race-day", "training-plan", "mental-fortitude", "achievement"],

  // ── NEW KEYS: Art movements ──
  "impressionist": ["light-dappled", "plein-air", "soft-focus", "color-field", "brushstroke-visible", "sun-filtered", "garden-scene", "water-lily", "atmospheric", "fleeting-moment", "pastel-palette", "afternoon-light", "haystack", "cathedral", "riverside", "boat-scene", "parasol", "shimmering", "Monet-esque", "captured-instant"],
  "surrealist": ["dream-logic", "melting", "uncanny", "subconscious", "juxtaposed", "hallucinatory", "metamorphic", "impossible-object", "Dali-esque", "automatic-writing", "irrational", "Magritte-like", "double-image", "psychoanalytic", "Freudian", "trompe-l'oeil", "fantastical", "disorienting", "marvelous", "chance-encounter"],
  "cubist": ["fragmented-view", "multiple-angle", "geometric-face", "flattened-plane", "analytical", "collage", "Picasso-esque", "Braque-like", "faceted", "deconstructed-form", "newspaper-insert", "still-life", "guitar-shape", "abstracted", "simultaneous-view", "overlapping", "angular-portrait", "earth-tone", "sculptural-painting", "revolutionary"],
  "pop-art": ["mass-produced", "comic-strip", "Warhol-esque", "screen-printed", "consumer-culture", "bright-flat-color", "celebrity-portrait", "soup-can", "repetition", "ironic", "commercial", "billboard-scale", "half-tone-dot", "Lichtenstein-like", "everyday-object", "advertising-aesthetic", "tongue-in-cheek", "iconic-image", "culture-commentary", "democratic-art"],

  // ── NEW KEYS: Color families ──
  "warm-toned": ["amber", "honey", "golden", "terracotta", "sienna", "sunset", "copper-glow", "fire-lit", "candle-warm", "autumn-leaf", "peach", "coral", "rust", "burnt-orange", "cinnamon", "caramel", "toffee", "bronze", "wheat", "sunbaked"],
  "cool-toned": ["ice-blue", "slate", "pewter", "fog", "steel", "arctic", "moonlit", "frost", "silver-grey", "ocean-deep", "twilight-blue", "lavender-grey", "ash", "platinum", "winter-sky", "blue-hour", "mist", "dove", "smoke", "graphite"],
  "earth-toned": ["clay", "umber", "ochre", "moss", "sandstone", "bark", "loam", "peat", "sage", "olive-drab", "mushroom", "flax", "burlap", "hemp", "adobe", "terra-firma", "soil", "dried-grass", "stone-grey", "canyon"],

  // ── NEW KEYS: Typography-specific ──
  "high-contrast": ["thick-thin", "dramatic-stroke", "Didone", "hairline-to-heavy", "fashion-magazine", "editorial-serif", "modulated", "calligraphic-contrast", "striking", "bold-refined", "elegant-tension", "display-quality", "headline-impact", "light-to-black", "stress-angle", "wasp-waisted", "engraved-style", "copper-plate-inspired", "Bodoni-like", "dramatic-serif"],
  "low-contrast": ["even-stroke", "monoline", "uniform-weight", "geometric-purity", "sans-serif-default", "screen-friendly", "text-optimized", "neutral", "workmanlike", "democratic", "accessible", "web-safe", "comfortable", "unassuming", "body-copy-ready", "paragraph-friendly", "sustained-reading", "quiet", "background-type", "dutiful"],
  "open-aperture": ["airy", "breathable", "generous-counter", "welcoming", "readable", "humanist-design", "friendly-letter", "accessible-form", "clear-distinction", "legible", "magazine-body", "book-friendly", "wide-opening", "inviting", "approachable-letter", "well-spaced", "comfortable-read", "modern-text", "screen-optimized", "inclusive-design"],
  "tight-set": ["compressed", "space-efficient", "headline-density", "compact", "narrow-fitting", "editorial-layout", "newspaper-column", "space-saving", "dense-paragraph", "economical", "text-heavy", "column-friendly", "small-space", "information-dense", "utilitarian-spacing", "reference-material", "fine-print", "condensed-layout", "efficient-communication", "maximized-content"],
};

// ═══════════════════════════════════════════════════════════════
// SYNONYM MAP — maps common words to font-relevant synonyms
// Used by the search engine for broader matching
// ═══════════════════════════════════════════════════════════════

export const SYNONYM_MAP: Record<string, string[]> = {
  // Appearance
  "pretty": ["elegant", "beautiful", "feminine", "delicate", "refined", "graceful"],
  "ugly": ["grunge", "raw", "brutal", "rough", "distressed", "gritty"],
  "beautiful": ["elegant", "refined", "graceful", "gorgeous", "stunning", "exquisite"],
  "gorgeous": ["elegant", "luxury", "stunning", "beautiful", "refined"],
  "attractive": ["appealing", "elegant", "polished", "refined", "charming"],
  "plain": ["minimal", "clean", "simple", "neutral", "restrained"],
  "fancy": ["ornate", "decorative", "elaborate", "embellished", "luxurious"],
  "ornamental": ["decorative", "ornate", "elaborate", "fancy", "detailed"],
  "sleek": ["modern", "clean", "polished", "streamlined", "minimal"],
  "chunky": ["bold", "heavy", "thick", "blocky", "impactful"],
  "thin": ["light", "delicate", "fine", "airy", "thin"],
  "thick": ["bold", "heavy", "strong", "chunky", "impactful"],

  // Emotions
  "happy": ["playful", "fun", "cheerful", "bright", "energetic", "joyful"],
  "sad": ["moody", "dark", "melancholic", "somber", "blue"],
  "angry": ["aggressive", "bold", "edgy", "fierce", "intense", "heavy"],
  "calm": ["serene", "peaceful", "minimal", "gentle", "zen", "quiet"],
  "excited": ["energetic", "dynamic", "bold", "vibrant", "electric"],
  "scared": ["horror", "dark", "spooky", "gothic", "eerie"],
  "peaceful": ["serene", "calm", "zen", "gentle", "organic", "soft"],
  "joyful": ["playful", "bright", "cheerful", "energetic", "fun", "bubbly"],
  "anxious": ["edgy", "restless", "nervous", "tense", "unsettled"],
  "confident": ["bold", "strong", "assertive", "commanding", "powerful"],
  "shy": ["delicate", "soft", "gentle", "subtle", "quiet", "understated"],
  "proud": ["bold", "regal", "stately", "dignified", "commanding"],
  "lonely": ["moody", "minimal", "somber", "isolated", "sparse"],
  "love": ["romantic", "feminine", "script", "flowing", "charming", "heart"],
  "hate": ["aggressive", "dark", "heavy", "grunge", "brutal"],
  "hope": ["bright", "light", "uplifting", "optimistic", "warm"],
  "fear": ["dark", "horror", "gothic", "spooky", "heavy"],
  "surprise": ["bold", "unexpected", "quirky", "playful", "dynamic"],

  // Size/Scale
  "big": ["bold", "heavy", "impactful", "dramatic", "large", "display"],
  "small": ["delicate", "light", "thin", "minimal", "petite", "subtle"],
  "huge": ["massive", "bold", "display", "impactful", "dramatic"],
  "tiny": ["delicate", "miniature", "fine", "subtle", "petite"],
  "tall": ["condensed", "elongated", "vertical", "towering"],
  "short": ["compact", "condensed", "wide", "squat"],
  "wide": ["expanded", "broad", "spacious", "generous"],
  "narrow": ["condensed", "compact", "tight", "compressed"],

  // Speed/Time
  "fast": ["dynamic", "energetic", "bold", "sharp", "quick"],
  "slow": ["calm", "gentle", "serene", "deliberate", "measured"],
  "old": ["vintage", "classic", "traditional", "retro", "heritage", "antique"],
  "new": ["modern", "contemporary", "fresh", "cutting-edge", "innovative"],
  "ancient": ["classic", "traditional", "historical", "medieval", "archaic"],
  "futuristic": ["modern", "tech", "sci-fi", "geometric", "digital"],
  "timeless": ["classic", "enduring", "permanent", "ageless", "eternal"],
  "trendy": ["modern", "contemporary", "fashionable", "current", "hip"],
  "outdated": ["vintage", "retro", "dated", "old-fashioned", "nostalgic"],

  // Temperature/Weather
  "hot": ["warm", "fiery", "passionate", "bold", "red", "intense"],
  "cold": ["cool", "icy", "minimal", "clinical", "sharp", "frosty"],
  "warm": ["cozy", "inviting", "friendly", "organic", "approachable"],
  "cool": ["modern", "clean", "sleek", "minimal", "crisp"],
  "sunny": ["bright", "warm", "cheerful", "golden", "optimistic"],
  "rainy": ["moody", "dark", "blue", "melancholic", "atmospheric"],
  "stormy": ["dramatic", "dark", "bold", "intense", "powerful"],
  "foggy": ["mysterious", "soft", "hazy", "atmospheric", "muted"],

  // Weight/Strength
  "strong": ["bold", "heavy", "powerful", "robust", "sturdy"],
  "weak": ["light", "thin", "delicate", "fragile", "subtle"],
  "hard": ["bold", "sharp", "angular", "rigid", "structured"],
  "soft": ["gentle", "rounded", "smooth", "flowing", "feminine"],
  "heavy": ["bold", "thick", "impactful", "weighty", "dense"],
  "light": ["thin", "airy", "delicate", "minimal", "weightless"],
  "tough": ["rugged", "bold", "heavy", "grunge", "industrial"],
  "fragile": ["delicate", "thin", "elegant", "refined", "breakable"],

  // Positive/Negative
  "good": ["clean", "polished", "refined", "professional", "quality"],
  "bad": ["grunge", "rough", "raw", "gritty", "distressed"],
  "perfect": ["polished", "refined", "immaculate", "pristine", "flawless"],
  "messy": ["grunge", "raw", "chaotic", "handwritten", "distressed"],
  "clean": ["minimal", "modern", "crisp", "polished", "organized"],
  "dirty": ["grunge", "distressed", "raw", "gritty", "worn"],
  "nice": ["pleasant", "friendly", "warm", "approachable", "clean"],
  "awful": ["harsh", "rough", "jarring", "discordant", "unrefined"],
  "great": ["bold", "impactful", "outstanding", "excellent", "premium"],
  "terrible": ["harsh", "discordant", "chaotic", "grating"],

  // Common descriptors
  "cool-style": ["modern", "edgy", "stylish", "slick", "trendy"],
  "awesome": ["bold", "impressive", "striking", "dynamic", "powerful"],
  "cute": ["adorable", "sweet", "playful", "feminine", "kawaii", "charming"],
  "weird": ["quirky", "unusual", "eccentric", "unconventional", "distinctive"],
  "normal": ["neutral", "clean", "standard", "conventional", "regular"],
  "boring": ["neutral", "plain", "generic", "standard", "unremarkable"],
  "interesting": ["distinctive", "unique", "creative", "unusual", "compelling"],
  "basic": ["simple", "clean", "minimal", "standard", "neutral"],
  "complex": ["detailed", "ornate", "layered", "intricate", "elaborate"],
  "simple": ["clean", "minimal", "plain", "straightforward", "unadorned"],

  // Color-related
  "dark": ["moody", "gothic", "heavy", "deep", "shadowy", "noir"],
  "bright": ["vibrant", "bold", "energetic", "vivid", "luminous"],
  "colorful": ["vibrant", "bold", "rainbow", "multi-colored", "lively"],
  "monochrome": ["minimal", "black-and-white", "tonal", "restrained"],
  "pastel": ["soft", "feminine", "gentle", "light", "muted"],
  "neon": ["bold", "electric", "bright", "80s", "synthwave", "vibrant"],
  "muted": ["subtle", "soft", "understated", "toned-down", "quiet"],
  "vivid": ["bold", "bright", "saturated", "intense", "striking"],

  // Texture-related
  "smooth": ["polished", "clean", "sleek", "refined", "flowing"],
  "rough": ["raw", "textured", "grunge", "rugged", "unpolished"],
  "sharp": ["angular", "geometric", "precise", "crisp", "pointed"],
  "round": ["rounded", "soft", "circular", "friendly", "bubbly"],
  "flat": ["minimal", "clean", "2d", "simple", "graphic"],
  "shiny": ["glossy", "polished", "reflective", "chrome", "metallic"],
  "dull": ["matte", "flat", "understated", "muted", "subtle"],
  "fuzzy": ["soft", "warm", "organic", "textured", "blurred"],

  // Style-related
  "formal": ["professional", "corporate", "traditional", "serif", "dignified"],
  "informal": ["casual", "friendly", "relaxed", "handwritten", "approachable"],
  "serious": ["professional", "corporate", "authoritative", "formal", "stern"],
  "funny": ["playful", "quirky", "fun", "whimsical", "comic"],
  "classy": ["elegant", "refined", "sophisticated", "premium", "upscale"],
  "trashy": ["grunge", "punk", "raw", "loud", "provocative"],
  "chic": ["stylish", "elegant", "modern", "refined", "fashionable"],
  "rustic": ["earthy", "organic", "vintage", "natural", "handmade"],
  "urban": ["street", "city", "modern", "edgy", "metropolitan"],
  "rural": ["rustic", "organic", "natural", "country", "earthy"],
  "luxurious": ["premium", "elegant", "opulent", "refined", "high-end"],
  "cheap": ["basic", "simple", "plain", "budget", "generic"],
  "expensive": ["luxury", "premium", "exclusive", "high-end", "refined"],
  "artsy": ["creative", "artistic", "expressive", "bohemian", "eclectic"],
  "corporate": ["professional", "formal", "business", "clean", "institutional"],
  "hipster": ["indie", "vintage", "alternative", "craft", "artisanal"],
  "boho": ["bohemian", "organic", "eclectic", "free-spirited", "earthy"],
  "minimalist": ["minimal", "clean", "simple", "restrained", "sparse"],
  "maximalist": ["ornate", "bold", "elaborate", "decorative", "rich"],
  "preppy": ["clean", "classic", "traditional", "polished", "collegiate"],
  "gothic": ["dark", "ornate", "medieval", "dramatic", "blackletter"],
  "punk": ["grunge", "raw", "edgy", "rebellious", "anarchic"],
  "hippie": ["organic", "bohemian", "free-spirited", "earthy", "handwritten"],
  "sporty": ["athletic", "dynamic", "bold", "energetic", "active"],
  "techy": ["modern", "digital", "clean", "geometric", "futuristic"],
  "romantic": ["feminine", "flowing", "script", "delicate", "elegant"],
  "spooky": ["horror", "dark", "gothic", "eerie", "creepy"],
  "festive": ["celebratory", "bold", "colorful", "fun", "decorative"],

  // Industry-related
  "medical": ["clean", "professional", "trustworthy", "clinical", "precise"],
  "legal": ["formal", "serif", "authoritative", "traditional", "serious"],
  "tech": ["modern", "clean", "digital", "geometric", "futuristic"],
  "food": ["warm", "organic", "inviting", "friendly", "appetizing"],
  "fashion": ["elegant", "editorial", "bold", "stylish", "high-contrast"],
  "music": ["expressive", "bold", "creative", "dynamic", "energetic"],
  "sports": ["bold", "dynamic", "athletic", "energetic", "competitive"],
  "education": ["friendly", "clean", "readable", "approachable", "warm"],
  "finance": ["professional", "trustworthy", "clean", "corporate", "reliable"],
  "travel": ["adventurous", "warm", "inviting", "editorial", "dynamic"],
  "real-estate": ["professional", "clean", "trustworthy", "luxury", "modern"],
  "automotive": ["bold", "dynamic", "sleek", "modern", "powerful"],

  // Age/Demographics
  "kids": ["playful", "fun", "colorful", "bubbly", "rounded", "friendly"],
  "teens": ["edgy", "bold", "trendy", "pop", "energetic"],
  "adults": ["professional", "clean", "modern", "mature", "balanced"],
  "seniors": ["traditional", "readable", "classic", "serif", "dignified"],
  "masculine": ["bold", "heavy", "strong", "angular", "structured"],
  "feminine": ["graceful", "delicate", "flowing", "elegant", "romantic"],
  "neutral": ["clean", "balanced", "universal", "minimal", "ungendered"],
  "youthful": ["energetic", "playful", "bold", "fresh", "dynamic"],
  "mature": ["sophisticated", "refined", "elegant", "dignified", "classic"],

  // Misc common words
  "water": ["flowing", "fluid", "organic", "blue", "cool", "transparent"],
  "fire": ["bold", "warm", "fiery", "red", "energetic", "passionate"],
  "earth": ["organic", "earthy", "grounded", "natural", "rustic"],
  "air": ["light", "airy", "minimal", "ethereal", "floating"],
  "nature": ["organic", "natural", "green", "earthy", "botanical"],
  "city": ["urban", "modern", "metropolitan", "edgy", "busy"],
  "space": ["futuristic", "cosmic", "vast", "sci-fi", "minimal"],
  "ocean": ["flowing", "blue", "deep", "fluid", "vast", "coastal"],
  "mountain": ["bold", "rugged", "majestic", "solid", "towering"],
  "forest": ["organic", "green", "natural", "deep", "earthy"],
  "desert": ["warm", "minimal", "earthy", "vast", "sandy"],
  "snow": ["clean", "white", "minimal", "crisp", "cold", "pure"],
  "night": ["dark", "moody", "mysterious", "nocturnal", "deep"],
  "day": ["bright", "warm", "clear", "optimistic", "light"],
  "sunrise": ["warm", "golden", "hopeful", "gradual", "emerging"],
  "sunset": ["warm", "dramatic", "golden-hour", "fading", "nostalgic"],
  "dream": ["ethereal", "surreal", "soft", "flowing", "hazy"],
  "nightmare": ["dark", "horror", "distorted", "chaotic", "disturbing"],
  "magic": ["whimsical", "fantasy", "enchanting", "sparkle", "mystical"],
  "science": ["technical", "precise", "analytical", "modern", "clean"],
  "art": ["creative", "expressive", "artistic", "distinctive", "bold"],
  "musical": ["rhythmic", "flowing", "dynamic", "expressive", "bold"],
  "dance": ["flowing", "dynamic", "graceful", "energetic", "feminine"],
  "loving": ["romantic", "warm", "heartfelt", "passionate", "tender"],
  "war": ["aggressive", "bold", "heavy", "dark", "militant"],
  "peace": ["calm", "minimal", "gentle", "serene", "harmonious"],
  "power": ["bold", "heavy", "commanding", "strong", "impactful"],
  "freedom": ["open", "flowing", "expansive", "free-spirited", "dynamic"],
  "luxury": ["premium", "refined", "elegant", "opulent", "exclusive"],
  "poverty": ["minimal", "sparse", "raw", "stripped", "honest"],
  "rich": ["luxurious", "opulent", "ornate", "premium", "gold"],
  "poor": ["minimal", "simple", "stripped", "bare", "raw"],
  "royal": ["regal", "ornate", "elegant", "gold", "luxurious", "serif"],
  "common": ["neutral", "standard", "everyday", "accessible", "simple"],

  // ── Myers-Briggs types ──
  "intj": ["precise", "minimal", "geometric", "technical", "structured", "clean"],
  "intp": ["technical", "experimental", "monospace", "analytical", "unconventional"],
  "entj": ["bold", "commanding", "modern", "structured", "authoritative", "confident"],
  "entp": ["inventive", "modern", "playful", "experimental", "clever", "dynamic"],
  "infj": ["elegant", "warm", "literary", "refined", "thoughtful", "idealistic"],
  "infp": ["warm", "organic", "handwritten", "creative", "authentic", "gentle"],
  "enfj": ["bold", "warm", "approachable", "inspiring", "charismatic", "friendly"],
  "enfp": ["playful", "warm", "expressive", "creative", "energetic", "fun"],
  "istj": ["traditional", "serif", "neutral", "reliable", "structured", "dependable"],
  "isfj": ["warm", "readable", "trustworthy", "friendly", "reliable", "gentle"],
  "estj": ["bold", "neutral", "professional", "organized", "direct", "structured"],
  "esfj": ["warm", "friendly", "approachable", "caring", "harmonious", "soft"],
  "istp": ["technical", "monospace", "utilitarian", "practical", "precise", "analytical"],
  "isfp": ["elegant", "warm", "organic", "artistic", "gentle", "flowing"],
  "estp": ["bold", "modern", "impactful", "direct", "energetic", "dynamic"],
  "esfp": ["playful", "bold", "expressive", "fun", "energetic", "spontaneous"],

  // ── Enneagram types ──
  "enneagram-1": ["precise", "clean", "structured", "orderly", "principled", "serif"],
  "enneagram-2": ["warm", "rounded", "friendly", "approachable", "caring", "soft"],
  "enneagram-3": ["polished", "modern", "sleek", "premium", "confident", "professional"],
  "enneagram-4": ["unique", "expressive", "experimental", "editorial", "distinctive", "artistic"],
  "enneagram-5": ["technical", "minimal", "monospace", "analytical", "clean", "precise"],
  "enneagram-6": ["trustworthy", "traditional", "reliable", "stable", "dependable", "serif"],
  "enneagram-7": ["playful", "bold", "energetic", "fun", "expressive", "colorful"],
  "enneagram-8": ["powerful", "bold", "commanding", "impactful", "condensed", "heavy"],
  "enneagram-9": ["neutral", "balanced", "calm", "gentle", "harmonious", "soft"],
  "1w9": ["precise", "calm", "structured", "clean", "measured", "serif"],
  "1w2": ["precise", "warm", "structured", "readable", "helpful", "friendly"],
  "2w1": ["warm", "organized", "friendly", "readable", "structured", "approachable"],
  "2w3": ["warm", "polished", "friendly", "modern", "professional", "approachable"],
  "3w2": ["polished", "charismatic", "modern", "warm", "confident", "elegant"],
  "3w4": ["polished", "unique", "editorial", "modern", "distinctive", "creative"],
  "4w3": ["artistic", "polished", "expressive", "editorial", "elegant", "distinctive"],
  "4w5": ["introspective", "intellectual", "experimental", "minimal", "unique", "literary"],
  "5w4": ["analytical", "creative", "technical", "experimental", "monospace", "precise"],
  "5w6": ["systematic", "analytical", "technical", "structured", "monospace", "reliable"],
  "6w5": ["analytical", "trustworthy", "reliable", "structured", "traditional", "clean"],
  "6w7": ["warm", "trustworthy", "friendly", "approachable", "reliable", "readable"],
  "7w6": ["playful", "responsible", "energetic", "friendly", "fun", "rounded"],
  "7w8": ["bold", "playful", "energetic", "impactful", "fun", "dynamic"],
  "8w7": ["powerful", "energetic", "bold", "dynamic", "impactful", "heavy"],
  "8w9": ["powerful", "calm", "bold", "grounded", "commanding", "structured"],
  "9w8": ["balanced", "grounded", "neutral", "calm", "strong", "readable"],
  "9w1": ["balanced", "principled", "neutral", "clean", "structured", "serif"],

  // ── DISC types (single + blends) ──
  "disc-d": ["bold", "direct", "condensed", "commanding", "impactful", "heavy"],
  "disc-i": ["friendly", "rounded", "warm", "approachable", "energetic", "social"],
  "disc-s": ["reliable", "traditional", "readable", "trustworthy", "calm", "serif"],
  "disc-c": ["analytical", "monospace", "precise", "technical", "structured", "clean"],
  "disc-di": ["bold", "warm", "confident", "charismatic", "modern", "energetic"],
  "disc-id": ["warm", "bold", "enthusiastic", "confident", "dynamic", "approachable"],
  "disc-dc": ["bold", "precise", "structured", "commanding", "analytical", "clean"],
  "disc-cd": ["precise", "bold", "technical", "structured", "commanding", "analytical"],
  "disc-is": ["warm", "reliable", "friendly", "approachable", "calm", "readable"],
  "disc-si": ["reliable", "warm", "trustworthy", "friendly", "approachable", "calm"],
  "disc-sc": ["reliable", "precise", "structured", "trustworthy", "analytical", "clean"],
  "disc-cs": ["precise", "reliable", "analytical", "structured", "trustworthy", "technical"],
  "disc-ds": ["bold", "reliable", "commanding", "grounded", "structured", "strong"],
  "disc-sd": ["reliable", "bold", "calm", "structured", "grounded", "commanding"],
  "disc-ic": ["friendly", "analytical", "warm", "precise", "approachable", "structured"],
  "disc-ci": ["analytical", "friendly", "precise", "warm", "technical", "approachable"],

  // ── Western Zodiac ──
  "aries": ["bold", "competitive", "energetic", "impactful", "fierce", "dynamic"],
  "taurus": ["reliable", "warm", "luxurious", "serif", "grounded", "earthy"],
  "gemini": ["versatile", "modern", "adaptable", "curious", "variable", "dynamic"],
  "cancer": ["warm", "soft", "rounded", "nurturing", "gentle", "friendly"],
  "leo": ["dramatic", "bold", "high-contrast", "confident", "theatrical", "display"],
  "virgo": ["precise", "clean", "structured", "analytical", "refined", "minimal"],
  "libra": ["balanced", "elegant", "harmonious", "beautiful", "refined", "graceful"],
  "scorpio": ["intense", "dark", "editorial", "high-contrast", "mysterious", "powerful"],
  "sagittarius": ["adventurous", "bold", "expressive", "playful", "free", "energetic"],
  "capricorn": ["professional", "ambitious", "structured", "traditional", "authoritative", "serif"],
  "aquarius": ["innovative", "experimental", "futuristic", "unconventional", "technical", "modern"],
  "pisces": ["dreamy", "flowing", "organic", "soft", "creative", "gentle"],

  // ── Chinese Zodiac ──
  "rat": ["clever", "versatile", "modern", "adaptable", "resourceful", "clean"],
  "ox": ["strong", "reliable", "sturdy", "slab", "dependable", "structured"],
  "tiger": ["bold", "fierce", "impactful", "brave", "dynamic", "powerful"],
  "rabbit": ["gentle", "elegant", "refined", "delicate", "graceful", "serif"],
  "dragon": ["powerful", "dramatic", "commanding", "high-contrast", "ambitious", "display"],
  "snake": ["sophisticated", "mysterious", "elegant", "editorial", "high-contrast", "refined"],
  "horse": ["energetic", "bold", "dynamic", "adventurous", "expressive", "free"],
  "goat": ["creative", "gentle", "warm", "organic", "artistic", "handwritten"],
  "monkey": ["playful", "clever", "quirky", "inventive", "experimental", "fun"],
  "rooster": ["confident", "structured", "professional", "clean", "polished", "modern"],
  "dog": ["loyal", "friendly", "trustworthy", "warm", "approachable", "readable"],
  "pig": ["generous", "warm", "rounded", "soft", "comfortable", "friendly"],
};

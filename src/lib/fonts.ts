// Font loading utility
// Self-hosted .woff2 files in public/fonts/ are the primary source.
// CDN fallbacks (Google Fonts, Fontshare) provide backup coverage.

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const loaded = new Set<string>();

// fonts.css is already in the static <head> via layout.tsx — mark it loaded so
// loadFont() never adds a duplicate dynamic <link>
loaded.add("__css__");

// Cap CDN stylesheets to prevent unbounded DOM growth
const MAX_CDN_LINKS = 200;
const cdnLinks: { key: string; fontKey: string; el: HTMLLinkElement }[] = [];

// Fonts that are pinned and must not be evicted (currently visible on detail pages)
const pinnedFonts = new Set<string>();

function addCdnLink(key: string, fontKey: string, href: string): void {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  cdnLinks.push({ key, fontKey, el: link });

  // Evict oldest stylesheet when over the cap, but never evict pinned fonts
  while (cdnLinks.length > MAX_CDN_LINKS) {
    // Find the oldest non-pinned entry
    const evictIdx = cdnLinks.findIndex(entry => !pinnedFonts.has(entry.fontKey));
    if (evictIdx === -1) break; // all entries are pinned, don't evict anything
    const old = cdnLinks.splice(evictIdx, 1)[0];
    loaded.delete(old.key);
    loaded.delete(old.fontKey);
    old.el.remove();
  }
}

export function loadFont(font: { name: string; slug: string; source: string; googleFontsFamily?: string; id?: string }): void {
  if (typeof window === "undefined") return;

  const key = font.id || font.slug;
  if (loaded.has(key)) return;
  loaded.add(key);

  // Load the local fonts.css once — contains @font-face rules for all self-hosted .woff2 files
  if (!loaded.has("__css__")) {
    loaded.add("__css__");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${BASE_PATH}/fonts/fonts.css`;
    document.head.appendChild(link);
  }

  // Google Fonts CDN — works for google-fonts source, and also as a fallback
  // for "other"/DaFont fonts that happen to be on Google Fonts
  const gfFamily = font.googleFontsFamily || font.name;
  const gfKey = `gf-cdn-${gfFamily}`;
  if (!loaded.has(gfKey) && (font.source === "google-fonts" || font.source === "other")) {
    loaded.add(gfKey);
    addCdnLink(gfKey, key, `https://fonts.googleapis.com/css2?family=${gfFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`);
  }

  // Fontshare CDN
  if (font.source === "fontshare") {
    const cdnKey = `fs-cdn-${font.slug}`;
    if (!loaded.has(cdnKey)) {
      loaded.add(cdnKey);
      addCdnLink(cdnKey, key, `https://api.fontshare.com/v2/css?f[]=${font.slug}@100,200,300,400,500,600,700,800,900&display=swap`);
    }
  }
}

/**
 * Pin fonts so they cannot be evicted from the CDN cache.
 * Use on detail pages to ensure the page's fonts stay loaded.
 * Returns an unpin function to call on cleanup.
 */
export function pinFonts(fonts: { id?: string; slug: string }[]): () => void {
  const keys: string[] = [];
  for (const f of fonts) {
    const key = f.id || f.slug;
    pinnedFonts.add(key);
    keys.push(key);
  }
  return () => {
    for (const key of keys) pinnedFonts.delete(key);
  };
}

/**
 * Force-load fonts using the CSS Font Loading API.
 * Waits for document.fonts.ready (stylesheets parsed), then loads each font.
 * Retries until every font is confirmed loaded or max attempts reached.
 */
export function ensureFontsRendered(fontNames: string[]): void {
  if (typeof window === "undefined" || !document.fonts || fontNames.length === 0) return;

  const unique = [...new Set(fontNames)];

  const attempt = (remaining: number) => {
    const notLoaded = unique.filter(
      (name) => !document.fonts.check(`400 16px "${name}"`) || !document.fonts.check(`700 16px "${name}"`)
    );
    if (notLoaded.length === 0 || remaining <= 0) return;

    const loads: Promise<FontFace[]>[] = [];
    for (const name of notLoaded) {
      loads.push(document.fonts.load(`400 16px "${name}"`).catch(() => []));
      loads.push(document.fonts.load(`700 16px "${name}"`).catch(() => []));
    }
    Promise.all(loads).then(() => {
      // Re-check after a short delay and retry if any still missing
      setTimeout(() => attempt(remaining - 1), 400);
    });
  };

  // Wait for stylesheets to be parsed first, then start loading
  document.fonts.ready.then(() => attempt(6));

  // When CDN links are re-injected after eviction, the browser fetches them async.
  // document.fonts.ready won't wait for those new stylesheets — but loadingdone
  // fires each time a newly-parsed stylesheet's fonts finish loading.
  const onLoadingDone = () => attempt(3);
  document.fonts.addEventListener("loadingdone", onLoadingDone);
  setTimeout(() => document.fonts.removeEventListener("loadingdone", onLoadingDone), 8000);
}

/**
 * Resolves when all named fonts are confirmed loaded, or after a 3s timeout.
 * Call loadFont() for each font before calling this.
 */
export function waitForFonts(fontNames: string[]): Promise<void> {
  if (typeof window === "undefined" || !document.fonts || fontNames.length === 0) return Promise.resolve();
  const unique = [...new Set(fontNames)];
  return new Promise((resolve) => {
    const deadline = setTimeout(resolve, 3000);
    const check = async () => {
      await document.fonts.ready;
      const deadline2 = Date.now() + 3000;
      while (Date.now() < deadline2) {
        const allLoaded = unique.every(
          (name) => document.fonts.check(`400 16px "${name}"`) || document.fonts.check(`700 16px "${name}"`)
        );
        if (allLoaded) { clearTimeout(deadline); resolve(); return; }
        await new Promise(r => setTimeout(r, 100));
      }
      resolve();
    };
    check();
  });
}

export function loadGoogleFont(family: string): void {
  loadFont({ name: family, slug: family.toLowerCase().replace(/\s+/g, "-"), source: "google-fonts", googleFontsFamily: family });
}

export function loadFontshareFont(slug: string): void {
  loadFont({ name: slug, slug, source: "fontshare" });
}

export function getFontFamily(fontName: string, source: string): string {
  return `"${fontName}", system-ui, sans-serif`;
}

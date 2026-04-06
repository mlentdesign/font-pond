// Font loading utility
// Self-hosted .woff2 files in public/fonts/ are the primary source.
// CDN fallbacks (Google Fonts, Fontshare) provide backup coverage.

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const loaded = new Set<string>();

// Cap CDN stylesheets to prevent unbounded DOM growth
const MAX_CDN_LINKS = 40;
const cdnLinks: { key: string; el: HTMLLinkElement }[] = [];

function addCdnLink(key: string, href: string): void {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  cdnLinks.push({ key, el: link });

  // Evict oldest stylesheet when over the cap
  while (cdnLinks.length > MAX_CDN_LINKS) {
    const old = cdnLinks.shift()!;
    loaded.delete(old.key);
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
    addCdnLink(gfKey, `https://fonts.googleapis.com/css2?family=${gfFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`);
  }

  // Fontshare CDN
  if (font.source === "fontshare") {
    const cdnKey = `fs-cdn-${font.slug}`;
    if (!loaded.has(cdnKey)) {
      loaded.add(cdnKey);
      addCdnLink(cdnKey, `https://api.fontshare.com/v2/css?f[]=${font.slug}@100,200,300,400,500,600,700,800,900&display=swap`);
    }
  }
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

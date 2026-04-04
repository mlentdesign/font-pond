// Font loading utility
// Self-hosted .woff2 files in public/fonts/ are the primary source.
// CDN fallbacks (Google Fonts, Fontshare) provide backup coverage.

const loaded = new Set<string>();

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
    link.href = "/fonts/fonts.css";
    document.head.appendChild(link);
  }

  // Google Fonts CDN — works for google-fonts source, and also as a fallback
  // for "other"/DaFont fonts that happen to be on Google Fonts
  const gfFamily = font.googleFontsFamily || font.name;
  const gfKey = `gf-cdn-${gfFamily}`;
  if (!loaded.has(gfKey) && (font.source === "google-fonts" || font.source === "other")) {
    loaded.add(gfKey);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${gfFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  // Fontshare CDN
  if (font.source === "fontshare") {
    const cdnKey = `fs-cdn-${font.slug}`;
    if (!loaded.has(cdnKey)) {
      loaded.add(cdnKey);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://api.fontshare.com/v2/css?f[]=${font.slug}@100,200,300,400,500,600,700,800,900&display=swap`;
      document.head.appendChild(link);
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

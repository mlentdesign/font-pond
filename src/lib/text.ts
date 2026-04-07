/** Capitalize the first letter of each word */
export function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Capitalize just the first letter */
export function sentenceCase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Format a classification for display — capitalises each word, replaces hyphens with spaces */
export function formatClassification(raw: string): string {
  return raw
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Format contrast-type strings: capitalise classification words and ensure spaces around slashes */
export function formatContrastType(raw: string): string {
  if (!raw) return raw;
  // Capitalise known classification words wherever they appear
  let s = raw;
  const classWords: Record<string, string> = {
    "sans-serif": "Sans Serif",
    "slab-serif": "Slab Serif",
    serif: "Serif",
    sans: "Sans",
    display: "Display",
    monospace: "Monospace",
    script: "Script",
    handwritten: "Handwritten",
  };
  // Replace longer keys first to avoid partial matches
  for (const [k, v] of Object.entries(classWords).sort((a, b) => b[0].length - a[0].length)) {
    s = s.replace(new RegExp(`\\b${k}\\b`, "gi"), v);
  }
  // Ensure spaces around slashes
  s = s.replace(/\s*\/\s*/g, " / ");
  // Sentence-case the result (first letter uppercase)
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

/** Proper nouns that should keep their original casing in chips */
const CHIP_PROPER_NOUNS = new Set([
  "google fonts", "fontshare", "dafont",
]);

/** Convert a chip label to sentence case, preserving proper nouns */
export function chipCase(raw: string): string {
  const lower = raw.toLowerCase();
  if (CHIP_PROPER_NOUNS.has(lower)) return raw; // keep as-is
  // Replace hyphens with spaces, then sentence-case
  const spaced = lower.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Human-readable label for a font source */
export function getSourceLabel(source: string): string {
  if (source === "google-fonts") return "Google Fonts";
  if (source === "fontshare") return "Fontshare";
  return "DaFont";
}

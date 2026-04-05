/** Capitalize the first letter of each word */
export function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Capitalize just the first letter */
export function sentenceCase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Human-readable label for a font source */
export function getSourceLabel(source: string): string {
  if (source === "google-fonts") return "Google Fonts";
  if (source === "fontshare") return "Fontshare";
  return "DaFont";
}

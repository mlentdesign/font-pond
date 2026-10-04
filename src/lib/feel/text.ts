import type { Font } from "@/data/types";

// One searchable text per font. Shared by the build-time embedding script, the
// in-browser keyword fallback, and the hash that decides when to re-embed.
export function fontFeelText(f: Font): string {
  const parts: string[] = [
    `${f.name}.`,
    `${f.classification.replace(/-/g, " ")} typeface.`,
  ];
  if (f.subcategory) parts.push(`${f.subcategory}.`);
  if (f.moodCategory) parts.push(`Mood: ${f.moodCategory}.`);
  if (f.toneDescriptors.length) parts.push(`Feels ${f.toneDescriptors.join(", ")}.`);
  if (f.tags.length) parts.push(`Personality: ${f.tags.slice(0, 14).join(", ")}.`);
  if (f.distinctiveTraits.length) parts.push(`Traits: ${f.distinctiveTraits.slice(0, 5).join(", ")}.`);
  if (f.useCases.length) parts.push(`Good for ${f.useCases.slice(0, 8).join(", ")}.`);
  if (f.xHeightRatio) parts.push(`${f.xHeightRatio} x-height.`);
  if (f.apertureOpenness) parts.push(`${f.apertureOpenness} apertures.`);
  if (f.strokeContrast) parts.push(`${f.strokeContrast} stroke contrast.`);
  if (f.letterSpacing) parts.push(`${f.letterSpacing} letter spacing.`);
  if (f.screenReadabilityNotes) parts.push(f.screenReadabilityNotes);
  if (f.historicalNotes) parts.push(f.historicalNotes);
  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 900);
}

export function simpleDigest(s: string): string {
  // FNV-1a 32-bit, twice with different seeds -> 16 hex chars. Not security, just change detection.
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

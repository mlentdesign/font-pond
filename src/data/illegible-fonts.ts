// Fonts that are categorically illegible — individual letterforms are
// pictographic (barcode), absent (wavefont/redacted), or so heavily
// decorated that even headline use is borderline unreadable.
//
// Pairs using these fonts are still allowed (they can fit creative
// briefs), but their legibility score is capped at 1/10 and the pair's
// overall score is penalized so ranking reflects "this pair is hard
// to read."

export const SEVERELY_ILLEGIBLE_FONT_IDS = new Set<string>([
  // Barcode / scan / encoded — letters replaced with stripes
  "gf-libre-barcode-128",
  "gf-libre-barcode-128-text",
  "gf-libre-barcode-39",
  "gf-libre-barcode-39-extended",
  "gf-libre-barcode-39-extended-text",
  "gf-libre-barcode-39-text",
  "gf-libre-barcode-ean13-text",

  // Waveform / redaction — no letterforms
  "gf-wavefont",
  "gf-redacted",
  "gf-redacted-script",

  // Decorative shapes / outlines — letters buried in effects
  "gf-moirai-one",
  "gf-workbench",
  "gf-kumar-one-outline",
  "gf-splash",
]);

export function isSeverelyIllegible(fontId: string): boolean {
  return SEVERELY_ILLEGIBLE_FONT_IDS.has(fontId);
}

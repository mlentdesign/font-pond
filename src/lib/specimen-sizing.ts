// Shared specimen sizing for the year / designer / pair detail cards.
//
// Each card section shows two things, and both must fill the card without
// clipping or leaving dead space:
//   1. Big line  — "Aa Bb Cc Dd Ee Ff", nowrap, sized to fill the card width.
//   2. Small line — A–Z / a–z / 0–9 stacked, wraps at card width, fills the
//      height left under the big line.
//
// Previously each page carried its own copy of this math and they drifted
// (the pair page measured live with canvas even when metrics existed). This
// is the single source of truth — see project_font_pond_approaches_log.
import { RENDER_METRICS } from "@/data/gf-render-metrics";

// Small line is sized by advance width only; italic/swash/brush terminals
// extend past the advance. m[14] (smallInkOverflow) covers the measured part;
// this safety margin covers faux-rendering variance the file can't predict.
const SMALL_SAFETY = 1.10;
// Cap the small line relative to the big line so the hierarchy always reads.
// Relaxed from the old 0.45 — that cap was so tight the small line couldn't
// fill a tall card and looked stranded ("too short").
const SMALL_CAP_RATIO = 0.65;
// One outlier swash glyph can report an enormous overflow; clamp it so it
// can't collapse a whole font's small line.
const MAX_SMALL_OVERFLOW = 0.5;
// Gap under the big line, and between the three small rows (8px grid: 8 / 4).
const BIG_GAP = 8;
const SMALL_ROW_GAP = 4;
// A handful of fonts ship corrupt OS/2 metrics (minecraftia reports 44×,
// 28-days-later 16×). Unclamped, sectionH / lh crushes the big line to the
// 12px floor. Real line-heights never exceed ~3, so clamp there.
const MAX_LINE_HEIGHT = 3;

/**
 * Big-line line-height for a font, clamped to a sane range.
 * Exported so the card render and the sizing math always agree — if they
 * disagree the DOM box and the computed size desync and text clips.
 */
export function specimenLineHeight(slug: string): number {
  const m = RENDER_METRICS[slug];
  if (!m) return 1.2;
  return Math.min(MAX_LINE_HEIGHT, Math.max(1, m[9] + m[10]));
}

export interface SpecimenSizing {
  /** Big specimen line font size, px. */
  bigSize: number;
  /** Small specimen line font size, px. */
  smallSize: number;
  /** Line-height for the big line. */
  lh: number;
  /** Gap between the three small rows, px. */
  smallGap: number;
}

export interface SpecimenSizingOpts {
  /** A 2D canvas context, reused for fonts that lack precomputed metrics. */
  ctx: CanvasRenderingContext2D;
  /** Fully-formed CSS font-family string from getFontFamily(). */
  family: string;
  /** Weight the big line renders at (600 for headers, 400 for body). */
  bigWeight: number;
  /** Optional hard cap on big-line px (year/designer use 80; pair leaves it open). */
  maxBigPx?: number;
}

/**
 * Compute big + small specimen sizes for one card section.
 * Pure function of the section's measured width/height — no DOM writes.
 */
export function computeSpecimenSizing(
  slug: string,
  sectionW: number,
  sectionH: number,
  opts: SpecimenSizingOpts,
): SpecimenSizing {
  const { ctx, family, bigWeight, maxBigPx } = opts;
  const m = RENDER_METRICS[slug];

  // ── Big line — fills card width, never wraps ──
  let bigSize: number;
  let lh = 1.2;
  if (m) {
    // Big-line divisor: max(file-advance + ink overflow, browser-measured
    // extent) × 1.20. Tuned across the whole font set — do not alter.
    const divisor = Math.max(m[0] + (m[12] ?? 0), m[13] ?? 0) * 1.20;
    bigSize = Math.floor(sectionW / divisor);
    lh = specimenLineHeight(slug);
    if (maxBigPx != null) {
      const inkRatio = (m[11] + m[5]) || 1;
      bigSize = Math.min(bigSize, Math.floor(maxBigPx / inkRatio));
    }
  } else {
    // No precomputed metrics — measure live (≈57 uncached fonts).
    ctx.font = `${bigWeight} 36px ${family}`;
    const w = ctx.measureText("Aa Bb Cc Dd Ee Ff").width;
    bigSize = w > 0 ? Math.floor((36 * sectionW) / w) : 36;
  }
  bigSize = Math.max(12, Math.min(bigSize, Math.floor(sectionH / lh)));

  // ── Small line — stacked A–Z / a–z / 0–9, wraps at card width ──
  const availableH = sectionH - Math.ceil(bigSize * lh) - BIG_GAP;
  let smallSize = 14;
  if (availableH >= 14) {
    const overflow = m ? Math.min(MAX_SMALL_OVERFLOW, m[14] ?? 0) : 0;
    let lo = 14, hi = 300, best = 14;
    for (let i = 0; i < 14; i++) {
      const mid = Math.round((lo + hi) / 2);
      let upperW: number, lowerW: number, numsW: number;
      if (m) {
        // m[1..3] are per-em advances; add measured ink overflow + safety.
        upperW = (m[1] + overflow) * mid * SMALL_SAFETY;
        lowerW = (m[2] + overflow) * mid * SMALL_SAFETY;
        numsW  = (m[3] + overflow) * mid * SMALL_SAFETY;
      } else {
        ctx.font = `400 ${mid}px ${family}`;
        upperW = ctx.measureText("ABCDEFGHIJKLMNOPQRSTUVWXYZ").width * SMALL_SAFETY;
        lowerW = ctx.measureText("abcdefghijklmnopqrstuvwxyz").width * SMALL_SAFETY;
        numsW  = ctx.measureText("0123456789").width * SMALL_SAFETY;
      }
      const lines =
        Math.max(1, Math.ceil(upperW / sectionW)) +
        Math.max(1, Math.ceil(lowerW / sectionW)) +
        Math.max(1, Math.ceil(numsW / sectionW));
      const totalH = lines * mid + 2 * SMALL_ROW_GAP;
      if (totalH <= availableH) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    smallSize = Math.min(Math.max(14, best), Math.floor(bigSize * SMALL_CAP_RATIO));
  }

  return { bigSize, smallSize, lh, smallGap: SMALL_ROW_GAP };
}

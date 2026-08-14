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
// Margin applied to the LIVE canvas measurement (subpixel rounding, hinting).
// Smaller than the metric safeties because the live number already includes
// faux-bold widening and real ink extent.
const LIVE_SAFETY = 1.05;
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

/**
 * Vertical offset (in em) to apply to a single header letter so its cap-height
 * middle lands at its box's vertical centre. Returns a CSS-ready em string
 * usable directly in `transform: translateY(...)`.
 *
 * Mixed-font headers like the "FONT POND" ransom-note ticker look uneven
 * because every font's baseline sits at a different position inside the
 * line-box — items-center aligns the BOXES, not the GLYPHS. This shifts each
 * letter so the visible cap middles line up across the row.
 *
 * Math (with line-height: 1, so 1em = box height):
 *   • half-leading          = (1 − (m[9] + m[10])) / 2
 *                             (line-height 1 centres the font's ascent+descent
 *                             block inside the 1em box; fonts with big metrics
 *                             get NEGATIVE half-leading, i.e. the baseline
 *                             rides higher than m[9] alone predicts — this is
 *                             why long-tailed / deep-descent fonts drifted up)
 *   • baseline from box top = half-leading + m[9]
 *   • cap top from box top  = baseline − m[4]   (m[4] is the measured ink
 *                                                ascent, ≈ cap-height for
 *                                                FONT POND's all-caps text)
 *   • cap middle from top   = baseline − m[4] / 2
 *   • target (box centre)   = 0.5
 *   → offset = 0.5 − (half-leading + m[9] − m[4] / 2)
 *            = (m[4] + m[10] − m[9]) / 2
 *
 * Clamped to ±0.4em so corrupt OS/2 metrics (the same minecraftia / 28-days-
 * later class of fonts the specimen-card clamp guards against) can't fling a
 * letter out of the header.
 */
export function headerLetterOffset(slug: string): string {
  const m = RENDER_METRICS[slug];
  if (!m) return "0em";
  const raw = (m[4] + m[10] - m[9]) / 2;
  const clamped = Math.max(-0.4, Math.min(0.4, raw));
  return `${clamped.toFixed(3)}em`;
}

/**
 * Effective big-line divisor (spec-string width per em of font size) for a
 * font: the tuned metric divisor (×1.20 — do not alter) guarded by the LIVE
 * rendered extent (advance + ink overhang, ×1.05). Shrink-only: the live
 * number only wins when the real render is wider than the metrics predict
 * (scripts, faux-bolded/variable-weight families). Canvas resolves the same
 * family-fallback list the DOM uses, so this matches whatever is really on
 * screen. Returns 0 only if nothing is measurable (test stubs, no metrics).
 *
 * `sectionW / divisor` = the largest font size whose big line fits sectionW.
 * Used by the desktop card sizing AND as the width cap on the mobile
 * cap-height-normalized path (which otherwise clips wide fonts).
 */
export function specimenBigDivisor(
  slug: string,
  ctx: CanvasRenderingContext2D,
  family: string,
  bigWeight: number,
): number {
  const m = RENDER_METRICS[slug];
  ctx.font = `${bigWeight} 100px ${family}`;
  const t = ctx.measureText("Aa Bb Cc Dd Ee Ff");
  const live = Math.max(t.width, t.actualBoundingBoxRight ?? 0) / 100;
  const metric = m ? Math.max(m[0] + (m[12] ?? 0), m[13] ?? 0) * 1.20 : 0;
  return Math.max(metric, live * LIVE_SAFETY);
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

  // Live per-em extent of a string as the browser will actually render it —
  // advance width plus any ink overhanging the last glyph. Canvas resolves the
  // same family list the DOM uses, so this measures whatever font is really on
  // screen (webfont once loaded, fallback before). Returns 0 when the ctx
  // can't measure (test stubs), which disables the guard.
  const liveExtent = (text: string, weight: number): number => {
    ctx.font = `${weight} 100px ${family}`;
    const t = ctx.measureText(text);
    return Math.max(t.width, t.actualBoundingBoxRight ?? 0) / 100;
  };

  // ── Big line — fills card width, never wraps ──
  let bigSize: number;
  let lh = 1.2;
  const effDivisor = specimenBigDivisor(slug, ctx, family, bigWeight);
  bigSize = effDivisor > 0 ? Math.floor(sectionW / effDivisor) : 36;
  if (m) {
    lh = specimenLineHeight(slug);
    if (maxBigPx != null) {
      const inkRatio = (m[11] + m[5]) || 1;
      bigSize = Math.min(bigSize, Math.floor(maxBigPx / inkRatio));
    }
  }
  bigSize = Math.max(12, Math.min(bigSize, Math.floor(sectionH / lh)));

  // ── Small line — stacked A–Z / a–z / 0–9, wraps at card width ──
  const availableH = sectionH - Math.ceil(bigSize * lh) - BIG_GAP;
  let smallSize = 14;
  if (availableH >= 14) {
    const overflow = m ? Math.min(MAX_SMALL_OVERFLOW, m[14] ?? 0) : 0;
    // Per-em row widths: metric prediction guarded by the live measurement of
    // the rendered font (same shrink-only rule as the big line). Without
    // metrics the live number is all we have.
    const liveUpper = liveExtent("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 400) * LIVE_SAFETY;
    const liveLower = liveExtent("abcdefghijklmnopqrstuvwxyz", 400) * LIVE_SAFETY;
    const liveNums  = liveExtent("0123456789", 400) * LIVE_SAFETY;
    const upperEm = m ? Math.max((m[1] + overflow) * SMALL_SAFETY, liveUpper) : liveUpper;
    const lowerEm = m ? Math.max((m[2] + overflow) * SMALL_SAFETY, liveLower) : liveLower;
    const numsEm  = m ? Math.max((m[3] + overflow) * SMALL_SAFETY, liveNums)  : liveNums;
    let lo = 14, hi = 300, best = 14;
    for (let i = 0; i < 14; i++) {
      const mid = Math.round((lo + hi) / 2);
      const upperW = upperEm * mid;
      const lowerW = lowerEm * mid;
      const numsW  = numsEm * mid;
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

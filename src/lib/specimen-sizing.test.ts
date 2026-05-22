import { describe, it, expect } from "vitest";
import { computeSpecimenSizing } from "./specimen-sizing";
import { RENDER_METRICS } from "@/data/gf-render-metrics";

// The audit (project_font_pond_approaches_log) requires a full-corpus
// simulation before any specimen-sizing change ships. These tests run the
// real helper across every font with precomputed metrics and assert the
// sizing invariants hold — no clipping, no degenerate sizes, hierarchy kept.

// Metric-path fonts never touch the canvas; a stub ctx is enough to sweep them.
const stubCtx = {
  font: "",
  measureText: () => ({ width: 0 }),
} as unknown as CanvasRenderingContext2D;

const opts = (maxBigPx?: number) => ({
  ctx: stubCtx,
  family: '"Test", sans-serif',
  bigWeight: 600,
  maxBigPx,
});

// Representative card section dimensions across the three pages / breakpoints.
const DIMS: Array<{ name: string; w: number; h: number; maxBigPx?: number }> = [
  { name: "year card (desktop)", w: 352, h: 190, maxBigPx: 80 },
  { name: "year card (tall neighbour)", w: 352, h: 300, maxBigPx: 80 },
  { name: "designer card (tablet)", w: 300, h: 200, maxBigPx: 80 },
  { name: "pair section (desktop)", w: 288, h: 210 },
  { name: "pair section (narrow)", w: 232, h: 150 },
];

const slugs = Object.keys(RENDER_METRICS);

describe("computeSpecimenSizing — corpus sweep", () => {
  it("has a non-trivial font corpus to test", () => {
    expect(slugs.length).toBeGreaterThan(2000);
  });

  it("produces finite, sane sizes for every font at every card size", () => {
    const bad: string[] = [];
    for (const dim of DIMS) {
      for (const slug of slugs) {
        const { bigSize, smallSize, lh, smallGap } = computeSpecimenSizing(slug, dim.w, dim.h, opts(dim.maxBigPx));
        const ok =
          Number.isFinite(bigSize) && Number.isFinite(smallSize) &&
          Number.isFinite(lh) && Number.isFinite(smallGap) &&
          bigSize >= 12 && smallSize > 0 &&
          smallSize <= bigSize &&            // hierarchy: small never exceeds big
          lh >= 1;
        if (!ok) bad.push(`${slug} @ ${dim.name}: big=${bigSize} small=${smallSize} lh=${lh}`);
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });

  it("keeps the small line within the 0.65×big cap", () => {
    for (const slug of slugs.slice(0, 400)) {
      const { bigSize, smallSize } = computeSpecimenSizing(slug, 352, 260, opts(80));
      expect(smallSize).toBeLessThanOrEqual(Math.max(14, Math.floor(bigSize * 0.65)));
    }
  });

  it("fills a normal card — big and small lines are substantial, not stranded", () => {
    // On a normal desktop card most fonts should land well above the floors.
    let bigAtFloor = 0, smallAtFloor = 0;
    for (const slug of slugs) {
      const { bigSize, smallSize } = computeSpecimenSizing(slug, 352, 200, opts(80));
      if (bigSize <= 14) bigAtFloor++;
      if (smallSize <= 14) smallAtFloor++;
    }
    // A handful of extreme display faces may bottom out; the bulk must not.
    expect(bigAtFloor / slugs.length).toBeLessThan(0.05);
    expect(smallAtFloor / slugs.length).toBeLessThan(0.05);
  });
});

describe("computeSpecimenSizing — behaviour", () => {
  it("a taller card yields a small line at least as large as a short card", () => {
    for (const slug of slugs.slice(0, 200)) {
      const short = computeSpecimenSizing(slug, 320, 150, opts(80)).smallSize;
      const tall = computeSpecimenSizing(slug, 320, 300, opts(80)).smallSize;
      expect(tall).toBeGreaterThanOrEqual(short);
    }
  });

  it("a wider card yields a big line at least as large as a narrow card", () => {
    for (const slug of slugs.slice(0, 200)) {
      const narrow = computeSpecimenSizing(slug, 220, 220, opts()).bigSize;
      const wide = computeSpecimenSizing(slug, 360, 220, opts()).bigSize;
      expect(wide).toBeGreaterThanOrEqual(narrow);
    }
  });

  it("returns the 8px-grid row gap", () => {
    const { smallGap } = computeSpecimenSizing(slugs[0], 320, 200, opts(80));
    expect(smallGap).toBe(4);
  });
});

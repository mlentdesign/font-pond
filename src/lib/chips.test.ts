import { describe, expect, it } from "vitest";
import { fonts } from "@/data/fonts";
import { distinctiveTags, labelsOf } from "./chips";

describe("distinctiveTags for tile rows", () => {
  it("returns enough ranked chips to fill two rows on a wide card", () => {
    const font = fonts.find((f) => labelsOf(f).length >= 12);
    expect(font).toBeTruthy();
    const { chips, total } = distinctiveTags(font!);
    expect(chips.length).toBeGreaterThan(6);
    expect(total).toBeGreaterThanOrEqual(chips.length);
  });

  it("does not stop at two rare chips when the font has more labels", () => {
    const font = fonts.find((f) => labelsOf(f).length >= 12);
    expect(font).toBeTruthy();
    const { chips } = distinctiveTags(font!, undefined, 40);
    expect(chips.length).toBeGreaterThan(2);
  });

  it("never includes serif or sans-serif", () => {
    const font = fonts.find((f) => labelsOf(f).some((t) => t === "serif" || t === "sans-serif"));
    if (!font) return;
    const { chips } = distinctiveTags(font);
    expect(chips).not.toContain("serif");
    expect(chips).not.toContain("sans-serif");
  });
});

import { describe, it, expect } from "vitest";
import { fonts } from "@/data/fonts";
import { fontFeelText, simpleDigest } from "./text";
import { rankFontsKeyword, pairsFromRanking } from "./search";

describe("search by feel", () => {
  it("builds a non-empty text for every font", () => {
    for (const f of fonts) expect(fontFeelText(f).length).toBeGreaterThan(10);
  });

  it("digest changes when text changes", () => {
    expect(simpleDigest("a")).not.toBe(simpleDigest("b"));
    expect(simpleDigest("a")).toBe(simpleDigest("a"));
  });

  it("keyword fallback keeps monospace queries in monospace fonts", () => {
    const top = rankFontsKeyword("technical monospace", 10);
    expect(top.length).toBeGreaterThan(0);
    expect(top.filter((r) => r.font.serifSansCategory === "monospace").length).toBeGreaterThanOrEqual(5);
  });

  it("keyword fallback returns nothing for nonsense", () => {
    expect(rankFontsKeyword("qzxv blorp wug", 10)).toEqual([]);
  });

  it("builds pairs whose slug is header-body", () => {
    const pairs = pairsFromRanking(rankFontsKeyword("elegant serif wedding", 400), 6);
    expect(pairs.length).toBeGreaterThan(0);
    for (const p of pairs) expect(p.slug).toBe(`${p.headerFont.slug}-${p.bodyFont.slug}`);
  });
});

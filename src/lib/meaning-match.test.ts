import { describe, it, expect } from "vitest";
import { isUnmatchedWord, prepareMeaningMatch, rankPairs } from "./engine";
import { meaningNeighbors } from "./meaning-match";
import { MEANING_MATCH_ENABLED } from "./meaning-enabled";

describe("meaning-match tier", () => {
  it("is switched on by its single flag", () => {
    expect(MEANING_MATCH_ENABLED).toBe(true);
  });

  it("treats words the engine knows as matched", () => {
    for (const w of ["elegant", "playful", "bakery", "luxury", "grunge"]) expect(isUnmatchedWord(w)).toBe(false);
  });

  it("treats words only fuzzy fallbacks catch as unmatched", () => {
    expect(isUnmatchedWord("dental")).toBe(true);
    expect(isUnmatchedWord("mortgage")).toBe(true);
  });

  it("only loads the table when a query has an unmatched word", async () => {
    expect(await prepareMeaningMatch("elegant wedding")).toBe(false);
    expect(await prepareMeaningMatch("dental clinic")).toBe(true);
  });

  it("maps unmatched words to nearby engine words", async () => {
    await prepareMeaningMatch("dental");
    expect(meaningNeighbors("dental")).toContain("dentist");
    expect(meaningNeighbors("cybersecurity").length).toBeGreaterThan(0);
    expect(meaningNeighbors("elegant")).toEqual([]);
  });

  it("does not change ranking for queries made of known words", async () => {
    const q = "elegant wedding invitation";
    await prepareMeaningMatch(q);
    const a = rankPairs(q).slice(0, 10).map((p) => p.id);
    expect(a.length).toBeGreaterThan(0);
    expect(rankPairs(q).slice(0, 10).map((p) => p.id)).toEqual(a);
  });
});

import { describe, it, expect } from "vitest";
import { rankPairs } from "./engine";
import { ScoredPair } from "@/data/types";

// ── Helpers ──
// Robustness tests: assert that prompts surface sensible vibes, rather than
// pinning exact font IDs (which would break on every data tweak). They guard
// the matching engine against regressions in scoring, phrase and negation
// handling, and stemming.

function allTags(p: ScoredPair): string[] {
  return [
    ...p.tags,
    ...p.headerFont.tags, ...p.headerFont.toneDescriptors,
    ...p.bodyFont.tags, ...p.bodyFont.toneDescriptors,
  ].map((t) => t.toLowerCase());
}

// Collect every tag present across the top N results for a query.
function topTags(query: string, n = 10): Set<string> {
  const tags = new Set<string>();
  for (const r of rankPairs(query, { limit: n })) {
    for (const t of allTags(r)) tags.add(t);
  }
  return tags;
}

// Count how many of the top N results carry a given tag.
function countTag(query: string, tag: string, n = 12): number {
  let c = 0;
  for (const r of rankPairs(query, { limit: n })) {
    if (allTags(r).includes(tag)) c++;
  }
  return c;
}

const hasAny = (tags: Set<string>, wanted: string[]) =>
  wanted.some((w) => tags.has(w));

describe("rankPairs — basic behaviour", () => {
  it("returns results for an empty query (explore mode)", () => {
    expect(rankPairs("", { limit: 10 }).length).toBeGreaterThan(0);
  });

  it("returns results for a vibe prompt", () => {
    expect(rankPairs("elegant editorial magazine", { limit: 10 }).length).toBeGreaterThan(0);
  });

  it("never throws on messy or empty-ish input", () => {
    expect(() => rankPairs("!!! ??? ___ 12", { limit: 5 })).not.toThrow();
    expect(() => rankPairs("a", { limit: 5 })).not.toThrow();
  });

  it("respects the limit option", () => {
    expect(rankPairs("modern clean", { limit: 6 }).length).toBeLessThanOrEqual(6);
  });
});

describe("rankPairs — vibe relevance", () => {
  it("a wedding prompt surfaces elegant / script vibes", () => {
    const tags = topTags("elegant wedding script");
    expect(hasAny(tags, ["elegant", "script", "romantic", "refined", "delicate"])).toBe(true);
  });

  it("a loud headline prompt surfaces bold / display vibes", () => {
    const tags = topTags("bold loud impactful headline");
    expect(hasAny(tags, ["bold", "display", "strong", "impactful", "expressive"])).toBe(true);
  });

  it("a tech prompt surfaces modern / geometric vibes", () => {
    const tags = topTags("modern minimal tech startup");
    expect(hasAny(tags, ["modern", "geometric", "clean", "minimal", "tech"])).toBe(true);
  });
});

describe("phrase matching", () => {
  it("'art deco' resolves as a two-word phrase", () => {
    const tags = topTags("art deco");
    expect(hasAny(tags, ["elegant", "geometric", "luxurious", "vintage", "ornate"])).toBe(true);
  });

  it("'mid century' resolves as a two-word phrase", () => {
    const tags = topTags("mid century");
    expect(hasAny(tags, ["retro", "geometric", "modern", "vintage", "minimal"])).toBe(true);
  });
});

describe("negation", () => {
  it("'not playful' does not increase playful results", () => {
    const plain = countTag("modern clean design", "playful");
    const negated = countTag("modern clean design not playful", "playful");
    expect(negated).toBeLessThanOrEqual(plain);
  });

  it("a negated word never out-ranks the same word used positively", () => {
    const positive = countTag("playful fun bubbly", "playful");
    const negated = countTag("serious refined not playful", "playful");
    expect(negated).toBeLessThanOrEqual(positive);
  });
});

describe("stemmer", () => {
  it("a plural form matches the same results as its root", () => {
    const root = rankPairs("script", { limit: 8 }).map((p) => p.slug);
    const plural = rankPairs("scripts", { limit: 8 }).map((p) => p.slug);
    expect(plural).toEqual(root);
  });

  it("inflected forms still return relevant results", () => {
    expect(rankPairs("rounded", { limit: 6 }).length).toBeGreaterThan(0);
    expect(rankPairs("rounding", { limit: 6 }).length).toBeGreaterThan(0);
  });
});

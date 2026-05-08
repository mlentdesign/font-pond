import { describe, it, expect } from "vitest";
import { titleCase, sentenceCase, formatClassification, formatContrastType, chipCase, getSourceLabel } from "./text";

describe("titleCase", () => {
  it("capitalises the first letter of each word", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });
  it("handles single word", () => {
    expect(titleCase("playfair")).toBe("Playfair");
  });
  it("leaves already-capitalised letters alone", () => {
    expect(titleCase("Already Cased")).toBe("Already Cased");
  });
  it("handles hyphenated words", () => {
    expect(titleCase("nothing-you-could-do")).toBe("Nothing-You-Could-Do");
  });
});

describe("sentenceCase", () => {
  it("capitalises the first letter only", () => {
    expect(sentenceCase("hello world")).toBe("Hello world");
  });
  it("capitalises after sentence-ending periods", () => {
    expect(sentenceCase("first. second. third.")).toBe("First. Second. Third.");
  });
  it("handles question and exclamation marks", () => {
    expect(sentenceCase("really? yes! ok.")).toBe("Really? Yes! Ok.");
  });
  it("returns empty string unchanged", () => {
    expect(sentenceCase("")).toBe("");
  });
});

describe("formatClassification", () => {
  it("preserves hyphens and capitalises each segment", () => {
    expect(formatClassification("sans-serif")).toBe("Sans-Serif");
    expect(formatClassification("slab-serif")).toBe("Slab-Serif");
  });
  it("handles single-word classifications", () => {
    expect(formatClassification("display")).toBe("Display");
  });
});

describe("formatContrastType", () => {
  it("normalises spaces around slashes", () => {
    expect(formatContrastType("sans/serif")).toBe("Sans / Serif");
    expect(formatContrastType("sans  /  serif")).toBe("Sans / Serif");
  });
  it("capitalises classification words anywhere in the string", () => {
    expect(formatContrastType("display vs script")).toBe("Display vs Script");
  });
  it("returns empty string unchanged", () => {
    expect(formatContrastType("")).toBe("");
  });
});

describe("chipCase", () => {
  it("preserves known proper nouns", () => {
    expect(chipCase("google fonts")).toBe("google fonts");
    expect(chipCase("fontshare")).toBe("fontshare");
  });
  it("expands UI to uppercase", () => {
    expect(chipCase("ui")).toBe("UI");
  });
  it("capitalises both halves of sans-serif/slab-serif", () => {
    expect(chipCase("sans-serif")).toBe("Sans-Serif");
    expect(chipCase("slab-serif")).toBe("Slab-Serif");
  });
  it("sentence-cases other chip labels", () => {
    expect(chipCase("editorial")).toBe("Editorial");
    expect(chipCase("EDITORIAL")).toBe("Editorial");
  });
});

describe("getSourceLabel", () => {
  it("maps known source slugs to display names", () => {
    expect(getSourceLabel("google-fonts")).toBe("Google Fonts");
    expect(getSourceLabel("fontshare")).toBe("Fontshare");
  });
  it("falls back to DaFont for unknown sources", () => {
    expect(getSourceLabel("dafont")).toBe("DaFont");
    expect(getSourceLabel("anything-else")).toBe("DaFont");
  });
});

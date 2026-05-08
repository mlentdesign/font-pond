import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Patterns used by detail clients to extract a slug from window.location.pathname
 * when there's no slugOverride and no `?f=` / `?p=` / etc query param.
 * These mirror the regexes in FontDetailClient/PairDetailClient/etc.
 */
const SLUG_FROM_PATH = {
  font: /\/font\/([^/?#]+)/,
  pair: /\/pair\/([^/?#]+)/,
  designer: /\/designer\/([^/?#]+)/,
  year: /\/year\/([^/?#]+)/,
};

describe("slug-from-pathname extraction", () => {
  it("extracts font slug under /font-pond basePath", () => {
    expect("/font-pond/font/nothing-you-could-do".match(SLUG_FROM_PATH.font)?.[1]).toBe("nothing-you-could-do");
  });
  it("extracts font slug without basePath (dev server)", () => {
    expect("/font/playfair-display".match(SLUG_FROM_PATH.font)?.[1]).toBe("playfair-display");
  });
  it("does NOT match the bare /font-pond path as a font slug", () => {
    expect("/font-pond".match(SLUG_FROM_PATH.font)).toBeNull();
  });
  it("does NOT match the /font listing path", () => {
    expect("/font-pond/font".match(SLUG_FROM_PATH.font)).toBeNull();
    expect("/font-pond/font/".match(SLUG_FROM_PATH.font)).toBeNull();
  });
  it("strips trailing query strings and fragments", () => {
    expect("/font-pond/font/inter?from=pair".match(SLUG_FROM_PATH.font)?.[1]).toBe("inter");
    expect("/font-pond/font/inter#section".match(SLUG_FROM_PATH.font)?.[1]).toBe("inter");
  });
  it("extracts pair, designer, year slugs the same way", () => {
    expect("/font-pond/pair/inter-and-merriweather".match(SLUG_FROM_PATH.pair)?.[1]).toBe("inter-and-merriweather");
    expect("/font-pond/designer/erik-spiekermann".match(SLUG_FROM_PATH.designer)?.[1]).toBe("erik-spiekermann");
    expect("/font-pond/year/2010".match(SLUG_FROM_PATH.year)?.[1]).toBe("2010");
  });
});

/**
 * Regression guard: cleaned URLs in detail clients must include /font-pond.
 *
 * Earlier bug: `pathname.replace(/\/font.*$/, "")` was greedy and matched
 * the /font inside /font-pond, stripping the basePath. Resulting clean URLs
 * looked like `/font/slug` — which 404 when pasted (they hit the user-level
 * GitHub Pages site, not the project repo's 404.html SPA fallback).
 *
 * These tests read the source files and assert the path literal exists and
 * the buggy regex pattern is gone.
 */
const ROOT = resolve(__dirname, "../app");
const DETAIL_CLIENTS = [
  { file: "font/FontDetailClient.tsx", segment: "font" },
  { file: "pair/PairDetailClient.tsx", segment: "pair" },
  { file: "designer/DesignerDetailClient.tsx", segment: "designer" },
  { file: "year/YearDetailClient.tsx", segment: "year" },
];

describe("cleaned URL must include /font-pond basePath", () => {
  for (const { file, segment } of DETAIL_CLIENTS) {
    it(`${file} writes /font-pond/${segment}/\${slug}`, () => {
      const src = readFileSync(resolve(ROOT, file), "utf8");
      expect(src).toContain(`\`/font-pond/${segment}/\${slug}\``);
    });
    it(`${file} does NOT use the greedy regex base-derivation`, () => {
      const src = readFileSync(resolve(ROOT, file), "utf8");
      expect(src).not.toMatch(new RegExp(`pathname\\.replace\\(\\/\\\\\\/${segment}\\.\\*\\$\\/`));
    });
  }
});

/**
 * not-found.tsx is the SPA fallback served by GitHub Pages for any unmatched path.
 * It must detect /pair, /font, /designer, /year segments after stripping /font-pond.
 */
describe("not-found.tsx route detection", () => {
  const stripBase = (path: string) => path.replace("/font-pond", "").replace(/\/$/, "");

  it("strips /font-pond prefix", () => {
    expect(stripBase("/font-pond/font/inter")).toBe("/font/inter");
    expect(stripBase("/font-pond/")).toBe("");
  });

  const PATTERNS = {
    pair: /^\/pair\/(.+)/,
    font: /^\/font\/(.+)/,
    designer: /^\/designer\/(.+)/,
    year: /^\/year\/(.+)/,
  };

  it("detects font detail paths", () => {
    expect(stripBase("/font-pond/font/nothing-you-could-do").match(PATTERNS.font)?.[1])
      .toBe("nothing-you-could-do");
  });
  it("detects pair detail paths", () => {
    expect(stripBase("/font-pond/pair/abc-and-def").match(PATTERNS.pair)?.[1])
      .toBe("abc-and-def");
  });
  it("detects designer detail paths", () => {
    expect(stripBase("/font-pond/designer/erik-spiekermann").match(PATTERNS.designer)?.[1])
      .toBe("erik-spiekermann");
  });
  it("detects year detail paths", () => {
    expect(stripBase("/font-pond/year/2010").match(PATTERNS.year)?.[1]).toBe("2010");
  });
  it("does not match bare segment listings", () => {
    expect(stripBase("/font-pond/font").match(PATTERNS.font)).toBeNull();
    expect(stripBase("/font-pond/").match(PATTERNS.font)).toBeNull();
  });
});

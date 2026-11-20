import { beforeEach, describe, expect, it, vi } from "vitest";
import { FAVORITES_KEY, isFavorite, readFavoriteSlugs, toggleFavorite } from "./favorites";

function stubStorage() {
  const map = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, String(v)); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => { map.clear(); },
  });
  return map;
}

describe("favorite pair slugs", () => {
  beforeEach(() => {
    stubStorage();
  });

  it("starts empty", () => {
    expect(readFavoriteSlugs()).toEqual([]);
    expect(isFavorite("playfair-display-inter")).toBe(false);
  });

  it("saves a pair at the front and can remove it", () => {
    expect(toggleFavorite("playfair-display-inter")).toBe(true);
    expect(readFavoriteSlugs()).toEqual(["playfair-display-inter"]);
    expect(isFavorite("playfair-display-inter")).toBe(true);
    expect(toggleFavorite("dm-serif-display-dm-sans")).toBe(true);
    expect(readFavoriteSlugs()).toEqual(["dm-serif-display-dm-sans", "playfair-display-inter"]);
    expect(toggleFavorite("playfair-display-inter")).toBe(false);
    expect(readFavoriteSlugs()).toEqual(["dm-serif-display-dm-sans"]);
    expect(localStorage.getItem(FAVORITES_KEY)).toContain("dm-serif-display-dm-sans");
  });

  it("ignores a broken stored value", () => {
    localStorage.setItem(FAVORITES_KEY, "{not json");
    expect(readFavoriteSlugs()).toEqual([]);
  });
});

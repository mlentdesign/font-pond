import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTRIBUTOR_KEY, FAVORITES_KEY, contributorId, isFavorite, readFavoriteSlugs, reportFavoriteChange, toggleFavorite } from "./favorites";

function stubStorage() {
  const map = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, String(v)); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => { map.clear(); },
  });
  vi.stubGlobal("window", {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
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

  it("keeps one anonymous contributor id on this browser", () => {
    const a = contributorId();
    const b = contributorId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/i);
    expect(b).toBe(a);
    expect(localStorage.getItem(CONTRIBUTOR_KEY)).toBe(a);
  });

  it("posts heart and unheart without waiting", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    reportFavoriteChange({ slug: "playfair-display-inter", action: "heart", header: "Playfair Display", body: "Inter" });
    reportFavoriteChange({ slug: "playfair-display-inter", action: "unheart", header: "Playfair Display", body: "Inter" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const first = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    const second = JSON.parse(String(fetchMock.mock.calls[1][1].body));
    expect(first.action).toBe("heart");
    expect(second.action).toBe("unheart");
    expect(first.contributor).toBe(second.contributor);
    expect(first.slug).toBe("playfair-display-inter");
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/favorite");
  });
});

import { fonts } from "./fonts";
import type { Font } from "./types";

export interface YearGroup {
  year: number;
  slug: string;
  fonts: Font[];
}

function buildYearMap(): Map<string, YearGroup> {
  const map = new Map<string, YearGroup>();
  for (const font of fonts) {
    if (!font.year) continue;
    const key = String(font.year);
    if (!map.has(key)) {
      map.set(key, { year: font.year, slug: key, fonts: [] });
    }
    map.get(key)!.fonts.push(font);
  }
  return map;
}

export const yearsBySlug = buildYearMap();

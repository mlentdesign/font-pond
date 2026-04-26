import { fonts } from "./fonts";
import type { Font } from "./types";

export interface Designer {
  name: string;
  slug: string;
  fonts: Font[];
}

export function designerToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function splitDesigners(designerStr: string): string[] {
  return designerStr.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildDesignerMap(): Map<string, Designer> {
  const map = new Map<string, Designer>();
  for (const font of fonts) {
    if (!font.designer) continue;
    const names = splitDesigners(font.designer);
    for (const name of names) {
      const slug = designerToSlug(name);
      if (!map.has(slug)) {
        map.set(slug, { name, slug, fonts: [] });
      }
      map.get(slug)!.fonts.push(font);
    }
  }
  return map;
}

export const designersBySlug: Map<string, Designer> = buildDesignerMap();

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

// Split on both ", " and " & " delimiters
export function splitDesigners(designerStr: string): string[] {
  return designerStr
    .split(/,\s*|\s+&\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const ITF = "Indian Type Foundry";
const ITF_SLUG = designerToSlug(ITF);

function addFontToDesigner(map: Map<string, Designer>, name: string, font: Font) {
  const slug = designerToSlug(name);
  if (!map.has(slug)) {
    map.set(slug, { name, slug, fonts: [] });
  }
  map.get(slug)!.fonts.push(font);
}

function buildDesignerMap(): Map<string, Designer> {
  const map = new Map<string, Designer>();

  for (const font of fonts) {
    const names = font.designer ? splitDesigners(font.designer) : [];

    for (const name of names) {
      addFontToDesigner(map, name, font);
    }

    // All Fontshare fonts belong to Indian Type Foundry as the foundry.
    // Only add ITF if it isn't already credited as a named designer.
    if (font.source === "fontshare") {
      const alreadyCredited = names.some((n) => designerToSlug(n) === ITF_SLUG);
      if (!alreadyCredited) {
        addFontToDesigner(map, ITF, font);
      }
    }
  }

  return map;
}

export const designersBySlug: Map<string, Designer> = buildDesignerMap();

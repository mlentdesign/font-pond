import { fontsById } from "@/data/fonts";
import { ensureDynamicPairs, getPairOrConstruct } from "@/data/pairs";
import type { ScoredPair } from "@/data/types";

export const FAVORITES_KEY = "font-pond-favorites";
export const FAVORITES_EVENT = "font-pond-favorites-changed";

function emit(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { slugs } }));
}

export function readFavoriteSlugs(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string" && s.length > 0);
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return readFavoriteSlugs().includes(slug);
}

/** Adds or removes a pair slug. Newest favorites sit at the front. Returns whether it is saved after the toggle. */
export function toggleFavorite(slug: string): boolean {
  if (!slug) return false;
  const current = readFavoriteSlugs();
  const saved = current.includes(slug);
  const next = saved ? current.filter((s) => s !== slug) : [slug, ...current.filter((s) => s !== slug)];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {}
  emit(next);
  return !saved;
}

export function subscribeFavorites(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === FAVORITES_KEY || e.key === null) cb();
  };
  window.addEventListener(FAVORITES_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function scoredFavorites(slugs: string[] = readFavoriteSlugs()): ScoredPair[] {
  ensureDynamicPairs();
  const out: ScoredPair[] = [];
  for (const slug of slugs) {
    const pair = getPairOrConstruct(slug);
    if (!pair) continue;
    const headerFont = fontsById.get(pair.headerFontId);
    const bodyFont = fontsById.get(pair.bodyFontId);
    if (!headerFont || !bodyFont) continue;
    out.push({
      ...pair,
      relevanceScore: 0,
      promptFitReason: pair.shortExplanation,
      headerFont,
      bodyFont,
    });
  }
  return out;
}

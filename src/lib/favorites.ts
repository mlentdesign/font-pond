import { fontsById } from "@/data/fonts";
import { ensureDynamicPairs, getPairOrConstruct } from "@/data/pairs";
import type { ScoredPair } from "@/data/types";

export const FAVORITES_KEY = "font-pond-favorites";
export const FAVORITES_EVENT = "font-pond-favorites-changed";
export const CONTRIBUTOR_KEY = "font-pond-contributor-id";
const FAVORITE_API = "https://fontpond.melware.art/api/favorite";

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

export function contributorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(CONTRIBUTOR_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(CONTRIBUTOR_KEY, created);
    return created;
  } catch {
    return "";
  }
}

/** Fire-and-forget heart/unheart for the private counts sheet. Local save already happened. */
export function reportFavoriteChange(opts: {
  slug: string;
  action: "heart" | "unheart";
  header?: string;
  body?: string;
}): void {
  if (typeof window === "undefined" || !opts.slug) return;
  const contributor = contributorId();
  if (!contributor) return;
  const payload = JSON.stringify({
    slug: opts.slug,
    action: opts.action,
    contributor,
    header: opts.header ?? "",
    body: opts.body ?? "",
  });
  try {
    void fetch(FAVORITE_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {}
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

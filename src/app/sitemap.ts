import { FEEL_ENABLED } from "@/lib/feel/enabled";
import type { MetadataRoute } from "next";
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
import { designersBySlug } from "@/data/designers";
import { yearsBySlug } from "@/data/years";

export const dynamic = "force-static";

const BASE = "https://fontpond.melware.art";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/database`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...(FEEL_ENABLED ? [{ url: `${BASE}/feel`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 }] : []),
    { url: `${BASE}/privacy.html`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms.html`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const fontPages: MetadataRoute.Sitemap = fonts.map((f) => ({
    url: `${BASE}/font/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const pairPages: MetadataRoute.Sitemap = fontPairs.map((p) => ({
    url: `${BASE}/pair/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const designerPages: MetadataRoute.Sitemap = [...designersBySlug.values()].map((d) => ({
    url: `${BASE}/designer/${d.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5,
  }));
  const yearPages: MetadataRoute.Sitemap = [...yearsBySlug.values()].map((y) => ({
    url: `${BASE}/year/${y.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4,
  }));

  return [...staticPages, ...fontPages, ...pairPages, ...designerPages, ...yearPages];
}

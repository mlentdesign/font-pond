import type { MetadataRoute } from "next";
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";

export const dynamic = "force-static";

const BASE = "https://mlentdesign.github.io/font-pond";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/database`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
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

  return [...staticPages, ...fontPages, ...pairPages];
}

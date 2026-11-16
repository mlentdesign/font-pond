// Build-time list of every font and pair page, read by scripts/prerender-seo-pages.mjs
// to give each clean URL its own static file (so search engines get a 200 and a real title).
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
import { legacyPairs } from "@/data/legacy-pairs";
import { designersBySlug } from "@/data/designers";
import { yearsBySlug } from "@/data/years";

export const dynamic = "force-static";

export function GET() {
  const byId = new Map(fonts.map((f) => [f.id, f]));
  const body = {
    fonts: fonts.map((f) => ({
      slug: f.slug,
      name: f.name,
      classification: f.classification,
      designer: f.designer,
      year: f.year,
      tones: (f.toneDescriptors || []).slice(0, 3),
    })),
    pairs: [...fontPairs, ...legacyPairs()].map((p) => ({
      slug: p.slug,
      heading: byId.get(p.headerFontId)?.name || null,
      body: byId.get(p.bodyFontId)?.name || null,
      summary: p.shortExplanation || p.toneSummary || "",
    })),
    designers: [...designersBySlug.values()].map((d) => ({ slug: d.slug, name: d.name, count: d.fonts.length, examples: d.fonts.slice(0, 3).map((f) => f.name) })),
    years: [...yearsBySlug.values()].map((y) => ({ slug: y.slug, year: y.year, count: y.fonts.length, examples: y.fonts.slice(0, 3).map((f) => f.name) })),
  };
  return Response.json(body);
}

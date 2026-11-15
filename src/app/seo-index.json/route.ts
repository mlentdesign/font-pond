// Build-time list of every font and pair page, read by scripts/prerender-seo-pages.mjs
// to give each clean URL its own static file (so search engines get a 200 and a real title).
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";

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
    pairs: fontPairs.map((p) => ({
      slug: p.slug,
      heading: byId.get(p.headerFontId)?.name || null,
      body: byId.get(p.bodyFontId)?.name || null,
      summary: p.shortExplanation || p.toneSummary || "",
    })),
  };
  return Response.json(body);
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fontsBySlug, fontsById } from "@/data/fonts";
import { getPairsWithFont } from "@/lib/engine";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { titleCase, sentenceCase, getSourceLabel } from "@/lib/text";
import { pairsBySlug } from "@/data/pairs";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";
import { ChipGroup } from "@/components/ChipGroup";
import { PairPreviewGrid } from "@/components/PairPreviewGrid";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-neutral-100 last:border-0" style={{ padding: "12px 24px" }}>
      <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}>{label.toUpperCase()}</dt>
      <dd className="text-neutral-700 text-right max-w-[60%]" style={{ fontSize: "16px" }}>{sentenceCase(value)}</dd>
    </div>
  );
}

export default function FontDetailPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("f") || "";
  const fromPair = searchParams.get("from");

  const font = fontsBySlug.get(slug);

  // Build breadcrumb trail
  const crumbs: { label: string; href?: string }[] = [];
  if (fromPair) {
    const pair = pairsBySlug.get(fromPair);
    if (pair) {
      const hf = fontsById.get(pair.headerFontId);
      const bf = fontsById.get(pair.bodyFontId);
      if (hf && bf) crumbs.push({ label: `${hf.name} + ${bf.name}`, href: `/pair?p=${fromPair}` });
    }
  }
  if (font) crumbs.push({ label: font.name });

  useEffect(() => {
    if (font) {
      loadFont(font);
      // Load similar fonts
      for (const sf of font.similarFonts) {
        const similar = fontsBySlug.get(sf);
        if (similar) loadFont(similar);
      }
    }
  }, [font]);

  const pairsUsing = font ? getPairsWithFont(font.id) : [];

  if (!font) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400">Font not found.</p>
      </div>
    );
  }

  const family = getFontFamily(font.name, font.source);
  const sourceLabel = getSourceLabel(font.source);

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main id="main-content" className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <Breadcrumb crumbs={crumbs} />

        {/* Font name, source, and download */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between" style={{ marginBottom: "24px", gap: "16px" }}>
          <div>
            <h2 className="text-3xl font-semibold text-neutral-900 mb-1">{font.name}</h2>
            <p className="text-sm text-neutral-400">
              {font.designer && `By ${font.designer}`}
              {font.year && `${font.designer ? " · " : ""}${font.year}`}
              {(font.designer || font.year) ? ` · ${sourceLabel}` : sourceLabel}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 mt-1">
            {font.sourceUrl && (
              <a
                href={font.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="outline-btn font-medium rounded-lg transition-colors" style={{ fontSize: "16px", padding: "8px 24px" }}
              >
                Download ↗
              </a>
            )}
          </div>
        </div>

        {/* Specimen */}
        <SectionCard style={{ marginBottom: "24px" }}>
          <div className="space-y-4">
            <p style={{ fontFamily: family, fontWeight: 700, fontSize: "48px" }} className="text-neutral-900 leading-tight">
              The quick brown fox
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "32px" }} className="text-neutral-700 leading-snug">
              jumps over the lazy dog
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "16px", lineHeight: 1.7 }} className="text-neutral-600">
              Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "14px", lineHeight: 1.6 }} className="text-neutral-500">
              At 14px: Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.
            </p>
          </div>

          {/* Alphabet */}
          <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="text-neutral-600 mb-2">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="text-neutral-600 mb-2">
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="text-neutral-600">
              0123456789 !@#$%^&*()-=+[]{'{'}|;:&apos;,./&lt;&gt;?
            </p>
          </div>

          {/* Weight samples */}
          {font.weights.length > 1 && (
            <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
              <p className="uppercase tracking-wider text-neutral-400 mb-3" style={{ fontSize: "12px" }}>WEIGHTS</p>
              <div className="space-y-2">
                {font.weights.map((w) => (
                  <p key={w} style={{ fontFamily: family, fontWeight: w, fontSize: "18px" }} className="text-neutral-700">
                    {w} — The quick brown fox jumps over the lazy dog
                  </p>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Details — two columns */}
        <div className="two-col-grid" style={{ marginBottom: "24px" }}>
          <SectionCard noPadding style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <dl>
              <InfoRow label="Classification" value={font.classification} />
              <InfoRow label="Subcategory" value={font.subcategory} />
              <InfoRow label="Category" value={font.serifSansCategory} />
              <InfoRow label="Variable font" value={font.variableFont ? "Yes" : "No"} />
              <InfoRow label="Weights" value={font.weights.join(", ")} />
              <InfoRow label="Styles" value={font.styles.join(", ")} />
              <InfoRow label="License" value={font.licenseType} />
              <InfoRow label="Header suitable" value={font.isHeaderSuitable ? "Yes" : "No"} />
              <InfoRow label="Body suitable" value={font.isBodySuitable ? "Yes" : "Not recommended"} />
              {font.bodyLegibilityScore && (
                <InfoRow label="Body legibility" value={`${font.bodyLegibilityScore}/10`} />
              )}
            </dl>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {font.distinctiveTraits.length > 0 && (
                <ChipGroup label="DISTINCTIVE TRAITS" chips={font.distinctiveTraits} />
              )}
              {font.toneDescriptors.length > 0 && (
                <ChipGroup label="TONE" chips={font.toneDescriptors} />
              )}
              {font.useCases.length > 0 && (
                <ChipGroup label="USE CASES" chips={font.useCases} />
              )}
              {font.screenReadabilityNotes && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>SCREEN READABILITY</p>
                  <p className="text-xs text-neutral-600 leading-relaxed">{font.screenReadabilityNotes}</p>
                </div>
              )}
              {font.historicalNotes && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>HISTORY</p>
                  <p className="text-xs text-neutral-600 leading-relaxed">{font.historicalNotes}</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* All characteristics */}
        {font.tags.length > 0 && (
          <SectionCard style={{ marginBottom: "24px" }}>
            <ChipGroup
              label="ALL CHARACTERISTICS"
              chips={[...new Set(font.tags)].filter(t => t.split("-").length < 3 && t.length <= 25)}
            />
          </SectionCard>
        )}

        {/* Similar fonts */}
        {font.similarFonts.length > 0 && (() => {
          const similarFonts = font.similarFonts
            .map((sf) => fontsBySlug.get(sf))
            .filter((f): f is import("@/data/types").Font => !!f);
          // Cap at even grid: 1→1, 2→2, 3→3, 4→4, 5→4, 6+→show all
          const capped = similarFonts.length === 5 ? similarFonts.slice(0, 4) : similarFonts;
          const gridCols = capped.length === 1 ? "1fr" : capped.length === 2 ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
          if (capped.length === 0) return null;
          return (
            <div className="detail-subheading" style={{ marginBottom: "24px" }}>
              <h3 className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>Similar fonts</h3>
              <div className={capped.length <= 2 ? "similar-fonts-grid-2" : "similar-fonts-grid"} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                {capped.map((sf) => {
                  const sfFamily = getFontFamily(sf.name, sf.source);
                  const sfSource = getSourceLabel(sf.source);
                  const sfChips = [...new Set([...sf.tags, ...sf.toneDescriptors].map(t => t.toLowerCase()))]
                    .filter(t => t.split("-").length < 3 && t.length <= 25);
                  return (
                    <Link
                      key={sf.slug}
                      href={`/font?f=${sf.slug}`}
                      className="block border border-neutral-200 rounded-xl bg-white p-6 hover:border-neutral-300 hover:shadow-sm transition-all overflow-hidden"
                    >
                      <div className="flex items-baseline justify-between mb-4">
                        <div className="min-w-0 flex-1 mr-3">
                          <span className="text-lg font-semibold text-neutral-900 block break-words">
                            {sf.name}
                          </span>
                        </div>
                        <span className="shrink-0 bg-neutral-100 text-neutral-500 rounded-md" style={{ fontSize: "14px", padding: "4px 12px" }}>
                          {sfSource}
                        </span>
                      </div>
                      <div
                        className="text-4xl leading-tight mb-4 text-neutral-800 break-words"
                        style={{ fontFamily: sfFamily, fontWeight: 600 }}
                      >
                        Aa Bb Cc Dd Ee Ff Gg
                      </div>
                      <div
                        className="leading-relaxed text-neutral-600 mb-4 break-words"
                        style={{ fontFamily: sfFamily, fontWeight: 400, fontSize: "16px" }}
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                      </div>
                      <div className="mb-4">
                        <ChipGroup label="CHARACTERISTICS" chips={sfChips} maxVisible={8} maxLines={2} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-neutral-500" style={{ fontSize: "16px" }}>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>DESIGNER</span>
                          <p>{sf.designer || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>CLASSIFICATION</span>
                          <p>{titleCase(sf.classification)}</p>
                        </div>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>LICENSE</span>
                          <p>{titleCase(sf.licenseType)}</p>
                        </div>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>VARIABLE</span>
                          <p>{sf.variableFont ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Pairs using this font */}
        {pairsUsing.length > 0 && (
          <PairPreviewGrid pairs={pairsUsing} title={`Pairs using ${font.name}`} />
        )}
      </main>
    </div>
  );
}

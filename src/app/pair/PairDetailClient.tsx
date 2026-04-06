"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { pairsBySlug, getPairOrConstruct } from "@/data/pairs";
import { fontsById } from "@/data/fonts";
import { getRelatedPairs } from "@/lib/engine";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { titleCase, sentenceCase, getSourceLabel } from "@/lib/text";
import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";
import { ChipGroup } from "@/components/ChipGroup";
import { PairPreviewGrid } from "@/components/PairPreviewGrid";
import { SampleTextInputs } from "@/components/SampleTextInputs";

function FontSection({
  font,
  role,
  pairSlug,
}: {
  font: import("@/data/types").Font;
  role: "Header" | "Body";
  pairSlug: string;
}) {
  const family = getFontFamily(font.name, font.source);
  const sourceLabel = getSourceLabel(font.source);

  const allChips = [...new Set([...font.tags, ...font.toneDescriptors].map(t => t.toLowerCase()))]
    .filter(t => t.split("-").length < 3 && t.length <= 25);

  return (
    <Link
      href={`/font?f=${font.slug}&from=${pairSlug}`}
      className="block border border-neutral-200 rounded-xl bg-white p-6 hover:border-neutral-300 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="flex items-baseline justify-between mb-4">
        <div className="min-w-0 flex-1 mr-3">
          <span className="uppercase tracking-wider text-neutral-400 block mb-1" style={{ fontSize: "12px" }}>
            {role === "Header" ? "HEADER FONT" : "BODY FONT"}
          </span>
          <span className="text-lg font-semibold text-neutral-900 block break-words">
            {font.name}
          </span>
        </div>
        <span className="shrink-0 bg-neutral-100 text-neutral-500 rounded-md" style={{ fontSize: "14px", padding: "4px 12px" }}>
          {sourceLabel}
        </span>
      </div>

      {/* Specimen */}
      <div
        className="text-4xl leading-tight mb-4 text-neutral-800 break-words"
        style={{ fontFamily: family, fontWeight: role === "Header" ? 600 : 400 }}
      >
        Aa Bb Cc Dd Ee Ff Gg
      </div>
      <div
        className="leading-relaxed text-neutral-600 mb-4 break-words"
        style={{ fontFamily: family, fontWeight: 400, fontSize: "16px" }}
      >
        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
      </div>

      {/* Keyword chips */}
      <div className="mb-4">
        <ChipGroup label="CHARACTERISTICS" chips={allChips} maxVisible={8} maxLines={2} />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-neutral-500" style={{ fontSize: "16px" }}>
        <div>
          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>DESIGNER</span>
          <p>{font.designer || "Unknown"}</p>
        </div>
        <div>
          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>CLASSIFICATION</span>
          <p>{titleCase(font.classification)}</p>
        </div>
        <div>
          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>LICENSE</span>
          <p>{titleCase(font.licenseType)}</p>
        </div>
        <div>
          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>VARIABLE</span>
          <p>{font.variableFont ? "Yes" : "No"}</p>
        </div>
      </div>
    </Link>
  );
}

export default function PairDetailPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("p") || "";
  const { sampleHeadline, sampleBody, addToHistory } = useAppState();

  const pair = pairsBySlug.get(slug) || getPairOrConstruct(slug);
  const headerFont = pair ? fontsById.get(pair.headerFontId) : undefined;
  const bodyFont = pair ? fontsById.get(pair.bodyFontId) : undefined;

  useEffect(() => {
    if (headerFont) loadFont(headerFont);
    if (bodyFont) loadFont(bodyFont);
  }, [headerFont, bodyFont]);

  useEffect(() => {
    if (pair && headerFont && bodyFont) {
      addToHistory({
        pairId: pair.id,
        pairSlug: pair.slug,
        headerFontName: headerFont.name,
        bodyFontName: bodyFont.name,
        viewedAt: Date.now(),
      });
    }
  }, [pair, headerFont, bodyFont, addToHistory]);

  const related = pair ? getRelatedPairs(pair.id, 3) : [];

  if (!pair || !headerFont || !bodyFont) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400">Pair not found.</p>
      </div>
    );
  }

  const headline = sampleHeadline || DEFAULT_HEADLINE;
  const body = sampleBody || DEFAULT_BODY;
  const headerFamily = getFontFamily(headerFont.name, headerFont.source);
  const bodyFamily = getFontFamily(bodyFont.name, bodyFont.source);

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main id="main-content" className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <Breadcrumb crumbs={[{ label: `${headerFont.name} + ${bodyFont.name}` }]} />

        {/* Pair specimen */}
        <SectionCard style={{ marginBottom: "24px" }}>
          <h2
            className="text-4xl md:text-5xl leading-tight mb-4"
            style={{ fontFamily: headerFamily, fontWeight: 700, color: "var(--text-heading)" }}
          >
            {headline}
          </h2>
          <p
            className="text-neutral-600 leading-relaxed max-w-2xl"
            style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "16px", lineHeight: 1.7 }}
          >
            {body}
          </p>

          {/* Preview settings */}
          <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
            <SampleTextInputs alwaysShow />
          </div>

          {/* Scale suggestion */}
          <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
            <p className="uppercase tracking-wider text-neutral-400 mb-3" style={{ fontSize: "12px" }}>
              SUGGESTED SCALE
            </p>
            <div className="space-y-2">
              <p style={{ fontFamily: headerFamily, fontWeight: 700, fontSize: "36px" }} className="text-neutral-800">H1 — 36px Bold</p>
              <p style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "24px" }} className="text-neutral-800">H2 — 24px Semibold</p>
              <p style={{ fontFamily: headerFamily, fontWeight: 500, fontSize: "18px" }} className="text-neutral-700">H3 — 18px Medium</p>
              <p style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "16px" }} className="text-neutral-600">Body — 16px Regular</p>
              <p style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "14px" }} className="text-neutral-500">Small — 14px Regular</p>
            </div>
          </div>
        </SectionCard>

        {/* Why this works */}
        <SectionCard className="overflow-hidden" style={{ marginBottom: "24px" }}>
          <h3 className="uppercase tracking-wider text-neutral-400 font-medium" style={{ fontSize: "12px", marginBottom: "8px" }}>WHY THIS WORKS</h3>
          <p className="text-neutral-700 leading-relaxed" style={{ fontSize: "16px" }}>{sentenceCase(pair.rationale)}</p>
        </SectionCard>

        {/* Details card */}
        <SectionCard className="overflow-hidden" style={{ marginBottom: "24px" }}>
          <dl>
            <div style={{ marginBottom: "16px" }}>
              <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>TONE</dt>
              <dd className="text-neutral-700" style={{ fontSize: "16px" }}>{sentenceCase(pair.toneSummary)}</dd>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>CONTRAST TYPE</dt>
              <dd className="text-neutral-700" style={{ fontSize: "16px" }}>{titleCase(pair.contrastType)}</dd>
            </div>
            <div className="grid grid-cols-3" style={{ gap: "16px" }}>
              <div>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>HIERARCHY</dt>
                <dd className="text-neutral-700 font-medium" style={{ fontSize: "16px" }}>{pair.hierarchyStrength}/10</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>LEGIBILITY</dt>
                <dd className="text-neutral-700 font-medium" style={{ fontSize: "16px" }}>{pair.bodyLegibilityScore}/10</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>PRACTICALITY</dt>
                <dd className="text-neutral-700 font-medium" style={{ fontSize: "16px" }}>{pair.practicalityScore}/10</dd>
              </div>
            </div>
          </dl>

          <div style={{ borderTop: "1px solid var(--divider)", marginTop: "24px", paddingTop: "24px", marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
            <ChipGroup label="USE CASES" chips={pair.useCases} />
          </div>
        </SectionCard>

        {/* Font sections — two columns */}
        <div className="two-col-grid" style={{ marginBottom: "24px" }}>
          <FontSection font={headerFont} role="Header" pairSlug={slug} />
          <FontSection font={bodyFont} role="Body" pairSlug={slug} />
        </div>

        {/* Related pairings */}
        {related.length > 0 && (
          <PairPreviewGrid
            pairs={related}
            title="Other interesting pairings for you"
            initialVisible={3}
            loadMoreIncrement={3}
            headlineText={sampleHeadline || "The quick brown fox"}
            showRationale
          />
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { pairsBySlug, getPairOrConstruct } from "@/data/pairs";
import { fontsById } from "@/data/fonts";
import { getRelatedPairs } from "@/lib/engine";
import { loadFont, getFontFamily, pinFonts, ensureFontsRendered } from "@/lib/fonts";
import { titleCase, sentenceCase, getSourceLabel, formatClassification, formatContrastType, chipCase, fontHasNumbers } from "@/lib/text";
import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { FishingLine } from "@/components/FishingLine";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";
import { ChipGroup } from "@/components/ChipGroup";
import { PairPreviewGrid } from "@/components/PairPreviewGrid";
import { SampleTextInputs } from "@/components/SampleTextInputs";
import { LabelWithTooltip } from "@/components/InfoTooltip";

function FontSection({
  font,
  role,
  pairSlug,
  onNavigate,
}: {
  font: import("@/data/types").Font;
  role: "Header" | "Body";
  pairSlug: string;
  onNavigate: (slug: string) => void;
}) {
  const family = getFontFamily(font.name, font.source);
  const sourceLabel = getSourceLabel(font.source);

  const allChips = [...new Set([...font.tags, ...font.toneDescriptors].map(t => t.toLowerCase()))]
    .filter(t => t.split("-").length < 3 && t.length <= 25)
    .map(chipCase);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => onNavigate(font.slug)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate(font.slug); } }}
      onMouseDown={(e) => e.preventDefault()}
      className="group flex flex-col border border-neutral-200 rounded-xl bg-white p-6 card-hover hover:border-neutral-300 hover:shadow-sm overflow-hidden cursor-pointer"
      style={{ position: "relative" }}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-3">
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", marginBottom: "2px" }}>
            {role === "Header" ? "HEADER FONT" : "BODY FONT"}
          </span>
          <span className="text-lg font-semibold text-neutral-900 block leading-tight break-words">
            {font.name}
          </span>
        </div>
        {font.sourceUrl ? (
          <a
            href={font.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 btn-generate font-medium rounded-lg"
            style={{ fontSize: "16px", padding: "8px 24px", textDecoration: "none" }}
          >
            {sourceLabel} ↗
          </a>
        ) : (
          <span className="shrink-0 bg-neutral-100 text-neutral-500 rounded-md" style={{ fontSize: "14px", padding: "4px 12px" }}>
            {sourceLabel}
          </span>
        )}
      </div>

      {/* Divider: between header info and specimen */}
      <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />

      {/* Specimen */}
      <div
        className="text-4xl leading-tight mb-4 text-neutral-800 break-words"
        style={{ fontFamily: family, fontWeight: role === "Header" ? 600 : 400 }}
      >
        Aa Bb Cc Dd Ee Ff Gg
      </div>
      <div
        className="leading-relaxed text-neutral-600 break-words"
        style={{ fontFamily: family, fontWeight: 400, fontSize: "16px" }}
      >
        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
      </div>

      {/* Divider: before characteristics */}
      <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />

      {/* Keyword chips */}
      <div>
        <ChipGroup label="CHARACTERISTICS" chips={allChips} maxVisible={8} maxLines={2} />
      </div>

      {/* Divider: after chips, before meta */}
      <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-neutral-500" style={{ fontSize: "16px" }}>
        <div>
          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>DESIGNER</span>
          <p>{font.designer || "Unknown"}</p>
        </div>
        <div>
          <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}>CLASSIFICATION</span>
          <p>{formatClassification(font.classification)}</p>
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

      {/* Typography anatomy */}
      {(font.xHeightRatio || font.apertureOpenness || font.strokeContrast || font.moodCategory) && (
        <>
          <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-neutral-500" style={{ fontSize: "16px" }}>
            {font.xHeightRatio && (
              <div>
                <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}><LabelWithTooltip label="X-HEIGHT" /></span>
                <p>{titleCase(font.xHeightRatio)}</p>
              </div>
            )}
            {font.apertureOpenness && (
              <div>
                <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}><LabelWithTooltip label="APERTURES" /></span>
                <p>{titleCase(font.apertureOpenness)}</p>
              </div>
            )}
            {font.strokeContrast && (
              <div>
                <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}><LabelWithTooltip label="STROKE CONTRAST" /></span>
                <p>{titleCase(font.strokeContrast)}</p>
              </div>
            )}
            {font.letterSpacing && (
              <div>
                <span className="uppercase tracking-wider text-neutral-400 block mb-0.5" style={{ fontSize: "12px" }}><LabelWithTooltip label="SPACING" /></span>
                <p>{titleCase(font.letterSpacing)}</p>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}

export default function PairDetailPage({ slugOverride }: { slugOverride?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramSlug = slugOverride || searchParams.get("p") || "";
  const { sampleHeadline, sampleBody, headerSize, bodySize, addToHistory } = useAppState();

  // Single source of truth for the current slug. Held in a ref that only
  // updates when paramSlug is non-empty — so after we clean the URL and
  // searchParams no longer carries `?p=`, the ref still points at the
  // pair we're showing. When the user navigates to a different pair,
  // paramSlug becomes the new slug and the ref advances. No stale state,
  // no flash of the previous pair, and the clean-URL swap is preserved.
  const slugRef = useRef(paramSlug);
  if (paramSlug && paramSlug !== slugRef.current) {
    slugRef.current = paramSlug;
  }
  const slug = slugRef.current;

  const pair = pairsBySlug.get(slug) || getPairOrConstruct(slug);
  const headerFont = pair ? fontsById.get(pair.headerFontId) : undefined;
  const bodyFont = pair ? fontsById.get(pair.bodyFontId) : undefined;

  // Swap to clean CMS URL only for pre-defined pairs (not constructed ones).
  // Constructed pairs have no pre-rendered page so their URL must stay as ?p=.
  useEffect(() => {
    const isConstructed = pair?.id?.startsWith("constructed-");
    if (pair && slug && !isConstructed && window.location.search.includes("p=")) {
      const cleanUrl = pair.url ? `/font-pond${pair.url}` : `/font-pond/pair/${slug}`;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [pair, slug]);

  useEffect(() => {
    if (headerFont) loadFont(headerFont);
    if (bodyFont) loadFont(bodyFont);
    // Pin these fonts so they can't be evicted while the page is open
    const fontsToPin = [headerFont, bodyFont].filter(Boolean) as { id: string; slug: string; name: string }[];
    const unpin = pinFonts(fontsToPin);
    // Force the browser to actually fetch and render both fonts
    ensureFontsRendered(fontsToPin.map(f => f.name));
    return unpin;
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

  const [headerHasNums, setHeaderHasNums] = useState(true);
  const [bodyHasNums, setBodyHasNums] = useState(true);
  useEffect(() => {
    if (!headerFont || !bodyFont) return;
    const hf = getFontFamily(headerFont.name, headerFont.source);
    const bf = getFontFamily(bodyFont.name, bodyFont.source);
    const check = () => { setHeaderHasNums(fontHasNumbers(hf)); setBodyHasNums(fontHasNumbers(bf)); };
    const t = setTimeout(check, 500);
    document.fonts?.ready?.then(check);
    return () => clearTimeout(t);
  }, [headerFont, bodyFont]);

  const related = pair ? getRelatedPairs(pair.id, 6) : [];

  if (!pair || !headerFont || !bodyFont) {
    return (
      <div className="flex-1 flex flex-col">
        <DetailPageHeader />
        <main className="flex-1 flex items-center justify-center" style={{ textAlign: "center", padding: "0 24px" }}>
          <div>
            <h1 className="font-semibold tracking-tight describe-heading" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}>
              Pair not found
            </h1>
            <Link
              href="/?explore=1"
              className="btn-generate font-medium rounded-lg inline-block"
              style={{ fontSize: "16px", padding: "12px 24px", marginTop: "24px" }}
            >
              Explore font pairs
            </Link>
            <FishingLine />
          </div>
        </main>
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
        <Breadcrumb crumbs={[{ label: `${headerFont.name} + ${bodyFont.name}` }]} sticky />

        {/* Pair specimen */}
        <SectionCard style={{ marginBottom: "24px" }}>
          <h1
            className="leading-tight mb-4"
            style={{ fontFamily: headerFamily, fontWeight: 700, color: "var(--text-heading)", fontSize: `${headerSize}px` }}
          >
            {headline}
          </h1>
          <p
            className="text-neutral-600 leading-relaxed max-w-2xl"
            style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: `${bodySize}px`, lineHeight: 1.7 }}
          >
            {body}
          </p>

          {/* Preview settings */}
          <div className="mt-6">
            <SampleTextInputs alwaysShow />
          </div>

          {/* Scale suggestion */}
          <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
            <p className="uppercase tracking-wider text-neutral-400 mb-3" style={{ fontSize: "12px" }}>
              SUGGESTED SCALE
            </p>
            {(() => {
              const fb = "system-ui, sans-serif";
              const hFb = !headerHasNums;
              const bFb = !bodyHasNums;
              const N = (text: string) => <span style={{ fontFamily: fb }}>{text}</span>;
              return (
                <div className="space-y-2">
                  <p style={{ fontFamily: headerFamily, fontWeight: 700, fontSize: "36px" }} className="text-neutral-800">H{hFb ? <>{N("1")} {N("— 36")} </> : "1 — 36 "}px Bold</p>
                  <p style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "24px" }} className="text-neutral-800">H{hFb ? <>{N("2")} {N("— 24")} </> : "2 — 24 "}px Semibold</p>
                  <p style={{ fontFamily: headerFamily, fontWeight: 500, fontSize: "18px" }} className="text-neutral-700">H{hFb ? <>{N("3")} {N("— 18")} </> : "3 — 18 "}px Medium</p>
                  <p style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "16px" }} className="text-neutral-600">Body {bFb ? <>{N("— 16")} </> : "— 16 "}px Regular</p>
                  <p style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "14px" }} className="text-neutral-500">Small {bFb ? <>{N("— 14")} </> : "— 14 "}px Regular</p>
                </div>
              );
            })()}
          </div>
        </SectionCard>

        {/* Why this works */}
        <SectionCard className="overflow-hidden" style={{ marginBottom: "24px" }}>
          <h3 className="uppercase tracking-wider text-neutral-400 font-medium" style={{ fontSize: "12px", marginBottom: "8px" }}>WHY THIS WORKS</h3>
          <p className="text-neutral-700 leading-relaxed" style={{ fontSize: "16px" }}>{sentenceCase(pair.rationale)}</p>
        </SectionCard>

        {/* Details — three columns */}
        <div className="three-col-grid" style={{ marginBottom: "24px" }}>
          {/* Card 1: scores — label left, value right, lines between */}
          <SectionCard noPadding style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <dl>
              <div className="flex justify-between items-baseline border-b border-neutral-100" style={{ padding: "12px 24px", gap: "16px" }}>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="HIERARCHY" /></dt>
                <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{pair.hierarchyStrength}/10</dd>
              </div>
              <div className="flex justify-between items-baseline border-b border-neutral-100" style={{ padding: "12px 24px", gap: "16px" }}>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="LEGIBILITY" /></dt>
                <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{pair.bodyLegibilityScore}/10</dd>
              </div>
              <div className="flex justify-between items-baseline border-b border-neutral-100" style={{ padding: "12px 24px", gap: "16px" }}>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="PRACTICALITY" /></dt>
                <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{pair.practicalityScore}/10</dd>
              </div>
              <div className="flex justify-between items-baseline border-b border-neutral-100" style={{ padding: "12px 24px", gap: "16px" }}>
                <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="OVERALL" /></dt>
                <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{Math.round(pair.overallScore / 10)}/10</dd>
              </div>
              {pair.xHeightHarmony != null && (
                <div className="flex justify-between items-baseline border-b border-neutral-100" style={{ padding: "12px 24px", gap: "16px" }}>
                  <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="X-HEIGHT HARMONY" /></dt>
                  <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{pair.xHeightHarmony}/10</dd>
                </div>
              )}
              {pair.roleFitness != null && (
                <div className="flex justify-between items-baseline border-b border-neutral-100" style={{ padding: "12px 24px", gap: "16px" }}>
                  <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="ROLE FITNESS" /></dt>
                  <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{pair.roleFitness}/10</dd>
                </div>
              )}
              {pair.personalityContrast != null && (
                <div className="flex justify-between items-baseline" style={{ padding: "12px 24px", gap: "16px" }}>
                  <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label="PERSONALITY CONTRAST" /></dt>
                  <dd className="text-neutral-700 font-medium shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{pair.personalityContrast}/10</dd>
                </div>
              )}
            </dl>
          </SectionCard>

          {/* Card 2: tone + contrast type */}
          <SectionCard>
            <div>
              <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>TONE</dt>
              <dd className="text-neutral-700" style={{ fontSize: "16px" }}>{sentenceCase(pair.toneSummary).replace(/\.+$/, '')}</dd>
            </div>
            <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
            <div>
              <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}><LabelWithTooltip label="CONTRAST TYPE" /></dt>
              <dd className="text-neutral-700" style={{ fontSize: "16px" }}>{formatContrastType(pair.contrastType)}</dd>
            </div>
          </SectionCard>

          {/* Card 3: use cases + mood */}
          <SectionCard>
            <ChipGroup label="USE CASES" chips={pair.useCases.map(chipCase)} />
            {(headerFont.moodCategory || bodyFont.moodCategory) && (
              <>
                <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
                {/* Chips show only the mood word (e.g. "Bold", "Modern"); the
                    per-font mapping (header/body → mood) is still in the
                    backend data on each Font object for API/analytics use. */}
                <ChipGroup label="MOOD PAIRING" chips={[
                  ...(headerFont.moodCategory ? [chipCase(headerFont.moodCategory)] : []),
                  ...(bodyFont.moodCategory ? [chipCase(bodyFont.moodCategory)] : []),
                ]} />
              </>
            )}
          </SectionCard>
        </div>

        {/* Font sections — two columns */}
        <div className="two-col-grid" style={{ marginBottom: "24px" }}>
          <FontSection font={headerFont} role="Header" pairSlug={slug} onNavigate={(s) => router.push(`/font?f=${s}&from=${slug}`)} />
          <FontSection font={bodyFont} role="Body" pairSlug={slug} onNavigate={(s) => router.push(`/font?f=${s}&from=${slug}`)} />
        </div>

        {/* Related pairings */}
        {related.length > 0 && (
          <PairPreviewGrid
            pairs={related}
            title="Other interesting pairings for you"
            initialVisible={4}
            loadMoreIncrement={4}
            headlineText={sampleHeadline || "The quick brown fox"}
            bodyText={sampleBody || "Typography is the art and technique of arranging type."}
          />
        )}
      </main>
    </div>
  );
}

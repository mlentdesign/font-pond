"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { fontsBySlug, fontsById } from "@/data/fonts";
import { getPairsWithFont } from "@/lib/engine";
import { loadFont, getFontFamily, pinFonts, ensureFontsRendered } from "@/lib/fonts";
import { titleCase, sentenceCase, getSourceLabel, formatClassification, chipCase, fontHasNumbers } from "@/lib/text";
import { splitDesigners, designerToSlug } from "@/data/designers";
import { pairsBySlug, getPairOrConstruct } from "@/data/pairs";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { FishingLine } from "@/components/FishingLine";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";
import { ChipGroup } from "@/components/ChipGroup";
import { PairPreviewGrid } from "@/components/PairPreviewGrid";
import { useAppState } from "@/lib/store";
import { LabelWithTooltip } from "@/components/InfoTooltip";

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const curr = [i];
    for (let j = 1; j <= lb; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[lb];
}

function InfoRow({ label, value, useTitle, useClassification }: { label: string; value: string | null | undefined; useTitle?: boolean; useClassification?: boolean }) {
  if (!value) return null;
  const formatted = useClassification ? formatClassification(value) : useTitle ? titleCase(value) : sentenceCase(value);
  return (
    <div className="flex justify-between items-baseline border-b border-neutral-100 last:border-0" style={{ padding: "12px 24px", gap: "16px" }}>
      <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}><LabelWithTooltip label={label.toUpperCase()} /></dt>
      <dd className="text-neutral-700 text-right shrink-0" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>{formatted}</dd>
    </div>
  );
}

export default function FontDetailPage({ slugOverride }: { slugOverride?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramSlug = slugOverride || searchParams.get("f") || "";
  const rawFromPair = searchParams.get("from") || "";

  // Single source of truth for the current font slug. Ref holds the last
  // non-empty paramSlug so that after URL cleanup (which removes `?f=`),
  // the component keeps rendering the correct font. When the user
  // navigates to a different font, paramSlug advances the ref.
  const slugRef = useRef(paramSlug);
  if (paramSlug && paramSlug !== slugRef.current) {
    slugRef.current = paramSlug;
  }
  const slug = slugRef.current;

  // Persist fromPair across the replaceState URL cleanup (same pattern as slugRef).
  // replaceState strips ?from= from the URL; if useSearchParams reacts to that,
  // rawFromPair would drop to "" and the breadcrumb pair crumb would disappear.
  const fromPairRef = useRef(rawFromPair);
  if (rawFromPair && rawFromPair !== fromPairRef.current) {
    fromPairRef.current = rawFromPair;
  }
  // When slug changes (navigating to a new font), clear stale fromPair so a
  // font opened without a pair context doesn't show a leftover pair crumb.
  const prevSlugRef = useRef(slug);
  if (slug !== prevSlugRef.current) {
    prevSlugRef.current = slug;
    fromPairRef.current = rawFromPair;
  }
  const fromPair = fromPairRef.current;

  const font = fontsBySlug.get(slug);

  // Swap to clean CMS URL after font has rendered. Runs only when URL still has ?f=.
  useEffect(() => {
    if (font && slug && window.location.search.includes("f=")) {
      window.history.replaceState(null, "", `/font-pond/font/${slug}`);
    }
  }, [font, slug]);

  // Build breadcrumb trail
  const crumbs: { label: string; href?: string }[] = [];
  if (fromPair) {
    const pair = pairsBySlug.get(fromPair) || getPairOrConstruct(fromPair);
    if (pair) {
      const hf = fontsById.get(pair.headerFontId);
      const bf = fontsById.get(pair.bodyFontId);
      if (hf && bf) crumbs.push({ label: `${hf.name} + ${bf.name}`, href: `/pair?p=${fromPair}` });
    }
  }
  if (font) crumbs.push({ label: font.name });

  const { addHistoryItem } = useAppState();
  const [hasNums, setHasNums] = useState(true);

  useEffect(() => {
    if (font) {
      loadFont(font);
      // Pin this font so it can't be evicted while the page is open
      const unpin = pinFonts([font]);
      // Force the browser to actually fetch and render the font
      ensureFontsRendered([font.name]);
      addHistoryItem({ type: "font", id: font.id, slug: font.slug, label: font.name, viewedAt: Date.now() });
      // Load similar fonts
      for (const sf of font.similarFonts) {
        const similar = fontsBySlug.get(sf);
        if (similar) loadFont(similar);
      }
      // Check if font has visible number glyphs
      const fam = getFontFamily(font.name, font.source);
      const checkNums = () => setHasNums(fontHasNumbers(fam));
      setTimeout(checkNums, 500);
      setTimeout(checkNums, 2000);
      return unpin;
    }
  }, [font]);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [showStickyDownload, setShowStickyDownload] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Track mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!downloadRef.current) return;
    const check = () => {
      if (!downloadRef.current) return;
      const rect = downloadRef.current.getBoundingClientRect();
      const header = document.querySelector("header");
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      // Show sticky download as soon as the download section scrolls behind the breadcrumb area
      setShowStickyDownload(rect.bottom < headerBottom + 40);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [font]);

  // Track footer visibility for mobile sticky CTA positioning
  useEffect(() => {
    if (!isMobile) return;
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [isMobile]);

  const pairsUsing = font ? getPairsWithFont(font.id) : [];

  if (!font) {
    // Find similar fonts by edit distance
    const suggestions: { slug: string; name: string; dist: number }[] = [];
    if (slug) {
      const slugLower = slug.toLowerCase();
      for (const [fSlug, f] of fontsBySlug) {
        // Quick length check to skip wildly different lengths
        if (Math.abs(fSlug.length - slugLower.length) > 3) continue;
        const dist = editDistance(slugLower, fSlug.toLowerCase());
        if (dist > 0 && dist <= 3) {
          suggestions.push({ slug: fSlug, name: f.name, dist });
        }
      }
      suggestions.sort((a, b) => a.dist - b.dist);
    }
    const bestMatch = suggestions.length > 0 ? suggestions[0] : null;

    return (
      <div className="flex-1 flex flex-col">
        <DetailPageHeader />
        <main className="flex-1 flex items-center justify-center" style={{ textAlign: "center", padding: "0 24px" }}>
          <div>
            <h1 className="font-semibold tracking-tight describe-heading" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}>
              Font not found
            </h1>
            {bestMatch && (
              <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "0" }}>
                Did you mean{" "}
                <Link
                  href={`/font?f=${bestMatch.slug}`}
                  style={{ color: "var(--text-link)", textDecoration: "underline" }}
                >
                  {bestMatch.name}
                </Link>
                ?
              </p>
            )}
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

  const family = getFontFamily(font.name, font.source);
  const sourceLabel = getSourceLabel(font.source);

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main id="main-content" className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <Breadcrumb
          crumbs={crumbs}
          sticky
          stickyAction={font.sourceUrl && !isMobile ? (
            <a
              href={font.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-generate font-medium rounded-lg"
              style={{
                fontSize: "16px",
                padding: "8px 24px",
                whiteSpace: "nowrap",
                opacity: showStickyDownload ? 1 : 0,
                transform: showStickyDownload ? "scale(1)" : "scale(1.15)",
                transformOrigin: "right center",
                transition: "opacity 0.12s ease-out, transform 0.12s ease-out",
                pointerEvents: showStickyDownload ? "auto" : "none",
              }}
            >
              {sourceLabel} ↗
            </a>
          ) : undefined}
        />

        {/* Font name, creator, and download */}
        <div ref={downloadRef} className="flex flex-col sm:flex-row sm:items-start sm:justify-between" style={{ marginBottom: "24px", gap: "16px" }}>
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-1">{font.name}</h1>
            <p className="text-sm text-neutral-400">
              {font.designer ? (
                <>
                  By{" "}
                  {splitDesigners(font.designer).map((name, i, arr) => (
                    <span key={name}>
                      <button
                        type="button"
                        onClick={() => router.push(`/designer?d=${designerToSlug(name)}${slug ? `&font=${slug}` : ""}${fromPair ? `&from=${fromPair}` : ""}`)}
                        className="hover:underline"
                        style={{ color: "inherit", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
                      >
                        {name}
                      </button>
                      {i < arr.length - 1 && ", "}
                    </span>
                  ))}
                </>
              ) : "By unknown creator"}
              {font.year && ` · ${font.year}`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 mt-1">
            {font.sourceUrl && (
              <a
                href={font.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-generate font-medium rounded-lg" style={{ fontSize: "16px", padding: "8px 24px" }}
              >
                {sourceLabel} ↗
              </a>
            )}
          </div>
        </div>

        {/* Specimen */}
        <SectionCard style={{ marginBottom: "24px" }}>
          <div className="space-y-4">
            <p style={{ fontFamily: family, fontWeight: 700, fontSize: "48px" }} className="specimen-48 text-neutral-900 leading-tight">
              The quick brown fox
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "32px" }} className="specimen-32 text-neutral-700 leading-snug">
              jumps over the lazy dog
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "16px", lineHeight: 1.7 }} className="specimen-16 text-neutral-600">
              Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "14px", lineHeight: 1.6 }} className="specimen-14 text-neutral-500">
              At {hasNums ? "14" : <span style={{ fontFamily: "system-ui, sans-serif", color: "inherit" }}>14</span>} px: Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.
            </p>
          </div>

          {/* Alphabet */}
          <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="specimen-18 text-neutral-600 mb-2">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="specimen-18 text-neutral-600 mb-2">
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p style={{ fontFamily: hasNums ? family : "system-ui, sans-serif", color: "inherit", fontWeight: 400, fontSize: "18px" }} className="specimen-18 text-neutral-600">
              0123456789 !@#$%^&*()-=+[]{'{'}|;:&apos;,./&lt;&gt;?
            </p>
          </div>

          {/* Weight samples */}
          {font.weights.length > 1 && (
            <div className="mt-6 pt-6 border-t border-neutral-100" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
              <p className="uppercase tracking-wider text-neutral-400 mb-3" style={{ fontSize: "12px" }}>WEIGHTS</p>
              <div className="space-y-2">
                {font.weights.map((w) => (
                  <p key={w} style={{ fontWeight: w, fontSize: "18px" }} className="specimen-18 text-neutral-700">
                    <span style={{ fontFamily: hasNums ? family : "system-ui, sans-serif", color: "inherit" }}>{w} —</span> <span style={{ fontFamily: family }}>The quick brown fox jumps over the lazy dog</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Details — responsive: 1 col mobile, 2 col tablet, 3 col desktop
             When card 3 chips heavily outweigh cards 1+2 info rows, merge to 2-card layout */}
        <div className={`font-detail-grid${(font.distinctiveTraits.length + font.toneDescriptors.length + font.useCases.length + (font.historicalNotes ? 1 : 0)) > 15 ? " font-detail-compact" : ""}`} style={{ marginBottom: "24px" }}>
          {/* Card 1: Type info (desktop only — hidden on tablet or when compact) */}
          <SectionCard noPadding className="font-detail-card1" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <dl>
              <InfoRow label="Classification" value={font.classification} useClassification />
              <InfoRow label="Subcategory" value={font.subcategory} />
              <InfoRow label="Variable font" value={font.variableFont ? "Yes" : "No"} />
              {!font.variableFont && (
                <InfoRow label="Weights" value={font.weights.join(", ")} />
              )}
              <InfoRow label="Styles" value={font.styles.join(", ")} />
              <InfoRow label="License" value={font.licenseType} />
              <InfoRow label="Header suitable" value={font.isHeaderSuitable ? "Yes" : "No"} />
            </dl>
          </SectionCard>

          {/* Card 2: Suitability + Anatomy (desktop only — hidden on tablet where it merges with card 1) */}
          <SectionCard noPadding className="font-detail-card2" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <dl>
              <InfoRow label="Body suitable" value={font.isBodySuitable ? "Yes" : "Not recommended"} />
              {font.bodyLegibilityScore && (
                <InfoRow label="Body legibility" value={`${font.bodyLegibilityScore}/10`} />
              )}
              <InfoRow label="X-height" value={font.xHeightRatio ? titleCase(font.xHeightRatio) : null} />
              <InfoRow label="Apertures" value={font.apertureOpenness ? titleCase(font.apertureOpenness) : null} />
              <InfoRow label="Stroke contrast" value={font.strokeContrast ? titleCase(font.strokeContrast) : null} />
              <InfoRow label="Spacing" value={font.letterSpacing ? titleCase(font.letterSpacing) : null} />
            </dl>
          </SectionCard>

          {/* Combined card (tablet + mobile only — hidden on desktop) */}
          <SectionCard noPadding className="font-detail-combined" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <dl>
              <InfoRow label="Classification" value={font.classification} useClassification />
              <InfoRow label="Subcategory" value={font.subcategory} />
              <InfoRow label="Variable font" value={font.variableFont ? "Yes" : "No"} />
              {!font.variableFont && (
                <InfoRow label="Weights" value={font.weights.join(", ")} />
              )}
              <InfoRow label="Styles" value={font.styles.join(", ")} />
              <InfoRow label="License" value={font.licenseType} />
              <InfoRow label="Header suitable" value={font.isHeaderSuitable ? "Yes" : "No"} />
              <InfoRow label="Body suitable" value={font.isBodySuitable ? "Yes" : "Not recommended"} />
              {font.bodyLegibilityScore && (
                <InfoRow label="Body legibility" value={`${font.bodyLegibilityScore}/10`} />
              )}
              <InfoRow label="X-height" value={font.xHeightRatio ? titleCase(font.xHeightRatio) : null} />
              <InfoRow label="Apertures" value={font.apertureOpenness ? titleCase(font.apertureOpenness) : null} />
              <InfoRow label="Stroke contrast" value={font.strokeContrast ? titleCase(font.strokeContrast) : null} />
              <InfoRow label="Spacing" value={font.letterSpacing ? titleCase(font.letterSpacing) : null} />
            </dl>
          </SectionCard>

          {/* Card 3: Tone, Use Cases, etc. */}
          <SectionCard>
            <div className="flex flex-col">
              {font.distinctiveTraits.length > 0 && (
                <ChipGroup label="DISTINCTIVE TRAITS" chips={font.distinctiveTraits.map(chipCase)} />
              )}
              {font.distinctiveTraits.length > 0 && font.toneDescriptors.length > 0 && (
                <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
              )}
              {font.toneDescriptors.length > 0 && (
                <ChipGroup label="TONE" chips={font.toneDescriptors.map(chipCase)} />
              )}
              {font.toneDescriptors.length > 0 && font.useCases.length > 0 && (
                <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
              )}
              {font.useCases.length > 0 && (
                <ChipGroup label="USE CASES" chips={font.useCases.map(chipCase)} />
              )}
              {font.useCases.length > 0 && (font.moodCategory || font.historicalNotes) && (
                <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
              )}
              {font.moodCategory && (
                <ChipGroup label="MOOD" chips={[chipCase(font.moodCategory)]} />
              )}
              {font.moodCategory && font.historicalNotes && (
                <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
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
              chips={[...new Set(font.tags)].filter(t => t.split("-").length < 3 && t.length <= 25).map(chipCase)}
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
                    .filter(t => t.split("-").length < 3 && t.length <= 25)
                    .map(chipCase);
                  return (
                    <div
                      key={sf.slug}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/font?f=${sf.slug}`)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/font?f=${sf.slug}`); } }}
                      onMouseDown={(e) => e.preventDefault()}
                      className="group border border-neutral-200 rounded-xl bg-white p-6 card-hover hover:border-neutral-300 hover:shadow-sm overflow-hidden cursor-pointer"
                      style={{ position: "relative" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <span className="text-lg font-semibold text-neutral-900 block break-words">
                            {sf.name}
                          </span>
                        </div>
                        {sf.sourceUrl ? (
                          <a
                            href={sf.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 btn-generate font-medium rounded-lg"
                            style={{ fontSize: "16px", padding: "8px 24px", textDecoration: "none" }}
                          >
                            {sfSource} ↗
                          </a>
                        ) : (
                          <span className="shrink-0 bg-neutral-100 text-neutral-500 rounded-md" style={{ fontSize: "14px", padding: "4px 12px" }}>
                            {sfSource}
                          </span>
                        )}
                      </div>
                      <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
                      <div
                        className="text-4xl leading-tight mb-4 text-neutral-800 break-words"
                        style={{ fontFamily: sfFamily, fontWeight: 600 }}
                      >
                        Aa Bb Cc Dd Ee Ff Gg
                      </div>
                      <div
                        className="leading-relaxed text-neutral-600 break-words"
                        style={{ fontFamily: sfFamily, fontWeight: 400, fontSize: "16px" }}
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                      </div>
                      <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
                      <div>
                        <ChipGroup label="CHARACTERISTICS" chips={sfChips} maxVisible={8} maxLines={2} />
                      </div>
                      <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-neutral-500" style={{ fontSize: "16px" }}>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-1" style={{ fontSize: "12px" }}>DESIGNER</span>
                          <p>{sf.designer || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-1" style={{ fontSize: "12px" }}>CLASSIFICATION</span>
                          <p>{formatClassification(sf.classification)}</p>
                        </div>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-1" style={{ fontSize: "12px" }}>LICENSE</span>
                          <p>{titleCase(sf.licenseType)}</p>
                        </div>
                        <div>
                          <span className="uppercase tracking-wider text-neutral-400 block mb-1" style={{ fontSize: "12px" }}>VARIABLE</span>
                          <p>{sf.variableFont ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
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

      {/* Mobile: sticky bottom CTA — left-aligned, floating above footer */}
      {isMobile && font.sourceUrl && (
        <div
          className={`mobile-sticky-download${!showStickyDownload || footerVisible ? " is-hidden" : ""}`}
        >
          <a
            href={font.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-generate font-medium rounded-lg inline-block"
            style={{ fontSize: "16px", padding: "8px 24px", textDecoration: "none" }}
          >
            {sourceLabel} ↗
          </a>
        </div>
      )}
    </div>
  );
}

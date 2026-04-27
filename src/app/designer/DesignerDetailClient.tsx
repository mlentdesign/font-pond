"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { designersBySlug } from "@/data/designers";
import { fontsBySlug, fontsById } from "@/data/fonts";
import { getPairOrConstruct } from "@/data/pairs";
import { loadFont, getFontFamily, pinFonts, ensureFontsRendered } from "@/lib/fonts";
import { getSourceLabel, formatClassification, chipCase } from "@/lib/text";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";
import { ChipGroup } from "@/components/ChipGroup";
import { FishingLine } from "@/components/FishingLine";
import Link from "next/link";

export default function DesignerDetailClient({ slugOverride }: { slugOverride?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramSlug = slugOverride || searchParams.get("d") || "";
  const rawFontSlug = searchParams.get("font") || "";
  const rawFromPair = searchParams.get("from") || "";

  const slugRef = useRef(paramSlug);
  if (paramSlug && paramSlug !== slugRef.current) slugRef.current = paramSlug;
  const slug = slugRef.current;

  const fontSlugRef = useRef(rawFontSlug);
  if (rawFontSlug && rawFontSlug !== fontSlugRef.current) fontSlugRef.current = rawFontSlug;
  const fontSlug = fontSlugRef.current;

  const fromPairRef = useRef(rawFromPair);
  if (rawFromPair && rawFromPair !== fromPairRef.current) fromPairRef.current = rawFromPair;
  const fromPair = fromPairRef.current;

  const designer = designersBySlug.get(slug);
  const fromFont = fontSlug ? fontsBySlug.get(fontSlug) : undefined;
  const fromPairData = fromPair ? getPairOrConstruct(fromPair) : undefined;

  useEffect(() => {
    if (designer && slug && window.location.search) {
      window.history.replaceState(null, "", `/font-pond/designer/${slug}`);
    }
  }, [designer, slug]);

  useEffect(() => {
    if (!designer) return;
    const unpin = pinFonts(designer.fonts);
    for (const font of designer.fonts) {
      loadFont(font);
    }
    ensureFontsRendered(designer.fonts.map((f) => f.name));
    return unpin;
  }, [designer]);

  const crumbs: { label: string; href?: string }[] = [];
  if (fromPairData) {
    const hName = fontsById.get(fromPairData.headerFontId)?.name;
    const bName = fontsById.get(fromPairData.bodyFontId)?.name;
    const pairLabel = hName && bName ? `${hName} + ${bName}` : fromPairData.slug;
    crumbs.push({ label: pairLabel, href: `/pair?p=${fromPair}` });
  }
  if (fromFont) crumbs.push({ label: fromFont.name, href: `/font?f=${fontSlug}${fromPair ? `&from=${fromPair}` : ""}` });
  if (designer) crumbs.push({ label: designer.name });

  if (!designer) {
    return (
      <div className="flex-1 flex flex-col">
        <DetailPageHeader />
        <main className="flex-1 flex items-center justify-center" style={{ textAlign: "center", padding: "0 24px" }}>
          <div>
            <h1 className="font-semibold tracking-tight" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}>
              Designer not found
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

  const sorted = [...designer.fonts].sort((a, b) => a.name.localeCompare(b.name));
  const fontCount = sorted.length;
  const INITIAL_FONTS = 6;
  const FONT_INCREMENT = 6;
  const [visibleFonts, setVisibleFonts] = useState(INITIAL_FONTS);
  const fontSentinelRef = useRef<HTMLDivElement>(null);
  const hasMoreFonts = visibleFonts < fontCount;

  useEffect(() => {
    const el = fontSentinelRef.current;
    if (!el || !hasMoreFonts) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleFonts((v) => Math.min(v + FONT_INCREMENT, fontCount)); },
      { rootMargin: "0px 0px 200px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreFonts, fontCount, visibleFonts]);

  // Per-card specimen scaling
  const sectionRefs = useRef<Record<string, HTMLDivElement>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement>>({});
  const bigRefs = useRef<Record<string, HTMLDivElement>>({});
  const smallRefs = useRef<Record<string, HTMLDivElement>>({});
  const [specimenSizes, setSpecimenSizes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (window.innerWidth < 768) return;

    let cancelled = false;
    const fontNames = sorted.slice(0, visibleFonts).map(f => f.name);

    const run = async () => {
      await document.fonts.ready;
      const unloaded = new Set(fontNames);
      const deadline = Date.now() + 4000;
      while (unloaded.size > 0 && Date.now() < deadline) {
        for (const name of [...unloaded]) {
          const [f400, f700] = await Promise.all([
            document.fonts.load(`400 16px "${name}"`).catch(() => [] as FontFace[]),
            document.fonts.load(`700 16px "${name}"`).catch(() => [] as FontFace[]),
          ]);
          if (f400.length > 0 || f700.length > 0) unloaded.delete(name);
        }
        if (unloaded.size > 0) await new Promise(r => setTimeout(r, 150));
      }

      if (cancelled) return;
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (cancelled) return;

      const updates: Record<string, number> = {};

      // Scale each card's specimen text to fill its section height.
      // The section has flex:1 so its height = available space after header/chips/meta.
      // Binary search finds the largest size where content fits without clipping.
      for (const [fontSlug, sectionEl] of Object.entries(sectionRefs.current)) {
        const sectionH = sectionEl.offsetHeight;
        const contentEl = contentRefs.current[fontSlug];
        const bigEl = bigRefs.current[fontSlug];
        const smallEl = smallRefs.current[fontSlug];
        if (!contentEl || !bigEl || !smallEl || sectionH < 32) continue;

        let lo = 12, hi = 200, best = 12;
        for (let i = 0; i < 12; i++) {
          const mid = Math.round((lo + hi) / 2);
          bigEl.style.fontSize = `${mid}px`;
          bigEl.style.lineHeight = "1";
          smallEl.style.fontSize = `${Math.round(mid * 16 / 36)}px`;
          smallEl.style.lineHeight = "1.15";
          if (contentEl.offsetHeight <= sectionH) { best = mid; lo = mid + 1; }
          else hi = mid - 1;
        }
        bigEl.style.fontSize = '';
        bigEl.style.lineHeight = '';
        smallEl.style.fontSize = '';
        smallEl.style.lineHeight = '';
        updates[fontSlug] = Math.max(12, best);
      }

      if (Object.keys(updates).length > 0) {
        setSpecimenSizes(prev => ({ ...prev, ...updates }));
      }
    };

    run();
    return () => { cancelled = true; };
  }, [visibleFonts]);

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main id="main-content" className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <Breadcrumb crumbs={crumbs} sticky />

        {/* Designer name + count */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="text-3xl font-semibold text-neutral-900 mb-1">
            {designer.name}
          </h1>
          <p className="text-neutral-400" style={{ fontSize: "16px" }}>
            {fontCount} {fontCount === 1 ? "font" : "fonts"} in Font Pond
          </p>
        </div>

        {/* Font grid */}
        <div className="designer-font-grid">
          {sorted.slice(0, visibleFonts).map((font) => {
            const family = getFontFamily(font.name, font.source);
            const sourceLabel = getSourceLabel(font.source);
            const chips = [...new Set([...font.tags, ...font.toneDescriptors].map((t) => t.toLowerCase()))]
              .filter((t) => t.split("-").length < 3 && t.length <= 25)
              .map(chipCase);

            return (
              <div
                key={font.slug}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/font?f=${font.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/font?f=${font.slug}`);
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="group flex flex-col border border-neutral-200 rounded-xl bg-white card-hover hover:border-neutral-300 hover:shadow-sm cursor-pointer"
                style={{ padding: "24px", position: "relative", overflow: "hidden" }}
              >
                {/* Font name + source */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <span className="text-lg font-semibold text-neutral-900 block break-words">
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
                <div className="border-t border-neutral-100" style={{ margin: "24px -24px 16px", padding: "0" }} />

                {/* Specimen */}
                <div
                  ref={(el) => { if (el) sectionRefs.current[font.slug] = el; else delete sectionRefs.current[font.slug]; }}
                  style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}
                >
                  <div ref={(el) => { if (el) contentRefs.current[font.slug] = el; else delete contentRefs.current[font.slug]; }}>
                    <div
                      ref={(el) => { if (el) bigRefs.current[font.slug] = el; else delete bigRefs.current[font.slug]; }}
                      className="mb-2 text-neutral-800 break-words"
                      style={{ fontFamily: family, fontWeight: 600, fontSize: `${specimenSizes[font.slug] ?? 36}px`, lineHeight: "1" }}
                    >
                      Aa Bb Cc Dd Ee Ff
                    </div>
                    <div
                      ref={(el) => { if (el) smallRefs.current[font.slug] = el; else delete smallRefs.current[font.slug]; }}
                      className="text-neutral-600"
                      style={{ fontFamily: family, fontWeight: 400, fontSize: `${Math.round((specimenSizes[font.slug] ?? 36) * 16 / 36)}px`, lineHeight: "1.15" }}
                    >
                      <span style={{ display: "block" }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                      <span style={{ display: "block" }}>abcdefghijklmnopqrstuvwxyz</span>
                      <span style={{ display: "block" }}>0123456789</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-100" style={{ margin: "16px -24px" }} />

                {/* Characteristics */}
                {chips.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <ChipGroup label="CHARACTERISTICS" chips={chips} maxVisible={8} maxLines={2} />
                  </div>
                )}

                <div className="border-t border-neutral-100" style={{ margin: "0 -24px 16px" }} />

                {/* Meta row */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-neutral-500" style={{ fontSize: "16px" }}>
                  <div>
                    <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", marginBottom: "4px" }}>
                      CLASSIFICATION
                    </span>
                    <span>{formatClassification(font.classification)}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", marginBottom: "4px" }}>
                      LICENSE
                    </span>
                    <span>{font.licenseType}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", marginBottom: "4px" }}>
                      YEAR
                    </span>
                    <span>{font.year || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", marginBottom: "4px" }}>
                      VARIABLE
                    </span>
                    <span>{font.variableFont ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {hasMoreFonts && <div ref={fontSentinelRef} style={{ height: 1 }} />}
      </main>
    </div>
  );
}

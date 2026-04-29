"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { yearsBySlug } from "@/data/years";
import { fontsBySlug } from "@/data/fonts";
import { loadFont, getFontFamily, pinFonts, ensureFontsRendered } from "@/lib/fonts";
import { RENDER_METRICS } from "@/data/gf-render-metrics";
import { getSourceLabel, formatClassification, chipCase } from "@/lib/text";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ChipGroup } from "@/components/ChipGroup";
import { FishingLine } from "@/components/FishingLine";
import Link from "next/link";

export default function YearDetailClient({ slugOverride }: { slugOverride?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramSlug = slugOverride || searchParams.get("y") ||
    (typeof window !== "undefined" ? (window.location.pathname.match(/\/year\/([^/?#]+)/)?.[1] || "") : "") || "";
  const rawFontSlug = searchParams.get("font") || "";

  const slugRef = useRef(paramSlug);
  if (paramSlug && paramSlug !== slugRef.current) slugRef.current = paramSlug;
  const slug = slugRef.current;

  const fontSlugRef = useRef(rawFontSlug);
  if (rawFontSlug && rawFontSlug !== fontSlugRef.current) fontSlugRef.current = rawFontSlug;
  const fontSlug = fontSlugRef.current;

  const yearGroup = yearsBySlug.get(slug);
  const fromFont = fontSlug ? fontsBySlug.get(fontSlug) : undefined;

  useEffect(() => {
    if (yearGroup && slug && window.location.search) {
      const base = window.location.pathname.replace(/\/year.*$/, "");
      window.history.replaceState(window.history.state, "", `${base}/year/${slug}`);
    }
  }, [yearGroup, slug]);

  useEffect(() => {
    if (!yearGroup) return;
    const unpin = pinFonts(yearGroup.fonts);
    for (const font of yearGroup.fonts) {
      loadFont(font);
    }
    ensureFontsRendered(yearGroup.fonts.map((f) => f.name));
    return unpin;
  }, [yearGroup]);

  const crumbs: { label: string; href?: string }[] = [];
  if (fromFont) crumbs.push({ label: fromFont.name, href: `/font?f=${fontSlug}` });
  if (yearGroup) crumbs.push({ label: String(yearGroup.year) });

  if (!yearGroup) {
    return (
      <div className="flex-1 flex flex-col">
        <DetailPageHeader />
        <main className="flex-1 flex items-center justify-center" style={{ textAlign: "center", padding: "0 24px" }}>
          <div>
            <h1 className="font-semibold tracking-tight describe-heading" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}>
              No fonts from this year
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "0" }}>
              We don&rsquo;t have any fonts from that year in Font Pond yet.
            </p>
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

  const sorted = [...yearGroup.fonts].sort((a, b) => a.name.localeCompare(b.name));
  const fontCount = sorted.length;
  type FontEntry = { font: (typeof sorted)[number]; animate: boolean; delay: number };
  const INITIAL_FONTS = 4;
  const FONT_INCREMENT = 2;
  const [fontEntries, setFontEntries] = useState<FontEntry[]>(() =>
    sorted.slice(0, Math.min(INITIAL_FONTS, sorted.length)).map(font => ({ font, animate: false, delay: 0 }))
  );
  const fontEntriesRef = useRef(fontEntries);
  fontEntriesRef.current = fontEntries;
  const fontSentinelRef = useRef<HTMLDivElement>(null);
  const hasMoreFonts = fontEntries.length < fontCount;

  useEffect(() => {
    const el = fontSentinelRef.current;
    if (!el || !hasMoreFonts) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const current = fontEntriesRef.current;
        if (current.length >= sorted.length) return;
        const batch = sorted.slice(current.length, current.length + FONT_INCREMENT);
        for (const font of batch) { loadFont(font); }
        ensureFontsRendered(batch.map(f => f.name));
        setTimeout(() => {
          setFontEntries(prev => [
            ...prev.map(e => ({ ...e, animate: false })),
            ...batch.map((font, i) => ({ font, animate: true, delay: i * 60 })),
          ]);
        }, 80);
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreFonts, fontEntries.length]);

  // Per-card specimen scaling via canvas visual measurement.
  // Canvas actualBoundingBox measures real glyph bounds (ignoring font metric whitespace),
  // so fonts with tall internal metrics (e.g. South Asian scripts) scale the same as Latin.
  const sectionRefs = useRef<Record<string, HTMLDivElement>>({});
  const [specimenSizes, setSpecimenSizes] = useState<Record<string, number>>({});
  const [smallSpecimenSizes, setSmallSpecimenSizes] = useState<Record<string, number>>({});
  const sizingFnRef = useRef<(() => void) | null>(null);
  const lastBigRef = useRef<Record<string, number>>({});
  const lastSmallRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => sizingFnRef.current?.(), 150);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(debounce); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (window.innerWidth < 768) {
      const TARGET_CAP_H = 40;
      const immediate: Record<string, number> = {};
      const needCanvas: (typeof sorted)[number][] = [];

      for (const { font } of fontEntriesRef.current) {
        const m = RENDER_METRICS[font.slug];
        if (m) {
          immediate[font.slug] = Math.max(28, Math.min(64, Math.round(TARGET_CAP_H / m[4])));
        } else {
          needCanvas.push(font);
        }
      }

      if (Object.keys(immediate).length > 0) setSpecimenSizes(prev => ({ ...prev, ...immediate }));

      if (needCanvas.length > 0) {
        const runMobileCanvas = async () => {
          await document.fonts.ready;
          const unloaded = new Set(needCanvas.map(f => f.name));
          const deadline = Date.now() + 4000;
          while (unloaded.size > 0 && Date.now() < deadline) {
            for (const name of [...unloaded]) {
              const faces = await document.fonts.load(`600 16px "${name}"`).catch(() => [] as FontFace[]);
              if (faces.length > 0) unloaded.delete(name);
            }
            if (unloaded.size > 0) await new Promise(r => setTimeout(r, 150));
          }
          if (cancelled) return;
          await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
          if (cancelled) return;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const updates: Record<string, number> = {};
          for (const font of needCanvas) {
            const family = getFontFamily(font.name, font.source);
            ctx.font = `600 36px ${family}`;
            const capH = ctx.measureText("A").actualBoundingBoxAscent;
            if (capH <= 0) continue;
            updates[font.slug] = Math.max(28, Math.min(64, Math.round(36 * TARGET_CAP_H / capH)));
          }
          if (Object.keys(updates).length > 0) setSpecimenSizes(prev => ({ ...prev, ...updates }));
        };
        runMobileCanvas();
      }

      return () => { cancelled = true; };
    }

    const doSizing = () => {
      const canvasEl = document.createElement('canvas');
      const ctx = canvasEl.getContext('2d')!;
      const bigUpdates: Record<string, number> = {};
      const smallUpdates: Record<string, number> = {};

      for (const [slug, sectionEl] of Object.entries(sectionRefs.current)) {
        const fontData = sorted.find(f => f.slug === slug);
        if (!fontData) continue;
        const sectionH = sectionEl.offsetHeight;
        const sectionW = sectionEl.offsetWidth;
        if (sectionH < 32 || sectionW < 32) continue;

        const m = RENDER_METRICS[slug];
        let bigSize: number;
        if (m) {
          bigSize = Math.max(12, Math.floor(sectionW / m[0]));
          // Cap so ink height (ascent+descent × fontSize) doesn't exceed 80px — prevents barcode/
          // dingbat fonts with extreme specAdv from producing enormous specimen cards.
          const inkRatio = (m[4] + m[5]) || 1;
          bigSize = Math.min(bigSize, Math.floor(80 / inkRatio));
        } else {
          const family = getFontFamily(fontData.name, fontData.source);
          ctx.font = `600 36px ${family}`;
          const bigW36 = ctx.measureText("Aa Bb Cc Dd Ee Ff").width;
          bigSize = bigW36 > 0 ? Math.max(12, Math.floor(36 * sectionW / bigW36)) : 36;
        }
        bigSize = Math.max(12, bigSize);
        bigUpdates[slug] = bigSize;

        const availableForSmall = sectionH - bigSize - 8;
        if (availableForSmall < 14) { smallUpdates[slug] = 14; continue; }

        let lo = 14, hi = 300, best = 14;
        if (m) {
          const [, upperAdv, lowerAdv, numsAdv] = m;
          for (let i = 0; i < 12; i++) {
            const mid = Math.round((lo + hi) / 2);
            const upperLines = Math.max(1, Math.ceil(upperAdv * mid / sectionW));
            const lowerLines = Math.max(1, Math.ceil(lowerAdv * mid / sectionW));
            const numsLines  = Math.max(1, Math.ceil(numsAdv * mid / sectionW));
            const totalH = (upperLines + lowerLines + numsLines) * mid + 2 * 6;
            if (totalH <= availableForSmall) { best = mid; lo = mid + 1; }
            else hi = mid - 1;
          }
        } else {
          const family = getFontFamily(fontData.name, fontData.source);
          for (let i = 0; i < 12; i++) {
            const mid = Math.round((lo + hi) / 2);
            ctx.font = `400 ${mid}px ${family}`;
            const vW = (t: string) => ctx.measureText(t).width;
            const upperLines = Math.max(1, Math.ceil(vW("ABCDEFGHIJKLMNOPQRSTUVWXYZ") / sectionW));
            const lowerLines = Math.max(1, Math.ceil(vW("abcdefghijklmnopqrstuvwxyz") / sectionW));
            const numsLines  = Math.max(1, Math.ceil(vW("0123456789") / sectionW));
            const totalH = (upperLines + lowerLines + numsLines) * mid + 2 * 6;
            if (totalH <= availableForSmall) { best = mid; lo = mid + 1; }
            else hi = mid - 1;
          }
        }
        smallUpdates[slug] = Math.min(Math.max(14, best), Math.floor(bigSize * 0.45));
      }

      const changedBig: Record<string, number> = {};
      const changedSmall: Record<string, number> = {};
      for (const [k, v] of Object.entries(bigUpdates)) {
        if (lastBigRef.current[k] !== v) { changedBig[k] = v; lastBigRef.current[k] = v; }
      }
      for (const [k, v] of Object.entries(smallUpdates)) {
        if (lastSmallRef.current[k] !== v) { changedSmall[k] = v; lastSmallRef.current[k] = v; }
      }
      if (Object.keys(changedBig).length > 0) {
        setSpecimenSizes(prev => ({ ...prev, ...changedBig }));
        setSmallSpecimenSizes(prev => ({ ...prev, ...changedSmall }));
      }
    };

    sizingFnRef.current = doSizing;

    let resizeObserver: ResizeObserver | null = null;

    const run = async () => {
      // Let layout settle, then size immediately using pre-computed metrics
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (cancelled) return;

      doSizing();

      resizeObserver = new ResizeObserver(() => { if (!cancelled) doSizing(); });
      for (const el of Object.values(sectionRefs.current)) {
        resizeObserver.observe(el);
      }

      // Second pass for any fonts not in pre-computed metrics (waits for font load)
      const needCanvas = fontEntriesRef.current
        .filter(e => !RENDER_METRICS[e.font.slug])
        .map(e => e.font.name);
      if (needCanvas.length === 0) return;

      await document.fonts.ready;
      const unloaded = new Set(needCanvas);
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
      if (!cancelled) doSizing();
    };

    run();
    return () => { cancelled = true; resizeObserver?.disconnect(); };
  }, [fontEntries.length]);

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main id="main-content" className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <Breadcrumb crumbs={crumbs} sticky />

        {/* Year heading + count */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="text-3xl font-semibold text-neutral-900 mb-1">
            {yearGroup.year}
          </h1>
          <p className="text-neutral-400" style={{ fontSize: "16px" }}>
            {fontCount} {fontCount === 1 ? "font" : "fonts"} in Font Pond
          </p>
        </div>

        {/* Font grid */}
        <div className="designer-font-grid">
          {fontEntries.map(({ font, animate, delay }) => {
            const family = getFontFamily(font.name, font.source);
            const sourceLabel = getSourceLabel(font.source);
            const chips = [...new Set([...font.tags, ...font.toneDescriptors].map((t) => t.toLowerCase()))]
              .filter((t) => t.split("-").length < 3 && t.length <= 25)
              .map(chipCase);
            const bigS = specimenSizes[font.slug] ?? 36;
            const smallS = smallSpecimenSizes[font.slug] ?? Math.max(14, Math.round(bigS * 14 / 36));
            const smallGap = 6;

            return (
              <div
                key={font.slug}
                role="link"
                tabIndex={0}
                onClick={() => startTransition(() => router.push(`/font?f=${font.slug}`))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startTransition(() => router.push(`/font?f=${font.slug}`));
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="group flex flex-col border border-neutral-200 rounded-xl bg-white card-hover hover:border-neutral-300 hover:shadow-sm cursor-pointer"
                style={{ padding: "24px", position: "relative", overflow: "hidden", animation: animate ? `pair-card-enter 400ms ease-out ${delay}ms both` : undefined }}
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
                  className="spec-section"
                  style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}
                >
                  <div>
                    <div
                      className="text-neutral-800 whitespace-nowrap"
                      style={{ fontFamily: family, fontWeight: 600, fontSize: `${bigS}px`, lineHeight: "1", marginBottom: "8px" }}
                    >
                      Aa Bb Cc Dd Ee Ff
                    </div>
                    <div
                      className="text-neutral-600"
                      style={{
                        fontFamily: family,
                        fontWeight: 400,
                        fontSize: `${smallS}px`,
                        lineHeight: "1",
                        display: "flex",
                        flexDirection: "column",
                        gap: `${smallGap}px`,
                      }}
                    >
                      <span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                      <span>abcdefghijklmnopqrstuvwxyz</span>
                      <span>0123456789</span>
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
                      DESIGNER
                    </span>
                    <span>{font.designer || "Unknown"}</span>
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

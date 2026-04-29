"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScoredPair } from "@/data/types";
import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import { navigateToPair } from "@/lib/navigate";
import { getFontFamily, loadFont } from "@/lib/fonts";
import { sentenceCase, chipCase } from "@/lib/text";
import { RENDER_METRICS } from "@/data/gf-render-metrics";

// Extra padding needed above a font: ink that exceeds OS/2 usWinAscent (browser already handles the rest).
function extraTop(slug: string, px: number): number {
  const m = RENDER_METRICS[slug];
  if (!m) return 0;
  return Math.max(0, Math.round(m[6] * px));
}

// Extra padding needed below a font: ink that exceeds OS/2 usWinDescent.
function extraBottom(slug: string, px: number): number {
  const m = RENDER_METRICS[slug];
  if (!m) return 0;
  return Math.max(0, Math.round(m[7] * px));
}

// Extra left padding needed: ink extending left of the glyph origin (negative LSB).
function extraLeft(slug: string, px: number): number {
  const m = RENDER_METRICS[slug];
  if (!m) return 0;
  return Math.max(0, Math.round(m[8] * px));
}

export function PairCard({ pair, isExploring = false, animationDelay = 0 }: { pair: ScoredPair; isExploring?: boolean; animationDelay?: number }) {
  const { sampleHeadline, sampleBody, headerSize, bodySize } = useAppState();
  const router = useRouter();
  const headline = sampleHeadline || DEFAULT_HEADLINE;
  const body = sampleBody || DEFAULT_BODY;

  // ResultsGrid already confirmed fonts are loaded before adding this pair to visiblePairs.
  // Just keep them pinned while the card is mounted.
  useEffect(() => {
    loadFont(pair.headerFont);
    loadFont(pair.bodyFont);
  }, [pair.headerFont.name, pair.bodyFont.name]);

  const { headerFont, bodyFont } = pair;

  const headerFamily = getFontFamily(headerFont.name, headerFont.source);
  const bodyFamily = getFontFamily(bodyFont.name, bodyFont.source);

  // Section 1: keep user's font sizes, expand padding for ink that overflows OS/2 bounds
  const sec1PadTop    = 24 + extraTop(headerFont.slug, headerSize);
  const sec1PadBottom = 16 + extraBottom(bodyFont.slug, bodySize);
  const sec1PadLeft   = 24 + Math.max(extraLeft(headerFont.slug, headerSize), extraLeft(bodyFont.slug, bodySize));
  const headlineMarginBottom = 16 + extraBottom(headerFont.slug, headerSize);

  // Sections 3/4: keep 22px labels, expand padding for ascenders/descenders/left overflow
  const headerSecPadTop    = 16 + extraTop(headerFont.slug, 22);
  const headerSecPadBottom = 16 + extraBottom(headerFont.slug, 22);
  const headerSecPadLeft   = 24 + extraLeft(headerFont.slug, 22);
  const bodySecPadTop      = 16 + extraTop(bodyFont.slug, 22);
  const bodySecPadBottom   = 16 + extraBottom(bodyFont.slug, 22);
  const bodySecPadLeft     = 24 + extraLeft(bodyFont.slug, 22);

  const description = isExploring
    ? sentenceCase(pair.shortExplanation)
    : sentenceCase(pair.promptFitReason);

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`View font pair: ${headerFont.name} and ${bodyFont.name}`}
      onClick={() => { navigateToPair(router, pair.slug); }}
      onMouseDown={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToPair(router, pair.slug); } }}
      className="group border border-neutral-200 rounded-xl bg-white card-hover hover:border-neutral-300 hover:shadow-md cursor-pointer overflow-hidden flex flex-col"
      style={{ position: "relative", animation: `pair-card-enter 400ms ease-out ${animationDelay}ms both` }}
    >
      {/* Hover arrow */}
      <span
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ position: "absolute", top: "16px", right: "16px", color: "var(--text-ransom)", fontSize: "16px", pointerEvents: "none" }}
      >
        ↗
      </span>

      {/* Section 1: Sample header + body text — pinned to top */}
      <div style={{ paddingTop: `${sec1PadTop}px`, paddingBottom: `${sec1PadBottom}px`, paddingLeft: `${sec1PadLeft}px`, paddingRight: "24px" }}>
        <h3
          className="text-neutral-900 break-words"
          style={{
            fontFamily: headerFamily,
            fontWeight: 700,
            fontSize: `${headerSize}px`,
            lineHeight: 1.15,
            marginBottom: `${headlineMarginBottom}px`,
          }}
        >
          {headline}
        </h3>
        <p
          className="text-neutral-600 break-words"
          style={{
            fontFamily: bodyFamily,
            fontWeight: 400,
            fontSize: `${bodySize}px`,
            lineHeight: 1.6,
          }}
        >
          {body}
        </p>
      </div>

      {/* Sections 2–4 pinned to bottom */}
      <div style={{ marginTop: "auto" }}>
        <div className="border-t border-neutral-100" />

        {/* Section 2: Description */}
        <div style={{ padding: "16px 24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "4px" }}>
            DESCRIPTION
          </span>
          <p className="text-neutral-500 break-words" style={{ fontSize: "16px", lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        <div className="border-t border-neutral-100" />

        {/* Section 3: Header font + chips */}
        <div style={{ paddingTop: `${headerSecPadTop}px`, paddingBottom: `${headerSecPadBottom}px`, paddingLeft: `${headerSecPadLeft}px`, paddingRight: "24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "4px" }}>
            HEADER
          </span>
          <span
            className="text-neutral-800 block"
            style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "22px", lineHeight: 1.3, marginBottom: "8px" }}
          >
            {headerFont.name}
          </span>
          <div className="flex flex-wrap" style={{ gap: "8px" }}>
            {[...new Set(headerFont.tags)].slice(0, 6).map((tag, i) => (
              <span
                key={`h-${i}-${tag}`}
                className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100"
                style={{ fontSize: "14px", padding: "4px 12px" }}
              >
                {chipCase(tag)}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        {/* Section 4: Body font + chips */}
        <div style={{ paddingTop: `${bodySecPadTop}px`, paddingBottom: `${bodySecPadBottom + 8}px`, paddingLeft: `${bodySecPadLeft}px`, paddingRight: "24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "4px" }}>
            BODY
          </span>
          <span
            className="text-neutral-800 block"
            style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "22px", lineHeight: 1.3, marginBottom: "8px" }}
          >
            {bodyFont.name}
          </span>
          <div className="flex flex-wrap" style={{ gap: "8px" }}>
            {[...new Set(bodyFont.tags)].slice(0, 6).map((tag, i) => (
              <span
                key={`b-${i}-${tag}`}
                className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100"
                style={{ fontSize: "14px", padding: "4px 12px" }}
              >
                {chipCase(tag)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

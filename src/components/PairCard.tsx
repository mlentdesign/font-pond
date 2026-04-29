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

  const hm = RENDER_METRICS[headerFont.slug];
  const bm = RENDER_METRICS[bodyFont.slug];

  // Line heights stay at their defaults — overlapping ascenders/descenders between lines of
  // the same font is fine. Only cross-element gaps (headline→body, label→chips) need fixing.
  const headerLineHeight    = 1.15;
  const headerLabelLH       = 1.3;
  const bodyLabelLH         = 1.3;

  // CSS line-box geometry: with a given lineHeight, the baseline sits at
  //   (lineHeight + os2Asc - os2Desc) / 2  from the line-box top.
  // inkTopFromLbTop: dead space above ink (os2 declares more room than ink needs).
  //   Subtract this from top padding so visual ink lands at the intended distance.
  // inkExtBelowLb: how far descenders poke below the line-box bottom.
  //   Add this to the margin below so descenders don't bleed into the next element.
  const hOs2A = hm ? hm[9] : 0.8;
  const hOs2D = hm ? hm[10] : 0.2;
  const hAsc  = hm ? hm[4] : 0.72;
  const hDesc = hm ? hm[5] : 0.22;
  const bOs2A = bm ? bm[9] : 0.8;
  const bOs2D = bm ? bm[10] : 0.2;
  const bAsc  = bm ? bm[4] : 0.72;
  const bDesc = bm ? bm[5] : 0.22;

  // Headline (LH 1.15)
  const hInkTopH    = Math.max(0, Math.round(((headerLineHeight + hOs2A - hOs2D) / 2 - hAsc) * headerSize));
  const hInkExtBotH = Math.max(0, Math.round((hDesc - (headerLineHeight - hOs2A + hOs2D) / 2) * headerSize));

  // Font name labels (LH 1.3)
  const hInkTop22    = Math.max(0, Math.round(((headerLabelLH + hOs2A - hOs2D) / 2 - hAsc) * 22));
  const hInkExtBot22 = Math.max(0, Math.round((hDesc - (headerLabelLH - hOs2A + hOs2D) / 2) * 22));
  const bInkTop22    = Math.max(0, Math.round(((bodyLabelLH + bOs2A - bOs2D) / 2 - bAsc) * 22));
  const bInkExtBot22 = Math.max(0, Math.round((bDesc - (bodyLabelLH - bOs2A + bOs2D) / 2) * 22));

  // Section 1
  // Target 16px visual top (24px was too large). Section already has 24px left padding as
  // a buffer for negative LSBs — only compensate the overflow beyond that buffer.
  const sec1PadTop           = Math.max(8, 16 - hInkTopH) + extraTop(headerFont.slug, headerSize);
  const sec1PadBottom        = 16 + extraBottom(bodyFont.slug, bodySize);
  const headlineMarginBottom = 16 + hInkExtBotH           + extraBottom(headerFont.slug, headerSize);

  // Left overflow: section padding (24px) already absorbs most negative LSB ink for the headline.
  // Only compensate the excess beyond that buffer so the headline stays flush with body text.
  // For font name labels (22px), keep the full value — they were already correct.
  const headerLeftPx    = Math.max(0, extraLeft(headerFont.slug, headerSize) - 24);
  const headerLabelLeft = extraLeft(headerFont.slug, 22);
  const bodyLabelLeft   = extraLeft(bodyFont.slug, 22);

  // Sections 3/4: 16px target for top padding (space between divider and HEADER/BODY label).
  const headerSecPadTop      = Math.max(8, 16 - hInkTop22) + extraTop(headerFont.slug, 22);
  const headerNameMarginBot  = 8 + hInkExtBot22;
  const headerSecPadBottom   = 16;
  const bodySecPadTop        = Math.max(8, 16 - bInkTop22) + extraTop(bodyFont.slug, 22);
  const bodyNameMarginBot    = 8 + bInkExtBot22;
  const bodySecPadBottom     = 16;

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
      <div style={{ paddingTop: `${sec1PadTop}px`, paddingBottom: `${sec1PadBottom}px`, paddingLeft: "24px", paddingRight: "24px" }}>
        <h3
          className="text-neutral-900 break-words"
          style={{
            fontFamily: headerFamily,
            fontWeight: 700,
            fontSize: `${headerSize}px`,
            lineHeight: headerLineHeight,
            marginBottom: `${headlineMarginBottom}px`,
            paddingLeft: headerLeftPx > 0 ? `${headerLeftPx}px` : undefined,
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
        <div style={{ paddingTop: `${headerSecPadTop}px`, paddingBottom: `${headerSecPadBottom}px`, paddingLeft: "24px", paddingRight: "24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "4px" }}>
            HEADER
          </span>
          <span
            className="text-neutral-800 block"
            style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "22px", lineHeight: headerLabelLH, marginBottom: `${headerNameMarginBot}px`, paddingLeft: headerLabelLeft > 0 ? `${headerLabelLeft}px` : undefined }}
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
        <div style={{ paddingTop: `${bodySecPadTop}px`, paddingBottom: `${bodySecPadBottom + 8}px`, paddingLeft: "24px", paddingRight: "24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "4px" }}>
            BODY
          </span>
          <span
            className="text-neutral-800 block"
            style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "22px", lineHeight: bodyLabelLH, marginBottom: `${bodyNameMarginBot}px`, paddingLeft: bodyLabelLeft > 0 ? `${bodyLabelLeft}px` : undefined }}
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

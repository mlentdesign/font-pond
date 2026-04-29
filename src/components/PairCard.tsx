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

  // lineHeight: use OS/2 bounds (m[9]+m[10]) — exact values browser uses for line-box layout.
  // Using ink bounds (m[4]+m[5]) was insufficient; OS/2 can be much larger for calligraphic fonts.
  const hm = RENDER_METRICS[headerFont.slug];
  const bm = RENDER_METRICS[bodyFont.slug];
  const headerLineHeight      = hm ? Math.max(1.15, +(hm[9] + hm[10]).toFixed(3)) : 1.15;
  const headerLabelLineHeight = hm ? Math.max(1.3,  +(hm[9] + hm[10]).toFixed(3)) : 1.3;
  const bodyLabelLineHeight   = bm ? Math.max(1.3,  +(bm[9] + bm[10]).toFixed(3)) : 1.3;

  // Dead space inside line box: gap between OS/2 declared bound and actual ink.
  // We subtract dead space from section padding (so visual ink lands at the intended distance)
  // and add it to margins (so visual gap between elements stays correct).
  const headerDeadTop         = hm ? Math.max(0, Math.round((hm[9] - hm[4]) * headerSize)) : 0;
  const headerDeadBottom      = hm ? Math.max(0, Math.round((hm[10] - hm[5]) * headerSize)) : 0;
  const headerLabelDeadTop    = hm ? Math.max(0, Math.round((hm[9] - hm[4]) * 22)) : 0;
  const headerLabelDeadBottom = hm ? Math.max(0, Math.round((hm[10] - hm[5]) * 22)) : 0;
  const bodyLabelDeadTop      = bm ? Math.max(0, Math.round((bm[9] - bm[4]) * 22)) : 0;
  const bodyLabelDeadBottom   = bm ? Math.max(0, Math.round((bm[10] - bm[5]) * 22)) : 0;

  // Section 1: reduce top padding by dead space above ink; increase margin by dead space below ink
  const sec1PadTop           = Math.max(8, 24 - headerDeadTop)   + extraTop(headerFont.slug, headerSize);
  const sec1PadBottom        = 16 + extraBottom(bodyFont.slug, bodySize);
  const headlineMarginBottom = 16 + headerDeadBottom             + extraBottom(headerFont.slug, headerSize);

  // Left overflow: apply only to the element rendered in that font, not the whole section
  const headerLeftPx    = extraLeft(headerFont.slug, headerSize);
  const headerLabelLeft = extraLeft(headerFont.slug, 22);
  const bodyLabelLeft   = extraLeft(bodyFont.slug, 22);

  // Sections 3/4: same dead-space compensation for ascenders/descenders
  const headerSecPadTop    = Math.max(8, 16 - headerLabelDeadTop)    + extraTop(headerFont.slug, 22);
  const headerSecPadBottom = 16 + headerLabelDeadBottom               + extraBottom(headerFont.slug, 22);
  const bodySecPadTop      = Math.max(8, 16 - bodyLabelDeadTop)      + extraTop(bodyFont.slug, 22);
  const bodySecPadBottom   = 16 + bodyLabelDeadBottom                 + extraBottom(bodyFont.slug, 22);

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
            style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "22px", lineHeight: headerLabelLineHeight, marginBottom: "8px", paddingLeft: headerLabelLeft > 0 ? `${headerLabelLeft}px` : undefined }}
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
            style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "22px", lineHeight: bodyLabelLineHeight, marginBottom: "8px", paddingLeft: bodyLabelLeft > 0 ? `${bodyLabelLeft}px` : undefined }}
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

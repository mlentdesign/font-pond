"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ScoredPair } from "@/data/types";
import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import { navigateToPair } from "@/lib/navigate";
import { getFontFamily, loadFont } from "@/lib/fonts";
import { chipCase } from "@/lib/text";
import { distinctiveTags } from "@/lib/chips";
import type { Font } from "@/data/types";
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
  const { sampleHeadline, sampleBody, headerSize, bodySize, results } = useAppState();
  const headerPeers = useMemo(() => results.map((r) => r.headerFont), [results]);
  const bodyPeers = useMemo(() => results.map((r) => r.bodyFont), [results]);
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

  // CSS line-box geometry. With line-height LH, the baseline sits at
  //   (LH + os2Asc - os2Desc) / 2 * fontSize  below the line-box top.
  // inkTopOffset = distance from line-box top to first visible ink (can be NEGATIVE — that means
  //   ink overflows above the line-box top, so padding must be increased, not decreased).
  // Clamping to 0 was wrong: negative values need to ADD to padding, not cancel out.
  const hOs2A = hm ? hm[9] : 0.8;
  const hOs2D = hm ? hm[10] : 0.2;
  const hAsc  = hm?.[11] ?? (hm ? hm[4] : 0.72);
  const hDesc = hm ? hm[5] : 0.22;
  const bOs2A = bm ? bm[9] : 0.8;
  const bOs2D = bm ? bm[10] : 0.2;
  const bAsc  = bm?.[11] ?? (bm ? bm[4] : 0.72);
  const bDesc = bm ? bm[5] : 0.22;

  // Ink-top offset (signed): positive = dead space above ink; negative = ink overflows above lb-top.
  // Ink-ext-bottom: how far descenders poke below the line-box bottom (always ≥ 0).
  const hInkTopOffset    = Math.round(((headerLineHeight + hOs2A - hOs2D) / 2 - hAsc) * headerSize);
  const hInkExtBot       = Math.max(0, Math.round((hDesc - (headerLineHeight - hOs2A + hOs2D) / 2) * headerSize));
  const hInkTopOffset22  = Math.round(((headerLabelLH + hOs2A - hOs2D) / 2 - hAsc) * 22);
  const hInkExtBot22     = Math.max(0, Math.round((hDesc - (headerLabelLH - hOs2A + hOs2D) / 2) * 22));
  const bInkTopOffset22  = Math.round(((bodyLabelLH + bOs2A - bOs2D) / 2 - bAsc) * 22);
  const bInkExtBot22     = Math.max(0, Math.round((bDesc - (bodyLabelLH - bOs2A + bOs2D) / 2) * 22));

  // Section 1: target 16px from card top to first visible ink.
  // extraTop/extraBottom removed — the geometry formula already uses ascentRatio/descentRatio
  // which incorporates any ink that overflows OS/2 bounds (no double-counting).
  const sec1PadTop           = Math.max(8, 24 - hInkTopOffset);
  const sec1PadBottom        = 16;
  const headlineMarginBottom = 16 + hInkExtBot;

  // Left overflow: 24px section padding already buffers most negative LSBs for the headline.
  // Font-name labels keep the full value — they were correct.
  const headerLeftPx    = Math.max(0, extraLeft(headerFont.slug, headerSize) - 24);
  const headerLabelLeft = extraLeft(headerFont.slug, 22);
  const bodyLabelLeft   = extraLeft(bodyFont.slug, 22);

  // Sections 3/4: section container padding is fixed at 16px on all sides so every divider
  // has equal spacing above and below. Only the font-name element's own marginBottom is
  // dynamic — it pushes chips clear of descenders without touching the divider rhythm.
  // headerLabelMarginBot also compensates when script font ink overflows above its label line-box.
  const headerSecPadTop     = 16;
  const headerLabelMarginBot = Math.max(4, 4 + Math.max(0, -hInkTopOffset22));
  const headerNameMarginBot  = 8 + hInkExtBot22;
  const headerSecPadBottom  = 16;
  const bodySecPadTop       = 16;
  const bodyLabelMarginBot   = Math.max(4, 4 + Math.max(0, -bInkTopOffset22));
  const bodyNameMarginBot    = 8 + bInkExtBot22;
  const bodySecPadBottom    = 16;

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

        {/* Section 3: Header font + chips (the description is not shown on tiles; it lives on the pair page) */}
        <div style={{ paddingTop: `${headerSecPadTop}px`, paddingBottom: `${headerSecPadBottom}px`, paddingLeft: "24px", paddingRight: "24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: `${headerLabelMarginBot}px` }}>
            HEADER
          </span>
          <span
            className="text-neutral-800 block"
            style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "22px", lineHeight: headerLabelLH, marginBottom: `${headerNameMarginBot}px`, paddingLeft: headerLabelLeft > 0 ? `${headerLabelLeft}px` : undefined }}
          >
            {headerFont.name}
          </span>
          <ChipRows font={headerFont} peers={headerPeers} />
        </div>

        <div className="border-t border-neutral-100" />

        {/* Section 4: Body font + chips */}
        <div style={{ paddingTop: `${bodySecPadTop}px`, paddingBottom: `${bodySecPadBottom + 8}px`, paddingLeft: "24px", paddingRight: "24px" }}>
          <span className="uppercase tracking-wider text-neutral-400 block leading-none" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: `${bodyLabelMarginBot}px` }}>
            BODY
          </span>
          <span
            className="text-neutral-800 block"
            style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "22px", lineHeight: bodyLabelLH, marginBottom: `${bodyNameMarginBot}px`, paddingLeft: bodyLabelLeft > 0 ? `${bodyLabelLeft}px` : undefined }}
          >
            {bodyFont.name}
          </span>
          <ChipRows font={bodyFont} peers={bodyPeers} />
        </div>
      </div>
    </div>
  );
}

const MAX_ROWS = 2;
const CHIP_GAP = 8;
const CHIP_STYLE = { fontSize: "14px", padding: "4px 12px", lineHeight: "20px" } as const;
const CHIP_ROW_HEIGHT = 4 + 20 + 4; // padding + line-height
const CHIP_AREA_HEIGHT = MAX_ROWS * CHIP_ROW_HEIGHT + (MAX_ROWS - 1) * CHIP_GAP;

// Two rows of the font's most distinctive chips on every card width (mobile included).
// Whatever still doesn't fit after filling those rows collapses into "+N more".
// Fitting uses the chip box positions inside this container, so a position:relative
// ancestor cannot make hidden chips look like an extra row.
function ChipRows({ font, peers }: { font: Font; peers: Font[] }) {
  const { chips, total } = useMemo(() => distinctiveTags(font, peers), [font, peers]);
  const ref = useRef<HTMLDivElement>(null);
  const key = `${font.id}:${peers.length}:${chips.join("|")}`;
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      if (kids.length === 0) return;
      const more = kids[kids.length - 1], tags = kids.slice(0, -1);
      tags.forEach((k) => { k.style.display = ""; });
      more.style.display = "";
      let shown = tags.length;
      const rowCount = () => {
        const origin = el.getBoundingClientRect().top;
        const tops = new Set<number>();
        for (const k of tags) {
          if (k.style.display === "none") continue;
          tops.add(Math.round(k.getBoundingClientRect().top - origin));
        }
        if (more.style.display !== "none") {
          tops.add(Math.round(more.getBoundingClientRect().top - origin));
        }
        return tops.size;
      };
      const label = () => {
        const n = total - shown;
        more.textContent = shown === 0 ? `See all ${n} tags` : `+${n} more`;
        more.style.display = n > 0 ? "" : "none";
      };
      label();
      while (shown > 0 && rowCount() > MAX_ROWS) {
        tags[--shown].style.display = "none";
        label();
      }
    };
    fit();
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 1) { w = el.clientWidth; fit(); } });
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [key, total]);
  return (
    <div ref={ref} className="flex flex-wrap" style={{ gap: `${CHIP_GAP}px`, minHeight: `${CHIP_AREA_HEIGHT}px` }}>
      {chips.map((tag) => (
        <span key={tag} className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100" style={CHIP_STYLE}>
          {chipCase(tag)}
        </span>
      ))}
      <span className="text-neutral-400 rounded-md" style={{ ...CHIP_STYLE, border: "1px solid transparent" }}>{chips.length === 0 ? `See all ${total} tags` : `+${total} more`}</span>
    </div>
  );
}

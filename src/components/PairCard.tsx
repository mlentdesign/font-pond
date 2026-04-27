"use client";

import { useRouter } from "next/navigation";
import { ScoredPair } from "@/data/types";
import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import { navigateToPair } from "@/lib/navigate";
import { getFontFamily } from "@/lib/fonts";
import { sentenceCase, chipCase } from "@/lib/text";

export function PairCard({ pair, isExploring = false, animationDelay = 0 }: { pair: ScoredPair; isExploring?: boolean; animationDelay?: number }) {
  const { sampleHeadline, sampleBody, headerSize, bodySize } = useAppState();
  const router = useRouter();
  const headline = sampleHeadline || DEFAULT_HEADLINE;
  const body = sampleBody || DEFAULT_BODY;

  const { headerFont, bodyFont } = pair;

  const headerFamily = getFontFamily(headerFont.name, headerFont.source);
  const bodyFamily = getFontFamily(bodyFont.name, bodyFont.source);

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
      <div style={{ padding: "24px", paddingBottom: "16px" }}>
        <h3
          className="text-neutral-900 break-words"
          style={{
            fontFamily: headerFamily,
            fontWeight: 700,
            fontSize: `${headerSize}px`,
            lineHeight: 1.15,
            marginBottom: "16px",
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
        <div style={{ padding: "16px 24px" }}>
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
        <div style={{ padding: "16px 24px 24px" }}>
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

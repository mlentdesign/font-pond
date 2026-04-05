"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pairsBySlug, getPairOrConstruct } from "@/data/pairs";
import { fontsById } from "@/data/fonts";
import { getRelatedPairs } from "@/lib/engine";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import { HeaderWithFontInfo } from "@/components/HeaderWithFontInfo";
import { ThemeToggle } from "@/components/ThemeToggle";

function sc(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

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
  const sourceLabel = font.source === "google-fonts" ? "Google Fonts" : font.source === "fontshare" ? "Fontshare" : "DaFont";

  // Combine tags and tone descriptors — filter out compound-adjective-style entries
  const allChips = [...new Set([...font.tags, ...font.toneDescriptors].map(t => t.toLowerCase()))]
    .filter(t => {
      // Skip entries with 3+ hyphenated segments (compound adjectives like "well-anchored-serif")
      const segments = t.split("-");
      if (segments.length >= 3) return false;
      // Skip very long entries
      if (t.length > 25) return false;
      return true;
    });
  const [showAllChips, setShowAllChips] = useState(false);
  const visibleChips = showAllChips ? allChips : allChips.slice(0, 8);

  return (
    <Link
      href={`/font/${font.slug}?from=${pairSlug}`}
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
        <span className="uppercase tracking-wider text-neutral-400 block mb-1.5" style={{ fontSize: "12px" }}>
          CHARACTERISTICS
        </span>
        <div className="flex flex-wrap items-center" style={{ gap: "8px" }}>
          {visibleChips.map((chip, i) => (
            <span
              key={`${i}-${chip}`}
              className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100"
              style={{ fontSize: "14px", padding: "4px 12px" }}
            >
              {chip}
            </span>
          ))}
          {allChips.length > 8 && !showAllChips && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllChips(true); }}
              style={{ fontSize: "14px", color: "var(--text-label)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: "4px 0" }}
            >
              +{allChips.length - 8} more
            </button>
          )}
          {showAllChips && allChips.length > 8 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllChips(false); }}
              style={{ fontSize: "14px", color: "var(--text-label)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: "4px 0" }}
            >
              See less
            </button>
          )}
        </div>
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

export default function PairDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { sampleHeadline, sampleBody, addToHistory } = useAppState();
  const router = useRouter();

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

  // Load related pair fonts
  const related = pair ? getRelatedPairs(pair.id, 3) : [];
  useEffect(() => {
    for (const rp of related) {
      loadFont(rp.headerFont);
      loadFont(rp.bodyFont);
    }
  }, [related]);

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
      {/* Sticky header */}
      <header className="w-full border-b sticky top-0 z-30" style={{ background: "var(--bg-header)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between shell-padding" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
          <div className="hover:opacity-80 transition-opacity min-w-0 flex-1 cursor-pointer" role="button" tabIndex={0} onClick={() => router.push("/")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/"); } }}>
            <HeaderWithFontInfo />
          </div>
          <div className="shrink-0" style={{ marginLeft: "16px" }}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 mx-auto w-full shell-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "24px" }}>
          <ol className="flex items-center gap-2 text-xs text-neutral-400">
            <li>
              <Link href="/" className="hover:text-neutral-600 transition-colors">
                Results
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-600">
              {headerFont.name} + {bodyFont.name}
            </li>
          </ol>
        </nav>

        {/* Pair specimen */}
        <div className="border border-neutral-200 rounded-xl bg-white" style={{ padding: "24px", marginBottom: "24px" }}>
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

          {/* Scale suggestion */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="uppercase tracking-wider text-neutral-400 mb-3" style={{ fontSize: "12px" }}>
              SUGGESTED SCALE
            </p>
            <div className="space-y-2">
              <p style={{ fontFamily: headerFamily, fontWeight: 700, fontSize: "36px" }} className="text-neutral-800">
                H1 — 36px Bold
              </p>
              <p style={{ fontFamily: headerFamily, fontWeight: 600, fontSize: "24px" }} className="text-neutral-800">
                H2 — 24px Semibold
              </p>
              <p style={{ fontFamily: headerFamily, fontWeight: 500, fontSize: "18px" }} className="text-neutral-700">
                H3 — 18px Medium
              </p>
              <p style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "16px" }} className="text-neutral-600">
                Body — 16px Regular
              </p>
              <p style={{ fontFamily: bodyFamily, fontWeight: 400, fontSize: "14px" }} className="text-neutral-500">
                Small — 14px Regular
              </p>
            </div>
          </div>
        </div>

        {/* Why this works — stacked, full width */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden" style={{ marginBottom: "24px" }}>
          <div style={{ padding: "24px" }}>
            <h3 className="uppercase tracking-wider text-neutral-400 font-medium" style={{ fontSize: "12px", marginBottom: "8px" }}>WHY THIS WORKS</h3>
            <p className="text-neutral-700 leading-relaxed" style={{ fontSize: "16px" }}>{sc(pair.rationale)}</p>
          </div>
        </div>

        {/* Details card — same spacing as above */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden" style={{ marginBottom: "24px" }}>
          <dl style={{ padding: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "4px" }}>TONE</dt>
              <dd className="text-neutral-700" style={{ fontSize: "16px" }}>{sc(pair.toneSummary)}</dd>
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

          {/* Edge-to-edge divider */}
          <div style={{ borderTop: "1px solid var(--divider)" }} />

          <div style={{ padding: "24px" }}>
            <p className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "8px" }}>USE CASES</p>
            <div className="flex flex-wrap" style={{ gap: "8px" }}>
              {[...new Set(pair.useCases)].map((uc, i) => (
                <span
                  key={`uc-${i}-${uc}`}
                  className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100"
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  {uc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Font sections — 24px between cards */}
        <div className="two-col-grid" style={{ marginBottom: "40px" }}>
          <FontSection font={headerFont} role="Header" pairSlug={slug} />
          <FontSection font={bodyFont} role="Body" pairSlug={slug} />
</div>

        {/* Other interesting pairings */}
        {related.length > 0 && (
          <div>
            <h3 className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>Other interesting pairings for you</h3>
            <div className="pair-grid">
              {related.map((rp) => {
                const rpHeaderFamily = getFontFamily(rp.headerFont.name, rp.headerFont.source);
                const rpBodyFamily = getFontFamily(rp.bodyFont.name, rp.bodyFont.source);
                return (
                  <Link
                    key={rp.id}
                    href={`/pair/${rp.slug}`}
                    className="border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 hover:shadow-sm transition-all overflow-hidden"
                    style={{ padding: "24px" }}
                  >
                    {/* Font preview */}
                    <p
                      className="text-xl leading-tight text-neutral-800 break-words"
                      style={{ fontFamily: rpHeaderFamily, fontWeight: 700, marginBottom: "8px" }}
                    >
                      {sampleHeadline || "The quick brown fox"}
                    </p>
                    <p
                      className="text-neutral-500 line-clamp-2 break-words"
                      style={{ fontFamily: rpBodyFamily, fontWeight: 400, fontSize: "16px", lineHeight: 1.5, marginBottom: "16px" }}
                    >
                      Typography is the art and technique of arranging type.
                    </p>

                    {/* Names */}
                    <p className="font-medium text-neutral-700 break-words" style={{ fontSize: "16px", marginBottom: "8px" }}>
                      {rp.headerFont.name} + {rp.bodyFont.name}
                    </p>
                    {/* Why this works */}
                    <p className="text-neutral-400 break-words" style={{ fontSize: "16px" }}>
                      {sc(rp.rationale)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

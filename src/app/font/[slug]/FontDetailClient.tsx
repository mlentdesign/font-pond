"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { fontsBySlug, fontsById } from "@/data/fonts";
import { getPairsWithFont } from "@/lib/engine";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { pairsBySlug } from "@/data/pairs";
import { HeaderWithFontInfo } from "@/components/HeaderWithFontInfo";
import { ThemeToggle } from "@/components/ThemeToggle";

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-neutral-100 last:border-0" style={{ padding: "12px 24px" }}>
      <dt className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px" }}>{label.toUpperCase()}</dt>
      <dd className="text-neutral-700 text-right max-w-[60%]" style={{ fontSize: "16px" }}>{titleCase(value)}</dd>
    </div>
  );
}

function PairsUsingSection({ pairs, fontName }: { pairs: import("@/data/types").ScoredPair[]; fontName: string }) {
  const [visible, setVisible] = useState(6);
  const hasMore = visible < pairs.length;

  return (
    <div style={{ marginTop: "24px" }}>
      <h3 className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>Pairs using {fontName}</h3>
      <div className="pair-grid">
        {pairs.slice(0, visible).map((p) => {
          const hFamily = getFontFamily(p.headerFont.name, p.headerFont.source);
          const bFamily = getFontFamily(p.bodyFont.name, p.bodyFont.source);
          return (
            <Link
              key={p.id}
              href={`/pair/${p.slug}`}
              className="border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 hover:shadow-sm transition-all"
              style={{ padding: "24px" }}
            >
              <p className="text-lg leading-tight text-neutral-800" style={{ fontFamily: hFamily, fontWeight: 700, marginBottom: "8px" }}>
                The quick brown fox
              </p>
              <p className="text-neutral-500 line-clamp-2" style={{ fontFamily: bFamily, fontWeight: 400, fontSize: "16px", lineHeight: 1.5, marginBottom: "16px" }}>
                Typography is the art and technique of arranging type.
              </p>
              <p className="font-medium text-neutral-700" style={{ fontSize: "16px" }}>
                {p.headerFont.name} + {p.bodyFont.name}
              </p>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center" style={{ marginTop: "32px" }}>
          <button
            onClick={() => setVisible(Math.min(visible + 6, pairs.length))}
            className="outline-btn font-medium rounded-lg transition-colors"
            style={{ fontSize: "16px", padding: "8px 24px" }}
          >
            Load more pairs
          </button>
        </div>
      )}
    </div>
  );
}

export default function FontDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const fromPair = searchParams.get("from");

  const router = useRouter();
  const font = fontsBySlug.get(slug);

  let parentPairLabel: string | null = null;
  if (fromPair) {
    const pair = pairsBySlug.get(fromPair);
    if (pair) {
      const hf = fontsById.get(pair.headerFontId);
      const bf = fontsById.get(pair.bodyFontId);
      if (hf && bf) parentPairLabel = `${hf.name} + ${bf.name}`;
    }
  }

  useEffect(() => {
    if (font) loadFont(font);
  }, [font]);

  const pairsUsing = font ? getPairsWithFont(font.id) : [];

  // Load fonts for pair previews
  useEffect(() => {
    for (const p of pairsUsing) {
      loadFont(p.headerFont);
      loadFont(p.bodyFont);
    }
  }, [pairsUsing]);

  if (!font) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400">Font not found.</p>
      </div>
    );
  }

  const family = getFontFamily(font.name, font.source);
  const sourceLabel = font.source === "google-fonts" ? "Google Fonts" : font.source === "fontshare" ? "Fontshare" : "DaFont";

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
          <ol className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
            <li>
              <Link href="/" className="hover:text-neutral-600 transition-colors">
                Results
              </Link>
            </li>
            {fromPair && parentPairLabel && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/pair/${fromPair}`}
                    className="hover:text-neutral-600 transition-colors"
                  >
                    {parentPairLabel}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li className="text-neutral-600">{font.name}</li>
          </ol>
        </nav>

        {/* Font name, source, and download */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between" style={{ marginBottom: "24px", gap: "16px" }}>
          <div>
            <h2 className="text-3xl font-semibold text-neutral-900 mb-1">{font.name}</h2>
            <p className="text-sm text-neutral-400">
              {font.designer && `By ${font.designer}`}
              {font.year && `${font.designer ? " · " : ""}${font.year}`}
              {(font.designer || font.year) ? ` · ${sourceLabel}` : sourceLabel}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 mt-1">
            {font.sourceUrl && (
              <a
                href={font.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="outline-btn font-medium rounded-lg transition-colors" style={{ fontSize: "16px", padding: "8px 24px" }}
              >
                Download ↗
              </a>
            )}
          </div>
        </div>

        {/* Specimen */}
        <div className="border border-neutral-200 rounded-xl bg-white" style={{ padding: "24px", marginBottom: "24px" }}>
          <div className="space-y-4">
            <p style={{ fontFamily: family, fontWeight: 700, fontSize: "48px" }} className="text-neutral-900 leading-tight">
              The quick brown fox
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "32px" }} className="text-neutral-700 leading-snug">
              jumps over the lazy dog
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "16px", lineHeight: 1.7 }} className="text-neutral-600">
              Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "14px", lineHeight: 1.6 }} className="text-neutral-500">
              At 14px: Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.
            </p>
          </div>

          {/* Alphabet */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="text-neutral-600 mb-2">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="text-neutral-600 mb-2">
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p style={{ fontFamily: family, fontWeight: 400, fontSize: "18px" }} className="text-neutral-600">
              0123456789 !@#$%^&*()-=+[]{'{'}|;:&apos;,./&lt;&gt;?
            </p>
          </div>

          {/* Weight samples */}
          {font.weights.length > 1 && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <p className="uppercase tracking-wider text-neutral-400 mb-3" style={{ fontSize: "12px" }}>WEIGHTS</p>
              <div className="space-y-2">
                {font.weights.map((w) => (
                  <p
                    key={w}
                    style={{ fontFamily: family, fontWeight: w, fontSize: "18px" }}
                    className="text-neutral-700"
                  >
                    {w} — The quick brown fox jumps over the lazy dog
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details — two columns */}
        <div className="two-col-grid" style={{ marginBottom: "24px" }}>
          <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <dl>
              <InfoRow label="Classification" value={font.classification} />
              <InfoRow label="Subcategory" value={font.subcategory} />
              <InfoRow label="Category" value={font.serifSansCategory} />
              <InfoRow label="Variable font" value={font.variableFont ? "Yes" : "No"} />
              <InfoRow label="Weights" value={font.weights.join(", ")} />
              <InfoRow label="Styles" value={font.styles.join(", ")} />
              <InfoRow label="License" value={font.licenseType} />
              <InfoRow label="Header suitable" value={font.isHeaderSuitable ? "Yes" : "No"} />
              <InfoRow label="Body suitable" value={font.isBodySuitable ? "Yes" : "Typically not recommended"} />
              {font.bodyLegibilityScore && (
                <InfoRow label="Body legibility" value={`${font.bodyLegibilityScore}/10`} />
              )}
            </dl>
          </div>

          <div className="border border-neutral-200 rounded-xl bg-white" style={{ padding: "24px" }}>
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {font.distinctiveTraits.length > 0 && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>DISTINCTIVE TRAITS</p>
                  <div className="flex flex-wrap" style={{ gap: "8px" }}>
                    {font.distinctiveTraits.map((trait) => (
                      <span key={`t-${trait}`} className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100" style={{ fontSize: "14px", padding: "4px 12px" }}>
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {font.toneDescriptors.length > 0 && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>TONE</p>
                  <div className="flex flex-wrap" style={{ gap: "8px" }}>
                    {font.toneDescriptors.map((tone) => (
                      <span key={`tn-${tone}`} className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100" style={{ fontSize: "14px", padding: "4px 12px" }}>
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {font.useCases.length > 0 && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>USE CASES</p>
                  <div className="flex flex-wrap" style={{ gap: "8px" }}>
                    {font.useCases.map((uc) => (
                      <span key={`uc-${uc}`} className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100" style={{ fontSize: "14px", padding: "4px 12px" }}>
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {font.screenReadabilityNotes && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>SCREEN READABILITY</p>
                  <p className="text-xs text-neutral-600 leading-relaxed">{font.screenReadabilityNotes}</p>
                </div>
              )}

              {font.historicalNotes && (
                <div>
                  <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>HISTORY</p>
                  <p className="text-xs text-neutral-600 leading-relaxed">{font.historicalNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full characteristics — all enriched tags, filtered for clean display */}
        {font.tags.length > 0 && (
          <div className="border border-neutral-200 rounded-xl bg-white" style={{ padding: "24px", marginBottom: "24px" }}>
            <p className="uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", marginBottom: "16px" }}>ALL CHARACTERISTICS</p>
            <div className="flex flex-wrap" style={{ gap: "8px" }}>
              {[...new Set(font.tags)]
                .filter(t => {
                  const segments = t.split("-");
                  if (segments.length >= 3) return false;
                  if (t.length > 25) return false;
                  return true;
                })
                .map((tag, i) => (
                  <span
                    key={`all-${i}-${tag}`}
                    className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100"
                    style={{ fontSize: "14px", padding: "4px 12px" }}
                  >
                    {tag}
                  </span>
                ))
              }
            </div>
          </div>
        )}

        {/* Similar fonts */}
        {font.similarFonts.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 className="uppercase tracking-wider text-neutral-400 font-medium" style={{ fontSize: "12px", marginBottom: "16px" }}>SIMILAR FONTS</h3>
            <div className="flex flex-wrap gap-2">
              {font.similarFonts.map((sf) => {
                const similar = fontsBySlug.get(sf);
                if (!similar) return null;
                return (
                  <Link
                    key={sf}
                    href={`/font/${sf}`}
                    className="outline-btn font-medium rounded-lg transition-colors" style={{ fontSize: "16px", padding: "8px 16px" }}
                  >
                    {similar.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Pairs using this font — progressive loading */}
        {pairsUsing.length > 0 && (
          <PairsUsingSection pairs={pairsUsing} fontName={font.name} />
        )}
      </main>
    </div>
  );
}

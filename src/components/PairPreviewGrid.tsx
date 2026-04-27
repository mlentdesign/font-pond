"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoredPair } from "@/data/types";
import { loadFont, getFontFamily, ensureFontsRendered } from "@/lib/fonts";
import { sentenceCase } from "@/lib/text";
import { navigateToPair } from "@/lib/navigate";

function useColumns(): number {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 1024) setCols(3);
      else if (window.innerWidth >= 768) setCols(2);
      else setCols(1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return cols;
}

interface PairPreviewGridProps {
  pairs: ScoredPair[];
  title: string;
  initialVisible?: number;
  loadMoreIncrement?: number;
  headlineText?: string;
  bodyText?: string;
  showRationale?: boolean;
}

export function PairPreviewGrid({
  pairs,
  title,
  initialVisible = 6,
  loadMoreIncrement = 6,
  headlineText = "The quick brown fox",
  bodyText = "Typography is the art and technique of arranging type.",
  showRationale = false,
}: PairPreviewGridProps) {
  const cols = useColumns();
  const router = useRouter();
  const adjustedInitial = Math.ceil(initialVisible / cols) * cols;
  const adjustedIncrement = Math.ceil(loadMoreIncrement / cols) * cols;
  const [visible, setVisible] = useState(adjustedInitial);

  useEffect(() => {
    setVisible(Math.ceil(initialVisible / cols) * cols);
  }, [cols, initialVisible]);

  const hasMore = visible < pairs.length;

  // Load fonts for newly visible pairs
  useEffect(() => {
    const fontNames: string[] = [];
    for (const p of pairs.slice(0, visible)) {
      loadFont(p.headerFont);
      loadFont(p.bodyFont);
      fontNames.push(p.headerFont.name, p.bodyFont.name);
    }
    ensureFontsRendered(fontNames);
  }, [pairs, visible]);

  if (pairs.length === 0) return null;

  return (
    <div className="detail-subheading">
      <h3 className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>{title}</h3>
      <div className="pair-grid">
        {pairs.slice(0, visible).map((p) => {
          const hFamily = getFontFamily(p.headerFont.name, p.headerFont.source);
          const bFamily = getFontFamily(p.bodyFont.name, p.bodyFont.source);
          return (
            <div
              key={p.id}
              role="link"
              tabIndex={0}
              aria-label={`View font pair: ${p.headerFont.name} and ${p.bodyFont.name}`}
              onClick={() => { navigateToPair(router, p.slug); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToPair(router, p.slug); } }}
              onMouseDown={(e) => e.preventDefault()}
              className="group border border-neutral-200 rounded-xl bg-white card-hover hover:border-neutral-300 hover:shadow-sm overflow-hidden cursor-pointer flex flex-col"
              style={{ padding: "24px", position: "relative" }}
            >
              <span
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ position: "absolute", top: "16px", right: "16px", color: "var(--text-ransom)", fontSize: "16px", pointerEvents: "none" }}
              >
                ↗
              </span>
              <div>
                <p
                  className="leading-tight text-neutral-800 line-clamp-2"
                  style={{ fontFamily: hFamily, fontWeight: 700, fontSize: "24px", marginBottom: "8px" }}
                >
                  {headlineText}
                </p>
                <p
                  className="text-neutral-500 line-clamp-2 break-words"
                  style={{ fontFamily: bFamily, fontWeight: 400, fontSize: "16px", lineHeight: 1.5 }}
                >
                  {bodyText}
                </p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
                <p className="font-medium text-neutral-700 break-words" style={{ fontSize: "16px", marginBottom: showRationale ? "8px" : undefined }}>
                  {p.headerFont.name} + {p.bodyFont.name}
                </p>
                {showRationale && (
                  <p className="text-neutral-400 break-words" style={{ fontSize: "16px" }}>
                    {sentenceCase(p.rationale)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(v + adjustedIncrement, pairs.length))}
            className="outline-btn font-medium rounded-lg"
            style={{ fontSize: "16px", padding: "12px 24px" }}
          >
            Load more pairs
          </button>
        </div>
      )}
    </div>
  );
}

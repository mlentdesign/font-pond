"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScoredPair } from "@/data/types";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { sentenceCase } from "@/lib/text";

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
  // Fill complete rows: round up initialVisible to nearest multiple of cols
  const adjustedInitial = Math.ceil(initialVisible / cols) * cols;
  const adjustedIncrement = Math.ceil(loadMoreIncrement / cols) * cols;
  const [visible, setVisible] = useState(adjustedInitial);

  useEffect(() => {
    setVisible(Math.ceil(initialVisible / cols) * cols);
  }, [cols, initialVisible]);
  const hasMore = visible < pairs.length;

  useEffect(() => {
    for (const p of pairs.slice(0, visible)) {
      loadFont(p.headerFont);
      loadFont(p.bodyFont);
    }
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
            <Link
              key={p.id}
              href={`/pair?p=${p.slug}`}
              className="border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 hover:shadow-sm transition-all overflow-hidden"
              style={{ padding: "24px" }}
            >
              <p
                className="text-lg leading-tight text-neutral-800 break-words"
                style={{ fontFamily: hFamily, fontWeight: 700, marginBottom: "8px" }}
              >
                {headlineText}
              </p>
              <p
                className="text-neutral-500 line-clamp-2 break-words"
                style={{ fontFamily: bFamily, fontWeight: 400, fontSize: "16px", lineHeight: 1.5 }}
              >
                {bodyText}
              </p>
              <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: "0" }} />
              <p className="font-medium text-neutral-700 break-words" style={{ fontSize: "16px", marginBottom: showRationale ? "8px" : undefined }}>
                {p.headerFont.name} + {p.bodyFont.name}
              </p>
              {showRationale && (
                <p className="text-neutral-400 break-words" style={{ fontSize: "16px" }}>
                  {sentenceCase(p.rationale)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center" style={{ marginTop: "32px" }}>
          <button
            onClick={() => setVisible(Math.min(visible + adjustedIncrement, pairs.length))}
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

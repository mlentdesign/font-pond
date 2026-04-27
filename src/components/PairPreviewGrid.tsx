"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScoredPair } from "@/data/types";
import { loadFont, getFontFamily } from "@/lib/fonts";
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

type VisiblePair = { pair: ScoredPair; delay: number; animate: boolean };

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
  const colsRef = useRef(cols);
  colsRef.current = cols;

  // Render initial batch immediately — no wait, no animation, matching page load feel
  const adjustedInitial = Math.ceil(initialVisible / cols) * cols;
  const [visiblePairs, setVisiblePairs] = useState<VisiblePair[]>(() =>
    pairs.slice(0, adjustedInitial).map(pair => ({ pair, delay: 0, animate: false }))
  );
  const [loadingMore, setLoadingMore] = useState(false);

  // Re-init when pairs prop changes (page navigation)
  useEffect(() => {
    const count = Math.ceil(initialVisible / cols) * cols;
    setVisiblePairs(pairs.slice(0, count).map(pair => ({ pair, delay: 0, animate: false })));
    // Pre-load fonts for all initial cards
    for (const p of pairs.slice(0, count)) {
      loadFont(p.headerFont);
      loadFont(p.bodyFont);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  // Pre-load fonts for initial batch on mount
  useEffect(() => {
    for (const { pair } of visiblePairs) {
      loadFont(pair.headerFont);
      loadFont(pair.bodyFont);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = visiblePairs.length < pairs.length;

  function computeDelays(newPairs: ScoredPair[], existingCount: number): VisiblePair[] {
    const c = colsRef.current;
    const colHeights = Array(c).fill(0) as number[];
    for (let i = 0; i < existingCount; i++) colHeights[i % c]++;

    const entries = newPairs.map((pair, batchIdx) => {
      const colIdx = (existingCount + batchIdx) % c;
      return { pair, colIdx, height: colHeights[colIdx] };
    });
    const sorted = [...entries].sort((a, b) => a.height - b.height);
    const delayByCol = new Map<number, number>();
    sorted.forEach(({ colIdx }, rank) => delayByCol.set(colIdx, rank * 80));

    return entries.map(({ pair, colIdx }) => ({
      pair,
      delay: delayByCol.get(colIdx) ?? 0,
      animate: true,
    }));
  }

  function handleLoadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const existingCount = visiblePairs.length;
    const increment = Math.ceil(loadMoreIncrement / cols) * cols;
    const batch = pairs.slice(existingCount, existingCount + increment);

    // Pre-load fonts, then reveal with staggered animation
    for (const p of batch) { loadFont(p.headerFont); loadFont(p.bodyFont); }

    // Small delay so fonts have a moment to start loading before cards appear
    setTimeout(() => {
      const newVPs = computeDelays(batch, existingCount);
      setVisiblePairs(prev => [
        ...prev.map(vp => ({ ...vp, animate: false })),
        ...newVPs,
      ]);
      setLoadingMore(false);
    }, 150);
  }

  if (pairs.length === 0) return null;

  return (
    <div className="detail-subheading">
      <h3 className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>{title}</h3>
      <div className="pair-grid">
        {visiblePairs.map(({ pair, delay, animate }) => {
          const hFamily = getFontFamily(pair.headerFont.name, pair.headerFont.source);
          const bFamily = getFontFamily(pair.bodyFont.name, pair.bodyFont.source);
          return (
            <div
              key={pair.id}
              role="link"
              tabIndex={0}
              aria-label={`View font pair: ${pair.headerFont.name} and ${pair.bodyFont.name}`}
              onClick={() => { navigateToPair(router, pair.slug); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToPair(router, pair.slug); } }}
              onMouseDown={(e) => e.preventDefault()}
              className="group border border-neutral-200 rounded-xl bg-white card-hover hover:border-neutral-300 hover:shadow-sm overflow-hidden cursor-pointer flex flex-col"
              style={{
                padding: "24px",
                position: "relative",
                animation: animate ? `pair-card-enter 400ms ease-out ${delay}ms both` : undefined,
              }}
            >
              <span
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ position: "absolute", top: "16px", right: "16px", color: "var(--text-ransom)", fontSize: "16px", pointerEvents: "none" }}
              >
                ↗
              </span>
              <div>
                <p
                  className="leading-tight text-neutral-800 break-words"
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
                  {pair.headerFont.name} + {pair.bodyFont.name}
                </p>
                {showRationale && (
                  <p className="text-neutral-400 break-words" style={{ fontSize: "16px" }}>
                    {sentenceCase(pair.rationale)}
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
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="outline-btn font-medium rounded-lg"
            style={{ fontSize: "16px", padding: "12px 24px" }}
          >
            {loadingMore ? "Loading…" : "Load more pairs"}
          </button>
        </div>
      )}
    </div>
  );
}

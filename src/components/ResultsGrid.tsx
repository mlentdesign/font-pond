"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/lib/store";
import { PairCard } from "./PairCard";
import { loadFont, ensureFontsRendered, pinFonts } from "@/lib/fonts";

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

export function ResultsGrid() {
  const { results, isLoading, hasSearched, isExploring, visibleCount, setVisibleCount } = useAppState();
  const cols = useColumns();

  // Initial count and increment based on column layout
  const initialCount = cols >= 3 ? 3 : cols >= 2 ? 4 : 3;
  const loadIncrement = cols >= 3 ? 3 : cols >= 2 ? 2 : 3;

  // On first render, column change, or new results: snap visibleCount to fill complete rows.
  // results in deps ensures a re-explore (same hasSearched=true) also resets correctly.
  useEffect(() => {
    if (hasSearched && results.length > 0) {
      const extra = visibleCount - initialCount;
      if (extra <= 0) {
        setVisibleCount(initialCount);
      } else {
        // Round extra up to next complete row
        const snapped = Math.ceil(extra / loadIncrement) * loadIncrement;
        setVisibleCount(initialCount + snapped);
      }
    }
  }, [cols, hasSearched, results]);

  // Load and re-ensure all currently visible fonts on every relevant change.
  // loadFont() is idempotent (skips already-added <link> tags via a Set), so
  // calling it again on navigation-back is safe and cheap. ensureFontsRendered
  // actively re-triggers document.fonts.load() for any font the browser hasn't
  // fetched yet — necessary when navigating back because the effect skipped the
  // "already loaded" fonts even though the browser needs to re-fetch them.
  useEffect(() => {
    if (!hasSearched || isLoading || results.length === 0) return;
    const end = Math.min(visibleCount, results.length);
    const fonts: { id?: string; slug: string }[] = [];
    const fontNames: string[] = [];
    for (let i = 0; i < end; i++) {
      const pair = results[i];
      loadFont(pair.headerFont);
      loadFont(pair.bodyFont);
      fonts.push(pair.headerFont, pair.bodyFont);
      fontNames.push(pair.headerFont.name, pair.bodyFont.name);
    }
    const unpin = pinFonts(fonts);
    ensureFontsRendered(fontNames);
    return unpin;
  }, [visibleCount, results, hasSearched, isLoading]);

  if (!hasSearched) return null;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="pair-grid">
          {Array.from({ length: initialCount }).map((_, i) => (
            <div key={i} className="rounded-xl bg-neutral-50 animate-pulse border border-neutral-100" style={{ height: "320px" }} />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full text-center">
        <p className="text-neutral-400" style={{ fontSize: "16px" }}>No results found. Try a different description.</p>
      </div>
    );
  }

  const topResults = results.slice(0, initialCount);
  const extra = visibleCount > initialCount ? results.slice(initialCount, visibleCount) : [];
  const hasMore = visibleCount < results.length;

  const topLabel = cols >= 2 && cols < 3 ? "Top 4 recommendations" : "Top 3 recommendations";

  return (
    <div className="w-full">
      {!isExploring && (
        <p className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>
          {topLabel}
        </p>
      )}
      {isExploring && (
        <p className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>
          Here are some ideas, to spark your creativity
        </p>
      )}

      <div className="pair-grid">
        {topResults.map((pair) => (
          <PairCard key={pair.id} pair={pair} isExploring={isExploring} />
        ))}
      </div>

      {extra.length > 0 && !isExploring && (
        <div className="border-t border-neutral-100" style={{ marginTop: "32px", marginBottom: "32px" }} />
      )}
      {extra.length > 0 && isExploring && (
        <div style={{ marginTop: "16px" }} />
      )}

      {extra.length > 0 && (
        <div className="pair-grid">
          {extra.map((pair) => (
            <PairCard key={pair.id} pair={pair} isExploring={isExploring} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center" style={{ marginTop: "32px" }}>
          <button
            onClick={() => setVisibleCount(Math.min(visibleCount + loadIncrement, results.length))}
            className="outline-btn font-medium rounded-lg"
            style={{ fontSize: "16px", padding: "8px 24px" }}
          >
            Load more pairs
          </button>
        </div>
      )}
    </div>
  );
}

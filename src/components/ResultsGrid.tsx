"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppState } from "@/lib/store";
import { PairCard } from "./PairCard";
import { loadFont } from "@/lib/fonts";
import { ScoredPair } from "@/data/types";

type VisiblePair = { pair: ScoredPair; delay: number };

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

function batchSizeForCols(cols: number): number {
  if (cols >= 3) return 3;  // desktop: 3×1
  if (cols === 2) return 4; // tablet: 2×2
  return 3;                  // mobile: 1×3
}

async function checkPairFonts(pair: ScoredPair): Promise<boolean> {
  loadFont(pair.headerFont);
  loadFont(pair.bodyFont);

  // Poll document.fonts.load() — returns [] until the CDN stylesheet is parsed
  // and @font-face rules are registered. Once registered, resolves with FontFace[].
  // Check both weights per font since not all fonts have a 700 face.
  const loadAny = (name: string) =>
    Promise.all([
      document.fonts.load(`700 16px "${name}"`).catch(() => [] as FontFace[]),
      document.fonts.load(`400 16px "${name}"`).catch(() => [] as FontFace[]),
    ]).then(([f700, f400]) => f700.length + f400.length);

  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const [h, b] = await Promise.all([
      loadAny(pair.headerFont.name),
      loadAny(pair.bodyFont.name),
    ]);
    if (h > 0 && b > 0) {
      // Two frames so font-display:swap finishes before the card appears.
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      return true;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return false;
}

async function fillBatch(
  queue: ScoredPair[],
  size: number
): Promise<{ loaded: VisiblePair[]; remaining: ScoredPair[] }> {
  const remaining = [...queue];
  const loaded: VisiblePair[] = [];

  while (loaded.length < size && remaining.length > 0) {
    const needed = size - loaded.length;
    const candidates = remaining.splice(0, needed);

    const results = await Promise.all(
      candidates.map(async (pair) => ({ pair, ok: await checkPairFonts(pair) }))
    );

    for (const { pair, ok } of results) {
      if (ok) loaded.push({ pair, delay: loaded.length * 90 });
    }
  }

  return { loaded, remaining };
}

export function ResultsGrid() {
  const { results, isLoading, hasSearched, isExploring } = useAppState();
  const cols = useColumns();
  const colsRef = useRef(cols);
  colsRef.current = cols;

  const [visiblePairs, setVisiblePairs] = useState<VisiblePair[]>([]);
  const [firstBatchLoaded, setFirstBatchLoaded] = useState(false);
  const queueRef = useRef<ScoredPair[]>([]);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Generation counter: incremented on each reset so stale async loads discard their results.
  // This prevents React StrictMode's double-effect invocation from adding duplicate pairs.
  const generationRef = useRef(0);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || queueRef.current.length === 0) return;
    loadingRef.current = true;
    const myGen = generationRef.current;

    const size = batchSizeForCols(colsRef.current);
    const { loaded, remaining } = await fillBatch(queueRef.current, size);

    if (myGen !== generationRef.current) {
      // Results changed while fonts were loading — discard stale batch.
      loadingRef.current = false;
      return;
    }

    queueRef.current = remaining;

    if (loaded.length > 0) {
      setVisiblePairs((prev) => [...prev, ...loaded]);
      setFirstBatchLoaded(true);
    }

    loadingRef.current = false;
  }, []);

  // Reset and load first batch when results change
  useEffect(() => {
    generationRef.current += 1;
    setVisiblePairs([]);
    setFirstBatchLoaded(false);
    loadingRef.current = false;
    queueRef.current = [...results];
    if (!isLoading && results.length > 0) loadNext();
  }, [results, isLoading]);

  // Intersection observer on sentinel triggers next batch load
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadNext(); },
      { rootMargin: "0px 0px 800px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visiblePairs, loadNext]);

  if (!hasSearched) return null;

  const showSkeleton = isLoading || (!firstBatchLoaded && results.length > 0);
  const batchSize = batchSizeForCols(cols);

  if (showSkeleton) {
    return (
      <div className="w-full">
        <div className="pair-grid-skeleton">
          {Array.from({ length: batchSize }).map((_, i) => (
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

  // Distribute pairs into explicit columns (round-robin).
  // Each batch adds exactly one item per column, keeping columns balanced.
  const columns: VisiblePair[][] = Array.from({ length: cols }, () => []);
  visiblePairs.forEach((item, i) => columns[i % cols].push(item));

  const gap = cols >= 2 ? 16 : 24;

  return (
    <div className="w-full">
      <p className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>
        {isExploring ? "Here are some ideas, to spark your creativity" : "Here's what we found"}
      </p>

      {/* Masonry columns — each column is an independent flex stack, cards take natural height */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: `${gap}px` }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: `${gap}px` }}>
            {col.map(({ pair, delay }) => (
              <PairCard key={pair.id} pair={pair} isExploring={isExploring} animationDelay={delay} />
            ))}
          </div>
        ))}
      </div>

      {queueRef.current.length > 0 && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}
    </div>
  );
}

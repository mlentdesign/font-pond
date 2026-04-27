"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppState } from "@/lib/store";
import { PairCard } from "./PairCard";
import { loadFont } from "@/lib/fonts";
import { ScoredPair } from "@/data/types";

type VisiblePair = { pair: ScoredPair; delay: number };

function useBatchSize(): number {
  const [size, setSize] = useState(3);
  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 1024) setSize(3);
      else if (window.innerWidth >= 768) setSize(4);
      else setSize(3);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return size;
}

async function checkPairFonts(pair: ScoredPair): Promise<boolean> {
  loadFont(pair.headerFont);
  loadFont(pair.bodyFont);
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`700 12px "${pair.headerFont.name}"`),
        document.fonts.load(`400 12px "${pair.bodyFont.name}"`),
      ]),
      new Promise<never>((_, reject) => setTimeout(() => reject(), 3000)),
    ]);
    return true;
  } catch {
    return false;
  }
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
      // Failed pairs are dropped for this search — already removed from remaining
    }
  }

  return { loaded, remaining };
}

export function ResultsGrid() {
  const { results, isLoading, hasSearched, isExploring } = useAppState();
  const batchSize = useBatchSize();
  const batchSizeRef = useRef(batchSize);
  batchSizeRef.current = batchSize;

  const [visiblePairs, setVisiblePairs] = useState<VisiblePair[]>([]);
  const [firstBatchLoaded, setFirstBatchLoaded] = useState(false);
  const queueRef = useRef<ScoredPair[]>([]);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || queueRef.current.length === 0) return;
    loadingRef.current = true;

    const { loaded, remaining } = await fillBatch(queueRef.current, batchSizeRef.current);
    queueRef.current = remaining;

    if (loaded.length > 0) {
      setVisiblePairs((prev) => [...prev, ...loaded]);
      setFirstBatchLoaded(true);
    }

    loadingRef.current = false;
  }, []);

  // Reset and load first batch when results change
  useEffect(() => {
    setVisiblePairs([]);
    setFirstBatchLoaded(false);
    loadingRef.current = false;
    queueRef.current = [...results];
    if (!isLoading && results.length > 0) {
      loadNext();
    }
  }, [results, isLoading]);

  // Intersection observer on sentinel — triggers next batch as user nears bottom
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadNext(); },
      { rootMargin: "0px 0px 400px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visiblePairs, loadNext]);

  if (!hasSearched) return null;

  const showSkeleton = isLoading || (!firstBatchLoaded && results.length > 0);

  if (showSkeleton) {
    return (
      <div className="w-full">
        <div className="pair-grid">
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

  const topLabel = batchSize === 4 ? "Top 4 recommendations" : "Top 3 recommendations";

  return (
    <div className="w-full">
      <p className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>
        {isExploring ? "Here are some ideas, to spark your creativity" : topLabel}
      </p>
      <div className="pair-grid">
        {visiblePairs.map(({ pair, delay }) => (
          <PairCard key={pair.id} pair={pair} isExploring={isExploring} animationDelay={delay} />
        ))}
      </div>
      {queueRef.current.length > 0 && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}
    </div>
  );
}

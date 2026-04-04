"use client";

import { useState, useCallback, ReactNode, useEffect } from "react";
import { AppContext, AppState, DEFAULT_HEADER_SIZE, DEFAULT_BODY_SIZE } from "@/lib/store";
import { RecentPairView, ScoredPair } from "@/data/types";

const HISTORY_KEY = "font-pairing-recent-history";
const MAX_HISTORY = 10;

export function AppProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [sampleHeadline, setSampleHeadline] = useState("");
  const [sampleBody, setSampleBody] = useState("");
  const [headerSize, setHeaderSize] = useState(DEFAULT_HEADER_SIZE);
  const [bodySize, setBodySize] = useState(DEFAULT_BODY_SIZE);
  const [results, setResults] = useState<ScoredPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [recentHistory, setRecentHistory] = useState<RecentPairView[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setRecentHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const addImage = useCallback((file: File) => {
    setImages((prev) => [...prev, file]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addToHistory = useCallback((view: RecentPairView) => {
    setRecentHistory((prev) => {
      const filtered = prev.filter((h) => h.pairId !== view.pairId);
      const next = [view, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value: AppState = {
    query, setQuery,
    images, addImage, removeImage,
    sampleHeadline, setSampleHeadline,
    sampleBody, setSampleBody,
    headerSize, setHeaderSize,
    bodySize, setBodySize,
    results, setResults,
    isLoading, setIsLoading,
    hasSearched, setHasSearched,
    isExploring, setIsExploring,
    visibleCount, setVisibleCount,
    recentHistory, addToHistory,
  };

  return <AppContext value={value}>{children}</AppContext>;
}

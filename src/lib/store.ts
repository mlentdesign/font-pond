"use client";

import { createContext, useContext } from "react";
import { RecentPairView, ScoredPair } from "@/data/types";

export interface AppState {
  query: string;
  setQuery: (q: string) => void;
  images: File[];
  addImage: (f: File) => void;
  removeImage: (i: number) => void;
  sampleHeadline: string;
  setSampleHeadline: (s: string) => void;
  sampleBody: string;
  setSampleBody: (s: string) => void;
  headerSize: number;
  setHeaderSize: (n: number) => void;
  bodySize: number;
  setBodySize: (n: number) => void;
  results: ScoredPair[];
  setResults: (r: ScoredPair[]) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  hasSearched: boolean;
  setHasSearched: (b: boolean) => void;
  isExploring: boolean;
  setIsExploring: (b: boolean) => void;
  visibleCount: number;
  setVisibleCount: (n: number) => void;
  recentHistory: RecentPairView[];
  addToHistory: (view: RecentPairView) => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

// Default sample text
export const DEFAULT_HEADLINE = "The quick brown fox jumps over the lazy dog";
export const DEFAULT_BODY = "Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.";

export const DEFAULT_HEADER_SIZE = 36;
export const DEFAULT_BODY_SIZE = 16;

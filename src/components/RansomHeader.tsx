"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { fonts as allFonts } from "@/data/fonts";

// Build pool from all header-suitable fonts in the database
const FONT_POOL = allFonts
  .filter((f) => f.isHeaderSuitable)
  .map((f) => ({ name: f.name, slug: f.slug, source: f.source, id: f.id }));

const TITLE = "FONT POND";
const LETTERS = TITLE.split("");
const NON_SPACE_INDICES = LETTERS.map((c, i) => c !== " " ? i : -1).filter((i) => i >= 0);
const ANIMATION_DURATION = 2200;
const DISPLAY_INTERVAL = 30000;

// Pre-load a batch of fonts on mount (randomized subset to avoid loading all at once)
const PRELOAD_COUNT = 80;

type PoolFont = typeof FONT_POOL[number];

function pickRandom(exclude?: string): PoolFont {
  let font: PoolFont;
  do { font = FONT_POOL[Math.floor(Math.random() * FONT_POOL.length)]; } while (font.name === exclude);
  return font;
}

export let headerAnimationPaused = false;
export function setHeaderAnimationPaused(v: boolean) { headerAnimationPaused = v; }

interface LetterState {
  fontName: string;
  fontSource: string;
  flipKey: number;
  flipSpeed: number;
}

export function RansomHeader({ onFontChange }: { onFontChange?: (fontName: string, fontSlug: string) => void }) {
  const [mounted, setMounted] = useState(false);
  const [displayFont, setDisplayFontRaw] = useState<PoolFont>(() => pickRandom());
  const loadedRef = useRef(new Set<string>());

  const ensureLoaded = useCallback((f: PoolFont) => {
    if (!loadedRef.current.has(f.id)) {
      loadedRef.current.add(f.id);
      loadFont(f);
    }
  }, []);

  const setDisplayFont = useCallback((f: PoolFont) => {
    setDisplayFontRaw(f);
    onFontChange?.(f.name, f.slug);
  }, [onFontChange]);

  const [letterStates, setLetterStates] = useState<LetterState[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const displayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const initial = pickRandom();
    setDisplayFont(initial);
    ensureLoaded(initial);

    // Preload a random subset of fonts for smooth animation
    const shuffled = [...FONT_POOL].sort(() => Math.random() - 0.5);
    for (const f of shuffled.slice(0, PRELOAD_COUNT)) {
      ensureLoaded(f);
    }
  }, [setDisplayFont, ensureLoaded]);

  const clearAllTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const runTicker = useCallback(() => {
    if (headerAnimationPaused) return;
    setIsAnimating(true);
    clearAllTimers();

    const newStates: LetterState[] = LETTERS.map(() => ({
      fontName: displayFont.name,
      fontSource: displayFont.source,
      flipKey: 0,
      flipSpeed: 0.2,
    }));
    setLetterStates(newStates);

    const finalFont = pickRandom(displayFont.name);
    ensureLoaded(finalFont);

    for (const idx of NON_SPACE_INDICES) {
      const numFlips = 4 + Math.floor(Math.random() * 5);
      const startDelay = Math.random() * 300;
      const letterInterval = (ANIMATION_DURATION - startDelay - 200) / numFlips;

      for (let flip = 0; flip < numFlips; flip++) {
        const delay = startDelay + flip * letterInterval;
        const isLast = flip === numFlips - 1;
        const speed = isLast ? 0.25 : 0.12 + (flip / numFlips) * 0.12;

        const timer = setTimeout(() => {
          if (headerAnimationPaused) return;
          const nextFont = isLast ? finalFont : pickRandom(undefined);
          ensureLoaded(nextFont);
          setLetterStates((prev) => {
            const next = [...prev];
            next[idx] = {
              fontName: nextFont.name,
              fontSource: nextFont.source,
              flipKey: (next[idx]?.flipKey || 0) + 1,
              flipSpeed: speed,
            };
            return next;
          });
        }, delay);
        timersRef.current.push(timer);
      }
    }

    const endTimer = setTimeout(() => {
      setDisplayFont(finalFont);
      setLetterStates([]);
      setIsAnimating(false);
    }, ANIMATION_DURATION + 100);
    timersRef.current.push(endTimer);
  }, [displayFont, clearAllTimers, ensureLoaded, setDisplayFont]);

  useEffect(() => {
    if (!mounted) return;
    displayRef.current = setInterval(() => {
      if (!headerAnimationPaused) runTicker();
    }, DISPLAY_INTERVAL);
    return () => {
      if (displayRef.current) clearInterval(displayRef.current);
      clearAllTimers();
    };
  }, [mounted, runTicker, clearAllTimers]);

  if (!mounted) {
    return <span style={{ color: "var(--text-ransom)", fontWeight: 700 }}>{TITLE}</span>;
  }

  const displayFamily = getFontFamily(displayFont.name, displayFont.source);

  if (isAnimating && letterStates.length > 0) {
    return (
      <span className="inline-flex flex-wrap items-center ticker-container" aria-label={TITLE}>
        {LETTERS.map((char, i) => {
          if (char === " ") {
            return <span key={i} className="inline-block" style={{ width: "0.3em" }} />;
          }
          const state = letterStates[i];
          const family = state ? getFontFamily(state.fontName, state.fontSource) : displayFamily;
          const flipSpeed = state?.flipSpeed || 0.2;
          return (
            <span
              key={`${i}-${state?.flipKey || 0}`}
              className="ticker-flip"
              style={{
                fontFamily: family,
                fontWeight: 700,
                display: "inline-block",
                lineHeight: 1,
                color: "var(--text-ransom)",
                ["--flip-speed" as string]: `${flipSpeed}s`,
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span
      style={{
        fontFamily: displayFamily,
        fontWeight: 700,
        lineHeight: 1,
        color: "var(--text-ransom)",
      }}
      aria-label={TITLE}
    >
      {TITLE}
    </span>
  );
}

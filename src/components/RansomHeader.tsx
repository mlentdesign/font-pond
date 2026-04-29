"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { loadFont, getFontFamily, waitForFontReady } from "@/lib/fonts";
import { fonts as allFonts } from "@/data/fonts";
import { useAppState } from "@/lib/store";

// Build pool from all header-suitable fonts in the database
const FONT_POOL = allFonts
  .filter((f) => f.isHeaderSuitable)
  .map((f) => ({ name: f.name, slug: f.slug, source: f.source, id: f.id }));

const TITLE = "FONT POND";
const LETTERS = TITLE.split("");
const NON_SPACE_INDICES = LETTERS.map((c, i) => c !== " " ? i : -1).filter((i) => i >= 0);
const ANIMATION_DURATION = 2200;
const DISPLAY_INTERVAL = 30000;

// Pre-load a batch of fonts on mount; keep small to avoid evicting explore grid fonts
const PRELOAD_COUNT = 30;

type PoolFont = typeof FONT_POOL[number];

// Shuffled display queue — cycles through ALL fonts before repeating.
// Only the final sustained font per animation consumes this queue.
// Intermediate flip fonts use pickRandomIntermediate() to avoid depleting it.
let fontQueue: PoolFont[] = [];
function shuffleQueue() {
  fontQueue = [...FONT_POOL];
  for (let i = fontQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fontQueue[i], fontQueue[j]] = [fontQueue[j], fontQueue[i]];
  }
}
shuffleQueue();

function pickRandom(exclude?: string): PoolFont {
  if (fontQueue.length === 0) shuffleQueue();
  let font = fontQueue.pop()!;
  // Skip the current font to avoid showing the same one twice in a row
  if (font.name === exclude && fontQueue.length > 0) {
    fontQueue.unshift(font);
    font = fontQueue.pop()!;
  }
  return font;
}

// Picks a random font for intermediate flip frames without consuming the display queue
function pickRandomIntermediate(): PoolFont {
  return FONT_POOL[Math.floor(Math.random() * FONT_POOL.length)];
}

// Peek at the next N fonts in the queue (for preloading)
function peekNext(count: number): PoolFont[] {
  if (fontQueue.length < count) shuffleQueue();
  return fontQueue.slice(-count);
}

// Persist pause state across pages and reloads
export let headerAnimationPaused = typeof window !== "undefined" && localStorage.getItem("animation-paused") === "true";
export function setHeaderAnimationPaused(v: boolean) {
  headerAnimationPaused = v;
  if (typeof window !== "undefined") localStorage.setItem("animation-paused", String(v));
}

interface LetterState {
  fontName: string;
  fontSource: string;
  flipKey: number;
  flipSpeed: number;
}

export function RansomHeader({ onFontChange }: { onFontChange?: (fontName: string, fontSlug: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { results } = useAppState();
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
  const animIdRef = useRef(0);
  const swapIdRef = useRef(0);

  // Preload queue — always keep the next 5 fonts ready
  const preloadQueueRef = useRef<PoolFont[]>([]);

  const preloadNext = useCallback((count: number) => {
    const upcoming = peekNext(count);
    preloadQueueRef.current = upcoming;
    for (const f of upcoming) ensureLoaded(f);
  }, [ensureLoaded]);

  useEffect(() => {
    setMounted(true);
    const initial = pickRandom();
    ensureLoaded(initial);
    preloadNext(10);
    let alive = true;
    waitForFontReady(initial.name, 500).then(() => {
      if (alive) setDisplayFont(initial);
    });

    // Also preload a broader set in the background for animation variety
    setTimeout(() => {
      const shuffled = [...FONT_POOL].sort(() => Math.random() - 0.5);
      for (const f of shuffled.slice(0, PRELOAD_COUNT)) {
        ensureLoaded(f);
      }
    }, 100);

    return () => { alive = false; };
  }, [setDisplayFont, ensureLoaded, preloadNext]);

  const clearAllTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const runTicker = useCallback(() => {
    if (headerAnimationPaused) return;
    setIsAnimating(true);
    clearAllTimers();
    const myAnimId = ++animIdRef.current;

    const newStates: LetterState[] = LETTERS.map(() => ({
      fontName: displayFont.name,
      fontSource: displayFont.source,
      flipKey: 0,
      flipSpeed: 0.2,
    }));
    setLetterStates(newStates);

    const finalFont = pickRandom(displayFont.name);
    ensureLoaded(finalFont);
    // Preload next 5 so they're ready for upcoming navigations
    preloadNext(10);

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
          const nextFont = isLast ? finalFont : pickRandomIntermediate();
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
      waitForFontReady(finalFont.name, 1500).then(() => {
        if (animIdRef.current !== myAnimId) return;
        setDisplayFont(finalFont);
        setLetterStates([]);
        setIsAnimating(false);
      });
    }, ANIMATION_DURATION + 100);
    timersRef.current.push(endTimer);
  }, [displayFont, clearAllTimers, ensureLoaded, setDisplayFont]);

  const runTickerRef = useRef(runTicker);
  runTickerRef.current = runTicker;

  useEffect(() => {
    if (!mounted) return;
    displayRef.current = setInterval(() => {
      if (!headerAnimationPaused) runTickerRef.current();
    }, DISPLAY_INTERVAL);
    return () => {
      if (displayRef.current) clearInterval(displayRef.current);
      clearAllTimers();
    };
  }, [mounted, clearAllTimers]);

  // Swap the header font without the flip animation — used when animation is off
  // but the user still navigates to different content (we want to see variety).
  const swapInstantly = useCallback(() => {
    const next = pickRandom(displayFont.name);
    ensureLoaded(next);
    preloadNext(10);
    const mySwapId = ++swapIdRef.current;
    waitForFontReady(next.name, 800).then(() => {
      if (swapIdRef.current === mySwapId) setDisplayFont(next);
    });
  }, [displayFont.name, ensureLoaded, setDisplayFont, preloadNext]);

  // Trigger a new font on:
  //   1. URL changes (pathname or query: home→pair, pair→pair, font→font, eye click, etc.)
  //   2. Results array identity changes on home page (every Generate / Explore click
  //      creates a new results array — even Explore→Explore swaps fonts, since the
  //      pair ordering is fresh each time)
  // Whether we animate or just swap depends on the animation-paused setting.
  const navKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const prevNavRef = useRef(navKey);
  const prevResultsRef = useRef<typeof results>(results);
  useEffect(() => {
    if (!mounted) return;
    const navChanged = navKey !== prevNavRef.current;
    const resultsChanged = results !== prevResultsRef.current;
    if (!navChanged && !resultsChanged) return;
    prevNavRef.current = navKey;
    prevResultsRef.current = results;
    if (headerAnimationPaused) swapInstantly();
    else runTicker();
  }, [navKey, results, mounted, runTicker, swapInstantly]);

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

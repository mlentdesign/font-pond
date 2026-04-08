"use client";

import { useEffect } from "react";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * The card occupying the most viewport space gets the "card-viewport-active" class.
 * Only one card glows at a time.
 */
export function MobileCardGlow() {
  useEffect(() => {
    const MOBILE_MAX = 768;
    let observer: IntersectionObserver | null = null;
    let activeCard: Element | null = null;
    const ratios = new Map<Element, number>();
    const observed = new WeakSet<Element>();
    let isMobile = window.innerWidth < MOBILE_MAX;
    let rafId = 0;

    function updateActive() {
      if (!isMobile) {
        if (activeCard) {
          activeCard.classList.remove("card-viewport-active");
          activeCard = null;
        }
        return;
      }

      let bestCard: Element | null = null;
      let bestRatio = 0;
      for (const [card, ratio] of ratios) {
        if (ratio > bestRatio && document.body.contains(card)) {
          bestRatio = ratio;
          bestCard = card;
        }
      }

      // Only glow if card is meaningfully visible
      if (bestRatio < 0.3) bestCard = null;

      if (bestCard !== activeCard) {
        if (activeCard) activeCard.classList.remove("card-viewport-active");
        if (bestCard) bestCard.classList.add("card-viewport-active");
        activeCard = bestCard;
      }
    }

    function observeCards() {
      if (!observer) return;
      const cards = document.querySelectorAll(".card-hover");
      for (const card of cards) {
        if (!observed.has(card)) {
          observed.add(card);
          observer.observe(card);
        }
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            ratios.set(entry.target, entry.intersectionRatio);
          } else {
            ratios.delete(entry.target);
          }
        }
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateActive);
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      }
    );

    observeCards();

    // Watch for new cards appearing in DOM (page navigation, load-more, etc.)
    const mo = new MutationObserver(() => observeCards());
    mo.observe(document.body, { childList: true, subtree: true });

    const handleResize = () => {
      const wasMobile = isMobile;
      isMobile = window.innerWidth < MOBILE_MAX;
      if (wasMobile !== isMobile) updateActive();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (observer) observer.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      if (activeCard) activeCard.classList.remove("card-viewport-active");
    };
  }, []);

  return null;
}

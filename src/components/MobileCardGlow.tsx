"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * The card occupying the most visible pixels gets the "card-viewport-active" class.
 * Only one card glows at a time.
 */
export function MobileCardGlow() {
  const pathname = usePathname();

  useEffect(() => {
    const MOBILE_MAX = 768;
    let activeCard: Element | null = null;
    let ticking = false;

    function isMobile() {
      return window.innerWidth < MOBILE_MAX;
    }

    function update() {
      ticking = false;
      if (!isMobile()) {
        if (activeCard) {
          activeCard.classList.remove("card-viewport-active");
          activeCard = null;
        }
        return;
      }

      const cards = document.querySelectorAll(".card-hover");
      const vh = window.innerHeight;
      let bestCard: Element | null = null;
      let bestPixels = 0;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const top = Math.max(0, rect.top);
        const bottom = Math.min(vh, rect.bottom);
        const visible = Math.max(0, bottom - top);
        if (visible > bestPixels) {
          bestPixels = visible;
          bestCard = card;
        }
      }

      // Only glow if card occupies at least 15% of viewport
      if (bestPixels < vh * 0.15) bestCard = null;

      if (bestCard !== activeCard) {
        if (activeCard) activeCard.classList.remove("card-viewport-active");
        if (bestCard) bestCard.classList.add("card-viewport-active");
        activeCard = bestCard;
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Initial check + delayed check for content that renders after mount
    requestAnimationFrame(update);
    const timer = setTimeout(update, 200);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(timer);
      if (activeCard) activeCard.classList.remove("card-viewport-active");
    };
  }, [pathname]);

  return null;
}

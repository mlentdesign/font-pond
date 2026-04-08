"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * The card with the most unobstructed visible pixels gets the "card-viewport-active" class.
 * Only one card glows at a time. Areas covered by fixed header/footer don't count.
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

      // Measure the visible area not covered by fixed elements
      const header = document.querySelector("header");
      const stickyBreadcrumb = document.querySelector(".breadcrumb-sticky");
      const stickyDownload = document.querySelector(".mobile-sticky-download:not(.is-hidden)");

      // Top edge: below header and sticky breadcrumb
      let visibleTop = 0;
      if (header) visibleTop = Math.max(visibleTop, header.getBoundingClientRect().bottom);
      if (stickyBreadcrumb) visibleTop = Math.max(visibleTop, stickyBreadcrumb.getBoundingClientRect().bottom);

      // Bottom edge: above sticky download CTA or viewport bottom
      let visibleBottom = window.innerHeight;
      if (stickyDownload) visibleBottom = Math.min(visibleBottom, stickyDownload.getBoundingClientRect().top);

      // Detect if user has scrolled to the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const atBottom = (scrollTop + window.innerHeight) >= (docHeight - 50);

      const cards = document.querySelectorAll(".card-hover");
      let bestCard: Element | null = null;
      let bestPixels = 0;

      // Collect all visible cards with their pixel counts
      const visibleCards: { card: Element; pixels: number }[] = [];

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        // Clamp card rect to the unobstructed visible area
        const top = Math.max(visibleTop, rect.top);
        const bottom = Math.min(visibleBottom, rect.bottom);
        const visible = Math.max(0, bottom - top);
        if (visible > 0) {
          visibleCards.push({ card, pixels: visible });
        }
        if (visible > bestPixels) {
          bestPixels = visible;
          bestCard = card;
        }
      }

      // At the bottom of the page, the last visible card wins
      // (it may be short and never get a chance to be the biggest otherwise)
      if (atBottom && visibleCards.length > 0) {
        // Pick the bottommost card (last in DOM order that's visible)
        const lastVisible = visibleCards[visibleCards.length - 1];
        if (lastVisible.pixels > 0) {
          bestCard = lastVisible.card;
          bestPixels = lastVisible.pixels;
        }
      }

      // Only glow if card occupies at least 15% of the visible area
      const visibleArea = Math.max(1, visibleBottom - visibleTop);
      if (bestPixels < visibleArea * 0.15) bestCard = null;

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

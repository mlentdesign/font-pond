"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * - Short cards: topmost fully-uncovered card wins (each gets a turn)
 * - Tall cards (taller than viewport): card whose top is visible and closest to
 *   the top of the visible area wins (switches when next card's top scrolls in)
 * - At the bottom of the page, the last visible card always wins
 * Only one card glows at a time. Only applies to interactive cards (.card-hover).
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
      const footer = document.querySelector("footer");

      let visibleTop = 0;
      if (header) visibleTop = Math.max(visibleTop, header.getBoundingClientRect().bottom);
      if (stickyBreadcrumb) visibleTop = Math.max(visibleTop, stickyBreadcrumb.getBoundingClientRect().bottom);

      let visibleBottom = window.innerHeight;
      if (stickyDownload) visibleBottom = Math.min(visibleBottom, stickyDownload.getBoundingClientRect().top);
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        if (footerTop < visibleBottom) visibleBottom = footerTop;
      }

      // Detect if at the very bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const atBottom = (scrollTop + window.innerHeight) >= (docHeight - 10);

      const cards = document.querySelectorAll(".card-hover");

      let firstFullyVisible: Element | null = null;
      let lastVisibleCard: Element | null = null;
      // For tall cards: the card whose top is visible and closest to visibleTop
      let topEdgeCard: Element | null = null;
      let topEdgeDist = Infinity;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const clampedTop = Math.max(visibleTop, rect.top);
        const clampedBottom = Math.min(visibleBottom, rect.bottom);
        const visible = Math.max(0, clampedBottom - clampedTop);

        if (visible <= 0) continue;

        lastVisibleCard = card;

        // Fully uncovered — entire card in the visible area
        const isFullyVisible = rect.top >= visibleTop && rect.bottom <= visibleBottom;
        if (isFullyVisible && !firstFullyVisible) {
          firstFullyVisible = card;
        }

        // Track the card whose real top edge is visible and nearest to visibleTop
        // (card.top is within or just below the visible area)
        if (rect.top >= visibleTop && rect.top < visibleBottom) {
          const dist = rect.top - visibleTop;
          if (dist < topEdgeDist) {
            topEdgeDist = dist;
            topEdgeCard = card;
          }
        }
      }

      let bestCard: Element | null = null;

      if (atBottom && lastVisibleCard) {
        // At the very bottom, the last visible card always wins
        bestCard = lastVisibleCard;
      } else if (firstFullyVisible) {
        // Topmost fully-uncovered card wins
        bestCard = firstFullyVisible;
      } else if (topEdgeCard) {
        // No card fully visible (tall cards) —
        // pick the card whose top is visible and closest to the top
        bestCard = topEdgeCard;
      } else if (lastVisibleCard) {
        // All card tops are above the visible area (scrolled deep into a tall card)
        // Just keep the last card that has any visible pixels
        bestCard = lastVisibleCard;
      }

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
    // Initial check + delayed checks for dynamically rendered content
    requestAnimationFrame(update);
    const t1 = setTimeout(update, 200);
    const t2 = setTimeout(update, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      if (activeCard) activeCard.classList.remove("card-viewport-active");
    };
  }, [pathname]);

  return null;
}

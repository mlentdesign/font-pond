"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * Priority: topmost fully-uncovered card wins. If none fully visible, most-pixels wins.
 * At the bottom of the page, the last visible card always wins.
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

      // Measure the visible area not covered by fixed elements
      const header = document.querySelector("header");
      const stickyBreadcrumb = document.querySelector(".breadcrumb-sticky");
      const stickyDownload = document.querySelector(".mobile-sticky-download:not(.is-hidden)");
      const footer = document.querySelector("footer");

      // Top edge: below header and sticky breadcrumb
      let visibleTop = 0;
      if (header) visibleTop = Math.max(visibleTop, header.getBoundingClientRect().bottom);
      if (stickyBreadcrumb) visibleTop = Math.max(visibleTop, stickyBreadcrumb.getBoundingClientRect().bottom);

      // Bottom edge: above sticky download CTA, footer, or viewport bottom
      let visibleBottom = window.innerHeight;
      if (stickyDownload) visibleBottom = Math.min(visibleBottom, stickyDownload.getBoundingClientRect().top);
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        if (footerTop < visibleBottom) visibleBottom = footerTop;
      }

      // Detect if user has scrolled near the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const atBottom = (scrollTop + window.innerHeight) >= (docHeight - 150);

      const cards = document.querySelectorAll(".card-hover");

      // Collect info about each card
      let firstFullyVisible: Element | null = null;
      let mostPixelsCard: Element | null = null;
      let mostPixels = 0;
      let lastVisibleCard: Element | null = null;
      let lastCardFullyVisible = false;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const clampedTop = Math.max(visibleTop, rect.top);
        const clampedBottom = Math.min(visibleBottom, rect.bottom);
        const visible = Math.max(0, clampedBottom - clampedTop);

        if (visible <= 0) continue;

        lastVisibleCard = card;

        if (visible > mostPixels) {
          mostPixels = visible;
          mostPixelsCard = card;
        }

        // A card is "fully uncovered" if none of it is clipped
        const isFullyVisible = rect.top >= visibleTop && rect.bottom <= visibleBottom;
        if (isFullyVisible && !firstFullyVisible) {
          firstFullyVisible = card;
        }
        // Track if the last visible card is fully visible
        lastCardFullyVisible = isFullyVisible;
      }

      let bestCard: Element | null = null;

      if (atBottom && lastVisibleCard && !lastCardFullyVisible) {
        // At the bottom, force the last card only if it's partially clipped
        // (it would never win otherwise). If it's fully visible, normal
        // topmost logic will cycle through to it naturally.
        bestCard = lastVisibleCard;
      } else if (firstFullyVisible) {
        // Topmost fully-uncovered card wins — ensures every card gets a turn
        bestCard = firstFullyVisible;
      } else if (mostPixelsCard) {
        // Fallback: most visible pixels (for when all cards are partially clipped)
        const visibleArea = Math.max(1, visibleBottom - visibleTop);
        bestCard = mostPixels >= visibleArea * 0.15 ? mostPixelsCard : null;
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

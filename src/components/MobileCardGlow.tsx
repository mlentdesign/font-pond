"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * Applies glow via inline styles to bypass CSS specificity issues.
 * Only one card glows at a time. Only applies to interactive cards (.card-hover).
 */
export function MobileCardGlow() {
  const pathname = usePathname();

  useEffect(() => {
    const MOBILE_MAX = 768;
    let activeCard: HTMLElement | null = null;
    let activeArrow: HTMLElement | null = null;
    let ticking = false;

    // Read CSS variable values from the document
    function getVar(name: string) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function isMobile() {
      return window.innerWidth < MOBILE_MAX;
    }

    function applyGlow(card: HTMLElement) {
      // Must use "important" to override .bg-white and .border-neutral-200 !important rules
      card.style.setProperty("background", getVar("--bg-card-hover"), "important");
      card.style.setProperty("box-shadow", getVar("--shadow-card-hover"), "important");
      // Show the arrow indicator if present
      const arrow = card.querySelector(".opacity-0") as HTMLElement | null;
      if (arrow) {
        arrow.style.setProperty("opacity", "1", "important");
        activeArrow = arrow;
      }
    }

    function removeGlow(card: HTMLElement) {
      card.style.removeProperty("background");
      card.style.removeProperty("box-shadow");
      if (activeArrow) {
        activeArrow.style.removeProperty("opacity");
        activeArrow = null;
      }
    }

    function update() {
      ticking = false;
      if (!isMobile()) {
        if (activeCard) {
          removeGlow(activeCard);
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

      const cards = document.querySelectorAll<HTMLElement>(".card-hover");

      let firstFullyVisible: HTMLElement | null = null;
      let lastVisibleCard: HTMLElement | null = null;
      let mostPixelsCard: HTMLElement | null = null;
      let mostPixels = 0;
      let topEdgeCard: HTMLElement | null = null;
      let topEdgeDist = Infinity;

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

        const isFullyVisible = rect.top >= visibleTop && rect.bottom <= visibleBottom;
        if (isFullyVisible && !firstFullyVisible) {
          firstFullyVisible = card;
        }

        if (rect.top >= visibleTop && rect.top < visibleBottom) {
          const dist = rect.top - visibleTop;
          if (dist < topEdgeDist) {
            topEdgeDist = dist;
            topEdgeCard = card;
          }
        }
      }

      let bestCard: HTMLElement | null = null;

      if (atBottom && lastVisibleCard) {
        bestCard = lastVisibleCard;
      } else if (firstFullyVisible) {
        bestCard = firstFullyVisible;
      } else if (topEdgeCard) {
        bestCard = topEdgeCard;
      } else if (mostPixelsCard) {
        bestCard = mostPixelsCard;
      }

      if (bestCard !== activeCard) {
        if (activeCard) removeGlow(activeCard);
        if (bestCard) applyGlow(bestCard);
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

    // Watch for new cards appearing in DOM (e.g., explore/generate search results)
    const mo = new MutationObserver(() => requestAnimationFrame(update));
    mo.observe(document.body, { childList: true, subtree: true });

    // Initial check
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      if (activeCard) removeGlow(activeCard);
    };
  }, [pathname]);

  return null;
}

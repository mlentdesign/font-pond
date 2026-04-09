"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile (< 768px), replaces hover-based card glow with viewport-based glow.
 * Applies glow via inline styles with !important to bypass all CSS specificity.
 * Uses scroll, touch, resize, MutationObserver, and polling to ensure reliability.
 */
export function MobileCardGlow() {
  const pathname = usePathname();

  useEffect(() => {
    const MOBILE_MAX = 768;
    const MOBILE_MAX_HEIGHT = 950;
    let activeCard: HTMLElement | null = null;
    let activeArrow: HTMLElement | null = null;

    function isMobile() {
      return window.innerWidth < MOBILE_MAX && window.innerHeight <= MOBILE_MAX_HEIGHT;
    }

    function getGlowBg(): string {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--bg-card-hover").trim();
      return v || "#ddf3f1";
    }

    function getGlowShadow(): string {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--shadow-card-hover").trim();
      return v || "0 4px 24px rgba(0, 77, 64, 0.20)";
    }

    function applyGlow(card: HTMLElement) {
      card.style.setProperty("background", "var(--bg-card-hover)", "important");
      card.style.setProperty("box-shadow", "var(--shadow-card-hover)", "important");
      const arrow = card.querySelector('[class*="opacity-0"]') as HTMLElement | null;
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
      if (!isMobile()) {
        if (activeCard) {
          removeGlow(activeCard);
          activeCard = null;
        }
        return;
      }

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

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const atBottom = (scrollTop + window.innerHeight) >= (docHeight - 10);

      // Exclude history chip and its items — they use card-hover but aren't content cards
      const allCards = document.querySelectorAll<HTMLElement>(".card-hover");
      const cards: HTMLElement[] = [];
      for (const card of allCards) {
        if (!card.closest(".history-chip-fixed")) {
          cards.push(card);
        }
      }
      if (cards.length === 0) return;

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

    // Multiple event sources for maximum reliability on mobile
    const handler = () => requestAnimationFrame(update);

    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    window.addEventListener("touchstart", handler, { passive: true });
    window.addEventListener("touchmove", handler, { passive: true });
    window.addEventListener("touchend", handler, { passive: true });

    // Detect new cards appearing (search results, load more, etc.)
    const mo = new MutationObserver(handler);
    mo.observe(document.body, { childList: true, subtree: true });

    // Polling fallback — catches anything the events miss
    const poll = setInterval(update, 500);

    // Initial check
    update();

    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("touchmove", handler);
      window.removeEventListener("touchend", handler);
      mo.disconnect();
      clearInterval(poll);
      if (activeCard) removeGlow(activeCard);
    };
  }, [pathname]);

  return null;
}

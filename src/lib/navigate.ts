import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Navigate to a font or pair page with clean URL in the address bar.
 * Uses the catch-all base route internally, then updates the URL bar.
 */
export function navigateToFont(router: AppRouterInstance, slug: string) {
  // Navigate to the base font route — the catch-all page reads the slug from the URL
  router.push(`/font?f=${slug}`);
  // Immediately show the clean URL
  requestAnimationFrame(() => {
    window.history.replaceState(null, "", `/font-pond/font/${slug}`);
  });
}

export function navigateToPair(router: AppRouterInstance, slug: string) {
  router.push(`/pair?p=${slug}`);
  requestAnimationFrame(() => {
    window.history.replaceState(null, "", `/font-pond/pair/${slug}`);
  });
}

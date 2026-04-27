import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Navigate to a font or pair page with clean URL in the address bar.
 * Uses the catch-all base route internally, then updates the URL bar.
 */
export function navigateToFont(router: AppRouterInstance, slug: string, fromPair?: string) {
  const url = fromPair ? `/font?f=${slug}&from=${fromPair}` : `/font?f=${slug}`;
  router.push(url);
}

export function navigateToPair(router: AppRouterInstance, slug: string) {
  router.push(`/pair?p=${slug}`);
}

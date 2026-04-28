import { startTransition } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Navigate to a font or pair page with clean URL in the address bar.
 * Uses the catch-all base route internally, then updates the URL bar.
 * startTransition keeps the current page visible while the new one loads — no blank flash.
 */
export function navigateToFont(router: AppRouterInstance, slug: string, fromPair?: string) {
  const url = fromPair ? `/font?f=${slug}&from=${fromPair}` : `/font?f=${slug}`;
  startTransition(() => router.push(url));
}

export function navigateToPair(router: AppRouterInstance, slug: string) {
  startTransition(() => router.push(`/pair?p=${slug}`));
}

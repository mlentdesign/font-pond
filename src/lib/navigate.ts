import { startTransition } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigateToFont(router: AppRouterInstance, slug: string, fromPair?: string) {
  const url = fromPair ? `/font?f=${slug}&from=${fromPair}` : `/font?f=${slug}`;
  startTransition(() => router.push(url));
}

export function navigateToPair(router: AppRouterInstance, slug: string) {
  startTransition(() => router.push(`/pair?p=${slug}`));
}

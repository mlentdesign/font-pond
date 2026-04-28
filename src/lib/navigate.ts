import { startTransition } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigateToFont(router: AppRouterInstance, slug: string, fromPair?: string) {
  startTransition(() => router.push(`/font/${slug}`));
}

export function navigateToPair(router: AppRouterInstance, slug: string) {
  startTransition(() => router.push(`/pair/${slug}`));
}

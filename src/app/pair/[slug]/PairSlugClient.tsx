"use client";

import { Suspense, lazy } from "react";

// Lazy import prevents loading the 210k+ pair data during build-time page collection
const PairDetailClient = lazy(() => import("../PairDetailClient"));

export default function PairSlugClient({ slug }: { slug: string }) {
  return (
    <Suspense>
      <PairDetailClient slugOverride={slug} />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import PairDetailClient from "../PairDetailClient";

export default function PairSlugClient({ slug }: { slug: string }) {
  return (
    <Suspense>
      <PairDetailClient slugOverride={slug} />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import YearDetailClient from "../YearDetailClient";

export default function YearSlugClient({ slug }: { slug: string }) {
  return (
    <Suspense>
      <YearDetailClient slugOverride={slug || undefined} />
    </Suspense>
  );
}

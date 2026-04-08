"use client";

import { Suspense } from "react";
import FontDetailClient from "../FontDetailClient";

export default function FontSlugClient({ slug }: { slug: string }) {
  return (
    <Suspense>
      <FontDetailClient slugOverride={slug} />
    </Suspense>
  );
}

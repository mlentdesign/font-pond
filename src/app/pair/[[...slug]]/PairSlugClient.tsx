"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import PairDetailClient from "../PairDetailClient";

export default function PairSlugClient() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug?.[0] || "";
  return (
    <Suspense>
      <PairDetailClient slugOverride={slug || undefined} />
    </Suspense>
  );
}

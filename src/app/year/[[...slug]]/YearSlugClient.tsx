"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import YearDetailClient from "../YearDetailClient";

export default function YearSlugClient() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug?.[0] || "";
  return (
    <Suspense>
      <YearDetailClient slugOverride={slug || undefined} />
    </Suspense>
  );
}

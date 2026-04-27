"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import FontDetailClient from "../FontDetailClient";

export default function FontSlugClient() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug?.[0] || "";
  return (
    <Suspense>
      <FontDetailClient slugOverride={slug || undefined} />
    </Suspense>
  );
}

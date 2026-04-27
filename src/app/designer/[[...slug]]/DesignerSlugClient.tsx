"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import DesignerDetailClient from "../DesignerDetailClient";

export default function DesignerSlugClient() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug?.[0] || "";
  return (
    <Suspense>
      <DesignerDetailClient slugOverride={slug || undefined} />
    </Suspense>
  );
}

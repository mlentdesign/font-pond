"use client";

import { Suspense } from "react";
import DesignerDetailClient from "../DesignerDetailClient";

export default function DesignerSlugClient({ slug }: { slug: string }) {
  return (
    <Suspense>
      <DesignerDetailClient slugOverride={slug || undefined} />
    </Suspense>
  );
}

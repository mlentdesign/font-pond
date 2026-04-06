"use client";

import { Suspense } from "react";
import FontDetailClient from "./FontDetailClient";

export default function FontPage() {
  return (
    <Suspense>
      <FontDetailClient />
    </Suspense>
  );
}

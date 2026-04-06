"use client";

import { Suspense } from "react";
import PairDetailClient from "./PairDetailClient";

export default function PairPage() {
  return (
    <Suspense>
      <PairDetailClient />
    </Suspense>
  );
}

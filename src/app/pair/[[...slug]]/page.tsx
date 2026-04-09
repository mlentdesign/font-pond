"use client";

import { use } from "react";
import PairDetailClient from "../PairDetailClient";

export default function PairPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  const pairSlug = slug?.[0] || "";
  return <PairDetailClient slugOverride={pairSlug || undefined} />;
}

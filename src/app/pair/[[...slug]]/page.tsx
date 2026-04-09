"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const PairDetailClient = dynamic(() => import("../PairDetailClient"), { ssr: false });

export default function PairPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  const pairSlug = slug?.[0] || "";
  return <PairDetailClient slugOverride={pairSlug || undefined} />;
}

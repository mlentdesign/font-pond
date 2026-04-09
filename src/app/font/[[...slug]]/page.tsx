"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const FontDetailClient = dynamic(() => import("../FontDetailClient"), { ssr: false });

export default function FontPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  const fontSlug = slug?.[0] || "";
  return <FontDetailClient slugOverride={fontSlug || undefined} />;
}

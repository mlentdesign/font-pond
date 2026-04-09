"use client";

import { use } from "react";
import FontDetailClient from "../FontDetailClient";

export default function FontPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  const fontSlug = slug?.[0] || "";
  return <FontDetailClient slugOverride={fontSlug || undefined} />;
}

"use client";

import dynamic from "next/dynamic";

const FontDetailClient = dynamic(() => import("./FontDetailClient"), { ssr: false });

export default function FontPage() {
  return <FontDetailClient />;
}

"use client";

import dynamic from "next/dynamic";

const PairDetailClient = dynamic(() => import("../PairDetailClient"), { ssr: false });

export default function PairSlugLoader({ slug }: { slug: string }) {
  return <PairDetailClient slugOverride={slug} />;
}

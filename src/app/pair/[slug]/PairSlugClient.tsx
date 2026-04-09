"use client";

import dynamic from "next/dynamic";

// ssr:false prevents loading the 210k+ pair data module during build
const PairDetailClient = dynamic(() => import("../PairDetailClient"), { ssr: false });

export default function PairSlugClient({ slug }: { slug: string }) {
  return <PairDetailClient slugOverride={slug} />;
}

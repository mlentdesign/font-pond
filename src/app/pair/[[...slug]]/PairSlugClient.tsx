"use client";

import PairDetailClient from "../PairDetailClient";

export default function PairSlugClient({ slug }: { slug: string }) {
  return <PairDetailClient slugOverride={slug || undefined} />;
}

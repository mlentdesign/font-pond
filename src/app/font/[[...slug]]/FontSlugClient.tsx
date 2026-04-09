"use client";

import FontDetailClient from "../FontDetailClient";

export default function FontSlugClient({ slug }: { slug: string }) {
  return <FontDetailClient slugOverride={slug || undefined} />;
}

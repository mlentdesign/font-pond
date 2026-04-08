import { fontPairs } from "@/data/pairs";
import PairSlugClient from "./PairSlugClient";

export function generateStaticParams() {
  // Generate static pages for hand-crafted + curated pairs
  // Dynamic pairs (gen-*) fall back to /pair?p=slug
  const params: { slug: string }[] = [];
  for (const p of fontPairs) {
    if (!p.id.startsWith("gen-")) {
      params.push({ slug: p.slug });
    }
  }
  return params;
}

export default async function PairSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PairSlugClient slug={slug} />;
}

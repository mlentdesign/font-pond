import PairSlugClient from "./PairSlugClient";
import { pairsBySlug, ensureDynamicPairs } from "@/data/pairs";

export function generateStaticParams() {
  ensureDynamicPairs();
  const slugs = Array.from(pairsBySlug.keys());
  return [{ slug: undefined }, ...slugs.map((s) => ({ slug: [s] }))];
}

export default async function PairPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pairSlug = slug?.[0] || "";
  return <PairSlugClient slug={pairSlug} />;
}

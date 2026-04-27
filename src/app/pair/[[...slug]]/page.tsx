import PairSlugClient from "./PairSlugClient";
import { pairsBySlug, ensureDynamicPairs } from "@/data/pairs";
ensureDynamicPairs();

export function generateStaticParams() {
  const pairSlugs = [...pairsBySlug.keys()].map((s) => ({ slug: [s] }));
  return [{ slug: [] }, ...pairSlugs];
}

export default async function PairPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pairSlug = slug?.[0] || "";
  return <PairSlugClient slug={pairSlug} />;
}

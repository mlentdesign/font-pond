import PairSlugClient from "./PairSlugClient";
import { pairsBySlug } from "@/data/pairs";

export function generateStaticParams() {
  const slugs = Array.from(pairsBySlug.keys());
  return [{ slug: undefined }, ...slugs.map((s) => ({ slug: [s] }))];
}

export default async function PairPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pairSlug = slug?.[0] || "";
  return <PairSlugClient slug={pairSlug} />;
}

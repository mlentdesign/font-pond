import { fontPairs } from "@/data/pairs";
import PairSlugClient from "./PairSlugClient";

export function generateStaticParams() {
  // Generate static pages for all pairs
  return fontPairs.map((p) => ({ slug: p.slug }));
}

export default async function PairSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PairSlugClient slug={slug} />;
}

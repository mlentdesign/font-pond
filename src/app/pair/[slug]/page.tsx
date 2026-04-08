import pairSlugs from "@/data/pair-slugs.json";
import PairSlugClient from "./PairSlugClient";

// Allow dynamic rendering for pairs not in the static set
export const dynamicParams = true;

export function generateStaticParams() {
  return pairSlugs.map((slug: string) => ({ slug }));
}

export default async function PairSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PairSlugClient slug={slug} />;
}

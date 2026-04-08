import pairSlugs from "@/data/pair-slugs.json";
import PairSlugClient from "./PairSlugClient";

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

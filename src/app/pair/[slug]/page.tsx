import pairSlugs from "@/data/pair-slugs.json";
import PairSlugLoader from "./PairSlugLoader";

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (let i = 0; i < pairSlugs.length; i++) {
    params.push({ slug: pairSlugs[i] as string });
  }
  return params;
}

export default async function PairSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PairSlugLoader slug={slug} />;
}

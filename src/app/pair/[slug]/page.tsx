import { fontPairs } from "@/data/pairs";
import PairSlugClient from "./PairSlugClient";

export function generateStaticParams() {
  // Generate a static page for every pair
  const params: { slug: string }[] = [];
  for (let i = 0; i < fontPairs.length; i++) {
    params.push({ slug: fontPairs[i].slug });
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

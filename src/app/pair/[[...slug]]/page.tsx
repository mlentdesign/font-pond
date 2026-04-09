import PairSlugClient from "./PairSlugClient";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function PairPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pairSlug = slug?.[0] || "";
  return <PairSlugClient slug={pairSlug} />;
}

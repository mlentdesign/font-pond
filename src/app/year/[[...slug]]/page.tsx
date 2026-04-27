import YearSlugClient from "./YearSlugClient";
import { yearsBySlug } from "@/data/years";

export function generateStaticParams() {
  const yearSlugs = [...yearsBySlug.keys()].map((y) => ({ slug: [y] }));
  return [{ slug: [] }, ...yearSlugs];
}

export default async function YearPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const yearSlug = slug?.[0] || "";
  return <YearSlugClient slug={yearSlug} />;
}

import YearSlugClient from "./YearSlugClient";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function YearPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const yearSlug = slug?.[0] || "";
  return <YearSlugClient slug={yearSlug} />;
}

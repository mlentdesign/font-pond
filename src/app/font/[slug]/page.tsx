import fontSlugs from "@/data/font-slugs.json";
import FontSlugClient from "./FontSlugClient";

export function generateStaticParams() {
  return fontSlugs.map((slug: string) => ({ slug }));
}

export default async function FontSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FontSlugClient slug={slug} />;
}

import FontSlugClient from "./FontSlugClient";
import { fontsBySlug } from "@/data/fonts";

export function generateStaticParams() {
  const slugs = Array.from(fontsBySlug.keys());
  return [{ slug: undefined }, ...slugs.map((s) => ({ slug: [s] }))];
}

export default async function FontPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const fontSlug = slug?.[0] || "";
  return <FontSlugClient slug={fontSlug} />;
}

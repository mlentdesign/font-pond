import FontSlugClient from "./FontSlugClient";
import { fontsBySlug } from "@/data/fonts";

export function generateStaticParams() {
  const fontSlugs = [...fontsBySlug.keys()].map((s) => ({ slug: [s] }));
  return [{ slug: [] }, ...fontSlugs];
}

export default async function FontPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const fontSlug = slug?.[0] || "";
  return <FontSlugClient slug={fontSlug} />;
}

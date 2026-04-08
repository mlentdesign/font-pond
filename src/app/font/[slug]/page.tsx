import { fonts } from "@/data/fonts";
import FontSlugClient from "./FontSlugClient";

export function generateStaticParams() {
  return fonts.map((f) => ({ slug: f.slug }));
}

export default async function FontSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FontSlugClient slug={slug} />;
}

import FontSlugClient from "./FontSlugClient";

// Only generate the base /font route — all /font/slug URLs work via client-side routing
export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function FontPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const fontSlug = slug?.[0] || "";
  return <FontSlugClient slug={fontSlug} />;
}

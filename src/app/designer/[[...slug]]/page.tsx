import DesignerSlugClient from "./DesignerSlugClient";
import { designersBySlug } from "@/data/designers";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function DesignerPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const designerSlug = slug?.[0] || "";
  return <DesignerSlugClient slug={designerSlug} />;
}

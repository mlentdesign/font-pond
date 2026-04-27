import DesignerSlugClient from "./DesignerSlugClient";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function DesignerPage() {
  return <DesignerSlugClient />;
}

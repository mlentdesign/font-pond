import FontSlugClient from "./FontSlugClient";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function FontPage() {
  return <FontSlugClient />;
}

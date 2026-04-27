import PairSlugClient from "./PairSlugClient";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function PairPage() {
  return <PairSlugClient />;
}

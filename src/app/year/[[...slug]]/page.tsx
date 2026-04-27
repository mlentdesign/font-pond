import YearSlugClient from "./YearSlugClient";

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default async function YearPage() {
  return <YearSlugClient />;
}

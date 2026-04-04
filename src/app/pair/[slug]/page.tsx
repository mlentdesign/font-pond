import { fontPairs } from "@/data/pairs";
import PairDetailClient from "./PairDetailClient";

export function generateStaticParams() {
  return fontPairs.map((p) => ({ slug: p.slug }));
}

export default function PairPage(props: { params: Promise<{ slug: string }> }) {
  return <PairDetailClient params={props.params} />;
}

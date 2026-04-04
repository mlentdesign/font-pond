import { Suspense } from "react";
import { fonts } from "@/data/fonts";
import FontDetailClient from "./FontDetailClient";

export function generateStaticParams() {
  return fonts.map((f) => ({ slug: f.slug }));
}

export default function FontPage(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <FontDetailClient params={props.params} />
    </Suspense>
  );
}

"use client";

import dynamic from "next/dynamic";

const PairDetailClient = dynamic(() => import("./PairDetailClient"), { ssr: false });

export default function PairPage() {
  return <PairDetailClient />;
}

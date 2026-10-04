import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeelClient from "./FeelClient";
import { FEEL_ENABLED } from "@/lib/feel/enabled";

export const metadata: Metadata = !FEEL_ENABLED ? { title: "Page not found · Font Pond", robots: { index: false } } : {
  title: "Search by feel · Font Pond",
  description: "Describe a feeling or a brand and find fonts and font pairs that match. Runs entirely in your browser.",
};

export default function FeelPage() {
  if (!FEEL_ENABLED) notFound();
  return <FeelClient />;
}

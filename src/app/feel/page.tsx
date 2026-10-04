import type { Metadata } from "next";
import FeelClient from "./FeelClient";

export const metadata: Metadata = {
  title: "Search by feel · Font Pond",
  description: "Describe a feeling or a brand and find fonts and font pairs that match. Runs entirely in your browser.",
};

export default function FeelPage() {
  return <FeelClient />;
}

import type { Metadata } from "next";
import LabClient from "./LabClient";

// Unlisted for now: no links, not in the sitemap, kept out of search.
export const metadata: Metadata = {
  title: "Font lab · Font Pond",
  description: "Pick any two fonts, swap header and body, and test your own sample text.",
  robots: { index: false },
};

export default function LabPage() {
  return <LabClient />;
}

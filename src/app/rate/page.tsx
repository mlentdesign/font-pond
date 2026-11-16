import type { Metadata } from "next";
import RateClient from "./RateClient";

// Unlisted tool for calibrating the pair score by eye: no links, not in the sitemap, kept out of search.
export const metadata: Metadata = {
  title: "Font Pond · Rate pairs",
  description: "Grade font pairs by eye to calibrate the pair score.",
  robots: { index: false },
};

export default function RatePage() {
  return <RateClient />;
}

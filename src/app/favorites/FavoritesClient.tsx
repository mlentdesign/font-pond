"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PairCard } from "@/components/PairCard";
import { FishingLine } from "@/components/FishingLine";
import { readFavoriteSlugs, scoredFavorites, subscribeFavorites } from "@/lib/favorites";

export default function FavoritesClient() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = "Font Pond · Favorites";
    setMounted(true);
    const load = () => setSlugs(readFavoriteSlugs());
    load();
    return subscribeFavorites(load);
  }, []);

  const pairs = useMemo(() => scoredFavorites(slugs), [slugs]);
  const count = pairs.length;

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />
      <main id="main-content" className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <Breadcrumb crumbs={[{ label: "Favorites" }]} sticky />

        <div style={{ marginBottom: "32px" }}>
          <h1 className="text-3xl font-semibold text-neutral-900 mb-1">Favorites</h1>
          <p className="text-neutral-400" style={{ fontSize: "16px" }}>
            {!mounted
              ? "Saved pairs on this device"
              : count === 0
                ? "No saved pairs on this device yet"
                : `${count} ${count === 1 ? "saved pair" : "saved pairs"} on this device`}
          </p>
        </div>

        {mounted && count === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0 48px" }}>
            <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "0" }}>
              Open a font pair and tap the heart to save it here.
            </p>
            <Link
              href="/?explore=1"
              className="btn-generate font-medium rounded-lg inline-block"
              style={{ fontSize: "16px", padding: "12px 24px", marginTop: "24px" }}
            >
              Explore font pairs
            </Link>
            <FishingLine />
          </div>
        )}

        {count > 0 && (
          <div className="designer-font-grid">
            {pairs.map((pair, i) => (
              <PairCard key={pair.slug} pair={pair} animationDelay={Math.min(i, 6) * 60} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

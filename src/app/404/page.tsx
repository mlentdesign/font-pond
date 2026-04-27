"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { FishingLine } from "@/components/FishingLine";
import FontDetailClient from "../font/FontDetailClient";
import PairDetailClient from "../pair/PairDetailClient";
import DesignerDetailClient from "../designer/DesignerDetailClient";

export default function NotFoundPage() {
  const [route, setRoute] = useState<{ type: "pair" | "font" | "designer" | "404"; slug: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace("/font-pond", "").replace(/\/$/, "");
    const pairMatch = path.match(/^\/pair\/(.+)/);
    const fontMatch = path.match(/^\/font\/(.+)/);
    const designerMatch = path.match(/^\/designer\/(.+)/);

    if (pairMatch) setRoute({ type: "pair", slug: pairMatch[1] });
    else if (fontMatch) setRoute({ type: "font", slug: fontMatch[1] });
    else if (designerMatch) setRoute({ type: "designer", slug: designerMatch[1] });
    else setRoute({ type: "404", slug: "" });
  }, []);

  // Render font/pair/designer content for clean URLs
  if (route?.type === "pair") return <Suspense><PairDetailClient slugOverride={route.slug} /></Suspense>;
  if (route?.type === "font") return <Suspense><FontDetailClient slugOverride={route.slug} /></Suspense>;
  if (route?.type === "designer") return <Suspense><DesignerDetailClient slugOverride={route.slug} /></Suspense>;

  // Still detecting URL
  if (route === null) return null;

  // Actual 404
  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />
      <main className="flex-1 flex items-center justify-center" style={{ textAlign: "center", padding: "0 24px" }}>
        <div>
          <h1 className="font-semibold tracking-tight describe-heading" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}>
            Gone fishing?
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "0" }}>
            We&rsquo;re not sure how you ended up here, but we can help you get back.
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
      </main>
    </div>
  );
}

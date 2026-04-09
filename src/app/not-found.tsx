"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DetailPageHeader } from "@/components/DetailPageHeader";

// Render pair/font detail directly on 404 — keeps the clean URL without redirect
const PairDetailClient = dynamic(() => import("./pair/PairDetailClient"), { ssr: false });
const FontDetailClient = dynamic(() => import("./font/FontDetailClient"), { ssr: false });

function FishingLine() {
  return (
    <svg width="120" height="160" viewBox="0 0 120 160" fill="none" style={{ margin: "24px auto 0" }}>
      {/* Rod */}
      <line x1="60" y1="0" x2="90" y2="8" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
      {/* Line */}
      <path d="M90 8 Q85 60, 60 90 Q50 110, 55 130" stroke="var(--text-muted)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Hook */}
      <path d="M55 130 Q50 140, 55 145 Q62 148, 60 138" stroke="rgba(240, 140, 50, 0.8)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Bobber */}
      <circle cx="60" cy="90" r="5" fill="rgba(240, 140, 50, 0.7)" stroke="rgba(200, 100, 30, 0.8)" strokeWidth="1.5" />
    </svg>
  );
}

export default function NotFound() {
  const [route, setRoute] = useState<{ type: "pair" | "font" | "unknown"; slug: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace("/font-pond", "").replace(/\/$/, "");
    const pairMatch = path.match(/^\/pair\/(.+)/);
    const fontMatch = path.match(/^\/font\/(.+)/);

    if (pairMatch) setRoute({ type: "pair", slug: pairMatch[1] });
    else if (fontMatch) setRoute({ type: "font", slug: fontMatch[1] });
    else setRoute({ type: "unknown", slug: "" });
  }, []);

  if (route?.type === "pair") return <PairDetailClient slugOverride={route.slug} />;
  if (route?.type === "font") return <FontDetailClient slugOverride={route.slug} />;

  // Still detecting
  if (route === null) return null;

  // General 404 page
  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />
      <main className="flex-1 flex items-center justify-center" style={{ textAlign: "center", padding: "0 24px" }}>
        <div>
          <h1 className="font-semibold tracking-tight describe-heading" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}>
            404
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "0" }}>
            We&rsquo;re not sure how you ended up here, but we can help you get back.
          </p>
          <FishingLine />
          <Link
            href="/?explore=1"
            className="btn-generate font-medium rounded-lg inline-block"
            style={{ fontSize: "16px", padding: "12px 24px", marginTop: "24px" }}
          >
            Explore font pairs
          </Link>
        </div>
      </main>
    </div>
  );
}

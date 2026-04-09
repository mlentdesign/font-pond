"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Render pair/font detail directly on 404 — keeps the clean URL without redirect
const PairDetailClient = dynamic(() => import("./pair/PairDetailClient"), { ssr: false });
const FontDetailClient = dynamic(() => import("./font/FontDetailClient"), { ssr: false });

export default function NotFound() {
  const [route, setRoute] = useState<{ type: "pair" | "font"; slug: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace("/font-pond", "").replace(/\/$/, "");
    const pairMatch = path.match(/^\/pair\/(.+)/);
    const fontMatch = path.match(/^\/font\/(.+)/);

    if (pairMatch) setRoute({ type: "pair", slug: pairMatch[1] });
    else if (fontMatch) setRoute({ type: "font", slug: fontMatch[1] });
  }, []);

  if (route?.type === "pair") return <PairDetailClient slugOverride={route.slug} />;
  if (route?.type === "font") return <FontDetailClient slugOverride={route.slug} />;

  // Actual 404 — not a font/pair URL
  if (route === null) return null; // Still detecting

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "24px", color: "var(--text-heading)", marginBottom: "8px" }}>
          Page not found
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
          <a href="/font-pond/" style={{ color: "var(--accent)" }}>Go to Font Pond</a>
        </p>
      </div>
    </div>
  );
}

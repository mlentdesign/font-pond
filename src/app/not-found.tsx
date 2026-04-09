"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Render pair/font detail directly — keeps the clean URL without redirect
const PairDetailClient = dynamic(() => import("./pair/PairDetailClient"), { ssr: false });
const FontDetailClient = dynamic(() => import("./font/FontDetailClient"), { ssr: false });

export default function NotFound() {
  const [route, setRoute] = useState<{ type: "pair" | "font" | "redirect"; slug: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace("/font-pond", "").replace(/\/$/, "");
    const pairMatch = path.match(/^\/pair\/(.+)/);
    const fontMatch = path.match(/^\/font\/(.+)/);

    if (pairMatch) setRoute({ type: "pair", slug: pairMatch[1] });
    else if (fontMatch) setRoute({ type: "font", slug: fontMatch[1] });
    else if (path !== "/404") {
      // Redirect unknown URLs to /404
      window.location.replace("/font-pond/404");
    }
  }, []);

  if (route?.type === "pair") return <PairDetailClient slugOverride={route.slug} />;
  if (route?.type === "font") return <FontDetailClient slugOverride={route.slug} />;

  return null;
}

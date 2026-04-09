"use client";

import { useEffect, useState, Suspense } from "react";
import PairDetailClient from "./pair/PairDetailClient";
import FontDetailClient from "./font/FontDetailClient";

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

  if (route?.type === "pair") return <Suspense><PairDetailClient slugOverride={route.slug} /></Suspense>;
  if (route?.type === "font") return <Suspense><FontDetailClient slugOverride={route.slug} /></Suspense>;

  return null;
}

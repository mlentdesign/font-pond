"use client";

import { useEffect, useState, Suspense } from "react";
import PairDetailClient from "./pair/PairDetailClient";
import FontDetailClient from "./font/FontDetailClient";
import DesignerDetailClient from "./designer/DesignerDetailClient";
import YearDetailClient from "./year/YearDetailClient";

export default function NotFound() {
  const [route, setRoute] = useState<{ type: "pair" | "font" | "designer" | "year" | "redirect"; slug: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace("/font-pond", "").replace(/\/$/, "");
    const pairMatch = path.match(/^\/pair\/(.+)/);
    const fontMatch = path.match(/^\/font\/(.+)/);
    const designerMatch = path.match(/^\/designer\/(.+)/);
    const yearMatch = path.match(/^\/year\/(.+)/);

    if (pairMatch) setRoute({ type: "pair", slug: pairMatch[1] });
    else if (fontMatch) setRoute({ type: "font", slug: fontMatch[1] });
    else if (designerMatch) setRoute({ type: "designer", slug: designerMatch[1] });
    else if (yearMatch) setRoute({ type: "year", slug: yearMatch[1] });
    else if (path !== "/404") {
      window.location.replace("/font-pond/404");
    }
  }, []);

  if (route?.type === "pair") return <Suspense><PairDetailClient slugOverride={route.slug} /></Suspense>;
  if (route?.type === "font") return <Suspense><FontDetailClient slugOverride={route.slug} /></Suspense>;
  if (route?.type === "designer") return <Suspense><DesignerDetailClient slugOverride={route.slug} /></Suspense>;
  if (route?.type === "year") return <Suspense><YearDetailClient slugOverride={route.slug} /></Suspense>;

  return null;
}

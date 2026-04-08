"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = pathname + searchParams.toString();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);

  return null;
}

/** Scroll to top on client-side navigation */
export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}

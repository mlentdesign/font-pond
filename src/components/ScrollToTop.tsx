"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Scroll to top on client-side navigation — uses popstate to detect query changes */
export function ScrollToTop() {
  const pathname = usePathname();
  const prevHref = useRef("");

  useEffect(() => {
    const href = window.location.href;
    if (prevHref.current && href !== prevHref.current) {
      window.scrollTo(0, 0);
    }
    prevHref.current = href;
  }, [pathname]);

  // Also catch query param changes (pair?p=, font?f=) that don't change pathname
  useEffect(() => {
    const onChange = () => {
      const href = window.location.href;
      if (href !== prevHref.current) {
        window.scrollTo(0, 0);
        prevHref.current = href;
      }
    };
    window.addEventListener("popstate", onChange);
    // Intercept pushState/replaceState for SPA navigation
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = (...args) => { origPush(...args); onChange(); };
    history.replaceState = (...args) => { origReplace(...args); onChange(); };
    return () => {
      window.removeEventListener("popstate", onChange);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return null;
}

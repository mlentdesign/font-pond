"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    // SPA redirect: convert clean URLs to query-param format for pairs/fonts
    // that don't have static pages (dynamic pairs)
    const path = window.location.pathname.replace("/font-pond", "");
    const pairMatch = path.match(/^\/pair\/(.+)/);
    const fontMatch = path.match(/^\/font\/(.+)/);

    if (pairMatch) {
      window.location.replace("/font-pond/pair?p=" + pairMatch[1]);
    } else if (fontMatch) {
      window.location.replace("/font-pond/font?f=" + fontMatch[1]);
    }
  }, []);

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
          Redirecting...
        </p>
      </div>
    </div>
  );
}

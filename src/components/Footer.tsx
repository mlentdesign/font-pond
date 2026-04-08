"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { setHeaderAnimationPaused } from "./RansomHeader";
import { useAppState } from "@/lib/store";

export function Footer() {
  const [paused, setPaused] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("font-pond-paused") === "true";
  });
  const { recentItems } = useAppState();
  const hasHistory = recentItems.length >= 2;

  // Restore pause state on mount
  useEffect(() => {
    if (paused) {
      setHeaderAnimationPaused(true);
      window.dispatchEvent(new CustomEvent("animationPauseToggle", { detail: true }));
      document.body.classList.add("animations-paused");
    }
  }, []);

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    localStorage.setItem("font-pond-paused", String(next));
    setHeaderAnimationPaused(next);
    window.dispatchEvent(new CustomEvent("animationPauseToggle", { detail: next }));
    document.body.classList.toggle("animations-paused", next);
  };

  return (
    <footer
      className="w-full mt-auto shell-padding site-footer footer-wrap"
      style={{
        background: "var(--bg-footer)",
        boxShadow: "var(--shadow-edge-top)",
        borderTop: "var(--border-edge)",
        minHeight: "88px",
        paddingTop: "16px",
        paddingBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="footer-left" style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <Link
          href="/database"
          className="footer-tagline hover:opacity-70 transition-opacity"
          style={{ fontSize: "16px", color: "var(--text-ransom)" }}
        >
          Free font combinations for design work
        </Link>
        <p style={{ fontSize: "16px", color: "var(--text-ransom)", margin: 0 }}>
          &copy; 2026{" "}
          <a
            href="https://www.linkedin.com/in/melanielent/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
            className="hover:opacity-70 transition-opacity"
          >
            Mel Lent
          </a>
        </p>
      </div>

      <div className="footer-right flex items-center shrink-0" style={{ gap: "24px" }}>
        <button
          onClick={togglePause}
          className="flex items-center transition-colors hover:opacity-70 footer-pause-btn"
          style={{
            fontSize: "16px",
            color: "var(--text-ransom)",
            background: "transparent",
            border: "none",
            padding: "0",
            gap: "4px",
            cursor: "pointer",
            height: "40px",
          }}
          aria-label={paused ? "Resume animation" : "Pause animation"}
        >
          {paused ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4v12l9-6L7 4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3.5" width="4" height="13" rx="1" />
              <rect x="12" y="3.5" width="4" height="13" rx="1" />
            </svg>
          )}
          <span className="footer-pause-label">{paused ? "Resume animation" : "Pause animation"}</span>
        </button>
        {hasHistory && (
          <div
            className="footer-spacer"
            aria-hidden="true"
            style={{ visibility: "hidden", height: "40px", width: "110px" }}
          />
        )}
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { setHeaderAnimationPaused } from "./RansomHeader";
import { useAppState } from "@/lib/store";

export function Footer() {
  const [paused, setPaused] = useState(false);
  const { recentHistory } = useAppState();
  const hasHistory = recentHistory.length >= 2;

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    setHeaderAnimationPaused(next);
    window.dispatchEvent(new CustomEvent("animationPauseToggle", { detail: next }));
    document.body.classList.toggle("animations-paused", next);
  };

  return (
    <footer
      className="w-full mt-auto shell-padding flex items-center justify-between site-footer"
      style={{ background: "var(--bg-footer)", borderTop: "1px solid var(--border)", minHeight: "88px", gap: "16px", paddingTop: "16px", paddingBottom: "16px" }}
    >
      {/* Left side — tagline + copyright + about */}
      <div className="footer-left flex items-center flex-wrap">
        <Link href="/database" className="footer-tagline hover:opacity-70 transition-opacity" style={{ fontSize: "16px", color: "var(--text-ransom)" }}>
          Free font combinations for design work
        </Link>
        <p style={{ fontSize: "16px", color: "var(--text-ransom)" }}>
          &copy; 2026{" "}
          <a
            href="https://meet-mel-lent.framer.website/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
            className="hover:opacity-70 transition-opacity"
          >
            Mel Lent
          </a>
        </p>
        <a
          href="/about"
          style={{ fontSize: "16px", color: "var(--text-ransom)", fontWeight: 600 }}
          className="hover:opacity-70 transition-opacity"
        >
          About
        </a>
      </div>

      {/* Right side — pause button + invisible spacer for viewed chip */}
      <div className="footer-right flex items-center shrink-0" style={{ gap: "24px" }}>
        <button
          onClick={togglePause}
          className="flex items-center transition-colors hover:opacity-70 footer-pause-btn"
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text-ransom)",
            background: "transparent",
            border: "none",
            padding: "0",
            gap: "4px",
            cursor: "pointer",
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
          <span className="hidden sm:inline">{paused ? "Resume animation" : "Pause animation"}</span>
        </button>

        {/* Invisible spacer — reserves space for the fixed viewed chip */}
        {hasHistory && (
          <div
            className="footer-spacer"
            aria-hidden="true"
            style={{
              visibility: "hidden",
              height: "40px",
              width: "110px",
            }}
          />
        )}
      </div>
    </footer>
  );
}

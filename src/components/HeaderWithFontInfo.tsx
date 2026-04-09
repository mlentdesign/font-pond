"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { RansomHeader } from "./RansomHeader";

export function HeaderWithFontInfo() {
  const [currentFont, setCurrentFont] = useState("");
  const [currentSlug, setCurrentSlug] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleFontChange = useCallback((fontName: string, fontSlug: string) => {
    setCurrentFont(fontName);
    setCurrentSlug(fontSlug);
  }, []);

  const scheduleHide = () => {
    hideTimeout.current = setTimeout(() => setShowTooltip(false), 300);
  };
  const cancelHide = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  };

  const handleFontClick = () => {
    if (currentSlug) {
      router.push(`/font?f=${currentSlug}`);
      setShowTooltip(false);
    }
  };

  return (
    <span className="inline-flex items-center" style={{ gap: "8px" }}>
      <span className="ransom-title">
        <RansomHeader onFontChange={handleFontChange} />
      </span>

      {currentFont && (
        <span
          className="relative shrink-0"
          onMouseEnter={() => { cancelHide(); setShowTooltip(true); }}
          onMouseLeave={scheduleHide}
          onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setShowTooltip(!showTooltip); } }}
          role="button"
          tabIndex={0}
          aria-label="View current font name"
          style={{ cursor: "pointer" }}
        >
          {/* Eye icon — stylized outline, no circle background */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-ransom)" }}
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>

          {showTooltip && (
            <span
              className="absolute rounded-lg shadow-lg card-hover"
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
              style={{
                top: "calc(100% + 4px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--bg-input)",
                border: "2px solid var(--border)",
                padding: "8px 16px",
                whiteSpace: "nowrap",
                fontSize: "16px",
                color: "var(--text-ransom)",
                zIndex: 100,
                cursor: "pointer",
              }}
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleFontClick(); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); handleFontClick(); } }}
            >
              {currentFont}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

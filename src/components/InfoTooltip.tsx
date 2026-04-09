"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Tooltip descriptions for technical typography terms
const TOOLTIP_DESCRIPTIONS: Record<string, string> = {
  // Font anatomy (font detail + pair detail)
  "x-height": "The height of lowercase letters like 'x' relative to uppercase. Taller x-heights improve readability at small sizes.",
  "apertures": "How open the gaps are in letters like 'c', 'e', and 'a'. Open apertures make letters easier to distinguish.",
  "stroke contrast": "The difference between the thickest and thinnest parts of a letter. High contrast adds elegance but can reduce body-text legibility.",
  "spacing": "The default space between letters. Generous spacing aids readability in body text; tight spacing suits bold headlines.",
  "body legibility": "How readable the font is for paragraphs and long-form text, scored from 1 (display only) to 10 (excellent body text).",
  "body suitable": "Whether the font works well for paragraphs and long reading, based on its proportions and stroke design.",

  // Pair scores
  "hierarchy": "How effectively the header and body fonts create a clear visual pecking order — making headings look like headings.",
  "legibility": "How readable the body font is when paired with this header, considering size, weight, and anatomy.",
  "practicality": "How versatile and usable this pair is across real-world projects like websites, apps, and print.",
  "overall": "A combined score weighing hierarchy, legibility, practicality, and anatomy-based compatibility.",
  "x-height harmony": "How well the header and body fonts' lowercase heights align visually, creating a cohesive look when used together.",
  "role fitness": "How well each font fits its intended role — the header font as a display face, the body font as a reading face.",
  "personality contrast": "The balance of visual personality between the two fonts. Too similar feels flat; too different feels chaotic.",
  "contrast type": "The design strategy that makes this pairing work — such as combining a serif header with a sans-serif body.",
  "mood": "The overall emotional character of the font — the feeling it conveys to readers before they even read the words.",

  // Font classification
  "classification": "The broad typographic category this font belongs to, like serif, sans-serif, display, or monospace.",
  "variable font": "A single font file that contains a range of weights and styles, allowing smooth adjustments instead of fixed steps.",
};

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export function InfoTooltip({ label }: { label: string }) {
  const key = label.toLowerCase();
  const description = TOOLTIP_DESCRIPTIONS[key];
  if (!description) return null;

  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();

  const scheduleHide = () => {
    hideTimeout.current = setTimeout(() => setShow(false), 300);
  };
  const cancelHide = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  };

  const updatePos = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, []);

  const handleShow = () => {
    cancelHide();
    updatePos();
    setShow(true);
  };

  // On mobile, close this tooltip when user taps anywhere else
  useEffect(() => {
    if (!isMobile || !show) return;
    const handleTap = (e: MouseEvent | TouchEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("click", handleTap);
    document.addEventListener("touchstart", handleTap);
    return () => {
      document.removeEventListener("click", handleTap);
      document.removeEventListener("touchstart", handleTap);
    };
  }, [isMobile, show]);

  return (
    <span
      ref={iconRef}
      style={{ marginLeft: "4px", display: "inline", verticalAlign: "baseline" }}
      // Desktop: hover to show/hide
      onMouseEnter={isMobile ? undefined : handleShow}
      onMouseLeave={isMobile ? undefined : scheduleHide}
      // Both: click/tap to toggle
      onClick={(e) => { e.stopPropagation(); if (show) { setShow(false); } else { handleShow(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Info about ${label}`}
    >
      {/* Info icon: circle with "i" */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "currentColor", opacity: 0.6, cursor: "help", display: "inline", verticalAlign: "-1px" }}
      >
        <circle cx="10" cy="10" r="8.5" />
        <line x1="10" y1="9" x2="10" y2="14" />
        <circle cx="10" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>

      {show && pos && typeof document !== "undefined" && createPortal(
        <span
          className="rounded-lg shadow-lg"
          onMouseEnter={isMobile ? undefined : cancelHide}
          onMouseLeave={isMobile ? undefined : scheduleHide}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            transform: "translateX(-50%)",
            background: "var(--bg-input)",
            border: "2px solid var(--border)",
            padding: "8px 16px",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "1.4",
            color: "var(--text-ransom)",
            textTransform: "none",
            letterSpacing: "normal",
            zIndex: 9999,
            width: "240px",
            whiteSpace: "normal",
            pointerEvents: isMobile ? "none" : "auto",
          }}
        >
          {description}
        </span>,
        document.body,
      )}
    </span>
  );
}

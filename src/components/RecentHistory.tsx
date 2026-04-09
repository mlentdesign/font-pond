"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store";

export function RecentHistory() {
  const { recentItems } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close when cursor moves more than 80px away from the combined chip + menu area
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Build a combined bounding rect from chip and menu
    const chipRect = containerRef.current?.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();
    if (!chipRect) return;

    const top = menuRect ? Math.min(chipRect.top, menuRect.top) : chipRect.top;
    const bottom = Math.max(chipRect.bottom, menuRect?.bottom ?? chipRect.bottom);
    const left = Math.min(chipRect.left, menuRect?.left ?? chipRect.left);
    const right = Math.max(chipRect.right, menuRect?.right ?? chipRect.right);

    const dx = Math.max(0, left - e.clientX, e.clientX - right);
    const dy = Math.max(0, top - e.clientY, e.clientY - bottom);
    if (Math.sqrt(dx * dx + dy * dy) > 80) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen, handleMouseMove]);

  if (recentItems.length < 2) return null;

  return (
    <div className="fixed z-50 fixed-right history-chip-fixed" style={{ bottom: "24px" }}>
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-lg shadow-sm transition-all card-hover"
          style={{
            fontSize: "16px",
            color: "var(--text-ransom)",
            background: "var(--bg-input)",
            border: "2px solid var(--border)",
            padding: "8px 12px",
            gap: "8px",
            height: "40px",
          }}
          aria-expanded={isOpen}
          aria-label="Recently viewed"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6.5V10L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">History</span>
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-full right-0 rounded-xl shadow-lg overflow-hidden"
            style={{ background: "var(--bg-card)", border: "2px solid var(--border)", marginBottom: "8px", width: "260px" }}
          >
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--divider)" }}>
              <h3 className="font-medium uppercase tracking-wider" style={{ fontSize: "12px", color: "var(--text-label)" }}>RECENTLY VIEWED</h3>
            </div>
            <ul className="overflow-y-auto" style={{ maxHeight: "280px" }}>
              {recentItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.type === "pair" ? `/pair?p=${item.slug}` : `/font?f=${item.slug}`}
                    className="flex items-center transition-colors card-hover"
                    style={{ padding: "8px 16px", gap: "8px" }}
                    onClick={() => { setIsOpen(false); requestAnimationFrame(() => window.history.replaceState(null, "", `/font-pond/${item.type === "pair" ? "pair" : "font"}/${item.slug}`)); }}
                  >
                    <span
                      className="shrink-0 rounded uppercase tracking-wider font-medium"
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        background: item.type === "pair" ? "var(--accent)" : "var(--border)",
                        color: item.type === "pair" ? "var(--btn-text)" : "var(--text-muted)",
                      }}
                    >
                      {item.type === "pair" ? "Pair" : "Font"}
                    </span>
                    <p className="truncate flex-1" style={{ fontSize: "16px", color: "var(--text-body)" }}>
                      {item.label}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

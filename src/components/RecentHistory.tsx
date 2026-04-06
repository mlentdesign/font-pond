"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store";

export function RecentHistory() {
  const { recentHistory } = useAppState();
  const [isOpen, setIsOpen] = useState(false);

  if (recentHistory.length < 2) return null;

  return (
    <div className="fixed z-50 fixed-right" style={{ bottom: "24px" }}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-lg shadow-sm transition-all hover:opacity-70"
          style={{
            fontSize: "16px",
            color: "var(--text-ransom)",
            background: "var(--bg-card)",
            border: "2px solid var(--border)",
            padding: "8px 16px",
            gap: "8px",
            height: "40px",
          }}
          aria-expanded={isOpen}
          aria-label="Recently viewed pairs"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4.5V7L8.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">{recentHistory.length > 10 ? "10+" : recentHistory.length} viewed</span>
        </button>

        {isOpen && (
          <div
            className="absolute bottom-full right-0 rounded-xl shadow-lg overflow-hidden"
            style={{ background: "var(--bg-card)", border: "2px solid var(--border)", marginBottom: "8px", width: "240px" }}
          >
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--divider)" }}>
              <h3 className="font-medium uppercase tracking-wider" style={{ fontSize: "12px", color: "var(--text-label)" }}>RECENTLY VIEWED</h3>
            </div>
            <ul className="overflow-y-auto" style={{ maxHeight: "240px" }}>
              {recentHistory.map((item) => (
                <li key={item.pairId}>
                  <Link
                    href={`/pair?p=${item.pairSlug}`}
                    className="flex items-center transition-colors hover:opacity-70"
                    style={{ padding: "8px 16px" }}
                    onClick={() => setIsOpen(false)}
                  >
                    <p className="truncate flex-1" style={{ fontSize: "16px", color: "var(--text-body)" }}>
                      {item.headerFontName} + {item.bodyFontName}
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

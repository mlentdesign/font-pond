"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Render a placeholder with fixed dimensions during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className="rounded-lg"
        style={{ width: "80px", height: "40px", background: "var(--bg-chip)", border: "2px solid var(--border)" }}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center rounded-lg overflow-hidden"
      style={{
        background: "var(--bg-chip)",
        border: "2px solid var(--border)",
        padding: "4px",
      }}
    >
      <span
        className="flex items-center justify-center rounded-md transition-all"
        style={{
          width: "32px",
          height: "32px",
          background: !dark ? "var(--toggle-active)" : "transparent",
          color: !dark ? "var(--toggle-active-text)" : "var(--text-ransom)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 2.5V4M9 14V15.5M2.5 9H4M14 9H15.5M4.7 4.7L5.8 5.8M12.2 12.2L13.3 13.3M13.3 4.7L12.2 5.8M5.8 12.2L4.7 13.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span
        className="flex items-center justify-center rounded-md transition-all"
        style={{
          width: "32px",
          height: "32px",
          background: dark ? "var(--toggle-active)" : "transparent",
          color: dark ? "var(--toggle-active-text)" : "var(--text-ransom)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M14.5 10.5a5.5 5.5 0 01-7-7A5.5 5.5 0 1014.5 10.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

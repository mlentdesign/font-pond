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
    // Enable transitions for smooth theme animation
    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 350);
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
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 3V4.5M10 15.5V17M3 10H4.5M15.5 10H17M5.2 5.2L6.3 6.3M13.7 13.7L14.8 14.8M14.8 5.2L13.7 6.3M6.3 13.7L5.2 14.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M16 11.5a6 6 0 01-7.5-7.5A6 6 0 1016 11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

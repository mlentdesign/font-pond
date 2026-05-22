"use client";

// The footer "© 2026" is a quiet trigger: looks like text, behaves like a
// button. Clicking it opens a themed modal with a scannable QR code rendered
// as a school of fish. Closes on backdrop click, Escape, or the X button.
import { useEffect, useState } from "react";
import { FishQR } from "./FishQR";

export function CopyrightQR() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show QR code to share Font Pond"
        // Match the surrounding "<p>" exactly — no underline, no chrome — so
        // it reads as plain copyright text. Cursor is the only tell.
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          font: "inherit",
          color: "inherit",
          cursor: "pointer",
        }}
        className="hover:opacity-70 transition-opacity"
      >
        &copy; 2026
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR code"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(0, 30, 28, 0.55)",
            backdropFilter: "blur(4px)",
            animation: "qrFade 160ms ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "var(--bg-card)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-hover)",
              border: "var(--border-edge)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              maxWidth: "calc(100vw - 48px)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "transparent",
                border: "none",
                padding: "8px",
                cursor: "pointer",
                color: "var(--text-ransom)",
                lineHeight: 0,
              }}
              className="hover:opacity-70 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>

            <FishQR px={260} />

            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                margin: 0,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              Scan to visit Font Pond
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes qrFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

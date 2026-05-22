"use client";

// The footer "© 2026" is a quiet trigger: looks like text, behaves like a
// button. Clicking it opens a themed modal containing a scannable QR code
// rendered as a school of fish. Closes on backdrop click, Escape, or X.
import { useEffect, useState } from "react";
import { FishQR } from "./FishQR";

export function CopyrightQR() {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while open.
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
        // Match the surrounding "<p>" exactly so it reads as plain text.
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
          // z-index above everything else on the site (InfoTooltip uses 9999),
          // so the backdrop + blur cover the sticky header and history chip.
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(0, 30, 28, 0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
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
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              maxWidth: "calc(100vw - 48px)",
            }}
          >
            {/* Header bar holds the close button on its own row so it can
                never bump into the QR code. */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
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
            </div>

            {/* QR + caption */}
            <div
              style={{
                padding: "0 32px 32px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <FishQR px={320} />
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-ransom)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Scan to visit Font Pond
              </p>
            </div>
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

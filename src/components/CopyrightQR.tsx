"use client";

// The footer "© 2026" is a quiet trigger: looks like text, behaves like a
// button. Clicking it opens a themed modal with the scannable fish QR.
//
// The modal is rendered through a React portal into <body>. Without that, it
// inherits the footer's stacking context (footer has its own z-index in
// globals.css) and the page header / history chip end up *over* the backdrop
// — which is exactly the bug she kept seeing.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FishQR } from "./FishQR";

export function CopyrightQR() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portals need document.body, which only exists after hydration in a
  // static-export build.
  useEffect(() => { setMounted(true); }, []);

  // Close on Escape and lock body scroll while the modal is open.
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

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR code"
      onClick={() => setOpen(false)}
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
        {/* Close button has its own padded row so it can't bump the QR. */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px" }}>
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

        {/* QR + caption. Scales responsively but caps at ~520px on desktop
            so the fish detail (forked tail, dorsal fin, eye) is visible. */}
        <div
          style={{
            padding: "0 32px 32px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ width: "min(520px, calc(100vw - 112px))" }}>
            <FishQR />
          </div>
          <p style={{ fontSize: "16px", color: "var(--text-ransom)", margin: 0, textAlign: "center" }}>
            Scan to visit Font Pond
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show QR code to share Font Pond"
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

      {open && mounted && createPortal(modal, document.body)}

      <style jsx>{`
        @keyframes qrFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

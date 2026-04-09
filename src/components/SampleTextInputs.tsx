"use client";

import { useAppState, DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";

function sliderFill(value: number, min: number, max: number): string {
  return `${((value - min) / (max - min)) * 100}%`;
}

export function SampleTextInputs({ alwaysShow = false }: { alwaysShow?: boolean } = {}) {
  const {
    sampleHeadline, setSampleHeadline,
    sampleBody, setSampleBody,
    headerSize, setHeaderSize,
    bodySize, setBodySize,
    hasSearched,
  } = useAppState();

  if (!alwaysShow && !hasSearched) return null;

  return (
    <div className="w-full preview-settings-spacing" style={{ marginTop: "24px", marginBottom: "80px" }}>
      <details className="group">
        {/* Summary — left-aligned with "Exploring — shuffled randomly" */}
        <summary
          className="cursor-pointer select-none list-none flex items-center font-semibold text-neutral-700 hover:opacity-70"
          style={{ fontSize: "16px", gap: "4px" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="transition-transform group-open:rotate-180"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Preview settings
        </summary>

        {/* Content — indented equally on left and right */}
        <div style={{ marginTop: "16px", paddingLeft: "24px", paddingRight: "24px" }}>
          <div className="settings-quad-grid">
            {/* Headline text — pos 1 on mobile, col 1 on desktop */}
            <div className="settings-item-headline-text">
              <label htmlFor="sample-headline" className="block uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "8px" }}>
                HEADLINE TEXT
              </label>
              <input
                id="sample-headline"
                type="text"
                value={sampleHeadline}
                onChange={(e) => setSampleHeadline(e.target.value)}
                placeholder="Custom headline text..."
                className="w-full rounded-lg outline-none"
                style={{ fontSize: "16px", background: "var(--bg-input)", color: "var(--text-heading)", boxShadow: "var(--shadow-input)", padding: "8px 16px" }}
              />
            </div>
            {/* Header slider — pos 2 on mobile, col 1 row 2 on desktop */}
            <div className="settings-item-headline-slider">
              <label htmlFor="header-size" className="flex items-center justify-between uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "8px" }}>
                <span>HEADER SIZE</span>
                <span className="tabular-nums">{headerSize}px</span>
              </label>
              <input
                id="header-size"
                type="range"
                min={20}
                max={64}
                value={headerSize}
                onChange={(e) => setHeaderSize(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ ["--slider-fill" as string]: sliderFill(headerSize, 20, 64) }}
              />
            </div>
            {/* Body text — pos 3 on mobile, col 2 row 1 on desktop */}
            <div className="settings-item-body-text">
              <label htmlFor="sample-body" className="block uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "8px" }}>
                BODY TEXT
              </label>
              <input
                id="sample-body"
                type="text"
                value={sampleBody}
                onChange={(e) => setSampleBody(e.target.value)}
                placeholder="Custom body text..."
                className="w-full rounded-lg outline-none"
                style={{ fontSize: "16px", background: "var(--bg-input)", color: "var(--text-heading)", boxShadow: "var(--shadow-input)", padding: "8px 16px" }}
              />
            </div>
            {/* Body slider — pos 4 on mobile, col 2 row 2 on desktop */}
            <div className="settings-item-body-slider">
              <label htmlFor="body-size" className="flex items-center justify-between uppercase tracking-wider text-neutral-400" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "8px" }}>
                <span>BODY SIZE</span>
                <span className="tabular-nums">{bodySize}px</span>
              </label>
              <input
                id="body-size"
                type="range"
                min={12}
                max={24}
                value={bodySize}
                onChange={(e) => setBodySize(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ ["--slider-fill" as string]: sliderFill(bodySize, 12, 24) }}
              />
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

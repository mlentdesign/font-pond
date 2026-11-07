"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { SectionCard } from "@/components/SectionCard";
import { fonts, getFont } from "@/data/fonts";
import type { Font } from "@/data/types";
import { loadFont, pinFonts, ensureFontsRendered, getFontFamily } from "@/lib/fonts";
import { DEFAULT_HEADLINE, DEFAULT_BODY, DEFAULT_HEADER_SIZE, DEFAULT_BODY_SIZE } from "@/lib/store";
import { FontPicker } from "./FontPicker";

type CaseMode = "as-typed" | "upper" | "sentence" | "lower" | "title";

const CASES: { id: CaseMode; label: string }[] = [
  { id: "as-typed", label: "As typed" },
  { id: "upper", label: "All caps" },
  { id: "sentence", label: "Sentence case" },
  { id: "lower", label: "All lowercase" },
  { id: "title", label: "Proper case" },
];

function applyCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "sentence": return text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
    case "title": return text.toLowerCase().replace(/(^|[\s\-(“"])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
    default: return text;
  }
}

const STORE_KEY = "font-lab-v1";
interface Saved {
  headerId: string; bodyId: string;
  headline: string; body: string;
  headerCase: CaseMode; bodyCase: CaseMode;
  headerSize: number; bodySize: number;
}

const DEFAULT_HEADER_ID = "playfair-display";
const DEFAULT_BODY_ID = "inter";

function CaseChips({ label, value, onChange }: { label: string; value: CaseMode; onChange: (c: CaseMode) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap" style={{ gap: "8px" }}>
      {CASES.map((c) => {
        const on = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(c.id)}
            className="rounded-lg hover:opacity-80"
            style={{ fontSize: "14px", padding: "8px", cursor: "pointer", background: on ? "var(--btn-bg)" : "var(--bg-input)", color: on ? "var(--btn-text)" : "var(--text-heading)", border: on ? "2px solid var(--btn-bg)" : "2px solid var(--border)" }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function Slider({ id, label, value, min, max, onChange }: { id: string; label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between uppercase text-neutral-400" style={{ fontSize: "12px", letterSpacing: "0.08em", marginBottom: "8px" }}>
        <span>{label}</span>
        <span className="tabular-nums">{value}px</span>
      </label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: "var(--accent)" }} />
    </div>
  );
}

const fieldLabel = { fontSize: "12px", letterSpacing: "0.08em", marginBottom: "8px" } as const;
const fieldBox = { fontSize: "16px", background: "var(--bg-input)", color: "var(--text-heading)", boxShadow: "var(--shadow-input)", padding: "8px 16px" } as const;

export default function LabClient() {
  const sorted = useMemo(() => [...fonts].sort((a, b) => a.name.localeCompare(b.name)), []);
  const [header, setHeader] = useState<Font | null>(null);
  const [bodyFont, setBodyFont] = useState<Font | null>(null);
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [bodyText, setBodyText] = useState(DEFAULT_BODY);
  const [headerCase, setHeaderCase] = useState<CaseMode>("as-typed");
  const [bodyCase, setBodyCase] = useState<CaseMode>("as-typed");
  const [headerSize, setHeaderSize] = useState(DEFAULT_HEADER_SIZE);
  const [bodySize, setBodySize] = useState(DEFAULT_BODY_SIZE);
  const [ready, setReady] = useState(false);
  const bodyBoxRef = useRef<HTMLTextAreaElement>(null);

  // Grow the sample text box to fit its text so it never scrolls. Re-fit when
  // the text changes, the page first shows, or the window width changes.
  useLayoutEffect(() => {
    const fit = () => {
      const el = bodyBoxRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [bodyText, ready]);

  // Restore the last session (localStorage only, never the URL).
  useEffect(() => {
    let s: Partial<Saved> = {};
    try { s = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { /* ignore */ }
    setHeader(getFont(s.headerId || DEFAULT_HEADER_ID) ?? sorted[0]);
    setBodyFont(getFont(s.bodyId || DEFAULT_BODY_ID) ?? sorted[1]);
    if (typeof s.headline === "string") setHeadline(s.headline);
    if (typeof s.body === "string") setBodyText(s.body);
    if (s.headerCase) setHeaderCase(s.headerCase);
    if (s.bodyCase) setBodyCase(s.bodyCase);
    if (s.headerSize) setHeaderSize(s.headerSize);
    if (s.bodySize) setBodySize(s.bodySize);
    setReady(true);
  }, [sorted]);

  useEffect(() => {
    if (!ready || !header || !bodyFont) return;
    const saved: Saved = { headerId: header.id, bodyId: bodyFont.id, headline, body: bodyText, headerCase, bodyCase, headerSize, bodySize };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch { /* ignore */ }
  }, [ready, header, bodyFont, headline, bodyText, headerCase, bodyCase, headerSize, bodySize]);

  // Load and pin just the two chosen fonts so the CDN cap never evicts them.
  useEffect(() => {
    const chosen = [header, bodyFont].filter((f): f is Font => !!f);
    if (!chosen.length) return;
    chosen.forEach(loadFont);
    ensureFontsRendered(chosen.map((f) => f.name));
    return pinFonts(chosen);
  }, [header, bodyFont]);

  const swap = () => {
    setHeader(bodyFont);
    setBodyFont(header);
  };

  if (!header || !bodyFont) {
    return (
      <div className="flex-1 flex flex-col">
        <DetailPageHeader />
        <main id="main-content" className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />
      <main id="main-content" className="flex-1 mx-auto w-full content-padding" style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}>
        <h1 className="font-semibold tracking-tight" style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "4px" }}>Font lab</h1>
        <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "24px" }}>
          Pick any two of {fonts.length.toLocaleString()} fonts, swap them, and test your own text.
        </p>

        <div className="grid lg:items-start lg:grid-cols-[400px_minmax(0,1fr)]" style={{ gap: "24px" }}>
          {/* Controls: left column on desktop, below the sample on tablet and phone */}
          <SectionCard className="flex flex-col" style={{ gap: "24px" }}>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <FontPicker label="Header font" fonts={sorted} value={header} onChange={setHeader} />
              <button
                type="button"
                onClick={swap}
                aria-label="Swap header and body fonts"
                className="flex items-center justify-center rounded-lg hover:opacity-70"
                style={{ height: "40px", gap: "4px", cursor: "pointer", background: "var(--bg-input)", border: "2px solid var(--border)", color: "var(--accent)", fontSize: "14px" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M7 4v12m0 0-3-3m3 3 3-3M13 16V4m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Swap fonts
              </button>
              <FontPicker label="Body font" fonts={sorted} value={bodyFont} onChange={setBodyFont} />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
              <label htmlFor="lab-headline" className="block uppercase text-neutral-400" style={fieldLabel}>Header text</label>
              <input id="lab-headline" type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full rounded-lg outline-none" style={fieldBox} />
              <div style={{ marginTop: "16px" }}><CaseChips label="Header text case" value={headerCase} onChange={setHeaderCase} /></div>
              <div style={{ marginTop: "16px" }}><Slider id="lab-header-size" label="Header size" value={headerSize} min={16} max={96} onChange={setHeaderSize} /></div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
              <label htmlFor="lab-body" className="block uppercase text-neutral-400" style={fieldLabel}>Body text</label>
              <textarea ref={bodyBoxRef} id="lab-body" rows={1} value={bodyText} onChange={(e) => setBodyText(e.target.value)} className="w-full rounded-lg outline-none" style={{ ...fieldBox, resize: "none", overflow: "hidden", display: "block" }} />
              <div style={{ marginTop: "16px" }}><CaseChips label="Body text case" value={bodyCase} onChange={setBodyCase} /></div>
              <div style={{ marginTop: "16px" }}><Slider id="lab-body-size" label="Body size" value={bodySize} min={10} max={32} onChange={setBodySize} /></div>
            </div>
          </SectionCard>

          {/* Sample: first on phone and tablet, right column and sticky on desktop */}
          <div className="order-first lg:order-none lg:sticky" style={{ top: "96px" }}>
            <SectionCard style={{ padding: "32px 24px" }}>
              <div className="uppercase text-neutral-400" style={{ ...fieldLabel, marginBottom: "16px" }}>
                {header.name} + {bodyFont.name}
              </div>
              <h2 style={{ fontFamily: getFontFamily(header.name, header.source), fontSize: `${headerSize}px`, lineHeight: 1.15, color: "var(--text-heading)", fontWeight: 700, marginBottom: "16px", overflowWrap: "anywhere" }}>
                {applyCase(headline, headerCase)}
              </h2>
              <p style={{ fontFamily: getFontFamily(bodyFont.name, bodyFont.source), fontSize: `${bodySize}px`, lineHeight: 1.6, color: "var(--text-body, var(--text-heading))", maxWidth: "70ch", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {applyCase(bodyText, bodyCase)}
              </p>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}

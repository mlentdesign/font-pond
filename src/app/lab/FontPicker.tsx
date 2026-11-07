"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Font } from "@/data/types";
import { formatClassification, getSourceLabel } from "@/lib/text";

const MAX_ROWS = 60;

function rank(fonts: Font[], query: string): Font[] {
  const q = query.trim().toLowerCase();
  if (!q) return fonts.slice(0, MAX_ROWS);
  const starts: Font[] = [];
  const wordStarts: Font[] = [];
  const contains: Font[] = [];
  for (const f of fonts) {
    const n = f.name.toLowerCase();
    if (n.startsWith(q)) starts.push(f);
    else if (n.split(/[\s-]+/).some((w) => w.startsWith(q))) wordStarts.push(f);
    else if (n.includes(q)) contains.push(f);
  }
  return [...starts, ...wordStarts, ...contains].slice(0, MAX_ROWS);
}

export function ShuffleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h2.5c3 0 4 8 7 8H17m0 0-2.5-2.5M17 14l-2.5 2.5M3 14h2.5c1 0 1.8-.7 2.4-1.6M12.5 6H17m0 0-2.5-2.5M17 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  label: string;
  fonts: Font[];
  value: Font | null;
  onChange: (font: Font) => void;
  onShuffle?: () => void;
}

export function FontPicker({ label, fonts, value, onChange, onShuffle }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => rank(fonts, query), [fonts, query]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (f: Font) => {
    onChange(f);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && open && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
        <label htmlFor={id} className="block uppercase text-neutral-400" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
          {label}
        </label>
        {onShuffle && (
          <button
            type="button"
            onClick={onShuffle}
            aria-label={`Shuffle ${label.toLowerCase()}`}
            className="flex items-center hover:opacity-70"
            style={{ gap: "4px", cursor: "pointer", background: "none", border: "none", color: "var(--accent)", fontSize: "14px", padding: 0 }}
          >
            <ShuffleIcon />
            Shuffle
          </button>
        )}
      </div>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        autoComplete="off"
        value={open ? query : ""}
        placeholder={value ? value.name : "Search fonts..."}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg outline-none"
        style={{ fontSize: "16px", background: "var(--bg-input)", color: "var(--text-heading)", boxShadow: "var(--shadow-input)", padding: "8px 16px", height: "44px" }}
      />
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          className="rounded-lg"
          style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: "8px", zIndex: 20, maxHeight: "320px", overflowY: "auto", background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-input-focus)", listStyle: "none", padding: "8px 0" }}
        >
          {results.length === 0 && (
            <li style={{ padding: "8px 16px", fontSize: "14px", color: "var(--text-muted)" }}>No fonts match that</li>
          )}
          {results.map((f, i) => (
            <li
              key={f.id}
              role="option"
              aria-selected={value?.id === f.id}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(f); }}
              className="flex items-center justify-between"
              style={{ gap: "16px", padding: "8px 16px", cursor: "pointer", fontSize: "16px", color: "var(--text-heading)", background: i === active ? "var(--bg-card-hover)" : "transparent", fontWeight: value?.id === f.id ? 600 : 400 }}
            >
              <span className="truncate">{f.name}</span>
              <span className="shrink-0" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {formatClassification(f.classification)} · {getSourceLabel(f.source)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

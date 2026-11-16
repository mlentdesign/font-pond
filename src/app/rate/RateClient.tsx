"use client";

import { useEffect, useMemo, useState } from "react";
import { getFont } from "@/data/fonts";
import type { Font } from "@/data/types";
import { loadFont, pinFonts, ensureFontsRendered, getFontFamily } from "@/lib/fonts";
import { DEFAULT_HEADLINE, DEFAULT_BODY } from "@/lib/store";
import sample from "./sample.json";

// Her grades live in this browser only (localStorage) until she downloads them.
const STORE_KEY = "font-pond-rate-v1";
type Grade = { grade: number | null; note: string };
type Saved = { index: number; grades: Record<string, Grade> };
const PAIRS = sample.pairs;
const BODY_SHORT = DEFAULT_BODY.split(". ").slice(0, 2).join(". ").replace(/\.+$/, "") + ".";

const label = { fontSize: "12px", letterSpacing: "0.08em" } as const;
const btn = (on: boolean) => ({ fontSize: "16px", padding: "12px", minWidth: "48px", cursor: "pointer", borderRadius: "8px", background: on ? "var(--btn-bg)" : "var(--bg-input)", color: on ? "var(--btn-text)" : "var(--text-heading)" }) as const;

export default function RateClient() {
  const [state, setState] = useState<Saved>({ index: 0, grades: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORE_KEY); if (raw) setState(JSON.parse(raw)); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }, [state, ready]);

  const i = Math.min(state.index, PAIRS.length - 1);
  const cur = PAIRS[i];
  const header = useMemo(() => getFont(cur.h) as Font | undefined, [cur]);
  const body = useMemo(() => getFont(cur.b) as Font | undefined, [cur]);
  const g = state.grades[cur.slug] ?? { grade: null, note: "" };
  const rated = Object.values(state.grades).filter((x) => x.grade != null).length;

  // load this pair's fonts, and the next two pairs' fonts ahead of time
  useEffect(() => {
    const now = [header, body].filter(Boolean) as Font[];
    now.forEach((f) => loadFont(f));
    const unpin = pinFonts(now);
    for (const p of PAIRS.slice(i + 1, i + 3)) for (const id of [p.h, p.b]) { const f = getFont(id); if (f) loadFont(f); }
    ensureFontsRendered(now.map((f) => f.name));
    return unpin;
  }, [i, header, body]);

  const go = (n: number) => setState((s) => ({ ...s, index: Math.max(0, Math.min(PAIRS.length - 1, n)) }));
  const setGrade = (v: number | null, advance = false) =>
    setState((s) => ({ index: advance ? Math.min(PAIRS.length - 1, s.index + 1) : s.index, grades: { ...s.grades, [cur.slug]: { grade: v, note: s.grades[cur.slug]?.note ?? "" } } }));
  const setNote = (note: string) => setState((s) => ({ ...s, grades: { ...s.grades, [cur.slug]: { grade: s.grades[cur.slug]?.grade ?? null, note } } }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (/^[1-9]$/.test(e.key)) setGrade(Number(e.key), true);
      else if (e.key === "0") setGrade(10, true);
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const download = () => {
    const rows = PAIRS.map((p) => ({ slug: p.slug, header: p.h, body: p.b, modelScore: p.q, inLiveSet: p.inSet, grade: state.grades[p.slug]?.grade ?? null, note: state.grades[p.slug]?.note ?? "" }));
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ratedAt: new Date().toISOString(), rows }, null, 1)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "font-pond-pair-grades.json"; a.click(); URL.revokeObjectURL(url);
  };

  if (!header || !body) return <main style={{ padding: "32px 16px" }}>Pair not found.</main>;
  return (
    <main style={{ maxWidth: "880px", margin: "0 auto", padding: "32px 16px", color: "var(--text-body)" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "24px", color: "var(--text-heading)", fontWeight: 600 }}>Rate pairs</h1>
          <p style={{ fontSize: "14px" }}>Grade each pair by eye, 1 to 10. The score is hidden so it can&apos;t sway you.</p>
        </div>
        <button type="button" onClick={download} style={btn(false)}>Download my grades</button>
      </div>

      <div className="flex items-center justify-between uppercase" style={{ ...label, marginBottom: "8px" }}>
        <span>Pair {i + 1} of {PAIRS.length}</span>
        <span className="tabular-nums">{rated} rated</span>
      </div>
      <div style={{ height: "8px", borderRadius: "8px", background: "var(--bg-input)", marginBottom: "24px" }}>
        <div style={{ height: "8px", borderRadius: "8px", background: "var(--accent)", width: `${(rated / PAIRS.length) * 100}%` }} />
      </div>

      <section style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "32px" }}>
        <h2 style={{ fontFamily: getFontFamily(header.name, header.source), fontSize: "40px", lineHeight: 1.15, color: "var(--text-heading)", marginBottom: "16px" }}>{DEFAULT_HEADLINE}</h2>
        <p style={{ fontFamily: getFontFamily(body.name, body.source), fontSize: "18px", lineHeight: 1.6, color: "var(--text-body)" }}>{BODY_SHORT}</p>
        <p style={{ fontSize: "14px", marginTop: "24px" }}>Header: {header.name} · Body: {body.name}</p>
      </section>

      <div style={{ marginTop: "32px" }}>
        <div className="uppercase" style={{ ...label, marginBottom: "8px" }}>How well does this pair work? 1 is poor, 10 is excellent</div>
        <div role="group" aria-label="Grade" className="flex flex-wrap" style={{ gap: "8px" }}>
          {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
            <button key={v} type="button" aria-pressed={g.grade === v} onClick={() => setGrade(v, true)} style={btn(g.grade === v)}>{v}</button>
          ))}
        </div>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>Judge legibility, balance, and whether the two fonts sound like one coherent brand voice. Looking different is fine. Keys: 1 to 9 grade, 0 is a 10. Arrow keys move between pairs.</p>
      </div>

      <div style={{ marginTop: "24px" }}>
        <label htmlFor="note" className="uppercase" style={{ ...label, display: "block", marginBottom: "8px" }}>Note (optional)</label>
        <textarea id="note" value={g.note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ width: "100%", fontSize: "16px", padding: "8px 16px", borderRadius: "8px", background: "var(--bg-input)", color: "var(--text-heading)" }} />
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: "24px", gap: "8px" }}>
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} style={btn(false)}>Back</button>
        <button type="button" onClick={() => setGrade(null, true)} style={btn(false)}>Skip</button>
        <button type="button" onClick={() => go(i + 1)} disabled={i === PAIRS.length - 1} style={btn(false)}>Next</button>
      </div>
    </main>
  );
}

"use client";
import { useMemo } from "react";
import { useAppState } from "@/lib/store";
import { understandQuery } from "@/lib/project-intent";

/** Shows what the search was understood as, so a wrong reading is visible before anyone scrolls the results. */
export function UnderstoodChips() {
  const { query, hasSearched, results } = useAppState();
  const u = useMemo(() => understandQuery(query), [query]);
  const chips = [...u.projects, ...u.looks];
  if (!hasSearched || results.length === 0 || chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center" style={{ gap: "8px", marginBottom: "24px" }} aria-label="Understood as">
      <span style={{ fontSize: "14px", color: "var(--text-muted, #737373)" }}>Understood as</span>
      {chips.map((c) => (
        <span key={c} style={{ fontSize: "14px", padding: "12px", lineHeight: 1, borderRadius: "999px", background: "var(--bg-input)", color: "var(--text-heading)", boxShadow: "var(--shadow-input)" }}>{c}</span>
      ))}
    </div>
  );
}

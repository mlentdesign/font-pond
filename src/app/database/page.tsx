"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { fonts } from "@/data/fonts";
import { getPairsWithFont } from "@/lib/engine";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { getSourceLabel } from "@/lib/text";
import { DetailPageHeader } from "@/components/DetailPageHeader";

type SortKey = "name" | "category" | "pairs" | "source";
type SortDir = "asc" | "desc";

interface FontRow {
  id: string;
  slug: string;
  name: string;
  family: string;
  category: string;
  source: string;
  sourceLabel: string;
  sourceUrl: string;
  pairCount: number;
}

const BATCH_SIZE = 50;

export default function DatabasePage() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Build rows once
  const [rows] = useState<FontRow[]>(() =>
    fonts.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      family: getFontFamily(f.name, f.source),
      category: f.classification,
      source: f.source,
      sourceLabel: getSourceLabel(f.source),
      sourceUrl: f.sourceUrl,
      pairCount: getPairsWithFont(f.id).length,
    }))
  );

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
    else if (sortKey === "pairs") cmp = a.pairCount - b.pairCount;
    else if (sortKey === "source") cmp = a.sourceLabel.localeCompare(b.sourceLabel);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const visible = sorted.slice(0, visibleCount);

  // Load fonts only for visible rows, in batches
  useEffect(() => {
    let cancelled = false;
    async function loadVisible() {
      for (let i = 0; i < visible.length; i++) {
        if (cancelled) break;
        const font = fonts.find((f) => f.id === visible[i].id);
        if (font) loadFont(font);
        if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      }
    }
    loadVisible();
    return () => { cancelled = true; };
  }, [visible]);

  // Infinite scroll — load more when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sorted.length) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, sorted.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, sorted.length]);

  // Reset visible count when sort changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";

  const thStyle = { fontSize: "12px", padding: "16px", whiteSpace: "nowrap" as const };

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full content-padding results-top-padding"
        style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}
      >
        <h2
          className="font-semibold tracking-tight"
          style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "8px" }}
        >
          Font database
        </h2>
        <p className="text-neutral-500" style={{ fontSize: "16px", marginBottom: "24px" }}>
          {rows.length} fonts currently in the collection
        </p>

        {/* Sticky table header bar — independent of table, sticks below page header */}
        <div
          className="db-sticky-header"
          style={{
            position: "sticky",
            zIndex: 25,
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--divider)",
            marginLeft: "-2px",
            marginRight: "-2px",
          }}
        >
          <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th onClick={() => toggleSort("name")} className="text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none" style={thStyle}>
                  Font name{arrow("name")}
                </th>
                <th className="text-left uppercase tracking-wider text-neutral-400" style={{ ...thStyle, minWidth: "200px" }}>
                  Specimen
                </th>
                <th onClick={() => toggleSort("category")} className="text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none" style={thStyle}>
                  Category{arrow("category")}
                </th>
                <th onClick={() => toggleSort("pairs")} className="text-right uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none" style={thStyle}>
                  Pairs{arrow("pairs")}
                </th>
                <th onClick={() => toggleSort("source")} className="text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none" style={thStyle}>
                  Source{arrow("source")}
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table body */}
        <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse" }}>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.slug}
                style={{ borderBottom: "1px solid var(--divider)" }}
                className="transition-colors"
              >
                <td style={{ padding: "16px" }}>
                  <Link
                    href={`/font?f=${row.slug}`}
                    className="font-medium text-neutral-800 hover:text-neutral-600 transition-colors"
                    style={{ fontSize: "16px" }}
                  >
                    {row.name}
                  </Link>
                </td>
                <td
                  className="text-neutral-600"
                  style={{
                    padding: "16px",
                    fontFamily: row.family,
                    fontSize: "16px",
                    lineHeight: 1.4,
                    minWidth: "200px",
                    maxWidth: "320px",
                  }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </td>
                <td
                  className="text-neutral-500"
                  style={{ padding: "16px", fontSize: "16px", whiteSpace: "nowrap" }}
                >
                  {row.category}
                </td>
                <td
                  className="text-neutral-500 text-right tabular-nums"
                  style={{ padding: "16px", fontSize: "16px" }}
                >
                  {row.pairCount}
                </td>
                <td style={{ padding: "16px" }}>
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-btn font-medium rounded-lg transition-colors inline-block"
                    style={{ fontSize: "16px", padding: "8px 24px", whiteSpace: "nowrap" }}
                  >
                    {row.sourceLabel} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sentinel for infinite scroll */}
        {visibleCount < sorted.length && (
          <div ref={sentinelRef} style={{ height: "1px" }} />
        )}

        {visibleCount < sorted.length && (
          <p className="text-center text-neutral-400" style={{ padding: "24px", fontSize: "16px" }}>
            Showing {visibleCount} of {sorted.length} fonts...
          </p>
        )}
      </main>
    </div>
  );
}

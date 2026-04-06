"use client";

import { useState, useEffect, useMemo } from "react";
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

const PAGE_SIZE = 50;

export default function DatabasePage() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const rows = useMemo<FontRow[]>(() =>
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
    })),
  []);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "pairs") cmp = a.pairCount - b.pairCount;
      else if (sortKey === "source") cmp = a.sourceLabel.localeCompare(b.sourceLabel);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Load fonts for current page only
  useEffect(() => {
    let cancelled = false;
    async function loadPageFonts() {
      for (let i = 0; i < pageRows.length; i++) {
        if (cancelled) break;
        const font = fonts.find((f) => f.id === pageRows[i].id);
        if (font) loadFont(font);
        if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      }
    }
    loadPageFonts();
    return () => { cancelled = true; };
  }, [page, sortKey, sortDir]);

  // Reset to page 0 when sort changes
  useEffect(() => { setPage(0); }, [sortKey, sortDir]);

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

  const thClass = "text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none";
  const thStyle = { fontSize: "12px", padding: "16px", whiteSpace: "nowrap" as const };

  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding"
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

        {/* Table container with section background */}
        <div
          className="border rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "2px solid var(--border)", position: "relative", zIndex: 1 }}
        >
          {/* Sticky column headers */}
          <div
            className="db-sticky-header"
            style={{
              position: "sticky",
              zIndex: 10,
              background: "var(--bg-card)",
              borderBottom: "1px solid var(--divider)",
            }}
          >
            <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th onClick={() => toggleSort("name")} className={thClass} style={thStyle}>
                    Font name{arrow("name")}
                  </th>
                  <th className="text-left uppercase tracking-wider text-neutral-400" style={thStyle}>
                    Specimen
                  </th>
                  <th onClick={() => toggleSort("category")} className={thClass} style={thStyle}>
                    Category{arrow("category")}
                  </th>
                  <th onClick={() => toggleSort("pairs")} className={thClass + " !text-right"} style={{ ...thStyle, textAlign: "right" }}>
                    Pairs{arrow("pairs")}
                  </th>
                  <th onClick={() => toggleSort("source")} className={thClass} style={thStyle}>
                    Source{arrow("source")}
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Table body */}
          <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <tbody>
              {pageRows.map((row, i) => (
                <tr
                  key={row.slug + "-" + i}
                  style={i < pageRows.length - 1 ? { borderBottom: "1px solid var(--divider)" } : undefined}
                >
                  <td style={{ padding: "16px" }}>
                    <Link
                      href={`/font?f=${row.slug}`}
                      className="font-medium hover:opacity-70 transition-opacity"
                      style={{ fontSize: "16px", color: "var(--text-heading)" }}
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontFamily: row.family,
                      fontSize: "16px",
                      lineHeight: 1.4,
                      color: "var(--text-body)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </td>
                  <td style={{ padding: "16px", fontSize: "16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {row.category}
                  </td>
                  <td style={{ padding: "16px", fontSize: "16px", color: "var(--text-muted)", textAlign: "right" }} className="tabular-nums">
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

          {/* Pagination */}
          <div
            style={{ borderTop: "1px solid var(--divider)", padding: "16px 24px" }}
            className="flex items-center justify-between"
          >
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 0}
                className="outline-btn font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: "16px", padding: "8px 16px" }}
              >
                Previous
              </button>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="outline-btn font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: "16px", padding: "8px 16px" }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

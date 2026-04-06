"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
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
const PAGE_WINDOW = 3; // pages shown on each side of current

function Pagination({ page, totalPages, goPage }: { page: number; totalPages: number; goPage: (p: number) => void }) {
  const pages: (number | "...")[] = [];
  pages.push(0);
  const rangeStart = Math.max(1, page - PAGE_WINDOW);
  const rangeEnd = Math.min(totalPages - 2, page + PAGE_WINDOW);
  if (rangeStart > 1) pages.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages - 1);

  const btnStyle = { fontSize: "16px", padding: "4px 8px", minWidth: "32px", textAlign: "center" as const, background: "none", border: "none", cursor: "pointer" };

  return (
    <div className="flex items-center flex-wrap" style={{ gap: "2px" }}>
      <button
        onClick={() => goPage(page - 1)}
        disabled={page === 0}
        className="hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ ...btnStyle, color: "var(--text-muted)", paddingRight: "12px" }}
      >
        ‹ Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} style={{ ...btnStyle, color: "var(--text-muted)", cursor: "default" }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => goPage(p)}
            className={`rounded-md transition-colors ${p === page ? "font-semibold" : "hover:opacity-70"}`}
            style={{
              ...btnStyle,
              color: p === page ? "var(--text-heading)" : "var(--text-muted)",
              background: p === page ? "var(--border)" : "transparent",
            }}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        onClick={() => goPage(page + 1)}
        disabled={page >= totalPages - 1}
        className="hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ ...btnStyle, color: "var(--text-muted)", paddingLeft: "12px" }}
      >
        Next ›
      </button>
    </div>
  );
}

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export default function DatabasePage() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(100);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Measure actual header height to position sticky header correctly
  useEffect(() => {
    const header = document.querySelector("header.sticky");
    if (header) {
      const h = header.getBoundingClientRect().height;
      setStickyTop(h + 16); // header height + 16px gap
    }
  }, []);

  const rows = useMemo<FontRow[]>(() => {
    const pairCounts = new Map<string, number>();
    for (const p of fontPairs) {
      pairCounts.set(p.headerFontId, (pairCounts.get(p.headerFontId) || 0) + 1);
      pairCounts.set(p.bodyFontId, (pairCounts.get(p.bodyFontId) || 0) + 1);
    }
    return fonts.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      family: getFontFamily(f.name, f.source),
      category: f.classification,
      source: f.source,
      sourceLabel: getSourceLabel(f.source),
      sourceUrl: f.sourceUrl,
      pairCount: pairCounts.get(f.id) || 0,
    }));
  }, []);

  const uniqueCategories = useMemo(() => [...new Set(rows.map((r) => r.category))].sort(), [rows]);
  const uniqueSources = useMemo(() => [...new Set(rows.map((r) => r.sourceLabel))].sort(), [rows]);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const toggleCategory = (c: string) => {
    setCategoryFilters((prev) => { const next = new Set(prev); next.has(c) ? next.delete(c) : next.add(c); return next; });
  };
  const toggleSource = (s: string) => {
    setSourceFilters((prev) => { const next = new Set(prev); next.has(s) ? next.delete(s) : next.add(s); return next; });
  };

  const activeFilterCount = categoryFilters.size + sourceFilters.size;

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

  const filtered = useMemo(() => {
    let result = sorted;
    if (categoryFilters.size > 0) {
      result = result.filter((r) => categoryFilters.has(r.category));
    }
    if (sourceFilters.size > 0) {
      result = result.filter((r) => sourceFilters.has(r.sourceLabel));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.sourceLabel.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sorted, search, categoryFilters, sourceFilters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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

  useEffect(() => { setPage(0); }, [sortKey, sortDir, search, categoryFilters, sourceFilters]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const goPage = (p: number) => {
    setPage(p);
    if (tableRef.current) {
      const top = tableRef.current.getBoundingClientRect().top + window.scrollY - stickyTop;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  const thClass = "text-left uppercase tracking-wider cursor-pointer hover:opacity-70 select-none";
  const thStyle = { fontSize: "12px", padding: "16px", whiteSpace: "nowrap" as const, color: "var(--text-label)" };
  const headerFooterBg = "var(--bg-chip)";

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding"
        style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}
      >
        <div className="flex items-start justify-between flex-wrap" style={{ gap: "16px", marginBottom: "24px" }}>
          <div style={{ minWidth: 0 }}>
            <h2
              className="font-semibold tracking-tight"
              style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "4px" }}
            >
              Font database
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {search.trim() || activeFilterCount > 0 ? `${filtered.length} of ${rows.length} fonts` : `${rows.length} fonts in the collection`}
            </p>
          </div>
          <div className="flex items-center" style={{ gap: "8px", flex: searchExpanded ? "1" : "none", maxWidth: searchExpanded ? "100%" : "none", marginLeft: searchExpanded ? "24px" : "0", transition: "flex 0.2s, margin 0.2s" }}>
            {/* Filter button */}
            <div ref={filterRef} style={{ position: "relative" }}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--bg-input)",
                  border: "2px solid var(--border)",
                  cursor: "pointer",
                  color: activeFilterCount > 0 ? "var(--accent)" : "var(--text-ransom)",
                  flexShrink: 0,
                }}
                aria-label="Filter fonts"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 4h16M5 10h10M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* Filter dropdown */}
              {filterOpen && (
                <div
                  className="absolute right-0 rounded-xl shadow-lg"
                  style={{
                    top: "calc(100% + 8px)",
                    background: "var(--bg-card)",
                    border: "2px solid var(--border)",
                    padding: "16px",
                    width: "240px",
                    zIndex: 50,
                  }}
                >
                  <p className="uppercase tracking-wider font-medium" style={{ fontSize: "12px", color: "var(--text-label)", marginBottom: "8px" }}>Category</p>
                  <div style={{ marginBottom: "16px" }}>
                    {uniqueCategories.map((c) => (
                      <label key={c} className="flex items-center cursor-pointer hover:opacity-70" style={{ gap: "8px", padding: "4px 0", fontSize: "16px", color: "var(--text-body)" }}>
                        <input
                          type="checkbox"
                          checked={categoryFilters.has(c)}
                          onChange={() => toggleCategory(c)}
                          style={{ accentColor: "var(--accent)" }}
                        />
                        {titleCase(c)}
                      </label>
                    ))}
                  </div>
                  <p className="uppercase tracking-wider font-medium" style={{ fontSize: "12px", color: "var(--text-label)", marginBottom: "8px" }}>Source</p>
                  <div>
                    {uniqueSources.map((s) => (
                      <label key={s} className="flex items-center cursor-pointer hover:opacity-70" style={{ gap: "8px", padding: "4px 0", fontSize: "16px", color: "var(--text-body)" }}>
                        <input
                          type="checkbox"
                          checked={sourceFilters.has(s)}
                          onChange={() => toggleSource(s)}
                          style={{ accentColor: "var(--accent)" }}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setCategoryFilters(new Set()); setSourceFilters(new Set()); }}
                      className="hover:opacity-70 transition-opacity"
                      style={{ fontSize: "16px", color: "var(--accent)", marginTop: "12px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Search field */}
            <div style={{ position: "relative", flex: searchExpanded ? "1" : "none", width: searchExpanded ? "auto" : "240px", maxWidth: "100%", transition: "flex 0.2s" }}>
              {!search && (
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-ransom)" }}
                >
                  <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchExpanded(true)}
                placeholder="Search fonts..."
                className="db-search-input rounded-lg outline-none transition-all w-full"
                style={{
                  fontSize: "16px",
                  padding: search ? "8px 16px" : "8px 16px 8px 40px",
                  background: "var(--bg-input)",
                  color: "var(--text-heading)",
                  boxShadow: "var(--shadow-input)",
                  border: "2px solid var(--border)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          ref={tableRef}
          style={{
            border: "2px solid var(--border)",
            borderRadius: "12px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Sticky table header */}
          <div
            ref={stickyRef}
            className="db-sticky-clip"
            style={{
              position: "sticky",
              top: `${stickyTop}px`,
              zIndex: 10,
              background: headerFooterBg,
              border: "2px solid var(--border)",
              borderBottom: "1px solid var(--divider)",
              borderRadius: "12px 12px 0 0",
              margin: "-2px -2px 0 -2px",
            }}
          >
            {/* Horizontal scroll wrapper for mobile */}
            <div style={{ overflowX: "auto" }}>
              <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse", tableLayout: "fixed", minWidth: "800px" }}>
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
                    <th className="text-left uppercase tracking-wider" style={{ ...thStyle, cursor: "default" }}>
                      Specimen
                    </th>
                    <th onClick={() => toggleSort("category")} className={thClass} style={thStyle}>
                      Category{arrow("category")}
                    </th>
                    <th onClick={() => toggleSort("pairs")} className={thClass} style={{ ...thStyle, textAlign: "right" }}>
                      Pairs{arrow("pairs")}
                    </th>
                    <th onClick={() => toggleSort("source")} className={thClass} style={{ ...thStyle, textAlign: "right" }}>
                      Source{arrow("source")}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          {/* Table body — horizontal scroll for mobile */}
          <div style={{ overflowX: "auto", background: "var(--bg-card)" }}>
            <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse", tableLayout: "fixed", minWidth: "800px" }}>
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
                      {titleCase(row.category)}
                    </td>
                    <td style={{ padding: "16px", fontSize: "16px", color: "var(--text-muted)", textAlign: "right" }} className="tabular-nums">
                      {row.pairCount}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
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
          </div>

          {/* Pagination footer */}
          <div
            style={{
              borderTop: "1px solid var(--divider)",
              padding: "16px",
              background: headerFooterBg,
              borderRadius: "0 0 12px 12px",
              minHeight: "56px",
            }}
            className="flex items-center justify-between flex-wrap"
          >
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {filtered.length > 0 ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}` : "No results"}
            </p>
            <Pagination page={page} totalPages={totalPages} goPage={goPage} />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { fonts } from "@/data/fonts";
import { fontPairs } from "@/data/pairs";
import { loadFont, getFontFamily, ensureFontsRendered } from "@/lib/fonts";
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
  variableFont: boolean;
}

const PAGE_SIZE = 50;
const PAGE_WINDOW = 3; // pages shown on each side of current
const PAGE_WINDOW_MOBILE = 1; // compact pagination for mobile single line

function Pagination({ page, totalPages, goPage, pageWindow }: { page: number; totalPages: number; goPage: (p: number) => void; pageWindow: number }) {
  const pages: (number | "...")[] = [];
  pages.push(0);
  const rangeStart = Math.max(1, page - pageWindow);
  const rangeEnd = Math.min(totalPages - 2, page + pageWindow);
  if (rangeStart > 1) pages.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages - 1);

  const btnStyle = { fontSize: "16px", padding: "4px 8px", minWidth: "32px", textAlign: "center" as const, background: "none", border: "none", cursor: "pointer" };

  return (
    <div className="flex items-center flex-wrap db-pagination" style={{ gap: "2px" }}>
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
            className={`rounded-md ${p === page ? "font-semibold" : "hover:opacity-70"}`}
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

// Fuzzy match: check if query words are close to target words (typo tolerance)
function fuzzyMatch(query: string, target: string): boolean {
  const qWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const tLower = target.toLowerCase();
  // First try substring match
  if (tLower.includes(query.toLowerCase())) return true;
  // Then try fuzzy word matching
  for (const qw of qWords) {
    if (qw.length < 3) continue;
    // Check if any word in target is within edit distance
    const tWords = tLower.split(/\s+/);
    for (const tw of tWords) {
      if (tw.length < 3) continue;
      if (Math.abs(tw.length - qw.length) > 2) continue;
      if (editDist(qw, tw) <= (qw.length <= 5 ? 1 : 2)) return true;
    }
    // Also check if query word is a substring of target
    if (tLower.includes(qw)) return true;
  }
  return false;
}

function editDist(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const curr = [i];
    for (let j = 1; j <= lb; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[lb];
}

export default function DatabasePage() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(new Set());
  const [variableOnly, setVariableOnly] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(100);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track mobile viewport
  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth < 640); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Measure actual header height and set responsive gap
  useEffect(() => {
    const header = document.querySelector("header.sticky");
    if (!header) return;
    const updateTop = () => {
      const h = header.getBoundingClientRect().height;
      const w = window.innerWidth;
      const vh = window.innerHeight;
      const isShortHeight = vh <= 900;
      const gap = w >= 1024 ? (isShortHeight ? 40 : 80) : w >= 768 ? (isShortHeight ? 24 : 56) : 40;
      setStickyTop(h + gap);
    };
    updateTop();
    window.addEventListener("resize", updateTop);
    return () => window.removeEventListener("resize", updateTop);
  }, []);

  // Sync horizontal scroll between header and body
  useEffect(() => {
    const header = headerScrollRef.current;
    const body = bodyScrollRef.current;
    if (!header || !body) return;
    let syncing = false;
    const syncFrom = (source: HTMLDivElement, target: HTMLDivElement) => () => {
      if (syncing) return;
      syncing = true;
      target.scrollLeft = source.scrollLeft;
      syncing = false;
    };
    const onBodyScroll = syncFrom(body, header);
    const onHeaderScroll = syncFrom(header, body);
    body.addEventListener("scroll", onBodyScroll, { passive: true });
    header.addEventListener("scroll", onHeaderScroll, { passive: true });
    return () => {
      body.removeEventListener("scroll", onBodyScroll);
      header.removeEventListener("scroll", onHeaderScroll);
    };
  }, []);

  // Sync header column widths to body column widths on tablet/mobile
  useEffect(() => {
    const syncWidths = () => {
      if (window.innerWidth >= 1024) return; // Only on tablet/mobile
      const body = bodyScrollRef.current;
      const header = headerScrollRef.current;
      if (!body || !header) return;
      const bodyRow = body.querySelector("tr");
      const headerRow = header.querySelector("tr");
      if (!bodyRow || !headerRow) return;
      const bodyCells = bodyRow.querySelectorAll("td");
      const headerCells = headerRow.querySelectorAll("th");
      const tableWidth = body.querySelector("table")?.offsetWidth || 1;
      bodyCells.forEach((td, i) => {
        if (i < headerCells.length) {
          const pct = (td.offsetWidth / tableWidth * 100).toFixed(2) + "%";
          (headerCells[i] as HTMLElement).style.width = pct;
        }
      });
    };
    requestAnimationFrame(syncWidths);
    window.addEventListener("resize", syncWidths);
    return () => window.removeEventListener("resize", syncWidths);
  }, [page, sortKey, sortDir, search]);

  // Detect when sticky header is stuck via scroll position
  useEffect(() => {
    const el = stickyRef.current;
    const container = tableRef.current;
    if (!el || !container) return;
    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const stuck = containerTop <= stickyTop;
      el.classList.toggle("is-stuck", stuck);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [stickyTop]);

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
      variableFont: f.variableFont,
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

  const activeFilterCount = categoryFilters.size + sourceFilters.size + (variableOnly ? 1 : 0);

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
    if (variableOnly) {
      result = result.filter((r) => r.variableFont);
    }
    if (search.trim()) {
      const q = search.trim();
      result = result.filter((r) =>
        fuzzyMatch(q, r.name) ||
        fuzzyMatch(q, r.category) ||
        fuzzyMatch(q, r.sourceLabel)
      );
    }
    return result;
  }, [sorted, search, categoryFilters, sourceFilters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Stable key for the current page's font set — triggers reload on sort/page/filter changes
  const pageKey = useMemo(() => pageRows.map((r) => r.id).join(","), [pageRows]);

  useEffect(() => {
    let cancelled = false;
    async function loadPageFonts() {
      const fontNames: string[] = [];
      for (let i = 0; i < pageRows.length; i++) {
        if (cancelled) break;
        const font = fonts.find((f) => f.id === pageRows[i].id);
        if (font) {
          loadFont(font);
          fontNames.push(font.name);
        }
        if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      if (!cancelled) {
        // Stagger multiple passes: CDN stylesheets are fetched async, so the
        // first call fires when they may still be parsing. Later calls catch
        // any fonts that needed more time on slow connections.
        setTimeout(() => { if (!cancelled) ensureFontsRendered(fontNames); }, 50);
        setTimeout(() => { if (!cancelled) ensureFontsRendered(fontNames); }, 400);
        setTimeout(() => { if (!cancelled) ensureFontsRendered(fontNames); }, 1000);
        setTimeout(() => { if (!cancelled) ensureFontsRendered(fontNames); }, 2000);
      }
    }
    loadPageFonts();
    return () => { cancelled = true; };
  }, [pageKey]);

  useEffect(() => { setPage(0); }, [sortKey, sortDir, search, categoryFilters, sourceFilters, variableOnly]);

  // When filters change, force re-render of font specimens after a tick
  // (pageKey effect handles loading, but this ensures a second render pass)
  useEffect(() => {
    const fontNames = pageRows.map((r) => r.name);
    // Small delay to let React update the DOM with new font-family styles first
    const t = setTimeout(() => ensureFontsRendered(fontNames), 200);
    return () => clearTimeout(t);
  }, [categoryFilters, sourceFilters]);

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
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : " \u2003";

  const thClass = "text-left uppercase tracking-wider cursor-pointer hover:opacity-70 select-none";
  const thStyle = { fontSize: "12px", padding: "20px 16px", whiteSpace: "nowrap" as const, color: "var(--text-label)" };
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
            <h1
              className="font-semibold tracking-tight"
              style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "4px" }}
            >
              Font database
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {search.trim() || activeFilterCount > 0 ? `${filtered.length} of ${rows.length} fonts` : `${rows.length} fonts in the collection`}
            </p>
          </div>
          <div className="flex items-center db-search-row" style={{ gap: "8px", flex: searchExpanded && !isMobile ? "1" : "none", maxWidth: searchExpanded && !isMobile ? "100%" : "none", marginLeft: searchExpanded && !isMobile ? "24px" : "0", transition: "flex 0.2s, margin 0.2s" }}>
            {/* Filter button */}
            <div ref={filterRef} style={{ position: "relative" }}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center justify-center rounded-lg hover:opacity-70"
                style={{
                  height: "44px",
                  padding: activeFilterCount > 0 ? "0 12px" : "0",
                  width: activeFilterCount > 0 ? "auto" : "44px",
                  gap: "6px",
                  background: "var(--bg-input)",
                  border: filterOpen ? "2px solid var(--accent)" : "2px solid var(--border)",
                  boxShadow: filterOpen ? "var(--shadow-input-focus)" : undefined,
                  cursor: "pointer",
                  color: activeFilterCount > 0 ? "var(--accent)" : "var(--text-ransom)",
                  flexShrink: 0,
                }}
                aria-label="Filter fonts"
              >
                {activeFilterCount > 0 && (
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{activeFilterCount}</span>
                )}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 4h16M5 10h10M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* Filter dropdown — right-aligned on desktop, left-aligned on mobile */}
              {filterOpen && (
                <div
                  className="absolute rounded-xl shadow-lg db-filter-dropdown"
                  role="dialog"
                  aria-label="Filter fonts"
                  style={{
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "var(--bg-card)",
                    border: "2px solid var(--border)",
                    padding: "16px",
                    width: "240px",
                    zIndex: 50,
                  }}
                >
                  <p id="filter-category-label" className="uppercase tracking-wider font-medium" style={{ fontSize: "12px", color: "var(--text-label)", marginBottom: "8px" }}>Category</p>
                  <div role="group" aria-labelledby="filter-category-label" style={{ marginBottom: "16px" }}>
                    {uniqueCategories.map((c) => (
                      <label key={c} className="flex items-center cursor-pointer hover:opacity-70" style={{ gap: "8px", padding: "4px 0", fontSize: "16px", color: "var(--text-body)" }}>
                        <input
                          type="checkbox"
                          checked={categoryFilters.has(c)}
                          onChange={() => toggleCategory(c)}
                          className="db-checkbox"
                        />
                        {titleCase(c)}
                      </label>
                    ))}
                  </div>
                  <p id="filter-source-label" className="uppercase tracking-wider font-medium" style={{ fontSize: "12px", color: "var(--text-label)", marginBottom: "8px" }}>Source</p>
                  <div role="group" aria-labelledby="filter-source-label" style={{ marginBottom: "16px" }}>
                    {uniqueSources.map((s) => (
                      <label key={s} className="flex items-center cursor-pointer hover:opacity-70" style={{ gap: "8px", padding: "4px 0", fontSize: "16px", color: "var(--text-body)" }}>
                        <input
                          type="checkbox"
                          checked={sourceFilters.has(s)}
                          onChange={() => toggleSource(s)}
                          className="db-checkbox"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                  <p id="filter-variable-label" className="uppercase tracking-wider font-medium" style={{ fontSize: "12px", color: "var(--text-label)", marginBottom: "8px" }}>Type</p>
                  <div role="group" aria-labelledby="filter-variable-label">
                    <label className="flex items-center cursor-pointer hover:opacity-70" style={{ gap: "8px", padding: "4px 0", fontSize: "16px", color: "var(--text-body)" }}>
                      <input
                        type="checkbox"
                        checked={variableOnly}
                        onChange={() => setVariableOnly((v) => !v)}
                        className="db-checkbox"
                      />
                      Variable fonts only
                    </label>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => { setCategoryFilters(new Set()); setSourceFilters(new Set()); setVariableOnly(false); }}
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
            <div className="db-search-field" style={{ position: "relative", flex: searchExpanded || isMobile ? "1" : "none", width: searchExpanded || isMobile ? "auto" : "240px", maxWidth: "100%", transition: "flex 0.2s" }}>
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
                aria-label="Search fonts"
                className="db-search-input rounded-lg outline-none w-full"
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
            <div ref={headerScrollRef} className="db-table-header" style={{ overflowX: "auto", width: "100%" }}>
              <table className="w-full" style={{ fontSize: "16px", borderCollapse: "collapse", tableLayout: "fixed", minWidth: "800px" }}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "15%" }} />
                  <col className="db-pairs-col" style={{ width: "10%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th onClick={() => toggleSort("name")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSort("name"); } }} tabIndex={0} className={thClass} style={thStyle} aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : undefined} role="columnheader">
                      Font name{arrow("name")}
                    </th>
                    <th className="text-left uppercase tracking-wider" style={{ ...thStyle, cursor: "default" }} role="columnheader">
                      Specimen
                    </th>
                    <th onClick={() => toggleSort("category")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSort("category"); } }} tabIndex={0} className={thClass} style={thStyle} aria-sort={sortKey === "category" ? (sortDir === "asc" ? "ascending" : "descending") : undefined} role="columnheader">
                      Category{arrow("category")}
                    </th>
                    <th onClick={() => toggleSort("pairs")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSort("pairs"); } }} tabIndex={0} className={`uppercase tracking-wider cursor-pointer hover:opacity-70 select-none db-pairs-col`} style={{ ...thStyle, textAlign: "center" }} aria-sort={sortKey === "pairs" ? (sortDir === "asc" ? "ascending" : "descending") : undefined} role="columnheader">
                      Pairs{arrow("pairs")}
                    </th>
                    <th onClick={() => toggleSort("source")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSort("source"); } }} tabIndex={0} className="uppercase tracking-wider cursor-pointer hover:opacity-70 select-none" style={{ ...thStyle, textAlign: "right" }} aria-sort={sortKey === "source" ? (sortDir === "asc" ? "ascending" : "descending") : undefined} role="columnheader">
                      Source{arrow("source")}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          {/* Table body — horizontal scroll for mobile, z-index below sticky header */}
          <div ref={bodyScrollRef} className="db-table-body" style={{ overflowX: "auto", background: "var(--bg-card)", position: "relative", zIndex: 1 }}>
            <table className="w-full db-body-table" style={{ fontSize: "16px", borderCollapse: "collapse", tableLayout: "fixed", minWidth: "800px" }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "15%" }} />
                <col className="db-pairs-col" style={{ width: "10%" }} />
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
                      className="db-specimen"
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
                      ABCDEFGHIJKLM<br className="db-specimen-break" />NOPQRSTUVWXYZ
                    </td>
                    <td style={{ padding: "16px", fontSize: "16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {titleCase(row.category)}
                    </td>
                    <td style={{ padding: "16px", fontSize: "16px", color: "var(--text-muted)", textAlign: "center" }} className="tabular-nums db-pairs-col">
                      {row.pairCount}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="outline-btn font-medium rounded-lg inline-block"
                        style={{ fontSize: "16px", padding: "8px 24px", whiteSpace: "nowrap" }}
                      >
                        {row.sourceLabel} ↗
                      </a>
                      </div>
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
            className="flex items-center justify-between flex-wrap db-pagination-footer"
          >
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {filtered.length > 0 ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}` : "No results"}
            </p>
            <Pagination page={page} totalPages={totalPages} goPage={goPage} pageWindow={isMobile ? PAGE_WINDOW_MOBILE : PAGE_WINDOW} />
          </div>
        </div>
      </main>
    </div>
  );
}

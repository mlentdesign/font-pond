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
  const tableRef = useRef<HTMLDivElement>(null);

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
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.sourceLabel.toLowerCase().includes(q)
    );
  }, [sorted, search]);

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

  useEffect(() => { setPage(0); }, [sortKey, sortDir, search]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const goPage = (p: number) => {
    setPage(p);
    if (tableRef.current) {
      const headerHeight = 57;
      const gap = 16;
      const top = tableRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - gap;
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
          <div>
            <h2
              className="font-semibold tracking-tight"
              style={{ color: "var(--text-heading)", fontSize: "24px", marginBottom: "4px" }}
            >
              Font database
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {search.trim() ? `${filtered.length} of ${rows.length} fonts` : `${rows.length} fonts in the collection`}
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fonts..."
            className="rounded-lg outline-none transition-colors"
            style={{
              fontSize: "16px",
              padding: "8px 16px",
              background: "var(--bg-input)",
              color: "var(--text-heading)",
              boxShadow: "var(--shadow-input)",
              border: "2px solid var(--border)",
              width: "240px",
              maxWidth: "100%",
            }}
          />
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
            className="db-sticky-header"
            style={{
              position: "sticky",
              zIndex: 10,
              background: headerFooterBg,
              borderBottom: "1px solid var(--divider)",
              borderRadius: "10px 10px 0 0",
              border: "2px solid var(--border)",
              borderBottomColor: "var(--divider)",
              borderBottomWidth: "1px",
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
              padding: "16px 24px",
              background: headerFooterBg,
              borderRadius: "0 0 10px 10px",
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

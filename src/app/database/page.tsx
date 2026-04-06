"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fonts } from "@/data/fonts";
import { getPairsWithFont } from "@/lib/engine";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { getSourceLabel } from "@/lib/text";
import { DetailPageHeader } from "@/components/DetailPageHeader";

type SortKey = "name" | "category" | "pairs" | "source";
type SortDir = "asc" | "desc";

interface FontRow {
  slug: string;
  name: string;
  family: string;
  category: string;
  source: string;
  sourceLabel: string;
  sourceUrl: string;
  pairCount: number;
}

export default function DatabasePage() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loaded, setLoaded] = useState(false);

  // Build rows once
  const [rows] = useState<FontRow[]>(() =>
    fonts.map((f) => ({
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

  // Load fonts progressively
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      for (let i = 0; i < fonts.length; i++) {
        if (cancelled) break;
        loadFont(fonts[i]);
        // Yield every 20 fonts to keep UI responsive
        if (i % 20 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      if (!cancelled) setLoaded(true);
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
    else if (sortKey === "pairs") cmp = a.pairCount - b.pairCount;
    else if (sortKey === "source") cmp = a.sourceLabel.localeCompare(b.sourceLabel);
    return sortDir === "asc" ? cmp : -cmp;
  });

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

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full content-padding"
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

        <div>
          <table className="w-full" style={{ fontSize: "16px", borderCollapse: "separate", borderSpacing: "0", border: "2px solid var(--border)", borderRadius: "12px" }}>
            <thead style={{ position: "sticky", top: "57px", zIndex: 20 }}>
              <tr
                style={{
                  background: "var(--bg-card)",
                  boxShadow: "inset 0 -1px 0 0 var(--divider)",
                }}
              >
                <th
                  onClick={() => toggleSort("name")}
                  className="text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none"
                  style={{ fontSize: "12px", padding: "16px", whiteSpace: "nowrap" }}
                >
                  Font name{arrow("name")}
                </th>
                <th
                  className="text-left uppercase tracking-wider text-neutral-400"
                  style={{ fontSize: "12px", padding: "16px", minWidth: "200px" }}
                >
                  Specimen
                </th>
                <th
                  onClick={() => toggleSort("category")}
                  className="text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none"
                  style={{ fontSize: "12px", padding: "16px", whiteSpace: "nowrap" }}
                >
                  Category{arrow("category")}
                </th>
                <th
                  onClick={() => toggleSort("pairs")}
                  className="text-right uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none"
                  style={{ fontSize: "12px", padding: "16px", whiteSpace: "nowrap" }}
                >
                  Pairs{arrow("pairs")}
                </th>
                <th
                  onClick={() => toggleSort("source")}
                  className="text-left uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 select-none"
                  style={{ fontSize: "12px", padding: "16px", whiteSpace: "nowrap" }}
                >
                  Source{arrow("source")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.slug}
                  style={{ borderBottom: "1px solid var(--divider)" }}
                  className="hover:bg-neutral-50 transition-colors"
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
                      style={{ fontSize: "16px", padding: "8px 24px" }}
                    >
                      {row.sourceLabel} ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

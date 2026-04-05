"use client";

import { useState } from "react";

interface ChipGroupProps {
  label?: string;
  chips: string[];
  maxVisible?: number;
}

export function ChipGroup({ label, chips, maxVisible }: ChipGroupProps) {
  const [showAll, setShowAll] = useState(false);
  const unique = [...new Set(chips)];
  const visible = maxVisible && !showAll ? unique.slice(0, maxVisible) : unique;
  const hasMore = maxVisible && unique.length > maxVisible;

  return (
    <div>
      {label && (
        <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>{label}</p>
      )}
      <div className="flex flex-wrap items-center" style={{ gap: "8px" }}>
        {visible.map((chip, i) => (
          <span
            key={`${i}-${chip}`}
            className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100"
            style={{ fontSize: "14px", padding: "4px 12px" }}
          >
            {chip}
          </span>
        ))}
        {hasMore && !showAll && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAll(true); }}
            style={{ fontSize: "14px", color: "var(--text-label)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: "4px 0" }}
          >
            +{unique.length - maxVisible!} more
          </button>
        )}
        {hasMore && showAll && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAll(false); }}
            style={{ fontSize: "14px", color: "var(--text-label)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: "4px 0" }}
          >
            See less
          </button>
        )}
      </div>
    </div>
  );
}

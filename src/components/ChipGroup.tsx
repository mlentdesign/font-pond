"use client";

import { useState, useRef, useEffect } from "react";

interface ChipGroupProps {
  label?: string;
  chips: string[];
  maxVisible?: number;
  maxLines?: number;
}

export function ChipGroup({ label, chips, maxVisible, maxLines }: ChipGroupProps) {
  const [showAll, setShowAll] = useState(false);
  const [fitCount, setFitCount] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const unique = [...new Set(chips)];

  // When maxLines is set, measure how many chips fit within that many lines
  useEffect(() => {
    if (!maxLines || showAll) { setFitCount(null); return; }
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;
      // Chip line height ~30px, gap 8px. Max height for N lines: N * 30 + (N-1) * 8
      const lineHeight = 30;
      const gap = 8;
      const maxHeight = maxLines * lineHeight + (maxLines - 1) * gap;
      let count = 0;
      for (const child of children) {
        if (child.offsetTop + child.offsetHeight > container.offsetTop + maxHeight) break;
        if (!child.dataset.moreBtn) count++;
      }
      // Leave room for the "+more" button by reducing by 1 if needed
      if (count < unique.length && count > 0) {
        setFitCount(count - 1);
      } else {
        setFitCount(null);
      }
    };

    // Render all chips briefly to measure, then clamp
    setFitCount(null);
    requestAnimationFrame(measure);
  }, [maxLines, showAll, unique.length]);

  const effectiveMax = fitCount ?? maxVisible;
  const visible = effectiveMax && !showAll ? unique.slice(0, effectiveMax) : unique;
  const hasMore = effectiveMax ? unique.length > effectiveMax : false;

  return (
    <div>
      {label && (
        <p className="uppercase tracking-wider text-neutral-400 mb-2" style={{ fontSize: "12px" }}>{label}</p>
      )}
      <div ref={containerRef} className="flex flex-wrap items-center" style={{ gap: "8px" }}>
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
            data-more-btn="true"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAll(true); }}
            style={{ fontSize: "14px", color: "var(--text-label)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: "4px 0" }}
          >
            +{unique.length - (effectiveMax ?? 0)} more
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

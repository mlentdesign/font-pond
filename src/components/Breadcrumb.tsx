"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ crumbs, sticky = false, stickyAction }: { crumbs: Crumb[]; sticky?: boolean; stickyAction?: ReactNode }) {
  const [stickyTop, setStickyTop] = useState(100);

  useEffect(() => {
    if (!sticky) return;
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => {
      const h = header.getBoundingClientRect().height;
      const w = window.innerWidth;
      const gap = w >= 1024 ? 80 : w >= 768 ? 56 : 40;
      setStickyTop(h + gap);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [sticky]);

  return (
    <div
      className={sticky ? "breadcrumb-sticky" : ""}
      style={sticky ? {
        position: "sticky" as const,
        top: `${stickyTop}px`,
        zIndex: 20,
        background: "var(--bg)",
      } : undefined}
    >
      <div style={sticky ? { display: "flex", alignItems: "center", justifyContent: stickyAction ? "space-between" : undefined } : undefined}>
        <nav aria-label="Breadcrumb" style={sticky ? { flex: stickyAction ? undefined : 1 } : { marginBottom: "24px" }}>
          <ol className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
            <li>
              <Link href="/?restore=1" className="transition-colors hover:underline" style={{ color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--text-heading)"; }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}>
                Results
              </Link>
            </li>
            {crumbs.map((crumb, i) => (
              <li key={i} className={i === crumbs.length - 1 ? "text-neutral-600" : ""}>
                <span aria-hidden="true" className="text-neutral-400" style={{ marginRight: "8px" }}>/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:underline" style={{ color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--text-heading)"; }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}>
                    {crumb.label}
                  </Link>
                ) : (
                  crumb.label
                )}
              </li>
            ))}
          </ol>
        </nav>
        {stickyAction && <div className="shrink-0">{stickyAction}</div>}
      </div>
    </div>
  );
}

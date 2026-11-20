"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { isFavorite, subscribeFavorites, toggleFavorite } from "@/lib/favorites";

const SPARKS = [
  { x: -16, y: -16 },
  { x: 16, y: -16 },
  { x: 16, y: 8 },
  { x: -16, y: 8 },
  { x: 0, y: -24 },
];

export function FavoriteButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(slug));
    return subscribeFavorites(() => setSaved(isFavorite(slug)));
  }, [slug]);

  const onClick = () => {
    const next = toggleFavorite(slug);
    setSaved(next);
    if (next) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 650);
    }
  };

  return (
    <button
      type="button"
      className={`favorite-heart${saved ? " is-saved" : ""}${burst ? " is-bursting" : ""}`}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={saved}
      onClick={onClick}
    >
      <svg className="heart-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 5.85C10.25 4.75 11.35 4.1 12.6 4.1C14.6 4.1 16.25 5.65 16.25 7.75C16.25 11.75 10 16.25 10 16.25C10 16.25 3.75 11.75 3.75 7.75C3.75 5.65 5.4 4.1 7.4 4.1C8.65 4.1 9.75 4.75 10 5.85Z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="favorite-spark"
          style={{ "--sx": `${s.x}px`, "--sy": `${s.y}px`, animationDelay: `${i * 40}ms` } as CSSProperties}
          aria-hidden="true"
        />
      ))}
    </button>
  );
}

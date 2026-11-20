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
      <svg className="heart-icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12.1 20.3s-6.6-4.1-8.9-8.1C1.2 8.5 3 4.9 6.4 4.9c1.9 0 3.2 1.1 3.7 2.1.5-1 1.8-2.1 3.7-2.1 3.4 0 5.2 3.6 3.2 7.3-2.3 4-8.9 8.1-8.9 8.1z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.7"
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

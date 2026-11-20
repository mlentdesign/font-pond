"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { isFavorite, reportFavoriteChange, subscribeFavorites, toggleFavorite } from "@/lib/favorites";

const SPARKS = [
  { x: -16, y: -16 },
  { x: 16, y: -16 },
  { x: 16, y: 8 },
  { x: -16, y: 8 },
  { x: 0, y: -24 },
];

const HEART_PATH =
  "M10 5.85C10.25 4.75 11.35 4.1 12.6 4.1C14.6 4.1 16.25 5.65 16.25 7.75C16.25 11.75 10 16.25 10 16.25C10 16.25 3.75 11.75 3.75 7.75C3.75 5.65 5.4 4.1 7.4 4.1C8.65 4.1 9.75 4.75 10 5.85Z";

const DRAIN_MS = 680;

export function FavoriteButton({
  slug,
  header,
  body,
  stuck = false,
}: {
  slug: string;
  header?: string;
  body?: string;
  stuck?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(false);
  const [draining, setDraining] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(slug));
    setDraining(false);
    return subscribeFavorites(() => setSaved(isFavorite(slug)));
  }, [slug]);

  const onClick = () => {
    const next = toggleFavorite(slug);
    reportFavoriteChange({ slug, action: next ? "heart" : "unheart", header, body });
    if (next) {
      setDraining(false);
      setSaved(true);
      setBurst(true);
      window.setTimeout(() => setBurst(false), 650);
    } else {
      setBurst(false);
      setDraining(true);
      window.setTimeout(() => {
        setSaved(false);
        setDraining(false);
      }, DRAIN_MS);
    }
  };

  const filled = saved || draining;

  return (
    <button
      type="button"
      className={`favorite-heart heart-float${filled ? " is-saved" : ""}${burst ? " is-bursting" : ""}${draining ? " is-draining" : ""}${stuck ? " is-stuck" : ""}`}
      aria-label={saved && !draining ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={saved && !draining}
      onClick={onClick}
    >
      <svg className="heart-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          className="heart-fill"
          d={HEART_PATH}
          fill="currentColor"
        />
        <path
          className="heart-outline"
          d={HEART_PATH}
          fill="none"
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

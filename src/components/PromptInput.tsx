"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAppState } from "@/lib/store";
import { rankPairs, explorePairs } from "@/lib/engine";

const SUGGESTION_SETS = [
  "'grungy girlypop', 'luxury fashion editorial', 'dark spooky halloween'",
  "'modern SaaS product', 'cozy cottagecore', 'bold streetwear brand'",
  "'clean minimalist portfolio', 'retro 70s groovy', 'cyberpunk neon'",
  "'elegant wedding invitations', 'playful kids brand', 'serious law firm'",
  "'warm coffee shop', 'edgy music festival', 'sci-fi tech startup'",
  "'romantic beauty brand', 'brutalist architecture', 'vintage bookshop'",
  "'Y2K nostalgic', 'dark academia literary', 'tropical surf vibes'",
  "'indie magazine editorial', 'futuristic crypto app', 'handmade artisan'",
  "'sporty athletic brand', 'zen wellness spa', 'gothic horror aesthetic'",
  "'French bistro charm', 'pixel art gaming', 'old money sophisticated'",
];

export function PromptInput() {
  const {
    query, setQuery,
    images, addImage, removeImage,
    setResults, setIsLoading, setHasSearched, setVisibleCount,
    isExploring, setIsExploring,
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Auto-resize textarea to fit content
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(56, el.scrollHeight) + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [query, autoResize]);

  // Listen for pause toggle from footer
  const [suggestionsPaused, setSuggestionsPaused] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => setSuggestionsPaused((e as CustomEvent).detail);
    window.addEventListener("animationPauseToggle", handler);
    return () => window.removeEventListener("animationPauseToggle", handler);
  }, []);

  // Rotate suggestions every 8 seconds when query is empty and not paused
  useEffect(() => {
    if (query.trim().length > 0 || suggestionsPaused) return;
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setAnimating(true);
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null;
        setSuggestionIndex((prev) => (prev + 1) % SUGGESTION_SETS.length);
        setAnimating(false);
      }, 300);
    }, 8000);
    return () => {
      clearInterval(interval);
      if (pendingTimeout) clearTimeout(pendingTimeout);
    };
  }, [query, suggestionsPaused]);

  const handleImageAdd = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      for (const file of Array.from(files)) {
        addImage(file);
        setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [addImage]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      removeImage(index);
      setImagePreviews((prev) => {
        const next = [...prev];
        URL.revokeObjectURL(next[index]);
        next.splice(index, 1);
        return next;
      });
    },
    [removeImage]
  );

  // Revoke any remaining image object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(() => {
    if (!query.trim() && images.length === 0) return;
    setIsLoading(true);
    setHasSearched(true);
    setIsExploring(false);
    setVisibleCount(3);
    setTimeout(() => { setResults(rankPairs(query)); setIsLoading(false); }, 400);
  }, [query, images, setResults, setIsLoading, setHasSearched, setIsExploring, setVisibleCount]);

  const handleExplore = useCallback(() => {
    setIsLoading(true);
    setHasSearched(true);
    setIsExploring(true);
    setVisibleCount(3);
    setTimeout(() => { setResults(explorePairs()); setIsLoading(false); }, 300);
  }, [setResults, setIsLoading, setHasSearched, setIsExploring, setVisibleCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } },
    [handleSubmit]
  );

  const isDisabled = !query.trim() && images.length === 0;

  return (
    <div className="w-full">
      <div
        className="prompt-container rounded-xl transition-all"
        style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-input)", border: "2px solid var(--border)" }}
      >
        {/* Textarea wrapper — focus ring wraps only this area */}
        <div className="prompt-textarea-wrap">
          <div style={{ position: "relative" }}>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder=" "
              className="w-full bg-transparent resize-none outline-none"
              style={{ fontSize: "16px", color: "var(--text-heading)", padding: "24px", minHeight: "56px", overflow: "hidden" }}
              aria-label="Describe your project mood or style"
            />
            {/* Animated placeholder with rotating suggestions — inline after "Try things like" */}
            {query.trim().length === 0 && (
              <div
                className="pointer-events-none absolute"
                style={{
                  top: "24px",
                  left: "24px",
                  right: "24px",
                  fontSize: "16px",
                  color: "var(--text-placeholder)",
                }}
              >
                <span>Try things like </span>
                <span
                  style={{
                    transition: "opacity 0.3s",
                    opacity: animating ? 0 : 1,
                  }}
                >
                  {SUGGESTION_SETS[suggestionIndex]}
                </span>
              </div>
            )}
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: "8px", padding: "0 24px 8px" }}>
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Reference ${i + 1}`}
                    className="rounded-lg object-cover"
                    style={{ width: "48px", height: "48px", border: "2px solid var(--border)" }}
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    style={{ top: "-8px", right: "-8px", width: "24px", height: "24px", background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: "16px" }}
                    aria-label={`Remove image ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mobile-only "Add image" — inside the text field area */}
          <div className="mobile-add-image items-center" style={{ padding: "8px 24px 16px" }}>
            <label
              htmlFor="image-upload"
              className="flex items-center rounded-lg cursor-pointer transition-colors hover:opacity-70"
              style={{ fontSize: "16px", fontWeight: 600, color: "var(--add-image-color)", gap: "4px" }}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="5" cy="6" r="1.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="M1.5 11l3.5-3.5L8 10.5l2.5-2.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add image
            </label>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="action-bar flex items-center justify-between action-bar-border"
          style={{ padding: "16px 24px", background: "var(--bg-action-bar)", borderTop: "1px solid var(--divider)" }}
        >
          <div className="action-bar-image flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="sr-only"
              id="image-upload"
              aria-label="Upload reference images"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center rounded-lg cursor-pointer transition-colors hover:opacity-70"
              style={{ fontSize: "16px", fontWeight: 600, color: "var(--add-image-color)", gap: "4px" }}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="5" cy="6" r="1.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="M1.5 11l3.5-3.5L8 10.5l2.5-2.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add image
            </label>
          </div>

          <div className="action-bar-ctas flex items-center" style={{ gap: "16px" }}>
            <button
              onClick={handleExplore}
              className="outline-btn font-medium rounded-lg transition-colors"
              style={{ fontSize: "16px", padding: "8px 24px" }}
            >
              Explore
            </button>
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="font-medium rounded-lg transition-colors disabled:cursor-not-allowed hover:opacity-90"
              style={{
                fontSize: "16px",
                background: isDisabled ? "var(--btn-bg-disabled)" : "var(--btn-bg)",
                color: isDisabled ? "var(--btn-text-disabled)" : "var(--btn-text)",
                border: "2px solid transparent",
                padding: "8px 24px",
              }}
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

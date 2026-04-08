"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAppState } from "@/lib/store";
import { rankPairs, explorePairs } from "@/lib/engine";
import { analyzeImages } from "@/lib/image-analysis";

const SUGGESTION_SETS = [
  "'elegant wedding stationery', 'bold streetwear lookbook', 'cozy coffee shop menu'",
  "'luxury fashion editorial', 'playful children's book', 'clean tech startup'",
  "'vintage record store poster', 'minimalist architecture portfolio', 'warm bakery brand'",
  "'dark academia journal', 'bright fitness app', 'sophisticated wine label'",
  "'retro 70s surf shop', 'sleek fintech dashboard', 'whimsical florist website'",
  "'grungy punk zine', 'serene yoga studio', 'premium skincare packaging'",
  "'editorial travel magazine', 'indie music festival flyer', 'modern law firm site'",
  "'handwritten love letter', 'geometric art gallery', 'rustic farm-to-table menu'",
  "'nostalgic diner signage', 'crisp nonprofit annual report', 'dreamy beauty brand'",
  "'brutalist gallery catalog', 'cheerful pet brand', 'old money country club'",
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
  const [isDragging, setIsDragging] = useState(false);
  const [generateHover, setGenerateHover] = useState(false);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (!files) return;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        addImage(file);
        setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
      }
    },
    [addImage]
  );

  // Revoke any remaining image object URLs on unmount
  const previewsRef = useRef(imagePreviews);
  previewsRef.current = imagePreviews;
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() && images.length === 0) return;
    setIsLoading(true);
    setHasSearched(true);
    setIsExploring(false);
    setVisibleCount(3);

    // Save query so breadcrumb "Results" can restore it
    try { localStorage.setItem("font-pond-last-query", query.trim()); } catch {}

    // If images are attached, analyze them for color/mood keywords and combine with query
    let searchQuery = query;
    if (images.length > 0) {
      const imageKeywords = await analyzeImages(images);
      if (imageKeywords.length > 0) {
        const combined = query.trim()
          ? `${query.trim()} ${imageKeywords.join(" ")}`
          : imageKeywords.join(" ");
        searchQuery = combined;
      }
    }

    setTimeout(() => { setResults(rankPairs(searchQuery)); setIsLoading(false); }, 200);
  }, [query, images, setResults, setIsLoading, setHasSearched, setIsExploring, setVisibleCount]);

  const handleExplore = useCallback(() => {
    setIsLoading(true);
    setHasSearched(true);
    setIsExploring(true);
    setVisibleCount(3);
    try { localStorage.setItem("font-pond-last-query", "__explore__"); } catch {}
    setTimeout(() => { setResults(explorePairs()); setIsLoading(false); }, 300);
  }, [setResults, setIsLoading, setHasSearched, setIsExploring, setVisibleCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } },
    [handleSubmit]
  );

  const isDisabled = !query.trim() && images.length === 0;

  return (
    <div className="w-full prompt-wrapper" style={{ position: "relative" }}>
      <div
        className="prompt-container rounded-xl transition-all overflow-hidden"
        style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-input)" }}
      >
        {/* Textarea wrapper */}
        <div className="prompt-textarea-wrap">
          <div className="prompt-textarea-inner" style={{ position: "relative" }}>
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

          {/* Mobile-only "Add image" — inside the text field area */}
          <div
            className="mobile-add-image items-center"
            style={{ padding: "16px 24px 8px" }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <label
              htmlFor="image-upload"
              className="flex items-center rounded-lg cursor-pointer transition-colors add-image-hover"
              style={{ fontSize: "16px", fontWeight: 600, color: "var(--add-image-color)", gap: "4px" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="6.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 14l4.5-4.5L10 13l3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add image
            </label>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="action-bar action-bar-border"
          style={{ padding: imagePreviews.length > 0 ? "16px 24px 16px" : "16px 24px" }}
        >
          {/* Image previews inside action bar */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: "8px", marginBottom: "8px" }}>
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
        <div className="action-bar-inner flex items-center justify-between">
          <div
            className="action-bar-image flex items-center"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <span id="image-upload-hint" className="sr-only">You can also drag and drop images here</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="sr-only"
              id="image-upload"
              aria-label="Upload reference images"
              aria-describedby="image-upload-hint"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center rounded-lg cursor-pointer transition-colors"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--add-image-color)",
                gap: "4px",
                position: "relative",
              }}
            >
              {isDragging && (
                <svg
                  className="pointer-events-none"
                  style={{ position: "absolute", top: "-8px", bottom: "-8px", left: "-12px", right: "-12px", overflow: "visible" }}
                >
                  <rect
                    rx="8"
                    ry="8"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    pathLength="200"
                    style={{ x: 1, y: 1, width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
                  />
                </svg>
              )}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="6.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 14l4.5-4.5L10 13l3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <span
              onMouseEnter={() => { if (isDisabled) { setGenerateHover(true); if (generateTimerRef.current) clearTimeout(generateTimerRef.current); } }}
              onMouseLeave={() => { setGenerateHover(false); if (generateTimerRef.current) clearTimeout(generateTimerRef.current); }}
              onClick={() => { if (isDisabled) { setGenerateHover(true); if (generateTimerRef.current) clearTimeout(generateTimerRef.current); generateTimerRef.current = setTimeout(() => setGenerateHover(false), 3000); } }}
              style={{ width: "100%", display: "block" }}
            >
              <button
                onClick={handleSubmit}
                disabled={isDisabled}
                className={`font-medium rounded-lg transition-colors disabled:cursor-not-allowed${isDisabled ? "" : " btn-generate"}`}
                style={{
                  fontSize: "16px",
                  ...(isDisabled ? { background: "var(--generate-bg-disabled)", color: "var(--generate-text-disabled)", border: "2px solid transparent" } : {}),
                  padding: "8px 24px",
                  width: "100%",
                }}
              >
                Generate
              </button>
            </span>
          </div>
        </div>
        </div>
      </div>
      {generateHover && (
        <div style={{ position: "relative", height: 0 }}>
          <div
            className="rounded-lg shadow-lg"
            style={{
              position: "absolute",
              top: "8px",
              right: 0,
              maxWidth: "100%",
              width: "fit-content",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
              padding: "8px 16px",
              fontSize: "14px",
              color: "var(--text-muted)",
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            Enter text or upload an image to generate
          </div>
        </div>
      )}
    </div>
  );
}

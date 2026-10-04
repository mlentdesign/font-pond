"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { SectionCard } from "@/components/SectionCard";
import { PairPreviewGrid } from "@/components/PairPreviewGrid";
import { loadFont, getFontFamily } from "@/lib/fonts";
import { chipCase, formatClassification } from "@/lib/text";
import { navigateToFont } from "@/lib/navigate";
import type { ScoredPair } from "@/data/types";
import {
  loadIndex, loadEmbedder, rankFontsSemantic, rankFontsKeyword, pairsFromRanking,
  type ScoredFont, type FeelProgress,
} from "@/lib/feel/search";

const EXAMPLES = [
  "Warm humanist sans for a dental brand",
  "Elegant serif for a wedding invite",
  "Playful rounded display",
  "Technical monospace",
  "Confident editorial headline for a news site",
  "Friendly handwriting for a children's book",
];

type Mode = "semantic" | "keyword";
type Status =
  | { kind: "idle" }
  | { kind: "loading"; progress: FeelProgress | null }
  | { kind: "searching" }
  | { kind: "done" };

const MB = 1024 * 1024;
// Below this top similarity the query probably is not about type at all.
const WEAK_MATCH = 0.4;

export default function FeelClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [mode, setMode] = useState<Mode>("semantic");
  const [shownFor, setShownFor] = useState("");
  const [fontResults, setFontResults] = useState<ScoredFont[]>([]);
  const [pairResults, setPairResults] = useState<ScoredPair[]>([]);
  const [visibleFonts, setVisibleFonts] = useState(9);
  const [modelFailed, setModelFailed] = useState(false);
  const warmedRef = useRef(false);
  const runRef = useRef(0);

  // Warm the model the first time the visitor shows interest — never on page load.
  const warm = useCallback(() => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    setStatus((s) => (s.kind === "idle" ? { kind: "loading", progress: null } : s));
    loadIndex().catch(() => {});
    loadEmbedder((p) => setStatus((s) => (s.kind === "loading" ? { kind: "loading", progress: p } : s)))
      .then(() => setStatus((s) => (s.kind === "loading" ? { kind: "idle" } : s)))
      .catch(() => { setModelFailed(true); setStatus((s) => (s.kind === "loading" ? { kind: "idle" } : s)); });
  }, []);

  const run = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const id = ++runRef.current;
    warm();
    setStatus((s) => (s.kind === "loading" ? s : { kind: "searching" }));
    let ranked: ScoredFont[];
    let usedMode: Mode = "semantic";
    try {
      const embed = await loadEmbedder();
      await loadIndex();
      ranked = await rankFontsSemantic(q, embed, 400);
    } catch (e) {
      console.warn("Semantic search unavailable, using keyword matching", e);
      usedMode = "keyword";
      setModelFailed(true);
      ranked = rankFontsKeyword(q, 400);
    }
    if (id !== runRef.current) return;
    const pairs = pairsFromRanking(ranked, 12);
    for (const r of ranked.slice(0, 30)) loadFont(r.font);
    setMode(usedMode);
    setFontResults(ranked);
    setPairResults(pairs);
    setVisibleFonts(9);
    setShownFor(q);
    setStatus({ kind: "done" });
  }, [warm]);

  useEffect(() => { document.title = "Search by feel · Font Pond"; }, []);

  const loading = status.kind === "loading";
  const pct = status.kind === "loading" && status.progress && status.progress.total > 0
    ? Math.min(100, Math.round((status.progress.loaded / status.progress.total) * 100)) : null;

  return (
    <div className="flex-1 flex flex-col">
      <DetailPageHeader />
      <main
        id="main-content"
        className="flex-1 mx-auto w-full content-padding results-top-padding results-bottom-padding"
        style={{ paddingTop: "80px", paddingBottom: "80px", maxWidth: "1280px" }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: "896px" }}>
          <h1 className="font-semibold tracking-tight text-center" style={{ color: "var(--text-ransom)", fontSize: "24px", marginBottom: "8px" }}>
            Search by feel
          </h1>
          <p className="text-center" style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "32px" }}>
            Describe a mood, a brand or a job. Matching happens in your browser, and nothing you type is sent anywhere.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); run(query); }}
            className="prompt-container rounded-xl"
            style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-input)", display: "flex", alignItems: "center", gap: "8px", padding: "8px 8px 8px 24px" }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={warm}
              placeholder="Warm humanist sans for a dental brand"
              aria-label="Describe the feel you want"
              enterKeyHint="search"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent outline-none feel-input"
              style={{ fontSize: "16px", color: "var(--text-heading)", height: "48px" }}
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="rounded-lg font-semibold shrink-0"
              style={{
                fontSize: "16px", padding: "12px 24px",
                background: query.trim() ? "var(--generate-bg)" : "var(--generate-bg-disabled)",
                color: query.trim() ? "var(--generate-text)" : "var(--generate-text-disabled)",
                cursor: query.trim() ? "pointer" : "not-allowed",
              }}
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap" style={{ gap: "8px", marginTop: "16px" }} role="group" aria-label="Example searches">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setQuery(ex); run(ex); }}
                className="feel-chip rounded-md"
                style={{ fontSize: "14px", padding: "4px 12px" }}
              >
                {ex}
              </button>
            ))}
          </div>

          <div aria-live="polite" style={{ minHeight: "24px", marginTop: "16px" }}>
            {loading && (
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Loading search, about 25 MB, one time{pct !== null ? ` (${pct}%, ${(status.kind === "loading" && status.progress ? status.progress.loaded / MB : 0).toFixed(0)} MB)` : "…"}
              </p>
            )}
            {status.kind === "searching" && <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Searching…</p>}
            {modelFailed && status.kind !== "loading" && (
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                The meaning-based search could not load, so this is plain keyword matching.
              </p>
            )}
          </div>
        </div>

        {status.kind === "done" && (
          <div style={{ marginTop: "32px" }}>
            <h2 className="font-semibold" style={{ fontSize: "16px", color: "var(--text-heading)", marginBottom: "16px" }}>
              Results for “{shownFor}”
            </h2>
            {mode === "semantic" && fontResults.length > 0 && fontResults[0].score < WEAK_MATCH && (
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Nothing matches closely. These are the nearest guesses, so try describing a mood or a job.
              </p>
            )}

            {fontResults.length === 0 ? (
              <SectionCard>
                <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
                  Nothing matched that. Try describing a mood, like “calm and trustworthy”, or a job, like “menu for a taqueria”.
                </p>
              </SectionCard>
            ) : (
              <>
                {pairResults.length > 0 && (
                  <PairPreviewGrid pairs={pairResults} title="Pairs that fit" initialVisible={6} loadMoreIncrement={6} />
                )}

                <div className="detail-subheading">
                  <h3 className="font-semibold text-neutral-700" style={{ fontSize: "16px", marginBottom: "16px" }}>Fonts that fit</h3>
                  <div className="pair-grid">
                    {fontResults.slice(0, visibleFonts).map(({ font }) => {
                      const family = getFontFamily(font.name, font.source);
                      const chips = [...new Set([...font.toneDescriptors, ...font.tags].map((t) => t.toLowerCase()))]
                        .filter((t) => t.split("-").length < 3 && t.length <= 25).slice(0, 4).map(chipCase);
                      return (
                        <div
                          key={font.id}
                          role="link"
                          tabIndex={0}
                          aria-label={`View font: ${font.name}`}
                          onClick={() => navigateToFont(router, font.slug)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToFont(router, font.slug); } }}
                          onMouseDown={(e) => e.preventDefault()}
                          className="group border border-neutral-200 rounded-xl bg-white card-hover hover:border-neutral-300 hover:shadow-sm overflow-hidden cursor-pointer flex flex-col"
                          style={{ padding: "24px", position: "relative" }}
                        >
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ position: "absolute", top: "16px", right: "16px", color: "var(--text-ransom)", fontSize: "16px", pointerEvents: "none" }}
                          >
                            ↗
                          </span>
                          <p className="leading-tight text-neutral-800 break-words" style={{ fontFamily: family, fontWeight: 600, fontSize: "32px", marginBottom: "8px" }}>
                            {font.name}
                          </p>
                          <p className="text-neutral-500 break-words" style={{ fontFamily: family, fontSize: "16px", lineHeight: 1.5 }}>
                            Quiet pond, steady hands.
                          </p>
                          <div style={{ marginTop: "auto" }}>
                            <div className="border-t border-neutral-100" style={{ margin: "16px -24px", padding: 0 }} />
                            <p className="text-neutral-500" style={{ fontSize: "14px", marginBottom: "8px" }}>
                              {formatClassification(font.classification)}
                            </p>
                            <div className="flex flex-wrap" style={{ gap: "8px" }}>
                              {chips.map((c) => (
                                <span key={c} className="text-neutral-500 bg-neutral-50 rounded-md border border-neutral-100" style={{ fontSize: "14px", padding: "4px 12px" }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {visibleFonts < Math.min(fontResults.length, 60) && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                      <button
                        type="button"
                        onClick={() => setVisibleFonts((n) => n + 9)}
                        className="outline-btn font-medium rounded-lg"
                        style={{ fontSize: "16px", padding: "12px 24px" }}
                      >
                        Load more fonts
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "32px" }}>
                  {mode === "semantic" ? "Ranked by meaning with a small open model that runs on your device." : "Ranked by keyword match."}
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

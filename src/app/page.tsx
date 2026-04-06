"use client";

import { PromptInput } from "@/components/PromptInput";
import { SampleTextInputs } from "@/components/SampleTextInputs";
import { ResultsGrid } from "@/components/ResultsGrid";
import { HeaderWithFontInfo } from "@/components/HeaderWithFontInfo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppState } from "@/lib/store";

export default function Home() {
  const { hasSearched, setQuery, setResults, setHasSearched, setIsExploring, setVisibleCount } = useAppState();

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setIsExploring(false);
    setVisibleCount(3);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky header */}
      <header
        className="w-full border-b sticky top-0 z-30"
        style={{ background: "var(--bg-header)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between shell-padding" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
          <div className="block min-w-0 flex-1 cursor-pointer" role="button" tabIndex={0} onClick={handleReset} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleReset(e as any); } }}>
            <span className="hover:opacity-80 transition-opacity block">
              <HeaderWithFontInfo />
            </span>
          </div>
          <div className="shrink-0" style={{ marginLeft: "16px" }}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className={`flex-1 flex flex-col${hasSearched ? " results-bottom-padding" : ""}`}
        style={hasSearched ? { paddingBottom: "80px" } : {}}
      >
        {/* Input area — stays max-w-4xl (896px) */}
        <div
          className={`w-full max-w-4xl mx-auto content-padding flex-1 flex flex-col${hasSearched ? " results-top-padding" : ""}`}
          style={hasSearched ? { paddingTop: "80px", flex: "none" } : { justifyContent: "center" }}
        >
          <div style={{ marginBottom: hasSearched ? "24px" : "40px", textAlign: "center" }}>
            <h2 className="describe-heading font-semibold tracking-tight" style={{ color: "var(--text-ransom)", fontSize: "24px" }}>
              Describe your project, mood, or brand
            </h2>
          </div>

          <PromptInput />
          <SampleTextInputs />
        </div>

        {/* Results area — wider container so tiles extend beyond the input field */}
        {hasSearched && (
          <div className="w-full mx-auto content-padding" style={{ maxWidth: "1280px" }}>
            <ResultsGrid />
          </div>
        )}
      </main>
    </div>
  );
}

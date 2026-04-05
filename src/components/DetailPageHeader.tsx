"use client";

import { useRouter } from "next/navigation";
import { HeaderWithFontInfo } from "./HeaderWithFontInfo";
import { ThemeToggle } from "./ThemeToggle";

export function DetailPageHeader() {
  const router = useRouter();

  return (
    <header className="w-full border-b sticky top-0 z-30" style={{ background: "var(--bg-header)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between shell-padding" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
        <div className="hover:opacity-80 transition-opacity min-w-0 flex-1 cursor-pointer" role="button" tabIndex={0} onClick={() => router.push("/")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/"); } }}>
          <HeaderWithFontInfo />
        </div>
        <div className="shrink-0" style={{ marginLeft: "16px" }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

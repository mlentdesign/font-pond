import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { RecentHistory } from "@/components/RecentHistory";
import { Footer } from "@/components/Footer";
import { WaterBackground } from "@/components/WaterBackground";
import { FishEasterEgg } from "@/components/FishEasterEgg";

export const metadata: Metadata = {
  title: "Font Pond",
  description: "Discover free font pairings for your next project. Describe your mood, brand, or vibe — get ranked typography recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* Skip to content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg"
          style={{ background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: "16px" }}
        >
          Skip to content
        </a>
        <WaterBackground />
        <FishEasterEgg />
        <AppProvider>
          {children}
          <Footer />
          <RecentHistory />
        </AppProvider>
      </body>
    </html>
  );
}

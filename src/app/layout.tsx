import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { RecentHistory } from "@/components/RecentHistory";
import { Footer } from "@/components/Footer";
import { WaterBackground } from "@/components/WaterBackground";
import { FishEasterEgg } from "@/components/FishEasterEgg";
import { MobileCardGlow } from "@/components/MobileCardGlow";
import { ScrollToTop } from "@/components/ScrollToTop";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      <head>
        {/* Theme script MUST be first — blocks rendering to prevent light/dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches);var h=document.documentElement;h.setAttribute("data-theme",d?"dark":"light");h.style.colorScheme=d?"dark":"light";h.setAttribute("data-loading","")}catch(e){}})()`,
          }}
        />
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N6BYH6MQKP" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-N6BYH6MQKP');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Remove data-loading after first paint so theme toggle transitions work */}
        <script
          dangerouslySetInnerHTML={{
            __html: `requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.removeAttribute("data-loading")})})`,
          }}
        />
        {/* Skip to content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg"
          style={{ background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: "16px" }}
        >
          Skip to content
        </a>
        <WaterBackground />
        <AppProvider>
          <FishEasterEgg />
          <MobileCardGlow />
          <ScrollToTop />
          {children}
          <Footer />
          <RecentHistory />
        </AppProvider>
      </body>
    </html>
  );
}

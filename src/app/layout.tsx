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
        {/* Theme-color meta tags — Chrome/Safari use these for pull-to-refresh background */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#c8e6e3" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d3b3f" />
        <meta name="color-scheme" content="light dark" />
        {/* Inline critical CSS — all theme variables available before external CSS loads */}
        <style
          dangerouslySetInnerHTML={{
            __html: [
              /* Light mode defaults */
              `:root{--bg:#c8e6e3;--bg-card:#d4edeb;--bg-card-hover:#ddf3f1;--bg-header:#b8ddd9;--bg-footer:#b8ddd9;--bg-chip:#bfe3df;--bg-input:#e0f2f0;--bg-action-bar:#cfe9e6;--border:rgba(0,77,64,0.15);--border-card:rgba(0,77,64,0.12);--border-chip:rgba(0,77,64,0.08);--divider:rgba(0,77,64,0.08);--text-heading:#000;--text-body:#444;--text-muted:#666;--text-label:#555;--text-chip:#333;--text-placeholder:#5a5a5a;--text-ransom:#0d4a44;--text-link:#0d4a44;--accent:#0d4a44;--btn-bg:#0d4a44;--btn-text:#fff;--btn-hover:#1a5f57;--toggle-active:#e0f2f0;--toggle-active-text:#0d4a44;--generate-bg:#f0bb7a;--generate-text:#2a1a05;--shadow:0 2px 16px rgba(0,77,64,0.12);--shadow-card:0 2px 12px rgba(0,77,64,0.10);--shadow-edge:0 2px 12px rgba(0,77,64,0.10);--shadow-edge-top:0 -2px 12px rgba(0,77,64,0.10);--border-edge:1px solid rgba(0,77,64,0.06)}`,
              /* Dark mode overrides */
              `[data-theme="dark"]{--bg:#0d3b3f;--bg-card:#11474c;--bg-card-hover:#185459;--bg-header:#0a2f32;--bg-footer:#0a2f32;--bg-chip:#0f4045;--bg-input:#164f54;--bg-action-bar:#134a4f;--border:rgba(130,200,190,0.15);--border-card:rgba(130,200,190,0.12);--border-chip:rgba(130,200,190,0.08);--divider:rgba(130,200,190,0.08);--text-heading:#fff;--text-body:#dcdcdc;--text-muted:#b8b8b8;--text-label:#a0a0a0;--text-chip:#d0d0d0;--text-placeholder:#a0a0a0;--text-ransom:#fff;--text-link:#b0ccc8;--accent:#4db6ac;--btn-bg:#e0e0e0;--btn-text:#111;--btn-hover:#f0f0f0;--toggle-active:rgba(255,255,255,0.15);--toggle-active-text:#fff;--generate-bg:#a06828;--generate-text:#fff;--shadow:0 2px 16px rgba(0,30,28,0.30);--shadow-card:0 2px 12px rgba(0,30,28,0.25);--shadow-edge:0 2px 12px rgba(0,30,28,0.25);--shadow-edge-top:0 -2px 12px rgba(0,30,28,0.25);--border-edge:1px solid rgba(130,200,190,0.06)}`,
              /* Base styles available immediately */
              `html{background:var(--bg)}body{background:var(--bg);color:var(--text-body)}`,
            ].join(""),
          }}
        />
        {/* Theme script — sets data-theme from localStorage before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches);var h=document.documentElement;h.setAttribute("data-theme",d?"dark":"light");h.style.colorScheme=d?"dark":"light"}catch(e){}})()`,
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

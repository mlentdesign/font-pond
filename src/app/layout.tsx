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
        {/* Theme-color for Chrome pull-to-refresh — script updates dynamically */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#c8e6e3" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d3b3f" />
        <meta name="color-scheme" content="light dark" />
        {/* Allow search indexing but block AI training and scraping */}
        <meta name="robots" content="noai, noimageai" />
        {/* Theme script — sets data-theme from localStorage before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches);var h=document.documentElement;h.setAttribute("data-theme",d?"dark":"light");h.style.colorScheme=d?"dark":"light";var m=document.querySelector('meta[name=theme-color][media*=light]');if(m)m.content=d?"#0d3b3f":"#c8e6e3"}catch(e){}})()`,
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

"use client";

import { useEffect } from "react";
import { Font } from "@/data/types";
import { loadGoogleFont, loadFontshareFont } from "@/lib/fonts";

export function FontLoader({ fonts }: { fonts: Font[] }) {
  useEffect(() => {
    for (const font of fonts) {
      if (font.source === "google-fonts" && font.googleFontsFamily) {
        loadGoogleFont(font.googleFontsFamily);
      } else if (font.source === "fontshare") {
        loadFontshareFont(font.slug);
      }
    }
  }, [fonts]);

  return null;
}

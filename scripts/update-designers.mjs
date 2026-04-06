#!/usr/bin/env node
// Fetches designer names from Google Fonts metadata and updates all-google-fonts.ts

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, "../src/data/all-google-fonts.ts");

async function main() {
  // Fetch Google Fonts metadata
  console.log("Fetching Google Fonts metadata...");
  const res = await fetch("https://fonts.google.com/metadata/fonts");
  const text = await res.text();
  // The response starts with ")]}'" which needs to be stripped
  const json = JSON.parse(text.replace(/^\)\]\}'?\n?/, ""));

  // Build a map: family name -> designers string
  const designerMap = new Map();
  for (const font of json.familyMetadataList) {
    const designers = font.designers;
    if (designers && designers.length > 0) {
      designerMap.set(font.family, designers.join(" & "));
    }
  }
  console.log(`Found designers for ${designerMap.size} fonts`);

  // Read the current data file
  let content = readFileSync(dataFile, "utf-8");

  // Match each gf() call and add designer if available
  let updated = 0;
  content = content.replace(
    /gf\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(true|false),\s*(true|false)(?:,\s*"[^"]*"(?:,\s*"[^"]*")?)?\)/g,
    (match, name, googleFamily, classification, tags, tone, isBody, hasRegular) => {
      const designer = designerMap.get(googleFamily);
      if (designer) {
        updated++;
        // Escape any quotes in designer name
        const escaped = designer.replace(/"/g, '\\"');
        return `gf("${name}", "${googleFamily}", "${classification}", ${tags}, ${tone}, ${isBody}, ${hasRegular}, "${escaped}")`;
      }
      return `gf("${name}", "${googleFamily}", "${classification}", ${tags}, ${tone}, ${isBody}, ${hasRegular})`;
    }
  );

  writeFileSync(dataFile, content, "utf-8");
  console.log(`Updated ${updated} fonts with designer info`);
}

main().catch(console.error);

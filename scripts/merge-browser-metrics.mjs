#!/usr/bin/env node
/**
 * Merges scripts/measured-browser-metrics.json into scripts/measured-render-metrics.json
 * as the `browserAscentRatio` (index [11]) and `browserSpecExtent` (index [13]) fields.
 *
 * Supports both old format { slug: ascentRatio } and new format { slug: { ascent, specExtent } }.
 *
 * Run after: visiting /measure-fonts in dev and clicking "Save"
 * Run before: node scripts/build-render-metrics.mjs
 */

import fs from "fs";
import path from "path";

const browserPath = path.join(process.cwd(), "scripts/measured-browser-metrics.json");
const mainPath    = path.join(process.cwd(), "scripts/measured-render-metrics.json");

if (!fs.existsSync(browserPath)) {
  console.error("missing scripts/measured-browser-metrics.json — run the /measure-fonts page first");
  process.exit(1);
}

const browser = JSON.parse(fs.readFileSync(browserPath, "utf-8"));
const main    = JSON.parse(fs.readFileSync(mainPath,    "utf-8"));

let updated = 0, skipped = 0, specFiltered = 0;
for (const [slug, value] of Object.entries(browser)) {
  if (!main[slug]) { skipped++; continue; }
  // Support old format (number) and new format ({ ascent, specExtent })
  if (typeof value === "number") {
    main[slug].browserAscentRatio = value;
  } else if (value && typeof value === "object") {
    if (value.ascent != null) main[slug].browserAscentRatio = value.ascent;
    if (value.specExtent != null) {
      // Validate: the new measure-fonts page detects and discards system-ui fallback
      // measurements before saving, so the ratio filter here is a last-resort sanity check.
      // Upper bound raised to 1.50 — script/calligraphic fonts can have ink extending
      // 40–50% beyond their advance due to swashes (previously, these were falsely
      // flagged as fallback because they happened to be condensed fonts whose advance
      // matched the ratio range for system-ui). Lower bound 0.60 accepts wide-spaced fonts.
      const ratio = value.specExtent / main[slug].specAdvance;
      if (ratio >= 0.40 && ratio <= 1.50) {
        main[slug].browserSpecExtent = value.specExtent;
      } else {
        specFiltered++;
      }
    }
  }
  updated++;
}
if (specFiltered > 0) console.log(`  (filtered ${specFiltered} suspect specExtent values where browser likely used fallback font)`);

fs.writeFileSync(mainPath, JSON.stringify(main, null, 2));
console.log(`Updated ${updated} entries with browser-measured metrics (${skipped} slugs not in main file)`);
console.log("Next: node scripts/build-render-metrics.mjs");

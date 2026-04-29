#!/usr/bin/env node
/**
 * Converts scripts/measured-render-metrics.json  →  src/data/gf-render-metrics.ts
 *
 * Tuple format: [specAdv, upperAdv, lowerAdv, numsAdv, ascentRatio]
 * Usage: bigSize = Math.floor(sectionWidth / specAdv)
 */

import fs from "fs";
import path from "path";

const inputPath = path.join(process.cwd(), "scripts/measured-render-metrics.json");
const outputPath = path.join(process.cwd(), "src/data/gf-render-metrics.ts");

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const keys = Object.keys(data).sort();

const lines = keys.map(slug => {
  const m = data[slug];
  return `  "${slug}": [${m.specAdvance}, ${m.upperAdvance}, ${m.lowerAdvance}, ${m.numsAdvance}, ${m.ascentRatio}, ${m.descentRatio}],`;
});

const ts = `// AUTO-GENERATED — do not edit manually
// Run: node scripts/measure-render-metrics.mjs && node scripts/build-render-metrics.mjs
//
// Tuple: [specAdv, upperAdv, lowerAdv, numsAdv, ascentRatio, descentRatio]
//   specAdv     = total advance of "Aa Bb Cc Dd Ee Ff" / UPM
//   upperAdv    = total advance of A–Z / UPM
//   lowerAdv    = total advance of a–z / UPM
//   numsAdv     = total advance of 0–9 / UPM
//   ascentRatio = max ink y2 across "AaBbCcDdEeFf" / UPM  (ascent height)
//   descentRatio = max ink depth below baseline across "gpqyjQ" / UPM
//
// Usage: bigSize = Math.floor(sectionWidth / specAdv)
// Scale for even visual padding: scaledPx = Math.floor(targetPx * 0.95 / (ascentRatio + descentRatio))
export type RenderMetricsTuple = [number, number, number, number, number, number];
export const RENDER_METRICS: Record<string, RenderMetricsTuple> = {
${lines.join("\n")}
};
`;

fs.writeFileSync(outputPath, ts);
console.log(`Written ${keys.length} entries to ${outputPath}`);

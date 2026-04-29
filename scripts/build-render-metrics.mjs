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
  return `  "${slug}": [${m.specAdvance}, ${m.upperAdvance}, ${m.lowerAdvance}, ${m.numsAdvance}, ${m.ascentRatio}, ${m.descentRatio}, ${m.inkOverTop ?? 0}, ${m.inkOverBottom ?? 0}, ${m.leftOverflow ?? 0}, ${m.os2AscentRatio ?? m.ascentRatio}, ${m.os2DescentRatio ?? m.descentRatio}],`;
});

const ts = `// AUTO-GENERATED — do not edit manually
// Run: node scripts/measure-render-metrics.mjs && node scripts/build-render-metrics.mjs
//
// Tuple indices:
//   [0] specAdv         = total advance of "Aa Bb Cc Dd Ee Ff" / UPM
//   [1] upperAdv        = total advance of A–Z / UPM
//   [2] lowerAdv        = total advance of a–z / UPM
//   [3] numsAdv         = total advance of 0–9 / UPM
//   [4] ascentRatio     = max ink y2 / UPM  (used for mobile cap-height sizing)
//   [5] descentRatio    = max ink depth below baseline / UPM
//   [6] inkOverTop      = ink above OS/2 usWinAscent / UPM  (true extra padding needed at top)
//   [7] inkOverBottom   = ink below OS/2 usWinDescent / UPM (true extra padding needed at bottom)
//   [8] leftOverflow    = max negative left side bearing / UPM (ink extending left of glyph origin)
//   [9] os2AscentRatio  = OS/2 usWinAscent / UPM  (what browser uses for line-box layout)
//   [10] os2DescentRatio = OS/2 usWinDescent / UPM (what browser uses for line-box layout)
//
// Usage: bigSize = Math.floor(sectionWidth / specAdv)
// Extra padding: padTop += m[6]*px, padBottom += m[7]*px, padLeft += m[8]*px
// lineHeight: use Math.max(1.15, m[9] + m[10]) — matches exact browser line-box allocation
export type RenderMetricsTuple = [number, number, number, number, number, number, number, number, number, number, number];
export const RENDER_METRICS: Record<string, RenderMetricsTuple> = {
${lines.join("\n")}
};
`;

fs.writeFileSync(outputPath, ts);
console.log(`Written ${keys.length} entries to ${outputPath}`);
